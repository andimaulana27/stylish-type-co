// src/components/CookieConsentBanner.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie } from 'lucide-react';
import { setCookieConsent } from '@/lib/cookieUtils';
import { useTransition } from 'react';

// Tipe ini akan digunakan untuk melacak status consent
type ConsentStatus = 'pending' | 'accepted' | 'declined';

const CookieConsentBanner = ({ initialConsent }: { initialConsent: boolean }) => {
  const [consentStatus, setConsentStatus] = useState<ConsentStatus>(initialConsent ? 'accepted' : 'pending');
  const [isExiting, setIsExiting] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Efek ini akan dijalankan saat komponen pertama kali dimuat
  useEffect(() => {
    // Jika persetujuan sudah diberikan sebelumnya, langsung sembunyikan banner
    if (initialConsent) {
      setConsentStatus('accepted');
    }
  }, [initialConsent]);

  const handleConsent = (consentValue: 'accepted' | 'declined') => {
    startTransition(async () => {
      await setCookieConsent(consentValue);
      setIsExiting(true);
      // Memberi waktu untuk animasi fade-out sebelum mengubah status
      setTimeout(() => {
        setConsentStatus(consentValue);
      }, 500); // Durasi harus sama dengan transisi di CSS
    });
  };

  // Jangan render apapun jika status bukan 'pending'
  if (consentStatus !== 'pending') {
    return null;
  }

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-4xl transition-all duration-500 ease-in-out
        ${isExiting ? 'opacity-0 -translate-y-10' : 'opacity-100 translate-y-0'}`}
    >
      <div className="bg-brand-darkest/80 backdrop-blur-lg border border-brand-accent/30 rounded-xl p-6 shadow-2xl shadow-brand-accent/10">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0">
            <Cookie className="w-10 h-10 text-brand-accent" />
          </div>
          <div className="flex-grow text-center md:text-left">
            <h3 className="font-semibold text-brand-light text-lg">Your Privacy Matters</h3>
            <p className="text-sm text-brand-light-muted mt-1">
              We use cookies to enhance your browsing experience and analyze our traffic. By clicking “Accept All”, you consent to our use of cookies. Read our{' '}
              <Link href="/privacy" className="underline hover:text-white transition-colors">
                Privacy Policy
              </Link>.
            </p>
          </div>
          <div className="flex-shrink-0 flex items-center gap-3">
            <button
              onClick={() => handleConsent('declined')}
              disabled={isPending}
              className="px-6 py-2.5 font-medium rounded-full text-center text-sm bg-transparent border border-white/20 text-brand-light hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              Decline
            </button>
            <button
              onClick={() => handleConsent('accepted')}
              disabled={isPending}
              className="px-6 py-2.5 font-medium rounded-full text-center text-sm bg-brand-accent text-brand-darkest transition-all duration-300 ease-in-out transform hover:shadow-lg hover:shadow-brand-accent/40 disabled:opacity-50"
            >
              {isPending ? 'Saving...' : 'Accept All'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;