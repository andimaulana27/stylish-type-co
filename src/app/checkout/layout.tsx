// src/app/checkout/layout.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Lock } from 'lucide-react';
import PayPalProvider from '@/context/PayPalProvider'; // <-- Impor provider baru

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // --- PERUBAHAN DI SINI: Membungkus dengan PayPalProvider ---
    <PayPalProvider>
      <div className="min-h-screen bg-brand-dark-secondary text-brand-light flex flex-col">
        <header className="py-6 bg-brand-darkest">
          <div className="container mx-auto px-6 flex items-center justify-between">
            <Link href="/" aria-label="Back to Homepage">
              <Image 
                src="/LOGO BARU ORANGE.svg" 
                alt="Timeless Type Logo" 
                width={210} 
                height={40} 
              />
            </Link>
            <div className="flex items-center gap-3 text-brand-primary-orange">
              <Lock size={18} />
              <span className="font-semibold text-sm">Secure Checkout</span>
            </div>
          </div>
        </header>

        <main className="flex-grow container mx-auto px-6 py-12 lg:py-16">
          {children}
        </main>

        <footer className="py-6 text-center text-md text-brand-light-muted">
           <p>© {new Date().getFullYear()} Timelesstype.co. All rights reserved.</p>
        </footer>
      </div>
    </PayPalProvider>
  );
}