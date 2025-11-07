// src/components/subscription/SubscriptionClientPage.tsx
'use client';

import { useState, useTransition } from 'react';
import { type Tables } from '@/lib/database.types';
import SubscriptionCard from '@/components/subscription/SubscriptionCard';
import { useAuth } from '@/context/AuthContext';
import DowngradeModal from './DowngradeModal'; // Impor modal baru
import { updateSubscriptionAction } from '@/app/actions/subscriptionActions'; // Impor action baru
import toast from 'react-hot-toast';

type Plan = Tables<'subscription_plans'>;

export default function SubscriptionClientPage({ plans }: { plans: Plan[] }) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const { activeSubscription, refreshAuthStatus } = useAuth();
  
  // --- STATE BARU UNTUK MODAL DOWNGRADE ---
  const [isDowngradeModalOpen, setIsDowngradeModalOpen] = useState(false);
  const [planToDowngrade, setPlanToDowngrade] = useState<Plan | null>(null);
  const [, startTransition] = useTransition();

  // Kalkulasi diskon dinamis
  const yearlyVsMonthlyPrice = plans[0] ? (plans[0].price_monthly * 12) : 0;
  const yearlyPrice = plans[0] ? plans[0].price_yearly : 0;
  const discountPercentage = yearlyVsMonthlyPrice > 0 
    ? Math.round((1 - (yearlyPrice / yearlyVsMonthlyPrice)) * 100) 
    : 0;

  const handleDowngradeClick = (plan: Plan) => {
    setPlanToDowngrade(plan);
    setIsDowngradeModalOpen(true);
  };

  const handleConfirmDowngrade = () => {
    if (!planToDowngrade) return;

    startTransition(async () => {
      const result = await updateSubscriptionAction(planToDowngrade.id, true);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success || 'Subscription downgraded!');
        await refreshAuthStatus(); // Refresh data langganan di UI
      }
      setIsDowngradeModalOpen(false);
      setPlanToDowngrade(null);
    });
  };


  return (
    <>
      <DowngradeModal
        isOpen={isDowngradeModalOpen}
        onClose={() => setIsDowngradeModalOpen(false)}
        onConfirm={handleConfirmDowngrade}
        planToDowngrade={planToDowngrade}
      />
      <div className="flex justify-center my-10">
        <div className="bg-brand-darkest p-1.5 rounded-full flex items-center space-x-2">
          <button onClick={() => setBillingCycle('yearly')} className={`px-6 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${billingCycle === 'yearly' ? 'bg-brand-accent text-brand-darkest shadow-md' : 'text-brand-light-muted hover:bg-white/5'}`}>
            Yearly {discountPercentage > 0 && <span className="font-bold opacity-80">(Save {discountPercentage}%)</span>}
          </button>
          <button onClick={() => setBillingCycle('monthly')} className={`px-6 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${billingCycle === 'monthly' ? 'bg-brand-accent text-brand-darkest shadow-md' : 'text-brand-light-muted hover:bg-white/5'}`}>
            Monthly
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {plans.map((plan) => {
          // --- PERUBAHAN UTAMA: Tambahkan logika untuk 'isRecommended' ---
          // Kita akan tandai plan yang namanya mengandung "Gold" sebagai recommended
          const isRecommended = plan.name.toLowerCase().includes('gold');
          // --- AKHIR PERUBAHAN ---

          return (
            <SubscriptionCard 
              key={plan.id} 
              plan={plan} 
              billingCycle={billingCycle}
              activeSubscription={activeSubscription}
              onDowngradeClick={handleDowngradeClick} 
              isRecommended={isRecommended} // <-- 4. Teruskan prop di sini
            />
          );
        })}
      </div>
    </>
  );
}