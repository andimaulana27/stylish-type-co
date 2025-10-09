// src/components/checkout/CheckoutSuccessModal.tsx
'use client';

import { CheckCircle2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUI } from '@/context/UIContext';

interface CheckoutSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSubscription?: boolean;
}

const CheckoutSuccessModal = ({ isOpen, onClose, isSubscription = false }: CheckoutSuccessModalProps) => {
  const router = useRouter();
  const { clearCart } = useUI();

  if (!isOpen) {
    return null;
  }
  
  // --- PERUBAHAN DIMULAI DI SINI ---

  // Logika untuk pembelian Font/Bundle
  let title = "Thank You For Your Order!";
  let primaryMessage = "Your purchase has been completed successfully.";
  let secondaryMessage = "A confirmation email has been sent with your download links. You can also access your files anytime from your account library.";
  let primaryButtonText = "Tutorial";
  let primaryButtonLink = "/blog/from-browse-to-download-your-guide-to-purchasing-fonts-on-timeless-type";
  let secondaryButtonText = "Go to My Library";
  let secondaryButtonLink = "/account/my-fonts";

  // Timpa logika jika ini adalah pembelian langganan
  if (isSubscription) {
    title = "Welcome Aboard!";
    primaryMessage = "Your subscription is now active.";
    secondaryMessage = "You now have unlimited access to our entire font library. A confirmation email has been sent to you. Start exploring!";
    primaryButtonText = "Tutorial";
    primaryButtonLink = "/blog/instant-access-how-to-download-fonts-with-your-subscription";
    secondaryButtonText = "Go to My Subscription";
    secondaryButtonLink = "/account/subscription";
  }
  
  const handlePrimaryAction = () => {
    if (!isSubscription) {
      clearCart();
    }
    onClose();
    router.push(primaryButtonLink);
  };
  
  const handleSecondaryAction = () => {
    if (!isSubscription) {
      clearCart();
    }
    onClose();
    router.push(secondaryButtonLink);
  };

  const handleClose = () => {
    if (!isSubscription) {
      clearCart();
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="relative bg-brand-darkest border border-brand-accent/30 rounded-lg p-8 w-full max-w-2xl text-center shadow-2xl shadow-brand-accent/10"
      >
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-brand-light-muted hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center">
          <CheckCircle2 size={64} className="text-brand-secondary-green" />
          <h2 className="text-3xl font-bold mt-6 text-brand-light">
            {title}
          </h2>
          <p className="text-lg text-brand-light-muted mt-2">
            {primaryMessage}
          </p>
          <div className="mt-6 text-sm text-brand-light-muted bg-white/5 p-4 rounded-md border border-white/10">
            <p>
              {secondaryMessage}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full">
            {/* Tombol Kiri (Primary) */}
            <button
              onClick={handlePrimaryAction}
              className="w-full px-6 py-3 font-medium rounded-full text-center bg-brand-accent text-brand-darkest transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-brand-accent/40"
            >
              {primaryButtonText}
            </button>
            {/* Tombol Kanan (Secondary) */}
            <button
              onClick={handleSecondaryAction}
              className="w-full px-6 py-3 font-medium rounded-full text-center bg-transparent border border-white/20 text-brand-light hover:bg-white/10 transition-colors"
            >
              {secondaryButtonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccessModal;
// --- AKHIR PERUBAHAN ---