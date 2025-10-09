// src/components/checkout/OrderSummary.tsx
'use client';

import Image from 'next/image';
import { useUI } from '@/context/UIContext';
import { type Tables } from '@/lib/database.types';

type Plan = Tables<'subscription_plans'>;

interface OrderSummaryProps {
  subscriptionPlan: Plan | null;
  billingCycle: string;
}

const OrderSummary = ({ subscriptionPlan, billingCycle }: OrderSummaryProps) => {
  const { cart, cartTotal } = useUI();

  const isSubscriptionCheckout = !!subscriptionPlan;
  
  let total = 0;
  let summaryTitle = "Order Summary";

  if (isSubscriptionCheckout) {
    summaryTitle = "Subscription Summary";
    total = billingCycle === 'yearly' ? subscriptionPlan.price_yearly : subscriptionPlan.price_monthly;
  } else {
    total = cartTotal;
  }

  return (
    <div className="relative w-full bg-brand-darkest p-6 rounded-lg border border-white/10 overflow-hidden h-full flex flex-col">
      <div className="relative z-10 flex flex-col h-full">
        <div className="mb-4 pb-4 border-b border-white/10 flex-shrink-0">
          <h3 className="text-lg font-semibold text-brand-light">{summaryTitle}</h3>
          <div className="w-16 h-0.5 bg-brand-accent rounded-full mt-2"></div>
        </div>
        
        <div className="space-y-4 max-h-[36rem] overflow-y-auto pr-2 flex-grow">
          {isSubscriptionCheckout ? (
            <div className="flex items-center gap-4">
               <div className="w-16 h-16 bg-brand-primary-blue/20 rounded-md flex items-center justify-center">
                  <Image src="/logo-timeless-type-footer.png" alt="Logo" width={48} height={48} className="opacity-50" />
               </div>
               <div>
                  <p className="font-medium text-brand-light leading-tight">{subscriptionPlan.name}</p>
                  <p className="text-xs text-brand-light-muted capitalize">{billingCycle} Billing</p>
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
                <p className="font-medium text-brand-light flex-shrink-0">${item.price.toFixed(2)}</p>
              </div>
            ))
          )}
        </div>
        
        <div className="mt-auto flex-shrink-0">
          {!isSubscriptionCheckout && (
            <form className="border-t border-white/10 mt-4 pt-4 flex gap-2">
              <input type="text" placeholder="Apply Discount Code" className="w-full bg-white/5 border border-white/10 rounded-full px-3 py-2 text-sm"/>
              <button type="submit" className="px-4 py-2 text-sm font-semibold bg-brand-secondary-gold rounded-full text-black">Apply</button>
            </form>
          )}
          
          <div className="border-t border-white/10 mt-4 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-brand-light-muted">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-brand-light text-lg font-bold mt-2 pt-2 border-t border-white/10">
              <span>Total</span>
              <span className="text-brand-accent">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;