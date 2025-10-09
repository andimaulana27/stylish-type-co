// src/components/NewHeroSection.tsx
import Button from "@/components/Button";
import type { ProductData } from '@/lib/dummy-data';
import MarqueeRow from './MarqueeRow';
import NewHeroClient from './NewHeroClient'; // Komponen client baru

// FUNGSI BARU: Mengambil data dari API Route
async function getMarqueeFonts() {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
        const res = await fetch(`${baseUrl}/api/homepage/marquee-fonts`, {
            next: { revalidate: 3600 } // Revalidate data cache setiap 1 jam
        });

        if (!res.ok) {
            throw new Error('Failed to fetch marquee fonts');
        }
        
        const data = await res.json();
        return data.products || [];
    } catch (error) {
        console.error("Error fetching marquee fonts:", error);
        return [];
    }
}


const NewHeroSection = async () => {
  const marqueeFonts: ProductData[] = await getMarqueeFonts();

  return (
    <section className="relative bg-brand-dark-secondary text-brand-light overflow-hidden">
      <div className="absolute inset-x-0 bottom-0 h-2/4 bg-gradient-to-t from-brand-primary-blue to-transparent opacity-50 z-0"></div>
      <div className="relative z-10">
        <div className="container mx-auto px-8 pt-24 pb-12">
          <div className="flex flex-col items-center text-center max-w-6xl mx-auto">
            
            <div className="relative w-full max-w-6xl">
              {/* Komponen Client untuk animasi teks */}
              <NewHeroClient />
            </div>

            <div className="w-24 h-1 bg-brand-accent mx-auto -my-28 mb-8 rounded-full"></div>
            <p className="text-lg text-brand-light-muted max-w-xl font-light">
              Why limit your creativity when you can access everything? With one subscription, you unlock our entire premium font library with unlimited downloads.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
              <Button href="/subscription" variant="primary" className="px-10 py-4 text-lg">
                See Pricing
              </Button>
              <Button href="/fonts" variant="outline" className="px-10 py-4 text-lg">
                Explore All Font
              </Button>
            </div>
          </div>
        </div>
        <div className="pt-8 pb-12 group relative">
            <MarqueeRow products={marqueeFonts} animationClass="animate-marquee-reverse-fast" />
        </div>
      </div>
    </section>
  );
};

export default NewHeroSection;