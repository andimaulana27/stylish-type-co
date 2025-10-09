// src/app/(main)/font-pair/page.tsx
import FontPairClientPage from "./FontPairClientPage";
import { type CardPost } from '@/components/blog/BlogCard';
import dynamic from 'next/dynamic';
import Button from "@/components/Button";
import MarqueeRow from "@/components/MarqueeRow";
import SectionHeader from "@/components/SectionHeader";
import { Metadata } from "next";

const BlogCarousel = dynamic(() => import('@/components/blog/BlogCarousel'));

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Font Pairing Tool | Timeless Type',
  description: 'Experiment with font combinations in real time. Our Font Pairing Tester helps you find the perfect match for headings and body text for your design projects.',
};

async function getFontPairPageData() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    try {
        const res = await fetch(`${baseUrl}/api/font-pair-page`, { next: { revalidate: 3600 } });
        if (!res.ok) throw new Error('Failed to fetch font pair page data');
        return res.json();
    } catch (error) {
        console.error("Error fetching font pair page data:", error);
        return { allFontsForPairing: [], latestBlogPosts: [], marqueeFonts: [] };
    }
}

export default async function FontPairPage() {
  const { allFontsForPairing, latestBlogPosts, marqueeFonts } = await getFontPairPageData();

  if (!allFontsForPairing) {
    return <div className="text-center py-20 text-red-500">Error fetching fonts.</div>;
  }

  return (
    <div className="bg-brand-dark-secondary">
      <FontPairClientPage allFonts={allFontsForPairing} />
      
      {marqueeFonts.length > 0 && (
          <div className="pt-8 pb-20 group relative text-center border-t border-white/10">
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
      
       <BlogCarousel
          posts={latestBlogPosts}
          title="Insights & Ideas"
          subtitle="From branding strategies and finance tips to lifestyle inspiration and tutorials, our blog covers everything you need to learn, grow, and stay inspired."
      />
    </div>
  );
}