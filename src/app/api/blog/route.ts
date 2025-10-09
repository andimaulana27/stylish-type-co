// src/app/api/blog/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { Database } from '@/lib/database.types';
import { type CardPost } from '@/components/blog/BlogCard';

// Cache data ini selama 1 jam, tetapi akan di-revalidate saat ada post baru/update
export const revalidate = 3600;

const ITEMS_PER_PAGE = 32;

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const cookieStore = cookies();
    const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) { return cookieStore.get(name)?.value; },
            },
        }
    );

    try {
        const currentPage = Number(searchParams.get('page')) || 1;
        const searchTerm = searchParams.get('search') || '';
        const selectedCategory = searchParams.get('category') || 'All Categories';
        const sortBy = searchParams.get('sort') || 'Newest';

        let query = supabase
            .from('posts')
            .select('*', { count: 'exact' })
            .eq('is_published', true);

        if (sortBy === 'Oldest') {
            query = query.order('created_at', { ascending: true });
        } else if (sortBy === 'Popular') {
            query = query.order('view_count', { ascending: false });
        } else { // Default ke 'Newest'
            query = query.order('created_at', { ascending: false });
        }

        if (searchTerm) {
            query = query.ilike('title', `%${searchTerm}%`);
        }

        if (selectedCategory && selectedCategory !== 'All Categories') {
            query = query.eq('category', selectedCategory);
        }
        
        const from = (currentPage - 1) * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;
        query = query.range(from, to);
        
        const { data: posts, error, count } = await query;
        
        if (error) {
            throw error;
        }
        
        const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE);

        const formattedPosts: CardPost[] = (posts || []).map(post => ({
            slug: post.slug,
            title: post.title,
            imageUrl: post.image_url || '/images/dummy/placeholder.jpg',
            category: post.category || 'Uncategorized',
            date: post.created_at,
            author: post.author_name || 'Anonymous',
            readTime: Math.ceil((post.content?.split(' ').length || 0) / 200),
            comments: 0, 
            views: post.view_count || 0,
        }));

        return NextResponse.json({ posts: formattedPosts, totalPages });

    } catch (error) {
        const message = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}