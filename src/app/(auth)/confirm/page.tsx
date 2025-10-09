// src/app/(auth)/confirm/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AuthConfirmPage() {
  const router = useRouter();
  const { profile, loading } = useAuth(); // Ambil status loading dari context

  useEffect(() => {
    // --- PERBAIKAN DI SINI ---
    // Jangan lakukan apa-apa sampai context selesai memuat data user (loading === false)
    if (loading) {
      return;
    }

    const timer = setTimeout(() => {
      // Jika setelah loading selesai ternyata tidak ada profil (jarang terjadi), fallback ke login
      if (!profile) {
        router.push('/login');
        return;
      }
      
      const userRole = profile.role || 'user';
      let redirectUrl = '/account';

      if (userRole === 'admin') {
        redirectUrl = '/admin/dashboard';
      } else if (userRole === 'blogger') {
        redirectUrl = '/admin/blog';
      } else if (userRole === 'uploader') {
        redirectUrl = '/admin/products/fonts';
      }
      
      router.push(redirectUrl);
    }, 3000); // Beri jeda 3 detik agar pengguna bisa membaca pesan

    return () => clearTimeout(timer);
  }, [router, profile, loading]); // Tambahkan `loading` sebagai dependency

  return (
    <div className="w-full max-w-md text-center bg-brand-darkest p-8 rounded-lg border border-brand-accent/30">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-accent/20">
        <CheckCircle2 className="h-6 w-6 text-brand-accent" aria-hidden="true" />
      </div>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-brand-light">
        Email Verified Successfully!
      </h1>
      <p className="mt-2 text-sm text-brand-light-muted">
        Thank you for confirming your email. You are now logged in. Redirecting to your dashboard...
      </p>
      <div className="mt-6">
        <div className="flex items-center justify-center gap-2 text-brand-light-muted">
            <Loader2 className="animate-spin" size={16} />
            <span>Please wait...</span>
        </div>
      </div>
    </div>
  );
}