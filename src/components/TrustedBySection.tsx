// src/components/TrustedBySection.tsx
import React from 'react';
import Image from 'next/image';
import SectionHeader from './SectionHeader';

// --- PERUBAHAN: Komponen tidak lagi async dan menerima data via props ---
const TrustedBySection = ({ brands }: { brands: { id: string; logo_url: string; name: string }[] }) => {
  if (brands.length === 0) {
    return null; 
  }

  return (
    <section className="bg-brand-dark-secondary py-20">
      <div className="container mx-auto px-6">
        <SectionHeader
          title="Brands Using Our Fonts"
          subtitle="Discover the global brands, agencies, and organizations that rely on our fonts to create powerful identities and memorable designs."
        />
        <div className="grid grid-cols-4 md:grid-cols-8 gap-x-12 gap-y-12 items-center">
          {brands.map((logo) => (
            <div
              key={logo.id}
              className="relative h-24 flex items-center justify-center"
            >
              <Image
                src={logo.logo_url}
                alt={`${logo.name} logo`}
                fill
                sizes="(max-width: 768px) 25vw, 12.5vw"
                className="object-contain brightness-0 invert grayscale opacity-60 hover:opacity-100 transition-opacity duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustedBySection;