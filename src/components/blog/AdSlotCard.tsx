// src/components/blog/AdSlotCard.tsx
import Button from '@/components/Button';
import { Sparkles } from 'lucide-react';

const AdSlotCard = () => {
  return (
    // --- PERUBAHAN UTAMA DI SINI: Arah gradien diubah ---
    <div className="my-8 relative overflow-hidden rounded-lg border border-brand-primary-blue/30 bg-gradient-to-t from-brand-primary-blue/20 to-brand-darkest px-8 py-16 shadow-2xl shadow-brand-primary-blue/10">
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-brand-primary-blue/10 rounded-full blur-3xl -z-0"></div>
      
      <div className="relative z-10 flex flex-wrap items-center justify-center md:justify-between gap-x-8 gap-y-6 text-center md:text-left">
        <div className="flex items-center gap-6">
          <div className="flex-shrink-0">
            <Sparkles className="w-12 h-12 text-brand-accent" />
          </div>
          <div className="flex-grow">
            <h3 className="text-xl font-bold text-brand-light">Elevate Your Brand. Reach a Targeted Audience.</h3>
            <p className="text-brand-light-muted mt-2">
              This exclusive yearly ad slot is visible on every article, ensuring maximum exposure with no rotation.
            </p>
          </div>
        </div>
        <div className="flex-shrink-0">
          <Button href="/contact?subject=Ad Slot Inquiry" target="_blank">
            Reserve Your Spot
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdSlotCard;