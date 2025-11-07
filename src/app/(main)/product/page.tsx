// src/app/(main)/product/page.tsx
import { Suspense } from 'react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import dynamic from 'next/dynamic';
import { Database, Tables } from '@/lib/database.types';
import type { ProductData } from '@/lib/dummy-data';
import { getLatestPostsAction } from '@/app/actions/blogActions';
import { type CardPost } from '@/components/blog/BlogCard';
import SectionHeader from '@/components/SectionHeader';
import BackToTopButton from "@/components/BackToTopButton";
import FontsClientPage from './FontsClientPage';
import { Metadata } from 'next';

const RecommendedSection = dynamic(() => import('@/components/RecommendedSection'));
const BlogCarousel = dynamic(() => import('@/components/blog/BlogCarousel'));

type FormattedFont = ProductData & {
    font_files: Tables<'fonts'>['font_files'];
    partner: { name: string; slug: string } | null;
};

const ITEMS_PER_PAGE = 32;

export async function generateMetadata({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }): Promise<Metadata> {
  const category = searchParams.category as string || null;
  const tag = searchParams.tag as string || null;

  if (category && category !== 'All') {
    return {
      title: `${category} Fonts | Stylish Type`,
      description: `Browse our collection of high-quality ${category} fonts. Perfect for designers and creatives looking for the right typeface.`,
    };
  }

  if (tag) {
    const capitalizedTag = tag.charAt(0).toUpperCase() + tag.slice(1);
    return {
      title: `Fonts Tagged with "${capitalizedTag}" | Stylish Type`,
      description: `Discover all premium fonts tagged with "${capitalizedTag}". Find the perfect style for your next design project.`,
    };
  }
  
  return {
    title: 'All Premium Fonts for Designers | Stylish Type',
    description: 'Explore diverse font categories including modern, classic, decorative, and thematic styles. Perfect for designers and creatives looking for the right typeface for any project.',
  };
}

export default async function AllProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const cookieStore = cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: { get(name: string) { return cookieStore.get(name)?.value; } },
    }
  );

  const searchTerm = searchParams.search as string || '';
  const selectedCategory = searchParams.category as string || 'All';
  const sortBy = searchParams.sort as string || 'Newest';
  const currentPage = Number(searchParams.page) || 1;
  const selectedTag = searchParams.tag as string || null;

  let initialFonts: FormattedFont[] = [];
  let initialTotalPages = 0;

  try {
    let query = supabase.from('fonts').select('*, discounts ( name, percentage ), partners ( name, slug )', { count: 'exact' });

    if (searchTerm) query = query.ilike('name', `%${searchTerm}%`);
    if (selectedCategory !== 'All') query = query.eq('category', selectedCategory);
    if (sortBy === 'Staff Pick') query = query.eq('staff_pick', true);
    if (selectedTag) query = query.or(`tags.cs.{${selectedTag}},purpose_tags.cs.{${selectedTag}}`);

    if (sortBy === 'Popular') query = query.order('sales_count', { ascending: false });
    else if (sortBy === 'Newest') query = query.order('created_at', { ascending: false });
    else if (sortBy === 'Oldest') query = query.order('created_at', { ascending: true });
    else if (sortBy === 'A to Z') query = query.order('name', { ascending: true });
    else if (sortBy === 'Z to A') query = query.order('name', { ascending: false });
    else query = query.order('created_at', { ascending: false });

    const from = (currentPage - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    initialTotalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE);
    initialFonts = (data || []).map(font => {
        const discountInfo = font.discounts;
        const originalPrice = font.price ?? 0;
        let finalPrice = originalPrice;
        let discountString: string | undefined = undefined;

        if (discountInfo && discountInfo.percentage > 0) {
            finalPrice = originalPrice - (originalPrice * discountInfo.percentage / 100);
            discountString = `${discountInfo.percentage}% OFF`;
        }

        return {
            id: font.id, name: font.name, slug: font.slug,
            imageUrl: font.preview_image_urls?.[0] ?? '/images/dummy/placeholder.jpg',
            price: finalPrice, originalPrice: discountInfo ? originalPrice : undefined,
            description: font.category ?? 'Font', type: 'font',
            discount: discountString, staffPick: font.staff_pick ?? false,
            font_files: font.font_files, partner: Array.isArray(font.partners) ? null : font.partners,
        };
    });
  } catch (error) {
    console.error("Error fetching initial fonts on server:", error);
  }

  const { posts: latestPostsData, error: postsError } = await getLatestPostsAction();
  let latestBlogPosts: CardPost[] = [];
  if (!postsError && latestPostsData) {
      latestBlogPosts = latestPostsData.map(post => ({
        slug: post.slug, title: post.title, imageUrl: post.image_url || '/images/dummy/placeholder.jpg',
        category: post.category || 'Uncategorized', date: post.created_at, author: post.author_name || 'Anonymous',
        readTime: Math.ceil((post.content?.split(' ').length || 0) / 200),
        comments: 0, views: 0,
      })).slice(0, 4);
  } else if (postsError) {
      console.error("Failed to fetch latest posts:", postsError);
  }

  return (
    <div className="bg-brand-dark-secondary relative overflow-hidden">
        <div className="relative z-10">
            <section className="container mx-auto px-6 pt-24 pb-12 text-center">
                <SectionHeader
                    title={<>Find the Perfect Typeface <br /> for Every Project</>}
                    subtitle={<>Explore diverse font categories including modern, classic, decorative, and thematic styles. Perfect for designers and creatives looking for the right typeface for any project.</>}
                />
            </section>
            
            <Suspense fallback={<div>Loading UI...</div>}>
                <FontsClientPage 
                    key={JSON.stringify(searchParams)}
                    initialFonts={initialFonts} 
                    initialTotalPages={initialTotalPages} 
                />
            </Suspense>
            
            <div className="relative">
                <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-brand-accent/50 to-transparent opacity-30 z-0 pointer-events-none"></div>
                <div className="relative z-10">
                    <RecommendedSection />
                </div>
            </div>

            <BlogCarousel
                posts={latestBlogPosts}
                title="Insights & Ideas"
                subtitle="From branding strategies and finance tips to lifestyle inspiration and tutorials, our blog covers everything you need to learn, grow, and stay inspired."
            />

            <BackToTopButton />
        </div>
    </div>
  );
}