// src/components/BannerSliderClient.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import type { EmblaOptionsType } from 'embla-carousel';

type BannerData = {
    src: string;
    href: string;
    alt: string;
};

type BannerSliderClientProps = {
    bannerData: BannerData[];
};

const EMBLA_OPTIONS: EmblaOptionsType = {
  loop: true,
  align: 'center',
};

export default function BannerSliderClient({ bannerData }: BannerSliderClientProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(EMBLA_OPTIONS, [
    Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true }),
  ]);

  const [, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi]);

  return (
    <section className="relative w-full bg-brand-darkest overflow-hidden">
      <div className="w-full" ref={emblaRef}>
        <div className="flex">
          {bannerData.map((banner, index) => (
            <div 
              className="relative flex-[0_0_85%] md:flex-[0_0_50%] min-w-0 p-0"
              key={index}
            >
              <div className="relative w-full h-0" style={{ paddingTop: '6.25%' }}> 
                <Link href={banner.href} className="absolute inset-0 group">
                  <div 
                    className="absolute inset-0 transition-transform duration-300 ease-in-out group-hover:scale-105"
                  >
                    <Image
                      src={banner.src}
                      alt={banner.alt}
                      fill
                      priority={index === 0}
                      className="object-cover w-full h-full"
                      sizes="100vw"
                    />
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}