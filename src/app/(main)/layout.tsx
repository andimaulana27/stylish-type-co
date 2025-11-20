// src/app/(main)/layout.tsx
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackToTopButton from "@/components/BackToTopButton";
import SideCart from '@/components/SideCart';
import BannerSlider from '@/components/BannerSlider';
import SideCartSuggestions from '@/components/SideCartSuggestions';
import { getSuggestionProductsAction } from '@/app/actions/productActions';
import MegaMenu from '@/components/MegaMenu';
import BlogMegaMenu from '@/components/BlogMegaMenu';
import { cookies } from 'next/headers';
import CookieConsentBanner from '@/components/CookieConsentBanner';

// --- UPDATE BARU: Import Action Social Links & Tipe Database ---
import { getSocialLinksAction } from '@/app/actions/socialActions';
import { Tables } from '@/lib/database.types';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  // --- UPDATE BARU: Mengambil data Produk, Social Links, dan Cookie secara bersamaan (Paralel) ---
  const [suggestionProducts, socialLinksData, consentCookie] = await Promise.all([
    getSuggestionProductsAction(),
    getSocialLinksAction(), // Mengambil data social links dari database
    cookies().get('stylishtype_cookie_consent') // Tetap menggunakan nama cookie 'stylishtype'
  ]);

  // Destructuring data agar mudah digunakan
  const { featuredFonts, latestBundles } = suggestionProducts;
  const { links: socialLinks } = socialLinksData;
  
  // Cek status consent cookie
  const hasConsent = consentCookie?.value === 'accepted';

  // (Opsional) Memastikan tipe data aman untuk dikirim ke Footer
  const typedSocialLinks = (socialLinks as Tables<'social_links'>[]) || [];

  return (
    <>
      <BannerSlider />
      <Navbar
        initialFeaturedFonts={featuredFonts}
        initialLatestBundles={latestBundles}
        megaMenuComponent={<MegaMenu />}
        blogMegaMenuComponent={<BlogMegaMenu />}
      />
      <SideCart>
        <SideCartSuggestions />
      </SideCart>
      <main>
        {children}
      </main>
      <BackToTopButton />
      
      {/* --- UPDATE BARU: Mengirim data socialLinks ke Footer --- */}
      <Footer socialLinks={typedSocialLinks} />
      
      <CookieConsentBanner initialConsent={hasConsent} />
    </>
  );
}