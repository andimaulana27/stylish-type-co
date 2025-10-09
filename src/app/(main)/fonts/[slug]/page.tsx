// src/app/(main)/fonts/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database, Tables } from '@/lib/database.types';
import type { ProductData } from '@/lib/dummy-data';
import { Suspense } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { Metadata, ResolvingMetadata } from 'next';

import FontImageGallery from '@/components/font-detail/FontImageGallery';
import TypeTester from '@/components/font-detail/TypeTester';
import GlyphViewer from '@/components/font-detail/GlyphViewer';
import LicenseSelector from '@/components/font-detail/LicenseSelector';
import DynamicFontLoader from '@/components/font-detail/DynamicFontLoader';
import SubscriptionBenefitsCard from '@/components/font-detail/SubscriptionBenefitsCard';
import CustomLicenseCard from '@/components/font-detail/CustomLicenseCard';
import FileInfo from '@/components/font-detail/FileInfo';
import LatestBundlesSection from '@/components/font-detail/LatestBundlesSection';
import SectionHeader from '@/components/SectionHeader';
import BackToTopButton from "@/components/BackToTopButton";
import RelatedTags from '@/components/font-detail/RelatedTags';
import ProductTitle from '@/components/font-detail/ProductTitle';
import InfoActionSection from '@/components/InfoActionSection';
import FontPairingPreview from '@/components/font-detail/FontPairingPreview';
import { type CardPost } from '@/components/blog/BlogCard';

const RecommendedSection = dynamic(() => import('@/components/RecommendedSection'), { ssr: false });
const BlogCarousel = dynamic(() => import('@/components/blog/BlogCarousel'), { ssr: false });

type FontFile = { style: string; url: string; };

export async function generateMetadata(
  { params }: { params: { slug: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = params;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  
  try {
    const res = await fetch(`${baseUrl}/api/font-detail/${slug}`);
    if (!res.ok) {
        return { title: 'Font Not Found' };
    }
    const { font } = await res.json();

    const previousImages = (await parent).openGraph?.images || [];
    const firstImage = font.preview_image_urls?.[0] || '/og-image.png';

    const descriptionText = font.main_description 
      ? font.main_description.replace(/<[^>]*>/g, '').split('. ')[0] + '.'
      : 'Discover the ' + font.name + ' font, a premium typeface perfect for your design projects.';

    const jsonLd = { /* ... (kode JSON-LD tetap sama) ... */ };

    return {
      title: `${font.name} Font`,
      description: descriptionText,
      keywords: font.tags || [],
      alternates: { canonical: `/fonts/${slug}` },
      openGraph: {
        title: `${font.name} Font | Timeless Type`,
        description: descriptionText,
        images: [firstImage, ...previousImages],
        url: `/fonts/${slug}`,
        type: 'article',
      },
      twitter: { /* ... (kode twitter tetap sama) ... */ },
      other: { 'script[type="application/ld+json"]': JSON.stringify(jsonLd) },
    };
  } catch (error) {
    return { title: 'Font Not Found' };
  }
}

export const revalidate = 3600;

// FUNGSI BARU UNTUK MENGAMBIL SEMUA DATA DARI SATU ENDPOINT
async function getFontPageData(slug: string) {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
    try {
        const res = await fetch(`${baseUrl}/api/font-detail/${slug}`, { next: { revalidate: 3600 } });
        if (!res.ok) {
            if (res.status === 404) return null;
            throw new Error(`Failed to fetch font data: ${res.statusText}`);
        }
        return res.json();
    } catch (error) {
        console.error("Error fetching font page data:", error);
        return null;
    }
}

export default async function FontDetailPage({ params }: { params: { slug: string } }) {
  // --- PERBAIKAN UTAMA: Panggil satu fungsi untuk semua data ---
  const pageData = await getFontPageData(params.slug);

  if (!pageData) {
    notFound();
  }

  const {
    font,
    licenses,
    formattedBundles,
    allFontsForPairing,
    latestBlogPosts,
  } = pageData;
  // --- AKHIR PERUBAIKAN ---
  
  const cookieStore = cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: { get(name: string) { return cookieStore.get(name)?.value; } },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  let activeSubscription = null;
  if (user) {
      const { data: subData } = await supabase
          .from('user_subscriptions')
          .select('*')
          .in('status', ['active', 'trialing'])
          .single();
      activeSubscription = subData;
  }
  
  const fontFiles = (font.font_files as FontFile[]) || [];
  const regularFont = fontFiles.find(f => f.style.toLowerCase() === 'regular') || fontFiles.find(f => f.style.toLowerCase() === 'medium') || fontFiles[0];
  const italicFont = fontFiles.find(f => f.style.toLowerCase().includes('italic') && f.url !== regularFont?.url);
  
  const dynamicFontFamilyRegular = `dynamic-${font.slug}-regular`;
  const dynamicFontFamilyItalic = `dynamic-${font.slug}-italic`;
  
  const releaseDate = new Date(font.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  const discountInfo = font.discounts;
  const originalPrice = font.price ?? 0;
  let finalPrice = originalPrice;
  let discountString: string | undefined = undefined;

  if (discountInfo && discountInfo.percentage > 0) {
      finalPrice = originalPrice - (originalPrice * discountInfo.percentage / 100);
      discountString = `${discountInfo.percentage}% OFF`;
  }

  const productDataForLicenseSelector: ProductData = {
      id: font.id, name: font.name, slug: font.slug,
      imageUrl: font.preview_image_urls?.[0] ?? '', price: finalPrice,
      originalPrice: discountInfo ? originalPrice : undefined,
      description: font.category ?? 'Font', type: 'font' as const, 
      discount: discountString,
      staffPick: font.staff_pick ?? false,
  };

  const glyphs = (font.glyphs_json as string[]) || [];
  const partnerName = font.partners?.name || 'Timeless Type';
  const partnerHref = font.partners ? `/partners/${font.partners.slug}` : '/fonts?partner=timeless-type';

  return (
    <>
      {regularFont && <DynamicFontLoader fontFamily={dynamicFontFamilyRegular} fontUrl={regularFont.url} />}
      {italicFont && <DynamicFontLoader fontFamily={dynamicFontFamilyItalic} fontUrl={italicFont.url} />}

      <div className="bg-brand-dark-secondary text-brand-light">
        <FontImageGallery mainImage={font.preview_image_urls?.[0] ?? '/images/dummy/placeholder.jpg'} galleryImages={font.preview_image_urls?.slice(1) ?? []} fontName={font.name} />
        <div className="container mx-auto px-6 py-12 lg:py-19">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <main className="w-full lg:col-span-2 space-y-16">
              <TypeTester fontFamilyRegular={dynamicFontFamilyRegular} fontFamilyItalic={italicFont ? dynamicFontFamilyItalic : undefined} />
              <div className="mt-8"><FileInfo fileTypes={font.file_types?.join(', ') ?? "N/A"} fileSize={`${font.file_size_kb ?? 0} KB`} releaseDate={releaseDate} /></div>
              <div>
                <h2 className="text-3xl font-medium text-brand-light mb-2 text-left">About The Font</h2>
                <div className="w-16 h-1 bg-brand-accent text-left my-4 rounded-full"></div>
                <article className="prose prose-invert prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: font.main_description ?? '' }} />
              </div>
              
              {allFontsForPairing.length > 0 && (
                <FontPairingPreview 
                    allFonts={allFontsForPairing} 
                />
              )}
              
              <RelatedTags purposeTags={font.purpose_tags ?? []} styleTags={font.tags ?? []} basePath="/fonts" />
              <InfoActionSection />
              
              <div>
                <h2 className="text-3xl font-medium text-brand-light mb-2 text-left">Glyphs</h2>
                <div className="w-16 h-1 bg-brand-accent text-left my-4 rounded-full"></div>
                <Suspense fallback={<div className="text-center">Loading glyphs...</div>}>
                  <GlyphViewer fontFamily={dynamicFontFamilyRegular} glyphs={glyphs} />
                </Suspense>
              </div>
            </main>

            <aside className="w-full lg:col-span-1 sticky top-28 h-fit">
              <div className='bg-brand-darkest p-8 rounded-lg border border-white/10'>
                <ProductTitle title={font.name} />
                <p className='text-brand-accent mt-2'>by <Link href={partnerHref} className="hover:underline">{partnerName}</Link></p>
                
                {!activeSubscription && <SubscriptionBenefitsCard />}
                
                <div className="border-b border-white/10 my-6"></div>
                <LicenseSelector font={productDataForLicenseSelector} licenses={licenses} />
                <CustomLicenseCard />
                <div className="mt-12">
                  <SectionHeader align="left" title="Latest Bundle" />
                  <LatestBundlesSection bundles={formattedBundles} />
                </div>
              </div>
            </aside>
          </div>
        </div>
        <RecommendedSection currentProductId={font.id} />
        
        <BlogCarousel
            posts={latestBlogPosts}
            title="Insights & Ideas"
            subtitle="From branding strategies and finance tips to lifestyle inspiration and tutorials, our blog covers everything you need to learn, grow, and stay inspired."
        />
        
        <BackToTopButton />
      </div>
    </>
  );
}