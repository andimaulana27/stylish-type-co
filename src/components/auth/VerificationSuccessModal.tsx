// src/components/auth/VerificationSuccessModal.tsx
'use client';

import { CheckCircle2, X } from 'lucide-react';

interface VerificationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

const VerificationSuccessModal = ({ isOpen, onClose, onContinue }: VerificationSuccessModalProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="relative bg-brand-darkest border border-brand-accent/30 rounded-lg p-8 w-full max-w-lg text-center shadow-2xl shadow-brand-accent/10"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-brand-light-muted hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-accent/20 mb-6">
            <CheckCircle2 className="h-8 w-8 text-brand-accent" aria-hidden="true" />
          </div>
          <h2 className="text-3xl font-bold text-brand-light">
            Verification Successful!
          </h2>
          <p className="text-lg text-brand-light-muted mt-2">
            Your email has been verified. You can now proceed to your account.
          </p>
          <div className="mt-8 w-full">
            <button
              onClick={onContinue}
              className="w-full px-6 py-3 font-medium rounded-full text-center bg-brand-accent text-brand-darkest transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-brand-accent/40"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationSuccessModal;