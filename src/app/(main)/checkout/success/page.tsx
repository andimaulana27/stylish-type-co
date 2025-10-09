// src/app/(main)/checkout/success/page.tsx
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

export default async function CheckoutSuccessPage() {
    return (
        <div className="bg-brand-dark-secondary text-brand-light">
            <div className="container mx-auto px-6 py-24 flex flex-col items-center text-center">
                <CheckCircle2 size={64} className="text-brand-primary-orange" />
                <h1 className="text-4xl font-bold mt-6 text-brand-light">Thank You For Your Order!</h1>
                <p className="text-lg text-brand-light-muted mt-2">
                    Your purchase has been completed successfully. You can now download your fonts from your account.
                </p>
                <div className="flex gap-4 mt-8">
                    <Link href="/account/my-fonts" className="px-6 py-3 font-medium rounded-full text-center bg-brand-accent text-brand-darkest transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-brand-accent/40">
                        Go to My Fonts
                    </Link>
                    <Link href="/fonts" className="px-6 py-3 font-medium rounded-full text-center bg-transparent border border-white/20 text-brand-light hover:bg-white/10 transition-colors">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}