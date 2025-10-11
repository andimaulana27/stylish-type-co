// src/app/checkout/CheckoutClientPage.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useUI } from '@/context/UIContext';
import { type Tables } from '@/lib/database.types';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import CheckoutSuccessModal from '@/components/checkout/CheckoutSuccessModal';

type Plan = Tables<'subscription_plans'>;

interface CheckoutClientPageProps {
  subscriptionPlan: Plan | null;
  billingCycle: 'monthly' | 'yearly';
  priceDifference: number | null;
  activeSubscriptionId: string | null;
}

const OrderSummary = ({ subscriptionPlan, billingCycle, priceDifference }: {
  subscriptionPlan: Plan | null;
  billingCycle: string;
  priceDifference: number | null;
}) => {
  const { cart, cartTotal, cartOriginalTotal } = useUI();
  const isSubscriptionCheckout = !!subscriptionPlan;
  
  let total = 0;
  let originalTotal = 0;
  let summaryTitle = "Order Summary";

  if (isSubscriptionCheckout && subscriptionPlan) {
    summaryTitle = priceDifference !== null ? "Upgrade Summary" : "Subscription Summary";
    total = priceDifference !== null 
      ? priceDifference 
      : (billingCycle === 'yearly' ? subscriptionPlan.price_yearly : subscriptionPlan.price_monthly);
    originalTotal = total;
  } else {
    total = cartTotal;
    originalTotal = cartOriginalTotal;
  }
  
  const hasDiscount = originalTotal > total;

  return (
    <div className="relative w-full bg-brand-darkest p-6 rounded-lg border border-white/10 overflow-hidden h-full flex flex-col">
      <div className="relative z-10 flex flex-col h-full">
        <div className="mb-4 pb-4 border-b border-white/10 flex-shrink-0">
          <h3 className="text-lg font-semibold text-brand-light">{summaryTitle}</h3>
          <div className="w-16 h-0.5 bg-brand-accent rounded-full mt-2"></div>
        </div>
        
        <div className="space-y-4 max-h-[36rem] overflow-y-auto pr-2 flex-grow">
          {isSubscriptionCheckout && subscriptionPlan ? (
            <div className="flex items-center gap-4">
               <div className="w-16 h-16 bg-brand-primary-blue/20 rounded-md flex items-center justify-center">
                  <Image src="/logo-stylishtype-footer.png" alt="Stylishtype Logo" width={48} height={48} className="opacity-50" />
               </div>
               <div>
                  <p className="font-medium text-brand-light leading-tight">{subscriptionPlan.name}</p>
                  <p className="text-xs text-brand-light-muted capitalize">{billingCycle} Billing</p>
                  {priceDifference !== null && <p className="text-xs font-semibold text-brand-accent mt-1">Prorated Upgrade</p>}
               </div>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Image 
                    src={item.imageUrl} alt={item.name} width={64} height={64} 
                    className="rounded-md object-cover aspect-[3/2] bg-brand-gray-light"
                  />
                  <div>
                    <p className="font-medium text-brand-light leading-tight">{item.name}</p>
                    <p className="text-xs text-brand-light-muted">{item.license.name} License</p>
                  </div>
                </div>
                <div className="text-right">
                    <p className="font-medium text-brand-light flex-shrink-0">${item.price.toFixed(2)}</p>
                    {item.originalPrice && <p className="text-xs text-brand-light-muted line-through">${item.originalPrice.toFixed(2)}</p>}
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="mt-auto flex-shrink-0">
          <div className="border-t border-white/10 mt-4 pt-4 space-y-2 text-sm">
            {hasDiscount && (
                <div className="flex justify-between text-brand-light-muted">
                    <span>Subtotal</span>
                    <span className='line-through'>${originalTotal.toFixed(2)}</span>
                </div>
            )}
            <div className="flex justify-between text-brand-light text-lg font-bold mt-2 pt-2 border-t border-white/10">
              <span>{priceDifference !== null ? 'Amount Due Today' : 'Total'}</span>
              <span className="text-brand-accent">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default function CheckoutClientPage({ subscriptionPlan, billingCycle, priceDifference, activeSubscriptionId }: CheckoutClientPageProps) {
  const { cart } = useUI();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSuccess = () => {
    setIsModalOpen(true);
  };
  
  if (!subscriptionPlan && cart.length === 0 && !isModalOpen) {
    return (
      <div className="w-full max-w-2xl mx-auto p-8 bg-brand-darkest rounded-lg border border-white/10 text-center">
        <h1 className="text-3xl font-bold text-brand-accent text-center">Your Cart is Empty</h1>
        <p className="mt-4 text-brand-light-muted text-center">
          Add items to your cart or choose a subscription plan to proceed.
        </p>
        <div className="mt-8">
          <Link href="/product" className="px-8 py-3 font-medium rounded-full text-center bg-brand-accent text-brand-darkest transition-all">
            Explore Products
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <CheckoutSuccessModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        isSubscription={!!subscriptionPlan} 
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div className="lg:col-span-1">
          <CheckoutForm 
            subscriptionPlan={subscriptionPlan} 
            billingCycle={billingCycle} 
            onSuccess={handleSuccess}
            priceDifference={priceDifference}
            activeSubscriptionId={activeSubscriptionId}
          />
        </div>
        <div className="lg:col-span-1 sticky top-28">
          <OrderSummary 
            subscriptionPlan={subscriptionPlan} 
            billingCycle={billingCycle}
            priceDifference={priceDifference}
          />
        </div>
      </div>
    </>
  );
}