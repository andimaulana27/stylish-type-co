// src/context/PayPalProvider.tsx
'use client';

import { PayPalScriptProvider } from '@paypal/react-paypal-js';

export default function PayPalProvider({ children }: { children: React.ReactNode }) {
    const initialOptions = {
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'sb', // 'sb' adalah fallback untuk sandbox jika env tidak ada
        currency: 'USD',
        intent: 'capture',
        locale: 'en_US',
    };

    return (
        <PayPalScriptProvider options={initialOptions}>
            {children}
        </PayPalScriptProvider>
    );
}