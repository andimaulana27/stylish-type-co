// src/app/(main)/account/page.tsx
'use client'; 

import SectionHeader from '@/components/SectionHeader';
import { useAuth } from '@/context/AuthContext';
import { Award, ShoppingCart } from 'lucide-react';
import Button from '@/components/Button';
import DashboardCard from '@/components/account/DashboardCard';
import { useEffect, useState } from 'react';

type Order = {
    id: string;
    created_at: string;
    total_amount: number;
    item_count: number;
};

export default function AccountDashboardPage() {
    const { user, activeSubscription } = useAuth();
    // --- PERBAIKAN: Menghapus 'setLastOrder' yang tidak terpakai ---
    const [lastOrder] = useState<Order | null>(null);

    useEffect(() => {
        // Logika untuk mengambil pesanan terakhir bisa ditambahkan di sini di masa depan
    }, [user]);

    return (
        <div>
            <SectionHeader
                align="left"
                title="Dashboard"
                subtitle="Welcome back! Here's a quick overview of your account."
            />

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <DashboardCard 
                    icon={Award} 
                    title="Subscription Status"
                    href="/account/subscription"
                    linkText={activeSubscription ? "Manage Subscription" : "View Subscription Plans"}
                >
                    {activeSubscription ? (
                        <div className='space-y-1 text-sm'>
                            <p>You are on the <strong className="text-brand-light">{activeSubscription.subscription_plans?.name}</strong>.</p>
                            <p>Your access is active until <strong className="text-brand-light">{new Date(activeSubscription.current_period_end).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-start space-y-4">
                            <p>Unlock our entire font library! Access over 100+ premium fonts with one simple subscription.</p>
                            <Button href="/subscription" variant="primary">Upgrade Now</Button>
                        </div>
                    )}
                </DashboardCard>

                <DashboardCard 
                    icon={ShoppingCart} 
                    title="Recent Order"
                    href="/account/orders"
                    linkText="View All Orders"
                >
                    {lastOrder ? (
                        <div className="space-y-1">
                            <p><strong>Order ID:</strong> #{lastOrder.id.substring(0, 8).toUpperCase()}</p>
                            <p><strong>Date:</strong> {new Date(lastOrder.created_at).toLocaleDateString()}</p>
                            <p><strong>Total:</strong> ${lastOrder.total_amount?.toFixed(2)}</p>
                            <p><strong>Items:</strong> {lastOrder.item_count}</p>
                        </div>
                    ) : (
                        <p>You haven&apos;t made any purchases yet.</p>
                    )}
                </DashboardCard>
            </div>
        </div>
    );
}