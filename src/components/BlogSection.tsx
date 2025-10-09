// src/components/BlogSection.tsx
import SectionHeader from './SectionHeader';
import Button from './Button';
import BlogCard, { type CardPost } from '@/components/blog/BlogCard'; 

// --- PERUBAHAN: Komponen tidak lagi async dan menerima data via props ---
const BlogSection = ({ latestPosts }: { latestPosts: CardPost[] }) => {
  if (latestPosts.length === 0) {
    return null;
  }

  return (
    <section
      className="py-20 bg-brand-dark-secondary text-brand-light"
    >
      <div className="container mx-auto px-6">
        <SectionHeader
          title="Insights & Ideas"
          subtitle="From branding strategies and finance tips to lifestyle inspiration and tutorials, our blog covers everything you need to learn, grow, and stay inspired."
        />
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          {latestPosts.map((post) => (
            <BlogCard
              key={post.slug}
              post={post}
            />
          ))}
        </div>
        <div className="text-center mt-16">
          <Button href="/blog">
            View All Blog
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;