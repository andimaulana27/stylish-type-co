// src/components/auth/RegistrationSuccessModal.tsx
'use client';

import { useState, useEffect, useTransition } from 'react';
import { MailCheck, X, Loader2 } from 'lucide-react';
import { resendVerificationEmailAction } from '@/app/actions/authActions';
import toast from 'react-hot-toast';

interface RegistrationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

const RegistrationSuccessModal = ({ isOpen, onClose, email }: RegistrationSuccessModalProps) => {
  const [countdown, setCountdown] = useState(60);
  const [isResending, startResendTransition] = useTransition();

  useEffect(() => {
    if (!isOpen) {
      setCountdown(60); // Reset countdown saat modal ditutup
      return;
    }

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, countdown]);

  const handleResend = () => {
    if (countdown > 0) return;

    startResendTransition(async () => {
      const result = await resendVerificationEmailAction(email);
      if (result.error) {
        toast.error(result.error);
        // Reset countdown lebih cepat jika ada error dari server
        setCountdown(10); 
      } else {
        toast.success('A new verification email has been sent!');
        setCountdown(60); // Mulai countdown lagi
      }
    });
  };

  if (!isOpen) {
    return null;
  }

  const isButtonDisabled = countdown > 0 || isResending;

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
            <MailCheck className="h-8 w-8 text-brand-accent" aria-hidden="true" />
          </div>
          <h2 className="text-3xl font-bold text-brand-light">
            Registration Successful!
          </h2>
          <p className="text-lg text-brand-light-muted mt-2">
            Please check your inbox to verify your account.
          </p>
          <div className="mt-6 text-sm text-brand-light-muted bg-white/5 p-4 rounded-md border border-white/10 w-full">
            <p>
              A confirmation link has been sent to <br />
              <strong className="text-brand-light">{email}</strong>.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full">
            <button
              onClick={handleResend}
              disabled={isButtonDisabled}
              className="w-full px-6 py-3 font-medium rounded-full text-center bg-transparent border border-white/20 text-brand-light hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isResending ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                'Resend Email'
              )}
              {countdown > 0 && !isResending && `(${countdown}s)`}
            </button>
          </div>
            <p className="text-xs text-brand-light-muted mt-4">
              Didn&apos;t receive the email? Check your spam folder or try resending.
            </p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationSuccessModal;