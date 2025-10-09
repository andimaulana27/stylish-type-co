// src/components/auth/GoogleAuthButton.tsx
'use client';

import { useTransition } from 'react';
import toast from 'react-hot-toast';
import { signInWithGoogleAction } from '@/app/actions/authActions';

// --- PERBAIKAN 1: Buat komponen ikon Google kustom menggunakan SVG ---
// Ini menghilangkan kebutuhan akan pustaka 'react-icons'
const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M44.5 24.3H42.7V24.3C42.7 23.3 42.6 22.3 42.4 21.3H24.5V28.3H35.3C34.8 30.8 33.1 33.4 30.2 35.3V39.8H36.3C41.3 35.2 44.5 29.8 44.5 24.3Z" fill="#4285F4"/>
    <path d="M24.5 45C31.5 45 37.4 42.5 41.3 38.3L35.2 33.8C33 35.3 30 36.3 26.5 36.3C20.5 36.3 15.4 32.3 13.5 26.8H7.2V31.4C10.1 37.3 16.8 41.5 24.5 41.5Z" fill="#34A853"/>
    <path d="M13.5 26.8C13.1 25.6 12.9 24.3 12.9 23C12.9 21.7 13.1 20.4 13.5 19.2V14.6H7.2C5.3 18.1 4 22.4 4 27.3C4 32.2 5.3 36.5 7.2 40L13.5 35.4C12.7 33.2 12.3 30.8 12.3 28.3C12.3 25.8 12.7 23.4 13.5 21.2V26.8Z" fill="#FBBC05"/>
    <path d="M24.5 11.7C28.1 11.7 31.1 13 33.3 15.1L38.5 9.9C34.9 6.7 30.1 4.5 24.5 4.5C16.8 4.5 10.1 8.7 7.2 14.6L13.5 19.2C15.4 13.7 20.5 9.7 26.5 9.7H24.5V11.7Z" fill="#EA4335"/>
  </svg>
);

export default function GoogleAuthButton() {
  const [isPending, startTransition] = useTransition();
  
  const handleSignInWithGoogle = () => {
    startTransition(async () => {
      const result = await signInWithGoogleAction();
      if (result?.error) {
        toast.error(result.error);
      }
    });
  };

  return (
    <button
      onClick={handleSignInWithGoogle}
      disabled={isPending}
      className="w-full flex items-center justify-center gap-3 bg-transparent 
                 text-brand-accent font-medium py-3 px-4 rounded-full 
                 border border-brand-accent 
                 transition-all duration-300 ease-in-out transform
                 hover:shadow-lg hover:shadow-brand-accent/40 
                 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {/* --- PERBAIKAN 2: Ganti ikon lama dengan komponen SVG kustom --- */}
      <GoogleIcon className="w-5 h-5" />
      <span className="text-sm">
        {isPending ? 'Redirecting...' : 'Continue with Google'}
      </span>
    </button>
  );
}