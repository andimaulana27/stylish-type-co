// src/app/checkout/page.tsx
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database, Tables } from '@/lib/database.types';
import CheckoutClientPage from './CheckoutClientPage';

export const revalidate = 0;

type Plan = Tables<'subscription_plans'>;
type UserSubscription = Tables<'user_subscriptions'> & {
  subscription_plans: Plan | null;
};


export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const planId = typeof searchParams.planId === 'string' ? searchParams.planId : null;
  const upgradeFromId = typeof searchParams.upgradeFrom === 'string' ? searchParams.upgradeFrom : null;
  const billingCycleParam = typeof searchParams.billing === 'string' ? searchParams.billing : 'monthly';
  const billingCycle: 'monthly' | 'yearly' = (billingCycleParam === 'yearly') ? 'yearly' : 'monthly';

  let subscriptionPlan: Plan | null = null;
  let priceDifference: number | null = null;
  let activeSubscriptionId: string | null = null;

  const cookieStore = cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
      },
    }
  );

  if (planId) {
    const { data: newPlanData } = await supabase.from('subscription_plans').select('*').eq('id', planId).single();
    subscriptionPlan = newPlanData;

    // Logika perhitungan selisih harga untuk UPGRADE
    if (upgradeFromId && newPlanData) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: currentSubData } = await supabase
                .from('user_subscriptions')
                .select('*, subscription_plans(*)')
                .eq('user_id', user.id)
                .in('status', ['active', 'trialing'])
                .single();
            
            const currentSub = currentSubData as UserSubscription | null;

            if (currentSub && currentSub.subscription_plans) {
                activeSubscriptionId = currentSub.id;
                const newPrice = billingCycle === 'yearly' ? newPlanData.price_yearly : newPlanData.price_monthly;
                const currentPrice = billingCycle === 'yearly' ? currentSub.subscription_plans.price_yearly : currentSub.subscription_plans.price_monthly;
                
                // Kalkulasi selisih (prorata disederhanakan)
                const calculatedDifference = newPrice - currentPrice;
                priceDifference = calculatedDifference > 0 ? calculatedDifference : 0; // Pastikan tidak negatif
            }
        }
    }
  }

  return (
    <CheckoutClientPage 
      subscriptionPlan={subscriptionPlan} 
      billingCycle={billingCycle}
      priceDifference={priceDifference} // Kirim selisih harga
      activeSubscriptionId={activeSubscriptionId} // Kirim ID langganan aktif
    />
  );
}