// src/app/not-found.tsx
import Image from 'next/image';
import BackToTopButton from '@/components/BackToTopButton';
import Button from '@/components/Button';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import NotFoundSearch from '@/components/NotFoundSearch';
import SectionHeader from '@/components/SectionHeader';
import { getSuggestionProductsAction } from './actions/productActions';
import MegaMenu from '@/components/MegaMenu';
import BlogMegaMenu from '@/components/BlogMegaMenu';
import MarqueeRow from '@/components/MarqueeRow';
import { getAllFontsForMarqueeAction } from './actions/productActions';

// Komponen ini harus async untuk mengambil data
export default async function NotFound() {
  
  // Ambil data yang diperlukan oleh Navbar dan Marquee
  const { featuredFonts, latestBundles } = await getSuggestionProductsAction();
  const { products: marqueeFonts } = await getAllFontsForMarqueeAction();

  return (
    // Kita buat ulang struktur layout utama di sini
    <div className="bg-brand-dark-secondary text-brand-light">
      <Navbar
        initialFeaturedFonts={featuredFonts}
        initialLatestBundles={latestBundles}
        megaMenuComponent={<MegaMenu />}
        blogMegaMenuComponent={<BlogMegaMenu />}
      />
      <main>
        <div className="container mx-auto px-6 py-24 text-center flex flex-col items-center">
            <div className="w-full max-w-4xl">
              <Image
                src="/404.svg"
                alt="Page Not Found"
                width={500}
                height={500}
                className="w-full h-auto"
                priority
              />
            </div>
            
            {/* --- PERUBAHAN 1: Menambahkan jarak di sini --- */}
            <div className="mt-12">
              <SectionHeader
                title="Page Not Found"
                subtitle="Sorry, the page you are looking for doesn't exist or has been moved."
              />
            </div>

            <div className="mt-8 w-full max-w-lg">
                <NotFoundSearch />
            </div>
            <div className="mt-12">
                <Button href="/" variant="outline">
                    Back to Homepage
                </Button>
            </div>
        </div>

        {/* --- PERUBAHAN 2: Menambahkan wrapper gradien biru --- */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-brand-primary-blue to-transparent opacity-40 z-0"></div>
          <div className="relative z-10">
            {marqueeFonts.length > 0 && (
              <div className="py-20 group relative text-center border-t border-white/10">
                <div className="container mx-auto px-6">
                    <SectionHeader
                        title="Our Staff Picks"
                        subtitle="Check out some of our favorite fonts, curated by the Timeless Type team."
                    />
                </div>
                <MarqueeRow products={marqueeFonts} animationClass="animate-marquee-reverse-fast" />
                <div className="text-center mt-16">
                    <Button href="/fonts">
                        Explore All Fonts
                    </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* --- AKHIR PERUBAHAN --- */}

      </main>
      <BackToTopButton />
      <Footer />
    </div>
  );
}