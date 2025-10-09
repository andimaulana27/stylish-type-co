// src/app/(main)/logotype/page.tsx
import { Suspense } from 'react';
import LogotypeGrid from '@/components/LogotypeGrid';
import SectionHeader from '@/components/SectionHeader';
import BackToTopButton from "@/components/BackToTopButton";
import { type LogotypeFont } from '@/components/LogotypeCard';
import dynamic from 'next/dynamic';
import MarqueeRow from '@/components/MarqueeRow';
import Button from '@/components/Button';
import { Metadata } from 'next';

// --- PERBAIKAN: Menggunakan path import yang benar ---
const BlogCarousel = dynamic(() => import('@/components/blog/BlogCarousel'));

export const metadata: Metadata = {
  title: 'Logotype Tester | Timeless Type',
  description: 'Find the right typeface to make your logo stand out. Instantly preview your brand name with hundreds of our premium logotype font styles.',
};

function LoadingSkeleton() {
  return (
    <div className="container mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 animate-pulse">
            {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="space-y-4">
                    <div className="h-24 bg-white/5 rounded-lg"></div>
                    <div className="h-4 bg-white/5 rounded w-3/4 mx-auto"></div>
                </div>
            ))}
        </div>
    </div>
  );
}

async function getLogotypePageData() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    try {
        const res = await fetch(`${baseUrl}/api/logotype-page`, { next: { revalidate: 3600 } });
        if (!res.ok) throw new Error('Failed to fetch logotype page data');
        return res.json();
    } catch (error) {
        console.error("Error fetching logotype page data:", error);
        return { allLogotypeFonts: [], latestBlogPosts: [], marqueeFonts: [] };
    }
}

export default async function LogotypePage() {
    const { allLogotypeFonts, latestBlogPosts, marqueeFonts } = await getLogotypePageData();

    return (
        <div className="bg-brand-dark-secondary">
            <section className="container mx-auto px-6 pt-24 pb-12 text-center">
                <SectionHeader
                    title={<>Find the Right Typeface to Make <br /> Your Logo Stand Out</>}
                    subtitle={<>Type in your brand name or a keyword and instantly see how it looks <br /> using hundreds of our premium font styles.</>}
                />
            </section>

            <Suspense fallback={<LoadingSkeleton />}>
                <LogotypeGrid allLogotypeFonts={allLogotypeFonts} />
            </Suspense>

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
            
            <BackToTopButton />
        </div>
    );
}