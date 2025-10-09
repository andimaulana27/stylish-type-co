// src/app/api/font-pair-page/route.ts
import { NextResponse } from 'next/server';
import { getAllFontsForPairingAction, getAllFontsForMarqueeAction } from "@/app/actions/productActions";
import { getLatestPostsAction } from '@/app/actions/blogActions';
import { type CardPost } from '@/components/blog/BlogCard';

export const revalidate = 3600; // Cache selama 1 jam

export async function GET() {
    try {
        // Jalankan semua pengambilan data secara paralel
        const [fontsRes, postsRes, marqueeRes] = await Promise.all([
            getAllFontsForPairingAction(),
            getLatestPostsAction(),
            getAllFontsForMarqueeAction()
        ]);

        const { fonts, error: fontsError } = fontsRes;
        if (fontsError) throw new Error(fontsError);
        
        // Proses data blog posts
        const { posts: latestPostsData, error: postsError } = postsRes;
        let latestBlogPosts: CardPost[] = [];
        if (!postsError && latestPostsData) {
            latestBlogPosts = latestPostsData.map(post => ({
                slug: post.slug, title: post.title, imageUrl: post.image_url || '/images/dummy/placeholder.jpg',
                category: post.category || 'Uncategorized', date: post.created_at, author: post.author_name || 'Anonymous',
                readTime: Math.ceil((post.content?.split(' ').length || 0) / 200),
                comments: 0, views: 0,
            })).slice(0, 4);
        }
        
        // Ambil data marquee
        const { products: marqueeFonts } = marqueeRes;

        return NextResponse.json({ allFontsForPairing: fonts || [], latestBlogPosts, marqueeFonts });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}