// src/components/checkout/PayPalCheckoutButton.tsx
'use client';

import { useState } from 'react';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import type { OnApproveData, } from '@paypal/paypal-js';
import { type CartItem } from '@/context/UIContext';
import { createOrderAction } from '@/app/actions/userActions';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

interface PayPalCheckoutButtonProps {
    cart: CartItem[];
    cartTotal: number;
    onSuccess: () => void;
    // --- TIPE BARU DITAMBAHKAN ---
    billingAddress: { streetAddress: string; city: string; country: string; postalCode: string; };
    subscriptionInfo?: { 
        planId: string; 
        billingCycle: 'monthly' | 'yearly';
        activeSubscriptionId: string | null;
    };
}

const PayPalCheckoutButton = ({ cart, cartTotal, onSuccess, billingAddress, subscriptionInfo }: PayPalCheckoutButtonProps) => {
    const { refreshAuthStatus } = useAuth();
    const [{ isPending }] = usePayPalScriptReducer();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const createOrder = async () => {
        setError(null);
        try {
            const res = await fetch('/api/paypal/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ totalAmount: cartTotal }),
            });
            const order = await res.json();
            if (order.id) return order.id;
            throw new Error(order.error || 'Could not create PayPal order.');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(message);
            toast.error(`Error creating order: ${message}`);
            throw err;
        }
    };

    const onApprove = async (data: OnApproveData) => {
        setIsProcessing(true);
        toast.loading('Processing your payment...');
        
        try {
            const res = await fetch('/api/paypal/capture-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderID: data.orderID }),
            });
            const capturedData = await res.json();
            
            if (capturedData.status === 'COMPLETED') {
                // --- PEMBARUAN: Kirim billingAddress ke action ---
                const orderResult = await createOrderAction(cart, cartTotal, billingAddress, subscriptionInfo);
                
                if (orderResult.error) {
                    throw new Error(`Payment succeeded, but failed to save order: ${orderResult.error}. Please contact support.`);
                }
                
                if (subscriptionInfo) {
                    await refreshAuthStatus(); 
                }

                toast.dismiss();
                const successMessage = subscriptionInfo 
                    ? "Subscription activated successfully!" 
                    : "Your order has been placed successfully!";
                toast.success(successMessage);
                
                onSuccess();
            } else {
                 throw new Error(capturedData.error || 'Payment was not completed by PayPal.');
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "An unknown payment error occurred.";
            setError(message);
            toast.dismiss();
            toast.error(message, { duration: 6000 });
        } finally {
            setIsProcessing(false);
        }
    };
    
    if (isPending) {
        return (
            <div className="flex justify-center items-center h-[100px] bg-white/5 rounded-lg">
                <Loader2 className="animate-spin text-brand-light-muted" />
                <span className="ml-2 text-sm text-brand-light-muted">Loading Gateway...</span>
            </div>
        );
    }

    return (
        <div className="relative">
            {isProcessing && (
                <div className="absolute inset-0 bg-brand-darkest/70 flex items-center justify-center z-20 rounded-lg">
                    <p className="text-white animate-pulse">Processing...</p>
                </div>
            )}
            
            {error && <div className="text-center text-red-400 text-sm mb-2 p-2 bg-red-500/10 rounded-md">{error}</div>}
            
            <div className={isProcessing ? 'opacity-50' : ''}>
                <PayPalButtons
                    key={subscriptionInfo ? 'subscribe' : 'pay'}
                    style={{
                        layout: 'vertical',
                        shape: 'pill',
                        height: 44,
                        label: subscriptionInfo ? 'subscribe' : 'pay',
                        tagline: false
                    }}
                    createOrder={createOrder}
                    onApprove={onApprove}
                    onError={(err) => {
                        const message = err instanceof Error ? err.message : 'An error occurred with PayPal.';
                        setError(message);
                        toast.error(message);
                    }}
                    onCancel={() => {
                        toast.error('Payment was cancelled.');
                    }}
                    disabled={isProcessing}
                />
            </div>
             <p className="text-center text-xs text-brand-light-muted mt-2">Powered by PayPal</p>
        </div>
    );
};

export default PayPalCheckoutButton;