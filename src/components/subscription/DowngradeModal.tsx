// src/components/subscription/DowngradeModal.tsx
'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { AlertTriangle, } from 'lucide-react';
import { type Tables } from '@/lib/database.types';

type Plan = Tables<'subscription_plans'>;

interface DowngradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  planToDowngrade: Plan | null;
}

const DowngradeModal = ({ isOpen, onClose, onConfirm, planToDowngrade }: DowngradeModalProps) => {
  if (!isOpen || !planToDowngrade) {
    return null;
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-brand-darkest border border-yellow-500/50 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div>
                    <Dialog.Title as="h3" className="text-lg font-bold text-brand-light">
                      Confirm Downgrade
                    </Dialog.Title>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-brand-light-muted">
                    Are you sure you want to downgrade to the <strong className="text-white">{planToDowngrade.name}</strong> plan?
                  </p>
                  <p className="mt-3 text-sm text-yellow-400 bg-yellow-500/10 p-3 rounded-md border border-yellow-500/20">
                    <strong>Warning:</strong> Your current subscription benefits will be lost immediately and replaced with the new plan&apos;s features. This action cannot be undone.
                  </p>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-brand-light-muted hover:bg-white/10"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-full border border-transparent bg-yellow-500 px-5 py-2 text-sm font-semibold text-brand-darkest hover:bg-yellow-400"
                    onClick={onConfirm}
                  >
                    Yes, Downgrade
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

export default DowngradeModal;