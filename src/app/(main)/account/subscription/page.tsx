// src/app/(main)/account/subscription/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getSubscriptionPlansAction } from '@/app/actions/subscriptionActions';
import { getSubscriptionHistoryAction } from '@/app/actions/orderActions';
import { type Tables } from '@/lib/database.types';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import SectionHeader from '@/components/SectionHeader';
import Button from '@/components/Button';
import ChangePlanModal from '@/components/subscription/ChangePlanModal';
import CancelSubscriptionModal from '@/components/subscription/CancelSubscriptionModal';
import { Loader2, FileText, ShieldCheck } from 'lucide-react';

type Plan = Tables<'subscription_plans'>;
type SubscriptionHistoryOrder = Pick<Tables<'orders'>, 'id' | 'created_at' | 'total_amount' | 'status'> & {
    planName: string | null;
};

// --- Komponen InfoRow dipindahkan ke sini untuk memastikan `router` digunakan ---
const InfoRow = ({ label, value, actionText, onActionClick }: { 
    label: string; 
    value: string; 
    actionText?: string; 
    onActionClick?: () => void;
}) => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 border-b border-white/10">
        <div>
            <p className="text-sm text-brand-light-muted">{label}</p>
            <p className="font-medium text-brand-light">{value}</p>
        </div>
        {actionText && onActionClick && (
            <button onClick={onActionClick} className="text-sm font-semibold text-brand-accent hover:underline mt-2 sm:mt-0">
                {actionText}
            </button>
        )}
    </div>
);


const StatusBadge = ({ status }: { status: string }) => {
    const statusClasses = 
        status === 'Completed' || status === 'Subscription Purchase' ? 'bg-green-500/20 text-green-300'
      : status === 'Pending' ? 'bg-yellow-500/20 text-yellow-500'
      : 'bg-gray-500/20 text-gray-300';
    return (
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusClasses}`}>
            {status}
        </span>
    );
};

export default function SubscriptionPage() {
    // --- PERBAIKAN: Variabel 'user' dan 'router' sekarang digunakan ---
    const { activeSubscription, refreshAuthStatus, user } = useAuth();
    const router = useRouter(); 
    
    const [isChangePlanModalOpen, setChangePlanModalOpen] = useState(false);
    const [isCancelModalOpen, setCancelModalOpen] = useState(false);
    const [allPlans, setAllPlans] = useState<Plan[]>([]);
    const [loadingPlans, setLoadingPlans] = useState(false);
    const [showCancelOptions, setShowCancelOptions] = useState(false);
    const [subscriptionHistory, setSubscriptionHistory] = useState<SubscriptionHistoryOrder[]>([]);

    useEffect(() => {
        const fetchSubscriptionHistory = async () => {
            if (activeSubscription) {
                const { data } = await getSubscriptionHistoryAction();
                if (data) {
                    setSubscriptionHistory(data as SubscriptionHistoryOrder[]);
                }
            }
        };
        fetchSubscriptionHistory();
    }, [activeSubscription]);

    const openChangePlanModal = async () => {
        setLoadingPlans(true);
        if (allPlans.length === 0) {
            const { plans } = await getSubscriptionPlansAction();
            if (plans) {
                setAllPlans(plans as Plan[]);
            }
        }
        setChangePlanModalOpen(true);
        setLoadingPlans(false);
    };

    if (!activeSubscription) {
        return (
             <div className="bg-brand-darkest p-8 rounded-lg border border-brand-accent/30 text-center">
                <h3 className="text-2xl font-bold text-brand-light">You Are Not Subscribed</h3>
                <p className="text-brand-light-muted mt-2 max-w-xl mx-auto">
                    Gain unlimited access to all our current and future fonts, starting from just $99. Perfect for any project, big or small.
                </p>
                <div className="mt-8">
                    <Button href="/subscription" variant="primary">View Subscription Plans</Button>
                </div>
            </div>
        );
    }
    
    const currentPlan = activeSubscription.subscription_plans;
    const nextPaymentDate = new Date(activeSubscription.current_period_end).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <>
            <SectionHeader
                align="left"
                title="Subscription"
                subtitle="Manage your current subscription plan, billing, and payment details."
            />

            <div className="mt-8 space-y-10">
                <div className="bg-brand-darkest p-6 rounded-lg border border-white/10">
                    <h3 className="text-xl font-semibold text-brand-light mb-4">Current Plan</h3>
                    <div className="flex flex-col sm:flex-row justify-between items-start p-4 bg-white/5 rounded-md">
                        <div>
                            <p className="font-bold text-brand-accent">{currentPlan?.name}</p>
                            <p className="text-sm text-brand-light-muted">Billed monthly</p>
                            <p className="text-sm text-brand-light-muted">Next payment: {nextPaymentDate}</p>
                        </div>
                        <div className="flex gap-2 mt-4 sm:mt-0">
                             <button 
                                onClick={openChangePlanModal} 
                                disabled={loadingPlans}
                                className="px-4 py-1.5 text-xs font-semibold bg-white/10 text-brand-light rounded-md hover:bg-white/20 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                            >
                                {loadingPlans && <Loader2 size={14} className="animate-spin" />}
                                Change Plan
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-brand-darkest p-6 rounded-lg border border-white/10">
                    <h3 className="text-xl font-semibold text-brand-light mb-2">Billing & Payment</h3>
                    {/* --- PERBAIKAN: Memastikan 'user' dan 'router' digunakan di sini --- */}
                    <InfoRow label="Billing Email" value={user?.email || 'N/A'} actionText="Change billing information" onActionClick={() => router.push('/account/profile')} />
                    <InfoRow label="Payment Details" value="PayPal" actionText="Update payment details" onActionClick={openChangePlanModal} />
                </div>
                
                <div className="bg-brand-darkest p-6 rounded-lg border border-white/10">
                    <h3 className="text-xl font-semibold text-brand-light mb-4">Subscription History</h3>
                     <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-white/10 text-brand-light-muted">
                                <tr>
                                    <th className="p-4 font-medium">Order ID</th>
                                    <th className="p-4 font-medium">Date</th>
                                    <th className="p-4 font-medium">Plan</th>
                                    <th className="p-4 font-medium">Total</th>
                                    <th className="p-4 font-medium">Status</th>
                                    <th className="p-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subscriptionHistory.length === 0 ? (
                                    <tr><td colSpan={6} className="p-8 text-center text-brand-light-muted">No transaction history found.</td></tr>
                                ) : (
                                    subscriptionHistory.map((order) => (
                                        <tr key={order.id} className="border-b border-white/10 last:border-b-0 hover:bg-white/5 transition-colors">
                                            <td className="p-4 font-mono text-brand-light-muted text-xs">#{order.id.substring(0, 8).toUpperCase()}</td>
                                            <td className="p-4 text-brand-light">{new Date(order.created_at).toLocaleDateString()}</td>
                                            <td className="p-4 text-brand-light font-medium">{order.planName}</td>
                                            <td className="p-4 text-brand-light font-semibold">${order.total_amount?.toFixed(2)}</td>
                                            <td className="p-4"><StatusBadge status={order.status} /></td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link href={`/invoices/${order.id}`} className="p-2 text-brand-light-muted hover:text-brand-accent transition-colors" title="View Invoice" target="_blank">
                                                        <FileText size={16} />
                                                    </Link>
                                                    <Link href={`/eula/${order.id}`} className="p-2 text-brand-light-muted hover:text-brand-accent transition-colors" title="View EULA" target="_blank">
                                                        <ShieldCheck size={16} /> 
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-brand-darkest p-6 rounded-lg border border-red-500/30">
                     <h3 className="text-xl font-semibold text-red-400 mb-2">Danger Zone</h3>
                     <p className="text-sm text-brand-light-muted">Manage your subscription cancellation options.</p>
                     <div className="mt-4">
                        <button 
                            onClick={() => setShowCancelOptions(!showCancelOptions)} 
                            className="px-4 py-2 text-sm font-semibold bg-red-500/20 text-red-300 rounded-md hover:bg-red-500/30 transition-colors"
                        >
                            {showCancelOptions ? 'Hide Options' : 'Show Cancellation Options'}
                        </button>

                        {showCancelOptions && (
                            <div className="mt-4 p-4 border border-red-500/30 rounded-md animate-fade-in">
                                <p className="text-sm text-brand-light-muted">If you cancel your plan, you will lose access to all subscription benefits at the end of your current billing period. This action can be undone before the period ends.</p>
                                <button onClick={() => setCancelModalOpen(true)} className="mt-4 text-sm font-semibold text-red-400 hover:underline">
                                    I want to cancel my subscription
                                </button>
                            </div>
                        )}
                     </div>
                </div>
            </div>

            <ChangePlanModal
                isOpen={isChangePlanModalOpen}
                onClose={() => setChangePlanModalOpen(false)}
                allPlans={allPlans}
                activeSubscription={activeSubscription}
                refreshAuthStatus={refreshAuthStatus}
            />
            <CancelSubscriptionModal
                isOpen={isCancelModalOpen}
                onClose={() => setCancelModalOpen(false)}
                onSuccess={() => {
                    refreshAuthStatus();
                    setShowCancelOptions(false);
                }}
                subscriptionId={activeSubscription.id}
            />
        </>
    );
}