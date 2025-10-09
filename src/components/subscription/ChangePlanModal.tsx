// src/components/subscription/ChangePlanModal.tsx
'use client';

import { Fragment, useState, useTransition, useMemo } from 'react';
import { Dialog, Transition, RadioGroup } from '@headlessui/react';
import { useRouter } from 'next/navigation';
import { type Tables } from '@/lib/database.types';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { updateSubscriptionAction } from '@/app/actions/subscriptionActions';
import toast from 'react-hot-toast';

type Plan = Tables<'subscription_plans'>;
type UserSubscription = Tables<'user_subscriptions'> & {
  subscription_plans: Pick<Tables<'subscription_plans'>, 'name' | 'price_monthly' | 'price_yearly' | 'features'> | null;
};

interface ChangePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  allPlans: Plan[];
  activeSubscription: UserSubscription;
  refreshAuthStatus: () => Promise<void>;
}

const ChangePlanModal = ({ isOpen, onClose, allPlans, activeSubscription, refreshAuthStatus }: ChangePlanModalProps) => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [selectedPlanId, setSelectedPlanId] = useState<string>(activeSubscription.plan_id);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    const currentPlanPriceMonthly = activeSubscription.subscription_plans?.price_monthly ?? 0;
    const selectedPlan = allPlans.find(p => p.id === selectedPlanId);
    
    const isUpgrade = selectedPlan ? selectedPlan.price_monthly > currentPlanPriceMonthly : false;

    // --- PERUBAHAN UTAMA: MENGHAPUS PAJAK ---
    const chargeDetails = useMemo(() => {
        if (!selectedPlan) return null;

        const price = billingCycle === 'yearly' ? selectedPlan.price_yearly : selectedPlan.price_monthly;
        
        return {
            planName: `${selectedPlan.name} - ${billingCycle} plan`,
            price: price,
            total: price, // Total sekarang sama dengan harga dasar
        };
    }, [selectedPlan, billingCycle]);
    // --- AKHIR PERUBAHAN ---

    const handleConfirm = () => {
        if (!selectedPlan) return;

        if (isUpgrade) {
            const upgradeUrl = `/checkout?planId=${selectedPlan.id}&billing=${billingCycle}&upgradeFrom=${activeSubscription.id}`;
            onClose();
            router.push(upgradeUrl);
            return;
        }

        startTransition(async () => {
            const result = await updateSubscriptionAction(selectedPlan.id, true);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(result.success || 'Plan changed successfully!');
                await refreshAuthStatus();
                onClose();
            }
        });
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black/70" />
                </Transition.Child>
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-brand-darkest border border-white/10 p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title as="h3" className="text-lg font-bold text-brand-light">Change plan and billing period</Dialog.Title>
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Kolom Kiri: Opsi */}
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="text-sm font-semibold text-brand-light-muted mb-2">Change billing period</h4>
                                            <div className="bg-brand-dark-secondary p-1.5 rounded-full flex items-center space-x-2">
                                                <button onClick={() => setBillingCycle('monthly')} className={`w-full px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${billingCycle === 'monthly' ? 'bg-brand-accent text-brand-darkest' : 'text-brand-light-muted'}`}>Monthly</button>
                                                <button onClick={() => setBillingCycle('yearly')} className={`w-full px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${billingCycle === 'yearly' ? 'bg-brand-accent text-brand-darkest' : 'text-brand-light-muted'}`}>Yearly</button>
                                            </div>
                                        </div>
                                        <RadioGroup value={selectedPlanId} onChange={setSelectedPlanId}>
                                            <RadioGroup.Label className="text-sm font-semibold text-brand-light-muted mb-2">Change plan</RadioGroup.Label>
                                            <div className="space-y-2">
                                                {allPlans.map((plan) => (
                                                    <RadioGroup.Option key={plan.id} value={plan.id} className={({ checked }) =>`relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none transition-all ${checked ? 'border-brand-accent bg-brand-accent/10' : 'border-white/20 bg-white/5'}`}>
                                                        {({ checked }) => (
                                                            <>
                                                                <div className="flex w-full items-center justify-between">
                                                                    <div className="flex items-center">
                                                                        <div className="text-sm">
                                                                            <RadioGroup.Label as="p" className="font-medium text-brand-light">{plan.name}</RadioGroup.Label>
                                                                            <RadioGroup.Description as="span" className="text-brand-light-muted text-xs">{plan.description}</RadioGroup.Description>
                                                                        </div>
                                                                    </div>
                                                                    {checked && <div className="shrink-0 text-brand-accent"><CheckCircle2 className="h-5 w-5" /></div>}
                                                                </div>
                                                            </>
                                                        )}
                                                    </RadioGroup.Option>
                                                ))}
                                            </div>
                                        </RadioGroup>
                                    </div>
                                    
                                    {/* --- BAGIAN YANG DIPERBARUI: Rincian Biaya Tanpa Pajak --- */}
                                    <div className="bg-white/5 p-4 rounded-lg">
                                        <h4 className="text-sm font-semibold text-brand-light-muted mb-4">Summary</h4>
                                        {chargeDetails && (
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-brand-light-muted">{chargeDetails.planName}</span>
                                                    <span className="text-brand-light font-medium">${chargeDetails.price.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between pt-2 border-t border-white/10 font-bold">
                                                    <span className="text-brand-light">Charged today</span>
                                                    <span className="text-brand-accent">${chargeDetails.total.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        )}
                                        <div className="mt-6 flex justify-end gap-3">
                                            <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-medium text-brand-light-muted hover:bg-white/10 rounded-full">Cancel</button>
                                            <button type="button" onClick={handleConfirm} disabled={isPending || selectedPlanId === activeSubscription.plan_id} className="px-5 py-2 text-sm font-semibold text-brand-darkest bg-brand-accent hover:brightness-110 rounded-full disabled:opacity-50 flex items-center gap-2">
                                                {isPending && <Loader2 size={16} className="animate-spin" />}
                                                Confirm and pay
                                            </button>
                                        </div>
                                    </div>
                                    {/* --- AKHIR BAGIAN YANG DIPERBARUI --- */}
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default ChangePlanModal;