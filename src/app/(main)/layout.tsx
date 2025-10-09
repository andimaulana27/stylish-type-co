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

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { featuredFonts, latestBundles } = await getSuggestionProductsAction();

  const cookieStore = cookies();
  const consentCookie = cookieStore.get('timelesstype_cookie_consent');
  const hasConsent = consentCookie?.value === 'accepted';

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
      <Footer />
      <CookieConsentBanner initialConsent={hasConsent} />
    </>
  );
}