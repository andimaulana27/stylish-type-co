// src/components/FontInUseClient.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Database } from '@/lib/database.types';

type GalleryImage = Database['public']['Tables']['gallery_images']['Row'];

type FontInUseClientProps = {
  galleryImages: GalleryImage[];
};

export default function FontInUseClient({ galleryImages }: FontInUseClientProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const [emblaRef] = useEmblaCarousel(
    { loop: true, align: 'start', dragFree: true },
    [Autoplay({ delay: 3000, stopOnInteraction: false, playOnInit: true })]
  );

  const openLightbox = useCallback((index: number) => {
    setSelectedImageIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    document.body.style.overflow = '';
  }, []);

  const goToNext = useCallback(() => {
    setSelectedImageIndex((prevIndex) => (prevIndex + 1) % galleryImages.length);
  }, [galleryImages.length]);

  const goToPrev = useCallback(() => {
    setSelectedImageIndex((prevIndex) => (prevIndex - 1 + galleryImages.length) % galleryImages.length);
  }, [galleryImages.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightboxOpen, goToNext, goToPrev, closeLightbox]);

  return (
    <>
      <div className="w-full cursor-grab mt-12" ref={emblaRef}>
        <div className="flex">
          {galleryImages.map((image, index) => (
            <div
              key={image.id}
              // --- PERUBAHAN UTAMA DI SINI ---
              // lg:flex-[0_0_12.5%] (8 item) diubah menjadi lg:flex-[0_0_16.667%] (6 item)
              className="relative flex-[0_0_50%] sm:flex-[0_0_33.33%] md:flex-[0_0_25%] lg:flex-[0_0_16.667%] min-w-0 p-0 group"
              onClick={() => openLightbox(index)}
            >
              <div className="relative w-full overflow-hidden aspect-[4/5]">
                <Image
                  src={image.image_url}
                  alt={image.alt_text || 'Font in use example'}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 17vw"
                  className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {lightboxOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in-fast">
          <button onClick={closeLightbox} className="absolute top-4 right-4 text-white/70 hover:text-brand-accent-green transition-colors z-50">
            <X size={32} />
          </button>
          <div className="relative w-full h-full max-w-5xl max-h-[85vh] flex items-center justify-center">
            <button onClick={goToPrev} className="absolute left-0 sm:-left-12 text-white/70 hover:text-brand-accent-green transition-colors p-2 z-50">
              <ChevronLeft size={48} />
            </button>
            <div className="relative w-full h-full">
               <Image
                src={galleryImages[selectedImageIndex].image_url}
                alt={galleryImages[selectedImageIndex].alt_text || 'Gallery image'}
                fill
                sizes="90vw"
                className="object-contain"
              />
            </div>
            <button onClick={goToNext} className="absolute right-0 sm:-right-12 text-white/70 hover:text-brand-accent-green transition-colors p-2 z-50">
              <ChevronRight size={48} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}