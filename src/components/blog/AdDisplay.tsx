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
        // --- PERUBAHAN UTAMA DI SINI ---
        const isVerticalAd = config.position === 'left' || config.position === 'right';
        
        // Tentukan style kustom. Jika ini iklan vertikal, atur min-height.
        // 400px adalah nilai yang baik untuk "meminta" iklan tinggi seperti 300x600.
        const adStyle = isVerticalAd ? { minHeight: '400px' } : {};
        // --- AKHIR PERUBAHAN ---

        return (
            <GoogleAdsense 
              slot={slot} 
              format={'auto'}
              // Terapkan style kustom ke komponen GoogleAdsense
              style={adStyle}
              className={`${isVerticalAd ? 'adsbygoogle adsbygoogle-vertical' : 'adsbygoogle'} ${className}`}
            />
        );
    }
    return <>{fallback}</>;
  }

  return <>{fallback}</>;
};

export default AdDisplay;