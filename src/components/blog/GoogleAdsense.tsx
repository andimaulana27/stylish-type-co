// src/components/blog/GoogleAdsense.tsx
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

type GoogleAdsenseProps = {
  slot: string;
  className?: string;
  format?: 'auto' | 'fluid';
  responsive?: string;
};

const GoogleAdsense = ({ 
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
            if (err instanceof Error) {
                if (err.message.includes("All ins elements in the DOM with class=adsbygoogle already have ads in them.")) {
                    return;
                }
                console.error("AdSense error:", err.message);
            } else {
                console.error("An unknown AdSense error occurred:", err);
            }
        }
    }, [pathname]); 

    if (!slot) {
        return null;
    }

    return (
        <ins
            className={className}
            // --- PERBAIKAN UTAMA DI SINI ---
            // 1. display: 'block' diperlukan agar margin auto berfungsi
            // 2. margin: '0 auto' akan memusatkan slot iklan secara horizontal
            // 3. textAlign: 'center' untuk memastikan konten di dalamnya juga center
            style={{ display: 'block', margin: '0 auto', textAlign: 'center' }}
            // --- AKHIR PERBAIKAN ---
            data-ad-slot={slot}
            data-ad-format={format}
            data-full-width-responsive={responsive}
            key={`${pathname}-${slot}`}
        />
    );
};

export default GoogleAdsense;