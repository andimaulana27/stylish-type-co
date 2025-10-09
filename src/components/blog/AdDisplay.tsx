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

const extractAdsenseData = (script: string): { client: string | null, slot: string | null } => {
    const clientMatch = script.match(/data-ad-client="([^"]+)"/);
    const slotMatch = script.match(/data-ad-slot="([^"]+)"/);
    return {
        client: clientMatch ? clientMatch[1] : null,
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
      <div className={`relative ${className}`}>
        <Link href="/contact?subject=Ad Inquiry" target="_blank" rel="noopener noreferrer">
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
    const { client, slot } = extractAdsenseData(config.google_script);
    
    if (client && slot) {
        // --- PERUBAHAN LOGIKA UTAMA DI SINI ---
        const isHorizontalAd = config.position === 'top' || config.position === 'bottom' || config.position.startsWith('in_article');
        const isVerticalAd = config.position === 'left' || config.position === 'right';

        return (
            <div className={`w-full flex justify-center items-center ${className}`}>
                <GoogleAdsense 
                  client={client} 
                  slot={slot} 
                  // Terapkan format dan class yang sesuai berdasarkan posisi
                  format={isHorizontalAd ? 'fluid' : 'auto'}
                  className={isVerticalAd ? 'adsbygoogle adsbygoogle-vertical' : 'adsbygoogle'}
                />
            </div>
        );
        // --- AKHIR PERUBAHAN ---
    }
    return <>{fallback}</>;
  }

  return <>{fallback}</>;
};

export default AdDisplay;