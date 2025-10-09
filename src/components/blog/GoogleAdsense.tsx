// src/components/blog/GoogleAdsense.tsx
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

type GoogleAdsenseProps = {
  client: string;
  slot: string;
  className?: string;
  format?: 'auto' | 'fluid';
  responsive?: string;
};

const GoogleAdsense = ({ 
    client, 
    slot, 
    className = 'adsbygoogle', 
    format = 'auto', 
    responsive = 'true' 
}: GoogleAdsenseProps) => {
    
    const pathname = usePathname();

    useEffect(() => {
        try {
            // @ts-expect-error adsbygoogle is loaded from an external script
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (err) {
            // --- PERBAIKAN UTAMA DI SINI ---
            // Kita cek terlebih dahulu apakah 'err' adalah sebuah instance dari Error
            if (err instanceof Error) {
                // Jangan tampilkan error di konsol jika hanya karena slot sudah terisi
                if (err.message.includes("All ins elements in the DOM with class=adsbygoogle already have ads in them.")) {
                    return;
                }
                console.error("AdSense error:", err.message);
            } else {
                // Jika 'err' bukan objek Error, log saja apa adanya
                console.error("An unknown AdSense error occurred:", err);
            }
            // --- AKHIR PERBAIKAN ---
        }
    }, [pathname]); 

    if (!client || !slot) {
        return null;
    }

    return (
        <ins
            className={className}
            style={{ display: 'block' }}
            data-ad-client={client}
            data-ad-slot={slot}
            data-ad-format={format}
            data-full-width-responsive={responsive}
            key={`${pathname}-${slot}`}
        />
    );
};

export default GoogleAdsense;