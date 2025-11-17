// src/app/actions/userActions.ts
'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { Database, Tables, TablesInsert, TablesUpdate } from '@/lib/database.types';
import { sendOrderConfirmationEmail, sendSubscriptionConfirmationEmail } from '@/lib/email';
import { CartItem } from '@/context/UIContext';

// --- Tipe Data Baru untuk Produk di Dashboard ---
export type MostRecentPurchase = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  type: 'font' | 'bundle';
  licenseName: string | null; // <-- Tambahkan licenseName
};
// --- Akhir Tipe Data Baru ---


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
        // --- Perbarui juga revalidatePath untuk dashboard ---
        revalidatePath('/account');
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

// --- FUNGSI DIPERBARUI: Menyertakan nama lisensi ---
export async function getPurchasedProductsAction() {
    const supabase = createSupabaseActionClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'User not authenticated' };

    const { data, error } = await supabase
        .from('order_items')
        .select(`
            id,
            orders!inner(user_id, status),
            licenses ( name ),
            fonts (id, name, slug, preview_image_urls, category, download_zip_path),
            bundles (id, name, slug, preview_image_urls, download_zip_path)
        `)
        .eq('orders.user_id', user.id)
        // Pastikan hanya mengambil dari order yang valid (bukan grant)
        .neq('orders.status', 'Subscription Grant');

    if (error) {
        console.error('Error fetching purchased products:', error);
        return { error: 'Could not fetch purchased products.' };
    }

    const products = data.map(item => {
        const licenseName = item.licenses?.name ?? null; // Ambil nama lisensi
        if (item.fonts) {
            return {
                id: item.fonts.id,
                name: item.fonts.name,
                slug: item.fonts.slug,
                imageUrl: item.fonts.preview_image_urls?.[0] ?? '/images/dummy/placeholder.jpg',
                description: item.fonts.category,
                type: 'font' as const,
                download_path: item.fonts.download_zip_path,
                licenseName: licenseName, // Sertakan nama lisensi
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
                licenseName: licenseName, // Sertakan nama lisensi
            };
        }
        return null;
    }).filter(Boolean);

    // --- Pastikan tipe data NonNullable<typeof products[number]> mencakup licenseName ---
    type PurchasedProductWithLicense = NonNullable<typeof products[number]>;
    return { products: products as PurchasedProductWithLicense[] };
}
// --- AKHIR PERUBAHAN ---

// --- FUNGSI BARU: Mengambil produk terbaru yang dibeli ---
export async function getMostRecentPurchaseAction(): Promise<{ data: MostRecentPurchase | null, error?: string }> {
    const supabase = createSupabaseActionClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'User not authenticated' };

    try {
        const { data: recentItem, error } = await supabase
            .from('order_items')
            .select(`
                id,
                orders!inner(user_id, created_at, status),
                licenses ( name ),
                fonts (id, name, slug, preview_image_urls, category),
                bundles (id, name, slug, preview_image_urls)
            `)
            .eq('orders.user_id', user.id)
            .neq('orders.status', 'Subscription Grant') // Jangan ambil grant
            .neq('orders.status', 'Subscription Purchase') // Jangan ambil pembelian langganan
            .order('created_at', { referencedTable: 'orders', ascending: false })
            .limit(1)
            .maybeSingle(); // Gunakan maybeSingle jika user mungkin belum beli

        if (error) throw error;
        if (!recentItem) return { data: null }; // User belum pernah beli

        const licenseName = recentItem.licenses?.name ?? null;

        if (recentItem.fonts) {
            return {
                data: {
                    id: recentItem.fonts.id,
                    name: recentItem.fonts.name,
                    slug: recentItem.fonts.slug,
                    imageUrl: recentItem.fonts.preview_image_urls?.[0] ?? '/images/dummy/placeholder.jpg',
                    type: 'font',
                    licenseName: licenseName,
                }
            };
        } else if (recentItem.bundles) {
            return {
                data: {
                    id: recentItem.bundles.id,
                    name: recentItem.bundles.name,
                    slug: recentItem.bundles.slug,
                    imageUrl: recentItem.bundles.preview_image_urls?.[0] ?? '/images/dummy/placeholder.jpg',
                    type: 'bundle',
                    licenseName: licenseName,
                }
            };
        }

        return { data: null }; // Item ada tapi bukan font/bundle (seharusnya tidak terjadi)

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        console.error('Error fetching most recent purchase:', message);
        return { data: null, error: 'Could not fetch most recent purchase.' };
    }
}
// --- AKHIR FUNGSI BARU ---

// --- FUNGSI BARU DITAMBAHKAN ---
export async function getRecentPurchasesAction(limit_count: number): Promise<{ data: MostRecentPurchase[], error?: string }> {
    const supabase = createSupabaseActionClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [], error: 'User not authenticated' };

    try {
        const { data: recentItems, error } = await supabase
            .from('order_items')
            .select(`
                id,
                orders!inner(user_id, created_at, status),
                licenses ( name ),
                fonts (id, name, slug, preview_image_urls, category),
                bundles (id, name, slug, preview_image_urls)
            `)
            .eq('orders.user_id', user.id)
            .neq('orders.status', 'Subscription Grant')
            .neq('orders.status', 'Subscription Purchase')
            .order('created_at', { referencedTable: 'orders', ascending: false })
            .limit(limit_count); // Gunakan limit dinamis

        if (error) throw error;
        if (!recentItems) return { data: [] };

        const products: MostRecentPurchase[] = recentItems.map(item => {
            const licenseName = item.licenses?.name ?? null;
            if (item.fonts) {
                return {
                    id: item.fonts.id,
                    name: item.fonts.name,
                    slug: item.fonts.slug,
                    imageUrl: item.fonts.preview_image_urls?.[0] ?? '/images/dummy/placeholder.jpg',
                    type: 'font' as const,
                    licenseName: licenseName,
                };
            } else if (item.bundles) {
                return {
                    id: item.bundles.id,
                    name: item.bundles.name,
                    slug: item.bundles.slug,
                    imageUrl: item.bundles.preview_image_urls?.[0] ?? '/images/dummy/placeholder.jpg',
                    type: 'bundle' as const,
                    licenseName: licenseName,
                };
            }
            return null;
        }).filter((p): p is MostRecentPurchase => p !== null); // Filter null

        return { data: products };

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        console.error('Error fetching recent purchases:', message);
        return { data: [], error: 'Could not fetch recent purchases.' };
    }
}
// --- AKHIR FUNGSI BARU ---


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
        process.env.SUPABASE_SERVICE_ROLE_KEY!, // Gunakan service role key untuk menghapus user auth
        {
            cookies: {
                get(name: string) { return cookieStore.get(name)?.value; },
                set(name: string, value: string, options: CookieOptions) { cookieStore.set(name, value, options); },
                remove(name: string, options: CookieOptions) { cookieStore.set(name, '', options); },
            },
        }
    );

    try {
        // Hapus pengguna dari Supabase Auth
        const { error } = await supabase.auth.admin.deleteUser(userId);
        if (error) throw error;
        // Profil akan otomatis terhapus oleh trigger jika sudah di-setup di database

        revalidatePath('/admin/users');
        return { success: 'User deleted successfully!' };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        console.error("Error deleting user:", message); // Log error
        return { error: `Failed to delete user: ${message}` };
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
                status: 'Subscription Grant', // Status khusus untuk item dari langganan
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
                price: 0 // Harga 0 karena dari langganan
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
            .eq('role', 'admin') // Atau peran lain yang relevan
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
        // 1. Verifikasi kepemilikan (PERBAIKAN DI SINI)
        // Kita harus menggunakan '!inner' untuk memastikan relasi orders dimuat
        // agar filter .eq('orders.user_id', ...) berfungsi valid.
        const { data: ownedItem, error: checkError } = await supabase
            .from('order_items')
            .select('id, orders!inner(user_id)') 
            .eq('orders.user_id', user.id)
            .eq(productType === 'font' ? 'font_id' : 'bundle_id', productId)
            .limit(1)
            .single();

        // Jika tidak ditemukan di pembelian biasa, cek langganan aktif
        if (checkError || !ownedItem) {
            const { data: activeSub } = await supabase
                .from('user_subscriptions')
                .select('id')
                .eq('user_id', user.id)
                .in('status', ['active', 'trialing'])
                .limit(1)
                .single();

            if (!activeSub) {
                // Debugging: Uncomment baris ini jika ingin melihat error spesifik di console server
                // console.error("Download Check Error:", checkError);
                return { error: 'You do not own this product or have an active subscription.' };
            }
        }

        // 2. Ambil path file
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

        // 3. Buat signed URL (Valid selama 7 hari / 604800 detik)
        const { data, error: urlError } = await supabase.storage.from('products').createSignedUrl(download_path, 604800);

        if (urlError) throw urlError;

        return { success: true, url: data.signedUrl };

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : `An unknown error occurred.`;
        console.error("Error generating download URL:", message);
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
            .in('status', ['active', 'trialing']) // Hanya update langganan aktif
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