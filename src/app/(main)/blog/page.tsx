// app/(main)/blog/page.tsx
import BlogCard from '@/components/blog/BlogCard';
import { type CardPost } from '@/components/blog/BlogCard'; 
import Pagination from '@/components/Pagination';
import SectionHeader from '@/components/SectionHeader';
import SearchInput from '@/components/SearchInput';
import FilterDropdown from '@/components/FilterDropdown';
import { Metadata } from 'next';

const ITEMS_PER_PAGE = 32;
export const revalidate = 3600;

const blogCategories = [
  "All", "Tutorial", "Inspiration", "Branding", "Business",
  "Freelancing", "Quotes", "Technology", "Lifestyle", "Finance",
];
const sortOptions = ["Newest", "Oldest", "Popular"];

export async function generateMetadata({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }): Promise<Metadata> {
  const category = searchParams.category as string || null;

  if (category && category !== 'All Categories') {
    return {
      title: `${category} Articles | Stylish Type Blog`,
      description: `Explore all articles about ${category} on the Stylish Type blog. Find tutorials, inspiration, and tips to elevate your design skills.`,
    };
  }

  return {
    title: 'Font Talks & Type Tips | Stylish Type Blog',
    description: 'Explore our latest thoughts, tricks, and tools to help you master the art of timeless typography.',
  };
}

async function getBlogListData(searchParams: { [key: string]: string | string[] | undefined }) {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const params = new URLSearchParams(searchParams as Record<string, string>);
    
    try {
        const res = await fetch(`${baseUrl}/api/blog?${params.toString()}`, {
            next: { revalidate: 3600 }
        });
        if (!res.ok) throw new Error('Failed to fetch blog posts');
        return res.json();
    } catch (error) {
        console.error("Error fetching blog list data:", error);
        return { posts: [], totalPages: 0 };
    }
}


export default async function BlogPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { posts: formattedPosts, totalPages } = await getBlogListData(searchParams);
  const currentPage = Number(searchParams.page) || 1;

  return (
    <div className="bg-brand-dark-secondary">
      <section className="container mx-auto px-6 pt-24 pb-12 text-center">
        <SectionHeader
          title={<>Font Talks & Type Tips</>}
          subtitle={<>Explore our latest thoughts, tricks, and tools to help you master <br /> the art of timeless typography.</>}
        />
      </section>

      <section className="container mx-auto px-6 py-4 sticky top-24 z-30 bg-brand-dark-secondary/80 backdrop-blur-sm rounded-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-1/3">
            <SearchInput placeholder="Search article by title..." />
          </div>
          <div className="flex w-full md:w-auto items-center gap-4">
            <FilterDropdown
              options={blogCategories}
              paramName="category"
              label="Category"
            />
            <FilterDropdown
              options={sortOptions}
              paramName="sort"
              label="Sort by"
            />
          </div>
        </div>
        <div className="border-b border-white/10 mt-6"></div>
      </section>

      <section className="container mx-auto px-6 pt-8 pb-24 min-h-[50vh]">
          {formattedPosts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
                  {formattedPosts.map((post: CardPost) => (
                      <BlogCard key={post.slug} post={post} />
                  ))}
              </div>
              {totalPages > 1 && (
                <Pagination currentPage={currentPage} totalPages={totalPages} />
              )}
            </>
          ) : (
            <p className="text-center py-20 text-brand-light-muted">No blog posts found matching your criteria.</p>
          )}
      </section>
    </div>
  );
}