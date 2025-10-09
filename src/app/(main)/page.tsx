// src/app/(main)/page.tsx
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import BackToTopButton from "@/components/BackToTopButton";
import SectionHeader from "@/components/SectionHeader";
import Button from "@/components/Button";
import NewHeroSection from "@/components/NewHeroSection";
import LogotypePreview from "@/components/LogotypePreview";
import FontInUseClient from '@/components/FontInUseClient';

import { getPopularBundles } from '@/app/api/homepage/popular-bundles/route.get';
import { getFeaturedProducts } from '@/app/api/homepage/featured-products/route.get';
import { getLatestPosts } from '@/app/api/homepage/latest-posts/route.get';
import { getBrands } from '@/app/api/homepage/trusted-by/route.get';
import { getGalleryImages } from '@/app/api/homepage/font-in-use/route.get';

export const revalidate = 3600;

const PopularSection = dynamic(() => import("@/components/PopularSection"), { ssr: false });
const FeaturedProductsSection = dynamic(() => import("@/components/FeaturedProductsSection"), { ssr: false });
const BlogSection = dynamic(() => import("@/components/BlogSection"), { ssr: false });
const TrustedBySection = dynamic(() => import("@/components/TrustedBySection"), { ssr: false });
const TestimonialSection = dynamic(() => import("@/components/TestimonialSection"), { ssr: false });

const SectionSkeleton = () => (
    <div className="py-20 bg-brand-dark-secondary">
        <div className="container mx-auto px-6 animate-pulse">
            <div className="h-10 bg-white/5 rounded w-1/3 mx-auto"></div>
            <div className="h-4 bg-white/5 rounded w-1/2 mx-auto mt-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-4">
                        <div className="aspect-[3/2] bg-white/10 rounded-lg"></div>
                        <div className="h-6 bg-white/10 rounded"></div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const FontInUseSection = ({ galleryImages }: { galleryImages: any[] }) => {
    if (galleryImages.length === 0) return null;

    return (
        <div className="border-b border-white/10">
            <section className="bg-brand-dark-secondary py-20 text-brand-light w-full overflow-hidden">
                <div className="container mx-auto px-6">
                    <SectionHeader
                        title="Font In Use"
                        subtitle="Discover how our fonts are used in real projects from product packaging and brand identities to digital campaigns and editorial design."
                    />
                </div>
                <FontInUseClient galleryImages={galleryImages} />
                <div className="text-center mt-16">
                    <Button href="https://www.instagram.com/stylishtype.co" target="_blank" rel="noopener noreferrer">
                        View All Gallery
                    </Button>
                </div>
            </section>
        </div>
    );
}

export default async function HomePage() {
  const separatorClasses = "border-b border-white/10";
  
  const [
    popularBundlesData,
    featuredProductsData,
    latestPostsData,
    brandsData,
    galleryImagesData
  ] = await Promise.all([
    getPopularBundles(),
    getFeaturedProducts(),
    getLatestPosts(),
    getBrands(),
    getGalleryImages()
  ]);

  return (
    <div>
      <div className={separatorClasses}>
        <Suspense fallback={<div className="h-[700px] bg-brand-dark-secondary animate-pulse"></div>}>
            <NewHeroSection />
        </Suspense>
      </div>
      
      <div className={separatorClasses}>
        <Suspense fallback={<SectionSkeleton />}>
            <LogotypePreview />
        </Suspense>
      </div>
      
      <div className={separatorClasses}>
        <Suspense fallback={<SectionSkeleton />}>
            <PopularSection popularBundlesData={popularBundlesData.products || []} />
        </Suspense>
      </div>

      <div className={separatorClasses}>
        <Suspense fallback={<SectionSkeleton />}>
            <FeaturedProductsSection featuredProductsData={featuredProductsData.products || []} />
        </Suspense>
      </div>

      <div className={separatorClasses}>
         <Suspense fallback={<div className="h-96 bg-brand-dark-secondary animate-pulse"></div>}>
            <TestimonialSection />
        </Suspense>
      </div>

      <div className={separatorClasses}>
        <Suspense fallback={<div className="h-48 bg-brand-dark-secondary animate-pulse"></div>}>
            <TrustedBySection brands={brandsData.brands || []} />
        </Suspense>
      </div>
      
      <Suspense fallback={<SectionSkeleton />}>
        <FontInUseSection galleryImages={galleryImagesData.images || []} />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <BlogSection latestPosts={latestPostsData.posts || []} />
      </Suspense>
      
      <BackToTopButton />
    </div>
  );
}