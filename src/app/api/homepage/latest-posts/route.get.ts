// src/app/api/homepage/latest-posts/route.get.ts
import { getLatestPostsAction } from '@/app/actions/blogActions';
import { type CardPost } from '@/components/blog/BlogCard';

export async function getLatestPosts() {
    try {
        const { posts, error } = await getLatestPostsAction();

        if (error || !posts) {
            throw new Error(error || "Failed to fetch latest posts");
        }

        const formattedPosts: CardPost[] = posts.map(post => ({
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
        
        return { posts: formattedPosts };

    } catch (error) {
        console.error("Error fetching latest posts:", error);
        return { posts: [] };
    }
}