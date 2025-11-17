// src/app/actions/orderActions.ts
'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';

type UserSubscriptionWithName = {
    current_period_start: string;
    subscription_plans: {
        name: string | null;
    } | null;
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

async function getSubscriptionPlanForOrder(supabase: ReturnType<typeof createSupabaseActionClient>, order: { created_at: string; user_id: string | null }) {
    if (!order.user_id) return null;

    const { data: userSubscription, error: subError } = await supabase
        .from('user_subscriptions')
        .select('subscription_plans (*)')
        .eq('user_id', order.user_id)
        .lte('current_period_start', order.created_at)
        .order('current_period_start', { ascending: false })
        .limit(1)
        .single();
    
    if (subError || !userSubscription) {
        // console.error("Could not find a matching subscription for the order date.", subError); // Optional log
        return null;
    }

    return userSubscription.subscription_plans;
}


export async function getSubscriptionOrderAction() {
    const supabase = createSupabaseActionClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'User not authenticated.' };
    }
    try {
        const { data: order, error } = await supabase
            .from('orders')
            .select('id')
            .eq('user_id', user.id)
            // --- PERBAIKAN DI SINI: Hanya ambil Subscription Purchase ---
            .eq('status', 'Subscription Purchase') 
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error) {
             if (error.code === 'PGRST116') return { data: null, error: 'No subscription order found.' };
             throw error;
        };
        
        return { data: order, error: null };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: message, data: null };
    }
}

export async function getSubscriptionHistoryAction() {
    const supabase = createSupabaseActionClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'User not authenticated.' };
    }
    try {
        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('id, created_at, total_amount, status, order_items (id)')
            .eq('user_id', user.id)
            // --- PERBAIKAN UTAMA DI SINI ---
            // Sebelumnya: .in('status', ['Subscription Purchase', 'Completed'])
            // Sekarang: Kita kunci HANYA 'Subscription Purchase'.
            // Order produk biasa statusnya 'Completed', jadi otomatis tidak akan terambil.
            .eq('status', 'Subscription Purchase') 
            .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;

        const { data: userSubscriptions, error: subsError } = await supabase
            .from('user_subscriptions')
            .select('current_period_start, subscription_plans (name)')
            .eq('user_id', user.id);

        if (subsError) throw subsError;

        // Kita tidak perlu lagi melakukan filter manual (array.filter) yang rumit
        // karena data dari database sudah pasti bersih.
        const subscriptionOrders = (orders || [])
            .map(order => {
                const orderDate = new Date(order.created_at).getTime();
                let planName: string | null = 'N/A';

                // Logika mencocokkan order dengan nama plan berdasarkan waktu
                const matchingSub = (userSubscriptions as UserSubscriptionWithName[] || []).reduce((closest, sub) => {
                    const subStartDate = new Date(sub.current_period_start).getTime();
                    const timeDiff = Math.abs(orderDate - subStartDate);

                    // Toleransi waktu 1 menit (60000ms) antara pembuatan order dan subscription record
                    if (timeDiff < 60000) { 
                        if (!closest || timeDiff < closest.diff) {
                            return { sub, diff: timeDiff };
                        }
                    }
                    return closest;
                }, null as { sub: UserSubscriptionWithName; diff: number } | null);

                if (matchingSub) {
                    planName = matchingSub.sub.subscription_plans?.name || 'N/A';
                }

                return { ...order, planName };
            });

        return { data: subscriptionOrders, error: null };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: message, data: null };
    }
}


export async function getInvoiceDataAction(orderId: string) {
    const supabase = createSupabaseActionClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'User not authenticated.' };
    }

    try {
        const { data: order, error } = await supabase
            .from('orders')
            .select(`
                id,
                created_at,
                total_amount,
                user_id,
                status,
                profiles ( full_name, email, street_address, city, country, postal_code ),
                order_items (
                    price,
                    fonts ( name ),
                    bundles ( name ),
                    licenses ( name, allowed )
                )
            `)
            .eq('id', orderId)
            .single();

        if (error) throw error;
        if (!order) return { error: 'Order not found.' };

        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (profile?.role !== 'admin' && order.user_id !== user.id) {
            return { error: 'You do not have permission to view this invoice.' };
        }
        
        const isSubscription = order.status === 'Subscription Purchase' || (order.status === 'Completed' && order.order_items.length === 0);
        
        if (isSubscription) {
            const planDetails = await getSubscriptionPlanForOrder(supabase, order);
            if (planDetails) {
                const features = planDetails.features as { allowed?: string[] };
                
                const modifiedOrderData = {
                    ...order,
                    order_items: [{
                        price: order.total_amount,
                        fonts: null,
                        bundles: null,
                        licenses: {
                            name: planDetails.name,
                            allowed: features?.allowed || []
                        }
                    }]
                };
                return { data: modifiedOrderData, error: null };
            }
        }

        return { data: order, error: null };

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: message, data: null };
    }
}

export async function getOrdersForAdminAction(options: { page: number, limit: number, searchTerm?: string }) {
  const { page, limit, searchTerm } = options;
  const supabase = createSupabaseActionClient();

  try {
    let query = supabase
      .from('orders')
      .select(`
        id,
        created_at,
        total_amount,
        status,
        profiles ( full_name, email ),
        order_items ( count )
      `, { count: 'exact' });

    if (searchTerm) {
      query = query.or(`id::text.ilike.%${searchTerm}%,profiles.full_name.ilike.%${searchTerm}%,profiles.email.ilike.%${searchTerm}%`);
    }

    const start = (page - 1) * limit;
    const end = start + limit - 1;

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(start, end);

    if (error) throw error;
    
    const transformedData = data.map(order => ({
        ...order,
        customer_name: order.profiles?.full_name || 'N/A',
        customer_email: order.profiles?.email || 'N/A',
        item_count: order.order_items[0]?.count || 0
    }));
    
    return { data: transformedData, count, error: null };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { data: [], count: 0, error: message };
  }
}

export async function getEulaDataAction(orderId: string) {
    const supabase = createSupabaseActionClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'User not authenticated.' };
    }

    try {
        const { data: order, error } = await supabase
            .from('orders')
            .select(`
                id,
                created_at,
                user_id,
                status,
                profiles ( full_name, street_address, city, country, postal_code ),
                order_items (
                    price,
                    font_id,
                    bundle_id,
                    fonts ( name ),
                    bundles ( name ),
                    licenses ( name, allowed )
                )
            `)
            .eq('id', orderId)
            .single();

        if (error) throw error;
        if (!order) return { error: 'Order not found.' };

        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (profile?.role !== 'admin' && order.user_id !== user.id) {
            return { error: 'You do not have permission to view this EULA.' };
        }
        
        type EulaItem = {
            productName: string;
            licenseName: string;
            permittedUse: string[];
        };
        const eulaItemList: EulaItem[] = [];

        const isSubscription = order.status === 'Subscription Purchase' || (order.status === 'Completed' && order.order_items.length === 0);

        if (isSubscription) {
            const planDetails = await getSubscriptionPlanForOrder(supabase, order);
            if (planDetails) {
                 const features = planDetails.features as { allowed?: string[] };
                 eulaItemList.push({
                    productName: planDetails.name,
                    licenseName: 'Subscription',
                    permittedUse: features?.allowed || []
                 });
            }
        } else {
             if (!order.order_items || order.order_items.length === 0) {
                return { error: 'No items found for this order to generate EULA.' };
            }
            for (const item of order.order_items) {
                const licenseName = item.licenses?.name || 'N/A';
                const permittedUse = (item.licenses?.allowed as string[]) || [];

                if (item.font_id && item.fonts) {
                    eulaItemList.push({
                        productName: item.fonts.name,
                        licenseName: licenseName,
                        permittedUse: permittedUse,
                    });
                } else if (item.bundle_id && item.bundles) {
                    eulaItemList.push({
                        productName: item.bundles.name,
                        licenseName: licenseName,
                        permittedUse: permittedUse,
                    });
                }
            }
        }

        const finalEulaData = {
            ...order,
            eula_items: eulaItemList,
        };
        
        return { data: finalEulaData, error: null };

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: message, data: null };
    }
}