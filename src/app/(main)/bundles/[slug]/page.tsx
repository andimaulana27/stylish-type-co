// src/app/(main)/bundles/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database, Tables } from '@/lib/database.types';
import type { ProductData } from '@/lib/dummy-data';
import dynamic from 'next/dynamic';
import type { Metadata, ResolvingMetadata } from 'next';

import FontImageGallery from '@/components/font-detail/FontImageGallery';
import LicenseSelector from '@/components/font-detail/LicenseSelector';
import SubscriptionBenefitsCard from '@/components/font-detail/SubscriptionBenefitsCard';
import BackToTopButton from "@/components/BackToTopButton";
import BundleFontsPreview from '@/components/bundle-detail/BundleFontsPreview';
import type { GroupedFont } from '@/components/bundle-detail/BundleFontsPreview';
import RelatedTags from '@/components/font-detail/RelatedTags';
import ProductTitle from '@/components/font-detail/ProductTitle';
import InfoActionSection from '@/components/InfoActionSection';

const RecommendedSection = dynamic(() => import('@/components/RecommendedSection'), { ssr: false });
const BlogCarousel = dynamic(() => import('@/components/blog/BlogCarousel'), { ssr: false });

type BundleFontPreview = { name: string; style: string; url: string; };

async function getBundlePageData(slug: string) {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    try {
        const res = await fetch(`${baseUrl}/api/bundle-detail/${slug}`, { next: { revalidate: 3600 } });
        if (!res.ok) {
            if (res.status === 404) return null;
            throw new Error(`Failed to fetch bundle data: ${res.statusText}`);
        }
        return res.json();
    } catch (error) {
        console.error("Error fetching bundle page data:", error);
        return null;
    }
}

export async function generateMetadata(
  { params }: { params: { slug: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const pageData = await getBundlePageData(params.slug);

  if (!pageData || !pageData.bundle) {
    return { title: 'Bundle Not Found' };
  }
  
  const { bundle } = pageData;
  const previousImages = (await parent).openGraph?.images || [];
  const firstImage = bundle.preview_image_urls?.[0] || '/og-image.png';
  const descriptionText = bundle.main_description ? bundle.main_description.replace(/<[^>]*>/g, '').split('. ')[0] + '.' : 'Explore the ' + bundle.name;
  const allTags = [...(bundle.tags || []), ...(bundle.purpose_tags || [])];
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: bundle.name,
    description: descriptionText,
    image: firstImage,
    offers: {
      '@type': 'Offer',
      price: bundle.price.toFixed(2),
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/bundles/${params.slug}`,
    },
    brand: {
      '@type': 'Brand',
      name: 'Stylish Type',
    },
  };

  return {
    title: `${bundle.name}`,
    description: descriptionText,
    keywords: allTags,
    alternates: { canonical: `/bundles/${params.slug}` },
    openGraph: {
      title: `${bundle.name} | Stylish Type`,
      description: descriptionText,
      images: [firstImage, ...previousImages],
      url: `/bundles/${params.slug}`,
      type: 'article',
    },
    twitter: {
        card: 'summary_large_image',
        title: `${bundle.name} | Stylish Type`,
        description: descriptionText,
        images: [firstImage],
    },
    other: { 'script[type="application/ld+json"]': JSON.stringify(jsonLd) },
  };
}

export const revalidate = 3600;

const getFontBaseName = (fileName: string): string => {
    return fileName.replace(/\.[^/.]+$/, "").replace(/[-_ ](thin|extralight|light|regular|medium|semibold|bold|extrabold|black|italic|bolditalic)/i, '').trim();
};

const getStyleName = (fileName: string): string => {
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
    const nameParts = nameWithoutExt.split(/[-_ ]+/);
    const styleKeywords: { [key: string]: string } = {
        'thin': 'Thin', 'extralight': 'ExtraLight', 'light': 'Light', 'regular': 'Regular',
        'medium': 'Medium', 'semibold': 'SemiBold', 'bold': 'Bold', 'extrabold': 'ExtraBold',
        'black': 'Black', 'italic': 'Italic', 'bolditalic': 'Bold Italic'
    };
    for (let i = nameParts.length - 1; i >= 0; i--) {
        const part = nameParts[i].toLowerCase();
        if (styleKeywords[part]) return styleKeywords[part];
    }
    return 'Regular';
};

export default async function BundleDetailPage({ params }: { params: { slug: string } }) {
  const [pageData] = await Promise.all([
      getBundlePageData(params.slug),
  ]);

  if (!pageData) {
    notFound();
  }
  
  const { bundle, licenses, latestBlogPosts } = pageData;
  
  const cookieStore = cookies()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  let activeSubscription = null;
  if (user) {
      const { data: subData } = await supabase.from('user_subscriptions').select('*').in('status', ['active', 'trialing']).single();
      activeSubscription = subData;
  }

  const { data: existingFonts } = await supabase
    .from('fonts')
    .select('name, slug')
    .in('name', Array.from(new Set((bundle.bundle_font_previews as BundleFontPreview[] || []).map(font => getFontBaseName(font.name)))));
  
  const existingFontsMap = new Map(existingFonts?.map(f => [f.name, f.slug]));
  
  const groupedFonts: GroupedFont[] = [];
  const fontMap = new Map<string, { styles: { styleName: string; fontFamily: string; url: string; }[], slug?: string }>();
  (bundle.bundle_font_previews as BundleFontPreview[] || []).forEach(font => {
    const familyName = getFontBaseName(font.name);
    if (!fontMap.has(familyName)) {
      fontMap.set(familyName, { styles: [], slug: existingFontsMap.get(familyName) });
    }
    fontMap.get(familyName)!.styles.push({
      styleName: getStyleName(font.name),
      fontFamily: `dynamic-bundle-${font.name.replace(/[^a-zA-Z0-9]/g, '-')}`,
      url: font.url
    });
  });
  fontMap.forEach((data, familyName) => {
    groupedFonts.push({ familyName, styles: data.styles, slug: data.slug });
  });

  const discountInfo = bundle.discounts;
  const originalPrice = bundle.price ?? 0;
  let finalPrice = originalPrice;
  let discountString: string | undefined = undefined;

  if (discountInfo && discountInfo.percentage > 0) {
      finalPrice = originalPrice - (originalPrice * discountInfo.percentage / 100);
      discountString = `${discountInfo.percentage}% OFF`;
  }

  const productDataForLicenseSelector: ProductData = {
      id: bundle.id, name: bundle.name, slug: bundle.slug,
      imageUrl: bundle.preview_image_urls?.[0] ?? '', price: finalPrice,
      originalPrice: discountInfo ? originalPrice : undefined,
      description: 'A collection of high-quality fonts.', type: 'bundle' as const,
      discount: discountString, staffPick: bundle.staff_pick ?? false,
  };

  return (
      <div className="bg-brand-dark-secondary text-brand-light">
        <FontImageGallery mainImage={bundle.preview_image_urls?.[0] ?? '/images/dummy/placeholder.jpg'} galleryImages={bundle.preview_image_urls?.slice(1) ?? []} fontName={bundle.name} />
        <div className="container mx-auto px-6 py-12 lg:py-19">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <main className="w-full lg:col-span-2 space-y-16">
              <BundleFontsPreview groupedFonts={groupedFonts} />
              <div>
                <h2 className="text-3xl font-medium text-brand-light mb-2 text-left">About The Bundle</h2>
                <div className="w-16 h-1 bg-brand-accent text-left my-4 rounded-full"></div>
                <article className="prose prose-invert prose-lg max-w-none text-brand-light-muted font-light leading-relaxed" dangerouslySetInnerHTML={{ __html: bundle.main_description ?? 'No description available.' }} />
              </div>
              <RelatedTags purposeTags={bundle.purpose_tags ?? []} styleTags={bundle.tags ?? []} basePath="/bundles" />
              <InfoActionSection />
            </main>
            <aside className="w-full lg:col-span-1 sticky top-28 h-fit">
              <div className='bg-brand-darkest p-8 rounded-lg border border-white/10'>
                <ProductTitle title={bundle.name} />
                <p className='text-brand-accent mt-2'>by Stylish Type</p>
                {!activeSubscription && <SubscriptionBenefitsCard />}
                <div className="border-b border-white/10 my-6"></div>
                <LicenseSelector font={productDataForLicenseSelector} licenses={licenses || []} />
              </div>
            </aside>
          </div>
        </div>
        <RecommendedSection currentProductId={bundle.id} />
        <BlogCarousel
            posts={latestBlogPosts}
            title="Insights & Ideas"
            subtitle="From branding strategies and finance tips to lifestyle inspiration and tutorials, our blog covers everything you need to learn, grow, and stay inspired."
        />
        <BackToTopButton />
      </div>
  );
}