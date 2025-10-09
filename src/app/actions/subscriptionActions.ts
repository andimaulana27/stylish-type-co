// src/app/actions/subscriptionActions.ts
'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { Database, TablesUpdate } from '@/lib/database.types';

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

export async function updateSubscriptionAction(newPlanId: string, isDowngrade: boolean) {
    const supabase = createSupabaseActionClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "You must be logged in to change your subscription." };
    }

    try {
        const { data: currentSubscription, error: fetchError } = await supabase
            .from('user_subscriptions')
            .select('id')
            .eq('user_id', user.id)
            .in('status', ['active', 'trialing'])
            .single();

        if (fetchError || !currentSubscription) {
            throw new Error("No active subscription found to update.");
        }

        const startDate = new Date();
        const endDate = new Date(startDate);

        const { data: newPlan } = await supabase.from('subscription_plans').select('price_yearly, price_monthly').eq('id', newPlanId).single();
        if (!newPlan) throw new Error("New plan details not found.");
        
        endDate.setMonth(startDate.getMonth() + 1);

        const { error: updateError } = await supabase
            .from('user_subscriptions')
            .update({
                plan_id: newPlanId,
                current_period_start: startDate.toISOString(),
                current_period_end: endDate.toISOString(),
            })
            .eq('id', currentSubscription.id);

        if (updateError) throw updateError;
        
        revalidatePath('/account/subscription');
        revalidatePath('/subscription');
        
        const message = isDowngrade ? 'Subscription downgraded successfully!' : 'Subscription updated successfully!';
        return { success: message };

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "An unknown error occurred.";
        return { error: message };
    }
}

export async function getSubscriptionPlansAction() {
    const supabase = createSupabaseActionClient();
    const { data, error } = await supabase.from('subscription_plans').select('*').order('price_monthly');
    if (error) return { error: error.message };
    return { plans: data };
}

// --- FUNGSI DIPERBARUI UNTUK MENYIMPAN PAYPAL ID ---
export async function updateSubscriptionPlanAction(planId: string, formData: FormData) {
    const supabase = createSupabaseActionClient();
    try {
        const features = {
            allowed: formData.getAll('allowed').map(String).filter(Boolean),
            not_allowed: formData.getAll('not_allowed').map(String).filter(Boolean),
        };

        const planData: TablesUpdate<'subscription_plans'> = {
            name: String(formData.get('name')),
            description: String(formData.get('description')),
            price_monthly: Number(formData.get('price_monthly')),
            price_yearly: Number(formData.get('price_yearly')),
            paypal_plan_id_monthly: String(formData.get('paypal_plan_id_monthly')) || null,
            paypal_plan_id_yearly: String(formData.get('paypal_plan_id_yearly')) || null,
            features: features,
        };
        
        const { data, error } = await supabase.from('subscription_plans').update(planData).eq('id', planId).select().single();
        if (error) throw error;

        revalidatePath('/admin/subscription/plans');
        revalidatePath('/subscription');
        return { success: 'Plan updated successfully!', plan: data };
    } catch (error: unknown) {
        if (error instanceof Error) return { error: `Failed to update plan: ${error.message}` };
        return { error: 'An unexpected error occurred.' };
    }
}
// --- AKHIR PERUBAHAN ---

export async function getSubscribersForAdminAction(options: { page: number, limit: number, searchTerm?: string }) {
    const { page, limit, searchTerm } = options;
    const supabase = createSupabaseActionClient();

    try {
        let query = supabase
            .from('user_subscriptions')
            .select(`
                id,
                status,
                current_period_end,
                profiles ( full_name, email, avatar_url ),
                subscription_plans ( name )
            `, { count: 'exact' });

        if (searchTerm) {
            query = query.or(`profiles.full_name.ilike.%${searchTerm}%,profiles.email.ilike.%${searchTerm}%`);
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

export async function cancelSubscriptionAction(subscriptionId: string) {
    const supabase = createSupabaseActionClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "You must be logged in." };
    }

    try {
        const { error } = await supabase
            .from('user_subscriptions')
            .update({ 
                status: 'canceled',
                cancel_at_period_end: true // Menandakan pembatalan di akhir periode
            })
            .eq('id', subscriptionId)
            .eq('user_id', user.id); // Pastikan user hanya bisa membatalkan langganan miliknya

        if (error) throw error;

        revalidatePath('/account/subscription');
        return { success: 'Your subscription has been scheduled for cancellation.' };

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "An unknown error occurred.";
        return { error: message };
    }
}
