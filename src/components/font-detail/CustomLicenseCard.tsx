// src/components/font-detail/CustomLicenseCard.tsx
import Button from '@/components/Button';
import React from 'react';

const CustomLicenseCard = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-t from-brand-accent/20 to-brand-darkest text-center pt-6 pb-11 px-6 rounded-lg mt-6 border border-brand-accent/30 shadow-2xl shadow-brand-accent/10">
      
      {/* Efek cahaya dekoratif di latar belakang */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-brand-accent/10 rounded-full blur-3xl -z-0"></div>

      {/* Konten sekarang rata tengah */}
      <div className="relative z-10 flex flex-col items-center space-y-4">
        
        {/* Bagian 1: Judul */}
        <div className="flex flex-col items-center gap-3">
          <h4 className="font-semibold text-brand-light text-lg">Need a Costum Font or License?</h4>
          <div className="w-16 h-1 bg-brand-accent text-left  rounded-full"></div>
        </div>

        {/* Bagian 2: Deskripsi */}
        <p className="font-light text-brand-light-muted text-sm leading-relaxed max-w-xs">
          Contact us and we will be happy to help you with your custom license needs.
        </p>
        
        {/* Bagian 3: Tombol */}
        <div className="pt-2 w-full"> 
            <Button href="/contact" className="w-full">
                Contact Us
                
            </Button>
        </div>
      </div>
    </div>
  );
};

export default CustomLicenseCard;