// src/components/font-detail/RelatedFontsSection.tsx
'use client';

import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import ProductCard from '@/components/ProductCard'; 
import type { ProductData } from '@/lib/dummy-data'; 
import SectionHeader from '@/components/SectionHeader';
import Button from '@/components/Button';

type RelatedFontsSectionProps = {
  products: ProductData[];
  title: string;
  subtitle: string;
};

const RelatedFontsSection = ({ products, title, subtitle }: RelatedFontsSectionProps) => {
  const [emblaRef] = useEmblaCarousel(
    { 
      loop: true, 
      align: 'start',
      slidesToScroll: 2, // Menggulir 2 slide sekaligus (cocok untuk mobile)
    },
    [Autoplay({ delay: 5000, stopOnInteraction: true })] 
  );

  // Jika tidak ada produk terkait, jangan tampilkan apa-apa
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-white/10">
      <div className="container mx-auto px-6 py-20">
        <SectionHeader
          align="center"
          title={title}
          subtitle={subtitle}
        />
        
        {/* Jika produk kurang dari 5, tampilkan sebagai grid.
          Jika lebih, tampilkan sebagai carousel.
        */}
        {products.length <= 4 ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 mt-12">
            {products.map((product) => (
              <ProductCard key={product.id} font={product} />
            ))}
          </div>
        ) : (
          <div className="overflow-hidden mt-12" ref={emblaRef}>
            <div className="flex -ml-4">
              {products.map((product) => (
                // Basis 1/2 di mobile (2 kolom), 1/4 di desktop (4 kolom)
                <div key={product.id} className="flex-grow-0 flex-shrink-0 basis-1/2 sm:basis-1/2 lg:basis-1/4 pl-4">
                  <ProductCard font={product} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center mt-16">
          <Button href="/product">
            View All Fonts
          </Button>
        </div>
      </div>
    </section>
  );
};

export default RelatedFontsSection;