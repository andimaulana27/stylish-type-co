// src/components/subscription/UpdatePaymentModal.tsx
'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, CreditCard } from 'lucide-react';
import PaypalIcon from '@/components/icons/footer/PaypalIcon';

interface UpdatePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Nama prop diubah agar lebih generik, karena kedua tombol akan memanggilnya
  onContinue: () => void; 
}

const UpdatePaymentModal = ({ isOpen, onClose, onContinue }: UpdatePaymentModalProps) => {
    
    // Alih-alih step, kita langsung panggil onContinue dari kedua tombol
    const handleSelection = () => {
        onContinue();
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
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-brand-darkest border border-white/10 p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title as="h3" className="text-lg font-bold text-brand-light flex justify-between items-center">
                                    <span>Update payment details</span>
                                    <button onClick={onClose}><X size={20} className="text-brand-light-muted" /></button>
                                </Dialog.Title>
                                
                                <div className="mt-4 space-y-3">
                                    <p className="text-sm text-brand-light-muted">Select a payment method.</p>
                                    
                                    {/* Tombol Kartu Kredit/Debit sekarang memanggil handleSelection */}
                                    <button onClick={handleSelection} className="w-full text-left flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                        <span className="font-semibold text-brand-light">Credit / debit card</span>
                                        <CreditCard size={24} className="text-brand-accent" />
                                    </button>

                                    {/* Tombol PayPal sekarang memanggil handleSelection */}
                                    <button onClick={handleSelection} className="w-full text-left flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                        <span className="font-semibold text-brand-light">PayPal</span>
                                        <PaypalIcon className="h-6 w-auto text-brand-light" />
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

export default UpdatePaymentModal;