// src/app/(main)/contact/page.tsx
import type { Metadata } from 'next';
import BackToTopButton from "@/components/BackToTopButton";
import SectionHeader from '@/components/SectionHeader';
import ContactForm from '@/components/contact/ContactForm';
import { getLatestPostsAction } from '@/app/actions/blogActions';
import { type CardPost } from '@/components/blog/BlogCard';
import dynamic from 'next/dynamic';
import MarqueeRow from '@/components/MarqueeRow';
import Button from '@/components/Button';
import { getAllFontsForMarqueeAction } from '@/app/actions/productActions';

const BlogCarousel = dynamic(() => import('@/components/blog/BlogCarousel'));

export const metadata: Metadata = {
  title: 'Contact | Stylish Type',
  description: 'Reach out and let’s create something timeless together.',
};

export default async function ContactPage() {
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
      console.error('Failed to fetch latest posts for contact page:', postsError);
  }

  const { products: marqueeFonts } = await getAllFontsForMarqueeAction();

  return (
    <div className="bg-brand-dark-secondary">
      <main>
        <div className="container mx-auto px-6 py-24">
            <SectionHeader
              align="center"
              title="Let's Connect"
              subtitle="We&apos;re excited to hear about your ideas. Reach out and let’s create something timeless together."
            />

            <div className="mt-12">
              <ContactForm />
            </div>
        </div>

        {marqueeFonts.length > 0 && (
          <div className="pt-8 pb-20 group relative text-center border-t border-white/10">
            <div className="container mx-auto px-6">
                <SectionHeader
                    title="Our Staff Picks"
                    subtitle="Check out some of our favorite fonts, curated by the Stylish Type team."
                />
            </div>
            <MarqueeRow products={marqueeFonts} animationClass="animate-marquee-reverse-fast" />
            <div className="text-center mt-16">
                <Button href="/product">
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

      </main>

      <BackToTopButton />
    </div>
  );
}