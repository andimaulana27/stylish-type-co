// src/app/actions/userActions.ts
'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { Database, Tables, TablesInsert, TablesUpdate } from '@/lib/database.types';
import { sendOrderConfirmationEmail, sendSubscriptionConfirmationEmail } from '@/lib/email';
import { CartItem } from '@/context/UIContext';

type CartItemForAction = {
  id: string;
  productId: string;
  price: number;
  license: { id: string; name: string };
  type: 'font' | 'bundle';
  quantity: number;
  name: string;
  imageUrl: string;
  originalPrice?: number;
  slug: string;
};

type SubscriptionInfo = {
    planId: string;
    billingCycle: 'monthly' | 'yearly';
    activeSubscriptionId: string | null;
};

const createSupabaseActionClient = () => {
    const cookieStore = cookies();
    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) { return cookieStore.get(name)?.value; },
                set(name: string, value: string, options: CookieOptions) { cookieStore.set(name, value, options); },
                remove(name: string, options: CookieOptions) { cookieStore.set(name, '', options); },
            },
        }
    );
};

export async function updateUserProfileAction(formData: FormData) {
    const supabase = createSupabaseActionClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'You must be logged in to update your profile.' };

    const fullName = String(formData.get('fullName'));
    const country = String(formData.get('country'));
    const city = String(formData.get('city'));
    const streetAddress = String(formData.get('streetAddress'));
    const postalCode = String(formData.get('postalCode'));
    const avatarFile = formData.get('avatar') as File | null;

    let avatar_url: string | undefined = undefined;

    try {
        if (avatarFile && avatarFile.size > 0) {
            const fileExt = avatarFile.name.split('.').pop();
            const filePath = `${user.id}/avatar.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, avatarFile, {
                    upsert: true,
                    cacheControl: '31536000',
                });

            if (uploadError) {
                throw new Error(`Avatar upload failed: ${uploadError.message}`);
            }

            const { data: urlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);
            
            avatar_url = `${urlData.publicUrl}?t=${new Date().getTime()}`;
        }

        const updates: TablesUpdate<'profiles'> = {
            full_name: fullName,
            country: country || null,
            city: city || null,
            street_address: streetAddress || null,
            postal_code: postalCode || null,
        };

        if (avatar_url) {
            updates.avatar_url = avatar_url;
        }

        const { error: updateError } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id);

        if (updateError) {
            throw new Error(`Failed to update profile: ${updateError.message}`);
        }

        revalidatePath('/account/profile');
        revalidatePath('/', 'layout');
        return { success: 'Profile updated successfully!' };
        
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: message };
    }
}


async function updateUserAddressFromCheckout(
  userId: string,
  profile: Tables<'profiles'>,
  address: { streetAddress: string; city: string; country: string; postalCode: string }
) {
  const needsUpdate = 
    !profile.street_address ||
    profile.street_address !== address.streetAddress ||
    profile.city !== address.city ||
    profile.country !== address.country ||
    profile.postal_code !== address.postalCode;

  if (!needsUpdate) {
    return;
  }

  const supabase = createSupabaseActionClient();
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        street_address: address.streetAddress,
        city: address.city,
        country: address.country,
        postal_code: address.postalCode,
      })
      .eq('id', userId);
    if (error) {
      console.error("Failed to update user address from checkout:", error.message);
    }
  } catch (error) {
     console.error("Unexpected error updating address from checkout:", error);
  }
}

export async function createOrderAction(
    items: CartItemForAction[], 
    totalAmount: number,
    billingAddress: { streetAddress: string; city: string; country: string; postalCode: string; } | null,
    subscriptionInfo?: SubscriptionInfo
) {
    const supabase = createSupabaseActionClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'You must be logged in to create an order.' };
    }

    try {
        const { data: userProfile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError || !userProfile) {
            throw new Error("Could not retrieve user profile for email confirmation.");
        }
        
        if (billingAddress && billingAddress.streetAddress) {
          await updateUserAddressFromCheckout(user.id, userProfile, billingAddress);
          Object.assign(userProfile, {
              street_address: billingAddress.streetAddress,
              city: billingAddress.city,
              country: billingAddress.country,
              postal_code: billingAddress.postalCode,
          });
        }
        
        let orderStatus = 'Completed';
        if (subscriptionInfo) {
            orderStatus = 'Subscription Purchase';
        }

        let nextBillingDateISO = '';

        if (subscriptionInfo) {
            const { planId, billingCycle, activeSubscriptionId } = subscriptionInfo;
            const startDate = new Date();
            const endDate = new Date(startDate);
            if (billingCycle === 'yearly') {
                endDate.setFullYear(startDate.getFullYear() + 1);
            } else {
                endDate.setMonth(startDate.getMonth() + 1);
            }
            nextBillingDateISO = endDate.toISOString();

            if (activeSubscriptionId) { 
                const { error: subError } = await supabase.from('user_subscriptions').update({ plan_id: planId, status: 'active', current_period_start: startDate.toISOString(), current_period_end: nextBillingDateISO }).eq('id', activeSubscriptionId);
                if (subError) throw subError;
            } else { 
                const { error: subError } = await supabase.from('user_subscriptions').insert({ user_id: user.id, plan_id: planId, status: 'active', current_period_start: startDate.toISOString(), current_period_end: nextBillingDateISO });
                if (subError) throw subError;
            }
        }

        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert({ user_id: user.id, total_amount: totalAmount, status: orderStatus })
            .select()
            .single();

        if (orderError) throw orderError;
        if (!orderData) throw new Error('Failed to create order record.');

        if (subscriptionInfo) {
            const { data: planData, error: planError } = await supabase
                .from('subscription_plans')
                .select('*')
                .eq('id', subscriptionInfo.planId)
                .single();
            if (planError || !planData) throw new Error("Could not retrieve plan details for email.");
            
            await sendSubscriptionConfirmationEmail(
                userProfile,
                orderData,
                planData,
                subscriptionInfo.billingCycle,
                nextBillingDateISO
            );

        } else {
            if (items.length > 0) {
              const orderItems: TablesInsert<'order_items'>[] = items.map(item => ({
                  order_id: orderData.id,
                  font_id: item.type === 'font' ? item.productId : null,
                  bundle_id: item.type === 'bundle' ? item.productId : null,
                  license_id: item.license.id,
                  price: item.price,
              }));

              const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
              if (itemsError) throw itemsError;

              const fontIdsToUpdate = items.filter(item => item.type === 'font').map(item => item.productId);
              if (fontIdsToUpdate.length > 0) {
                  const { error: rpcError } = await supabase.rpc('increment_sales_count', { product_ids: fontIdsToUpdate, product_type: 'font' });
                  if (rpcError) console.error("Error incrementing font sales count:", rpcError);
              }
            }
            
            await sendOrderConfirmationEmail(userProfile, orderData, items as CartItem[]);
        }

        revalidatePath('/account/profile');
        revalidatePath('/account/my-fonts');
        revalidatePath('/account/orders');
        revalidatePath('/account/subscription');
        revalidatePath('/admin/dashboard');
        revalidatePath('/admin/products/fonts');

        return { success: true, orderId: orderData.id };

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        console.error('Create Order/Subscription Error:', message);
        return { error: `Failed to process purchase: ${message}` };
    }
}


export async function updateUserPasswordAction(formData: FormData) {
    const supabase = createSupabaseActionClient();
    const newPassword = String(formData.get('newPassword'));
    if (newPassword.length < 6) { return { error: 'Password must be at least 6 characters long.' }; }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) { return { error: 'Failed to update password. Please try again.' }; }
    return { success: 'Password updated successfully!' };
}

export async function getPurchasedProductsAction() {
    const supabase = createSupabaseActionClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'User not authenticated' };

    const { data, error } = await supabase
        .from('order_items')
        .select(`
            id,
            orders!inner(user_id),
            fonts (id, name, slug, preview_image_urls, category, download_zip_path),
            bundles (id, name, slug, preview_image_urls, download_zip_path)
        `)
        .eq('orders.user_id', user.id);

    if (error) {
        console.error('Error fetching purchased products:', error);
        return { error: 'Could not fetch purchased products.' };
    }
    
    const products = data.map(item => {
        if (item.fonts) {
            return {
                id: item.fonts.id,
                name: item.fonts.name,
                slug: item.fonts.slug,
                imageUrl: item.fonts.preview_image_urls?.[0] ?? '/images/dummy/placeholder.jpg',
                description: item.fonts.category,
                type: 'font' as const,
                download_path: item.fonts.download_zip_path,
            };
        }
        if (item.bundles) {
            return {
                id: item.bundles.id,
                name: item.bundles.name,
                slug: item.bundles.slug,
                imageUrl: item.bundles.preview_image_urls?.[0] ?? '/images/dummy/placeholder.jpg',
                description: 'Bundle',
                type: 'bundle' as const,
                download_path: item.bundles.download_zip_path,
            };
        }
        return null;
    }).filter(Boolean);

    return { products: products as NonNullable<typeof products[number]>[] };
}

export async function getOrderHistoryAction() {
    const supabase = createSupabaseActionClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'User not authenticated' };

    const { data, error } = await supabase
        .from('orders')
        .select(`id, created_at, total_amount, status, order_items (id)`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
    if (error) { 
        console.error('Error fetching order history:', error); 
        return { error: 'Could not fetch order history.' }; 
    }
    
    const filteredData = (data || []).filter(order => {
        if (order.status === 'Subscription Grant' || order.status === 'Subscription Purchase') {
            return false;
        }
        if (order.status === 'Completed' && order.order_items.length === 0) {
            return false;
        }
        return true;
    });
    
    const orders = filteredData.map(order => ({ ...order, item_count: order.order_items.length }));
    
    return { orders };
}

export async function getUsersForAdminAction(options: { page: number, limit: number, searchTerm?: string }) {
  const { page, limit, searchTerm } = options;
  const supabase = createSupabaseActionClient();

  try {
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' });

    if (searchTerm) {
      query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
    }

    const start = (page - 1) * limit;
    const end = start + limit - 1;

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(start, end);

    if (error) throw error;
    
    return { data, count, error: null };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { data: [], count: 0, error: message };
  }
}

export async function updateUserRoleAction(userId: string, newRole: string) {
    const supabase = createSupabaseActionClient();
    try {
        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId);

        if (error) throw error;
        revalidatePath('/admin/users');
        return { success: 'User role updated successfully!' };

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: message };
    }
}

export async function deleteUserAction(userId: string) {
    const cookieStore = cookies();
    const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: {
                get(name: string) { return cookieStore.get(name)?.value; },
                set(name: string, value: string, options: CookieOptions) { cookieStore.set(name, value, options); },
                remove(name: string, options: CookieOptions) { cookieStore.set(name, '', options); },
            },
        }
    );

    try {
        const { error } = await supabase.auth.admin.deleteUser(userId);
        if (error) throw error;

        revalidatePath('/admin/users');
        return { success: 'User deleted successfully!' };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: message };
    }
}

export async function addFontToLibraryAction(productId: string, licenseId: string, productType: 'font' | 'bundle') {
    const supabase = createSupabaseActionClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'You must be logged in.' };
    }
    
    try {
        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: user.id,
                total_amount: 0,
                status: 'Subscription Grant',
            })
            .select()
            .single();

        if (orderError) throw orderError;

        const { error: itemError } = await supabase
            .from('order_items')
            .insert({
                order_id: orderData.id,
                font_id: productType === 'font' ? productId : null,
                bundle_id: productType === 'bundle' ? productId : null,
                license_id: licenseId,
                price: 0
            });

        if (itemError) throw itemError;

        revalidatePath('/account/my-fonts');
        return { success: 'Product added to your library!' };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: message };
    }
}

export async function getAuthorsForAdminAction() {
    const supabase = createSupabaseActionClient();
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name')
            .eq('role', 'admin')
            .order('full_name', { ascending: true });

        if (error) throw error;
        
        return { authors: data };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: message, authors: [] };
    }
}

export async function getDownloadUrlAction(productId: string, productType: 'font' | 'bundle') {
    const supabase = createSupabaseActionClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'You must be logged in to download files.' };
    }

    try {
        let download_path: string | null | undefined = null;

        if (productType === 'font') {
            const { data: font } = await supabase.from('fonts').select('download_zip_path').eq('id', productId).single();
            download_path = font?.download_zip_path;
        } else {
            const { data: bundle } = await supabase.from('bundles').select('download_zip_path').eq('id', productId).single();
            download_path = bundle?.download_zip_path;
        }
        
        if (!download_path) {
            return { error: 'Downloadable file not found for this product.' };
        }

        // --- PERUBAHAN UTAMA DI SINI ---
        // Durasi diubah menjadi 604800 detik (7 hari) sesuai batas maksimal Supabase
        const { data, error } = await supabase.storage.from('products').createSignedUrl(download_path, 604800);
        // --- AKHIR PERUBAHAN ---

        if (error) {
            throw error;
        }

        return { success: true, url: data.signedUrl };

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : `An unknown error occurred.`;
        return { error: `Failed to get download link: ${message}` };
    }
}

export async function updateUserPaypalAction(paypalSubscriptionId: string) {
    const supabase = createSupabaseActionClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'You must be logged in.' };
    }
    if (!paypalSubscriptionId) {
        return { error: 'Invalid PayPal subscription ID.' };
    }

    try {
        const { data: activeSubscription, error: fetchError } = await supabase
            .from('user_subscriptions')
            .select('id')
            .eq('user_id', user.id)
            .in('status', ['active', 'trialing'])
            .single();
        
        if (fetchError || !activeSubscription) {
            return { error: 'No active subscription found to update.' };
        }

        const { error: updateError } = await supabase 
            .from('user_subscriptions')
            .update({ paypal_subscription_id: paypalSubscriptionId })
            .eq('id', activeSubscription.id);

        if (updateError) throw updateError;

        revalidatePath('/account/subscription');
        return { success: 'Your PayPal account has been linked for future payments.' };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "An unknown error occurred.";
        return { error: message };
    }
}