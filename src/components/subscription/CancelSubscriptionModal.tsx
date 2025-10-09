// src/components/subscription/CancelSubscriptionModal.tsx
'use client';

import { Fragment, useTransition } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { cancelSubscriptionAction } from '@/app/actions/subscriptionActions';
import toast from 'react-hot-toast';

interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subscriptionId: string;
}

const CancelSubscriptionModal = ({ isOpen, onClose, onSuccess, subscriptionId }: CancelSubscriptionModalProps) => {
    const [isPending, startTransition] = useTransition();

    const handleConfirm = () => {
        startTransition(async () => {
            const result = await cancelSubscriptionAction(subscriptionId);
            if(result.error) {
                toast.error(result.error);
            } else {
                toast.success(result.success || 'Subscription cancelled.');
                onSuccess();
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
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-brand-darkest border border-red-500/50 p-6 text-left align-middle shadow-xl transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                                        <AlertTriangle className="w-6 h-6 text-red-500" />
                                    </div>
                                    <Dialog.Title as="h3" className="text-lg font-bold text-brand-light">Confirm Cancellation</Dialog.Title>
                                </div>
                                <div className="mt-4">
                                    <p className="text-sm text-brand-light-muted">
                                        Are you sure you want to cancel your subscription? Your access to all benefits will end on your next renewal date.
                                    </p>
                                </div>
                                <div className="mt-6 flex justify-end gap-3">
                                    <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-medium text-brand-light-muted hover:bg-white/10 rounded-full">Keep Subscription</button>
                                    <button type="button" onClick={handleConfirm} disabled={isPending} className="px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-500 rounded-full flex items-center gap-2">
                                        {isPending && <Loader2 size={16} className="animate-spin" />}
                                        Yes, Cancel
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default CancelSubscriptionModal;