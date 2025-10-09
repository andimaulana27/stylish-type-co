// src/components/font-detail/FontImageGallery.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

type FontImageGalleryProps = {
  mainImage: string;
  galleryImages: string[];
  fontName: string;
};

const SLIDE_INTERVAL = 5000;

const FontImageGallery = ({ mainImage, galleryImages, fontName }: FontImageGalleryProps) => {
  const allImages = [mainImage, ...galleryImages.filter(img => img !== mainImage)];
  
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: 'center',
  });

  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

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

  useEffect(() => {
    if (!emblaApi) return;
    const autoplay = setInterval(scrollNext, SLIDE_INTERVAL);
    return () => clearInterval(autoplay);
  }, [scrollNext, emblaApi]);

  return (
    // --- PERUBAHAN UTAMA DI SINI ---
    // Mobile: h-[50vh] (50% tinggi layar)
    // Desktop (lg): h-[70vh] (70% tinggi layar)
    <section className="relative w-full h-[24vh] lg:h-[70vh] bg-brand-darkest overflow-hidden">
      <div className="h-full" ref={emblaRef}>
        <div className="flex h-full">
          {allImages.map((img, index) => (
            <div 
              className="relative flex-[0_0_80%] md:flex-[0_0_52%] min-w-0"
              key={index}
            >
              <div 
                className="relative w-full h-full transition-opacity duration-500"
                style={{ opacity: index === selectedIndex ? 1 : 0.6 }}
              >
                <Image
                  src={img}
                  alt={`Preview ${index + 1} for ${fontName}`}
                  fill
                  priority={index < 2}
                  sizes="(min-width: 768px) 52vw, 80vw"
                  className="object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="absolute inset-0 bg-black/10 z-10 pointer-events-none"></div>

      <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-4 sm:px-8 z-20">
        <button 
          onClick={scrollPrev} 
          className="bg-brand-accent text-brand-darkest p-3 rounded-full transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-brand-accent/30"
          aria-label="Previous slide"
        >
          <ChevronLeft size={28} />
        </button>
        <button 
          onClick={scrollNext} 
          className="bg-brand-accent text-brand-darkest p-3 rounded-full transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-brand-accent/30"
          aria-label="Next slide"
        >
          <ChevronRight size={28} />
        </button>
      </div>
    </section>
  );
};

export default FontImageGallery;