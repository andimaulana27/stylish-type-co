// src/components/blog/AdDisplay.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';

import { type AdSlotConfig } from '@/app/actions/blogActions';
import GoogleAdsense from './GoogleAdsense';

interface AdDisplayProps {
  config: AdSlotConfig | undefined;
  className?: string;
  fallback?: React.ReactNode; 
}

const extractAdsenseData = (script: string): { slot: string | null } => {
    const slotMatch = script.match(/data-ad-slot="([^"]+)"/);
    return {
        slot: slotMatch ? slotMatch[1] : null,
    };
};

const AdDisplay = ({ config, className = '', fallback = null }: AdDisplayProps) => {
  const isEmpty = !config || (!config.banner_image_url && !config.google_script);

  if (isEmpty) {
    return <>{fallback}</>;
  }

  if (config.ad_type === 'banner' && config.banner_image_url) {
    return (
      // --- PERBAIKAN UNTUK BANNER ---
      // Kita hapus 'className' dari wrapper dan tambahkan style centering
      <div className="w-full flex justify-center items-center">
        <Link href="/contact?subject=Ad Inquiry" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block' }}>
          <Image 
            src={config.banner_image_url} 
            alt="Advertisement" 
            width={728}
            height={90}
            style={{ width: '100%', height: 'auto', borderRadius: '0.5rem' }}
          />
        </Link>
      </div>
    );
  }

  if (config.ad_type === 'google_ads' && config.google_script) {
    const { slot } = extractAdsenseData(config.google_script);
    
    if (slot) {
        const isVerticalAd = config.position === 'left' || config.position === 'right';

        // --- PERUBAIKAN UTAMA DI SINI ---
        // Hapus 'div' wrapper yang memiliki background hitam.
        // Render 'GoogleAdsense' secara langsung.
        // Komponen 'GoogleAdsense' (dari langkah 1) sekarang akan mengurus centering-nya sendiri.
        return (
            <GoogleAdsense 
              slot={slot} 
              // 'auto' adalah format responsif modern yang lebih baik daripada 'fluid'
              format={'auto'}
              // Kita tetap teruskan 'className' jika ada, tapi style centering akan di-handle
              // oleh 'GoogleAdsense.tsx'
              className={`${isVerticalAd ? 'adsbygoogle adsbygoogle-vertical' : 'adsbygoogle'} ${className}`}
            />
        );
        // --- AKHIR PERUBAIKAN ---
    }
    return <>{fallback}</>;
  }

  return <>{fallback}</>;
};

export default AdDisplay;