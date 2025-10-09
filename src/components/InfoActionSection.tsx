// src/components/InfoActionSection.tsx
import React from 'react';
import Button from './Button';

const InfoActionSection = () => {
  return (
    // --- PERUBAHAN UTAMA: Menambahkan background, border, dan padding ---
    <div className="relative overflow-hidden bg-brand-darkest border border-brand-primary-blue/50 rounded-2xl p-12">
      {/* Elemen untuk efek gradien biru */}
      <div className="absolute inset-0 bg-gradient-to-t from-brand-primary-blue/70 to-transparent opacity-50 z-0"></div>
      
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
        {/* Kolom Kiri: How to Use */}
        <div className="text-left">
          <h3 className="text-2xl font-medium text-brand-light mb-4">How to Use the Font</h3>
          <div className="w-16 h-1 bg-brand-accent text-left rounded-full mb-8"></div>
          <p className="text-brand-light-muted font-light leading-relaxed mb-6">
            Enable OpenType features in apps like Illustrator, Photoshop, or InDesign to access alternates, swashes, and ligatures. Our fonts work on Canva, Procreate, Cricut, and other tools, so you can create premium designs anywhere with ease.
          </p>
          <Button href="/blog?category=Tutorial" variant="primary">
            Learn More
          </Button>
        </div>
        
        {/* Kolom Kanan: License Info */}
        <div className="text-left " >
          <h3 className="text-2xl font-medium text-brand-light mb-4">View License Information</h3>
          <div className="w-16 h-1 bg-brand-accent text-left rounded-full mb-8"></div>
          <p className="text-brand-light-muted font-light leading-relaxed mb-6">
            Please check the detailed license information for proper usage. This will help you verify that the font adheres to the terms and restrictions and allows for unlimited and what is allowed and ensure correct usage.
          </p>
          <Button href="/license" variant="primary">
            Learn More
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InfoActionSection;