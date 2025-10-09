// src/app/actions/adminActions.ts
'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';
import { format, eachDayOfInterval, parseISO } from 'date-fns';


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

export async function getSidebarCountsAction() {
    const supabase = createSupabaseActionClient();
    try {
        const [fonts, bundles, posts] = await Promise.all([
            supabase.from('fonts').select('id', { count: 'exact', head: true }),
            supabase.from('bundles').select('id', { count: 'exact', head: true }),
            supabase.from('posts').select('id', { count: 'exact', head: true })
        ]);

        if (fonts.error) throw fonts.error;
        if (bundles.error) throw bundles.error;
        if (posts.error) throw posts.error;

        return {
            success: true,
            counts: {
                fonts: fonts.count ?? 0,
                bundles: bundles.count ?? 0,
                posts: posts.count ?? 0,
            }
        };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        console.error("Error fetching sidebar counts:", message);
        return { 
            error: message, 
            counts: { fonts: 0, bundles: 0, posts: 0 } 
        };
    }
}

export async function getDashboardAnalyticsAction(startDate: string, endDate: string) {
    const supabase = createSupabaseActionClient();

    try {
        const [
            totalRevenue, monthlyOrders, totalUsers, totalFonts,
            totalBundles, totalPosts, totalSubscribers, recentOrders,
            topSellingFonts, dailySales
        ] = await Promise.all([
            supabase.from('orders').select('total_amount').neq('status', 'Subscription Grant').gte('created_at', startDate).lte('created_at', `${endDate}T23:59:59Z`),
            supabase.from('orders').select('id', { count: 'exact', head: true }).neq('status', 'Subscription Grant').gte('created_at', startDate).lte('created_at', `${endDate}T23:59:59Z`),
            supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'user'),
            supabase.from('fonts').select('id', { count: 'exact', head: true }),
            supabase.from('bundles').select('id', { count: 'exact', head: true }),
            supabase.from('posts').select('id', { count: 'exact', head: true }).eq('is_published', true),
            supabase.from('user_subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
            supabase.from('orders').select('id, total_amount, status, created_at, profiles(full_name)').neq('status', 'Subscription Grant').order('created_at', { ascending: false }).limit(5),
            // --- PERBAIKAN DI SINI: Mengubah limit menjadi 10 ---
            supabase.rpc('get_top_selling_fonts_from_orders', { limit_count: 10 }),
            supabase.from('orders').select('created_at, total_amount').neq('status', 'Subscription Grant').gte('created_at', startDate).lte('created_at', `${endDate}T23:59:59Z`)
        ]);

        const allDaysInRange = eachDayOfInterval({ start: parseISO(startDate), end: parseISO(endDate) });

        const salesByDay = (dailySales.data || []).reduce((acc: { [key: string]: number }, order) => {
            const day = format(new Date(order.created_at), 'MMM dd');
            acc[day] = (acc[day] || 0) + order.total_amount;
            return acc;
        }, {});

        const salesChartData = allDaysInRange.map(day => {
            const formattedDay = format(day, 'MMM dd');
            return {
                day: formattedDay,
                sales: salesByDay[formattedDay] || 0
            };
        });
        
        const totalIncomeForPeriod = (totalRevenue.data || []).reduce((sum, order) => sum + order.total_amount, 0);

        if (topSellingFonts.error) {
            console.error("Error fetching top selling fonts:", topSellingFonts.error);
        }

        return {
            stats: {
                revenue: totalIncomeForPeriod,
                orders: monthlyOrders.count ?? 0,
                totalUsers: totalUsers.count ?? 0,
                fonts: totalFonts.count ?? 0,
                bundles: totalBundles.count ?? 0,
                posts: totalPosts.count ?? 0,
                subscribers: totalSubscribers.count ?? 0,
            },
            recentOrders: (recentOrders.data || []).map(o => ({ ...o, customer: o.profiles?.full_name || 'N/A' })),
            topSellingFonts: topSellingFonts.data || [],
            salesChartData,
            salesSummary: {
                monthlyIncome: totalIncomeForPeriod,
                latestDailySales: salesByDay[format(new Date(), 'MMM dd')] || 0,
            }
        };

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        console.error("Error fetching dashboard analytics:", message);
        return { error: message };
    }
}