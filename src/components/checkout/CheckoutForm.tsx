// src/components/checkout/CheckoutForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Lock } from 'lucide-react'; 
import { useUI } from '@/context/UIContext';
import PayPalCheckoutButton from './PayPalCheckoutButton';
import { type Tables } from '@/lib/database.types';

type Plan = Tables<'subscription_plans'>;

interface CheckoutFormProps {
  subscriptionPlan: Plan | null;
  billingCycle: 'monthly' | 'yearly';
  onSuccess: () => void;
  priceDifference: number | null;
  activeSubscriptionId: string | null;
}

const CheckoutForm = ({ subscriptionPlan, billingCycle, onSuccess, priceDifference, activeSubscriptionId }: CheckoutFormProps) => {
  const { session, profile, refreshAuthStatus } = useAuth();
  const { cart, cartTotal } = useUI();

  // --- STATE BARU UNTUK ALAMAT ---
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [postalCode, setPostalCode] = useState('');
  
  // --- EFEK UNTUK MENGISI DATA DARI PROFIL ---
  useEffect(() => {
    if (profile) {
      setStreetAddress(profile.street_address || '');
      setCity(profile.city || '');
      setCountry(profile.country || '');
      setPostalCode(profile.postal_code || '');
    }
  }, [profile]);

  // --- VALIDASI FORM DIPERBARUI ---
  const isFormValid = streetAddress.trim() !== '' && city.trim() !== '' && country.trim() !== '' && postalCode.trim() !== '';

  const totalAmount = priceDifference !== null 
    ? priceDifference
    : subscriptionPlan 
      ? (billingCycle === 'yearly' ? subscriptionPlan.price_yearly : subscriptionPlan.price_monthly)
      : cartTotal;
  
  const handleSuccess = async () => {
    await refreshAuthStatus(); // Refresh data profil setelah order berhasil
    onSuccess();
  }

  const inputStyles = "w-full bg-white/5 border border-white/20 rounded-full px-4 py-3 text-brand-light placeholder:text-brand-light-muted transition-colors duration-300 focus:outline-none focus:border-brand-accent";
  const readOnlyStyles = "w-full bg-brand-darkest border border-white/10 rounded-full px-4 py-3 text-brand-light-muted cursor-not-allowed";

  return (
    <>
      <style jsx global>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px #171717 inset !important;
          -webkit-text-fill-color: #FFFFFF !important;
          caret-color: #FFFFFF !important;
        }
      `}</style>
      
      <div className="relative bg-brand-darkest p-8 rounded-lg border border-white/10 overflow-hidden">
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-radial from-brand-primary-blue/20 to-transparent blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          {!session && (
            <div className="mb-8 p-4 bg-brand-primary-blue/10 border border-brand-primary-blue/30 rounded-md text-sm">
              Returning customer? <Link href="/login?next=/checkout" className="font-semibold text-brand-accent hover:underline">Click here to login</Link>
            </div>
          )}

          <form onSubmit={(e) => e.preventDefault()} className="space-y-8" autoComplete="on">
            <div>
              <h2 className="text-2xl font-bold text-brand-light">Billing Details</h2>
              <div className="w-16 h-0.5 bg-brand-accent rounded-full mt-2 mb-6 "></div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-brand-light-muted ml-4">Full Name</label>
                    <input type="text" name="name" value={profile?.full_name || ''} className={readOnlyStyles} readOnly />
                  </div>
                   <div>
                    <label className="text-xs text-brand-light-muted ml-4">Email Address</label>
                    <input type="email" name="email" value={session?.user.email || ''} className={readOnlyStyles} readOnly />
                  </div>
                </div>
                {/* --- INPUT BARU DITAMBAHKAN DAN DIHUBUNGKAN KE STATE --- */}
                <input type="text" name="street_address" placeholder="Address *" className={inputStyles} required value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} autoComplete="street-address" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input type="text" name="city" placeholder="City *" className={inputStyles} required value={city} onChange={(e) => setCity(e.target.value)} autoComplete="address-level2" />
                  <input type="text" name="country" placeholder="Country *" className={inputStyles} required value={country} onChange={(e) => setCountry(e.target.value)} autoComplete="country" />
                  <input type="text" name="postal_code" placeholder="Postal Code *" className={inputStyles} required value={postalCode} onChange={(e) => setPostalCode(e.target.value)} autoComplete="postal-code" />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-brand-light border-t border-white/10 pt-6">Payment Method</h2>
              <div className="w-16 h-0.5 bg-brand-accent rounded-full mt-2 mb-6"></div>
              <div className="space-y-3">
                  <p className="text-sm text-brand-light-muted text-center mb-4 ">
                      Complete your purchase securely. You can use your PayPal balance or a debit/credit card.
                  </p>
                  
                  <div className={`transition-opacity duration-300 ${!isFormValid ? 'opacity-50 pointer-events-none' : ''}`}>
                    {session ? (
                        <PayPalCheckoutButton 
                          cart={cart} 
                          cartTotal={totalAmount} 
                          onSuccess={handleSuccess}
                          // --- MENGIRIM DATA ALAMAT KE ACTION ---
                          billingAddress={{ streetAddress, city, country, postalCode }}
                          subscriptionInfo={subscriptionPlan ? { planId: subscriptionPlan.id, billingCycle, activeSubscriptionId } : undefined}
                        />
                    ) : (
                        <p className='text-center text-sm text-yellow-400'>Please login to proceed with payment.</p>
                    )}
                  </div>
                   {!isFormValid && session && (
                      <p className="text-center text-xs text-yellow-400/80 pt-2">
                          Please fill in all required billing details to proceed.
                      </p>
                  )}
              </div>
            </div>
            
             <div className="border-t border-white/10 pt-6 text-center text-xs text-brand-light-muted">
                  By clicking the payment buttons, you agree to our 
                  <Link href="/terms" className="underline hover:text-white"> Terms of Service</Link> and 
                  <Link href="/privacy" className="underline hover:text-white"> Privacy Policy</Link>.
                  <div className="flex items-center justify-center gap-2 mt-4">
                      <Lock size={12}/>
                      <span>Secure Payment</span>
                  </div>
              </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CheckoutForm;