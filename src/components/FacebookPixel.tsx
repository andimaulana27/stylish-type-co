'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { useEffect, useState } from 'react';

export default function FacebookPixel() {
  const [loaded, setLoaded] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Logika ini berjalan setiap kali user ganti halaman (klik link menu, dll)
    if (!loaded) return;
    
    // Kirim event PageView saat pindah rute
    if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'PageView');
    }
  }, [pathname, searchParams, loaded]);

  return (
    <>
      <Script
        id="fb-pixel"
        src="https://connect.facebook.net/en_US/fbevents.js"
        strategy="afterInteractive"
        onLoad={() => {
          // Inisialisasi Manual setelah script selesai di-download browser
          setLoaded(true);
          
          // INIT PIXEL ANDA
          (window as any).fbq('init', '1415867166812105'); 
          
          // TRACK HALAMAN PERTAMA KALI BUKA
          (window as any).fbq('track', 'PageView');
        }}
      />
    </>
  );
}