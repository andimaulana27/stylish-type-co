// src/app/(main)/bundles/page.tsx
import ProductCard from '@/components/ProductCard';
import type { ProductData } from '@/lib/dummy-data';
import Pagination from '@/components/Pagination';
import FilterDropdown from '@/components/FilterDropdown';
import SearchInput from '@/components/SearchInput';
import SectionHeader from '@/components/SectionHeader';
import BackToTopButton from "@/components/BackToTopButton";
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database, Tables } from '@/lib/database.types';
import { getLatestPostsAction } from '@/app/actions/blogActions';
import { type CardPost } from '@/components/blog/BlogCard';
import dynamic from 'next/dynamic';
import MarqueeRow from '@/components/MarqueeRow';
import Button from '@/components/Button';
import { getAllFontsForMarqueeAction } from '@/app/actions/productActions';
import { Metadata } from 'next'; // <-- 1. Impor Metadata

const BlogCarousel = dynamic(() => import('@/components/blog/BlogCarousel'));

const ITEMS_PER_PAGE = 32;
export const revalidate = 3600;

type BundleWithDiscounts = Tables<'bundles'> & {
  discounts: Pick<Tables<'discounts'>, 'name' | 'percentage'> | null;
};

// --- PERUBAHAN UTAMA: Fungsi generateMetadata ---
export async function generateMetadata({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }): Promise<Metadata> {
  const tag = searchParams.tag as string || null;

  if (tag) {
    const capitalizedTag = tag.charAt(0).toUpperCase() + tag.slice(1);
    return {
      title: `Font Bundles Tagged with "${capitalizedTag}" | Timeless Type`,
      description: `Discover curated font bundles tagged with "${capitalizedTag}". Get premium typefaces at an incredible value.`,
    };
  }
  
  return {
    title: 'Unlock Value with Font Bundles | Timeless Type',
    description: 'Discover affordable font bundles featuring top-selling typefaces. Save big while building a professional font library for logos, branding, and creative projects.',
  };
}
// --- AKHIR PERUBAHAN ---

export default async function AllBundlesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const cookieStore = cookies()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
      },
    }
  )

  const searchTerm = typeof searchParams.search === 'string' ? searchParams.search : '';
  const sortBy = typeof searchParams.sort === 'string' ? searchParams.sort : 'Newest';
  const currentPage = typeof searchParams.page === 'string' ? Number(searchParams.page) : 1;
  const selectedTag = typeof searchParams.tag === 'string' ? searchParams.tag : null;
  
  const sortOptions = ["Popular", "Newest", "Oldest", "A to Z", "Z to A"];

  let query = supabase.from('bundles').select('*, discounts ( name, percentage )', { count: 'exact' });

  if (searchTerm) {
    query = query.ilike('name', `%${searchTerm}%`);
  }

  if (selectedTag) {
      query = query.or(`tags.cs.{${selectedTag}},purpose_tags.cs.{${selectedTag}}`);
  }

  if (sortBy === 'Newest' || sortBy === 'Popular') {
    query = query.order('created_at', { ascending: false });
  } else if (sortBy === 'Oldest') {
    query = query.order('created_at', { ascending: true });
  } else if (sortBy === 'A to Z') {
    query = query.order('name', { ascending: true });
  } else if (sortBy === 'Z to A') {
    query = query.order('name', { ascending: false });
  }

  const from = (currentPage - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;
  query = query.range(from, to);
  
  const { data: bundles, error, count } = await query;
  
  if (error) {
    console.error('Error fetching bundles:', error);
    return <p className="text-center text-red-500 py-20">Could not fetch bundles. Please try again later.</p>
  }
  
  const totalItems = count ?? 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  
  const formattedBundles: ProductData[] = ((bundles as BundleWithDiscounts[]) || []).map(bundle => {
      const discountInfo = bundle.discounts;
      const originalPrice = bundle.price ?? 0;
      let finalPrice = originalPrice;
      let discountString: string | undefined = undefined;

      if (discountInfo && discountInfo.percentage > 0) {
          finalPrice = originalPrice - (originalPrice * discountInfo.percentage / 100);
          discountString = `${discountInfo.percentage}% OFF`;
      }
      
      return {
          id: bundle.id,
          name: bundle.name,
          slug: bundle.slug,
          imageUrl: bundle.preview_image_urls?.[0] ?? '/images/dummy/placeholder.jpg',
          price: finalPrice,
          originalPrice: discountInfo ? originalPrice : undefined,
          description: 'A collection of high-quality fonts.',
          type: 'bundle', 
          discount: discountString,
          staffPick: bundle.staff_pick ?? false,
      };
  });

  const { posts: latestPostsData, error: postsError } = await getLatestPostsAction();
  let latestBlogPosts: CardPost[] = [];
  if (!postsError && latestPostsData) {
      latestBlogPosts = latestPostsData.map(post => ({
          slug: post.slug,
          title: post.title,
          imageUrl: post.image_url || '/images/dummy/placeholder.jpg',
          category: post.category || 'Uncategorized',
          date: post.created_at,
          author: post.author_name || 'Anonymous',
          readTime: Math.ceil((post.content?.split(' ').length || 0) / 200),
          comments: 0,
          views: 0,
      })).slice(0, 4);
  } else if (postsError) {
      console.error('Failed to fetch latest posts for bundles page:', postsError);
  }

  const { products: marqueeFonts } = await getAllFontsForMarqueeAction();

  return (
    <div className="bg-brand-dark-secondary">
      <section className="container mx-auto px-6 pt-24 pb-12 text-center">
        <SectionHeader
          title={<>Unlock Incredible Value with Font Bundles</>}
          subtitle={<>Discover affordable font bundles featuring top-selling typefaces. Save big while building a professional font library for logos, branding, packaging, and creative projects.</>}
        />
      </section>

      <section className="container mx-auto px-6 py-4 sticky top-24 z-30 bg-brand-dark-secondary/80 backdrop-blur-sm rounded-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-1/3">
            <SearchInput placeholder="Search bundle by name..." />
          </div>
          <div className="flex w-full md:w-auto items-center gap-4">
            <FilterDropdown paramName="sort" options={sortOptions} label="Sort by" />
          </div>
        </div>
        <div className="border-b border-white/10 mt-6"></div>
      </section>

      <section className="container mx-auto px-6 pt-8 pb-24 min-h-[50vh]">
        {formattedBundles.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {formattedBundles.map((font) => (
                <ProductCard key={font.id} font={font} />
              ))}
            </div>
            {totalPages > 1 && (
              <Pagination currentPage={currentPage} totalPages={totalPages} />
            )}
          </>
        ) : (
          <p className="text-center col-span-full py-16 text-brand-light-muted">
            No bundles found matching your criteria.
          </p>
        )}
      </section>
      
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