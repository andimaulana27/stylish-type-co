// src/components/blog/RelatedPostsSection.tsx
import BlogCarousel from '@/components/blog/BlogCarousel';
import { type CardPost } from './BlogCard';
import { Tables } from '@/lib/database.types'; // Impor tipe

type Post = Tables<'posts'>;

type RelatedPostsSectionProps = {
  currentPostId: string;
  category: string;
  initialRelatedPosts: Post[]; // Terima data sebagai props
};

const RelatedPostsSection = ({ currentPostId, category, initialRelatedPosts }: RelatedPostsSectionProps) => {
  
  if (!initialRelatedPosts || initialRelatedPosts.length === 0) {
    return null;
  }

  const formattedPosts: CardPost[] = initialRelatedPosts.map(post => ({
      slug: post.slug,
      title: post.title,
      imageUrl: post.image_url || '/images/dummy/placeholder.jpg',
      category: post.category || 'Uncategorized',
      date: post.created_at,
      author: post.author_name || 'Anonymous',
      readTime: Math.ceil((post.content?.split(' ').length || 0) / 200),
      comments: 0,
      views: 0,
  }));

  return (
    <BlogCarousel
        posts={formattedPosts}
        title="You May Also Like Related Post"
        subtitle="Read more articles on similar topics."
    />
  );
};

export default RelatedPostsSection;