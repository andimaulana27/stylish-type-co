// src/app/api/bundle-detail/[slug]/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Database, Tables } from '@/lib/database.types';
import { getLatestPostsAction } from '@/app/actions/blogActions';

// Cache data ini selama 1 jam
export const revalidate = 3600;

type BundleWithDiscounts = Tables<'bundles'> & {
  discounts: Pick<Tables<'discounts'>, 'name' | 'percentage'> | null;
};

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
    const slug = params.slug;
    if (!slug) {
        return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

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
        const [bundleRes, licensesRes, postsRes] = await Promise.all([
            supabase.from('bundles').select('*, discounts(name, percentage)').eq('slug', slug).single(),
            supabase.from('licenses').select('*').order('created_at'),
            getLatestPostsAction(),
        ]);

        if (bundleRes.error) {
            if (bundleRes.error.code === 'PGRST116') {
                return NextResponse.json({ error: 'Bundle not found' }, { status: 404 });
            }
            throw bundleRes.error;
        }

        const bundle = bundleRes.data as BundleWithDiscounts;
        const licenses = licensesRes.data || [];
        
        const latestBlogPosts = (postsRes.posts || []).map(post => ({
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

        return NextResponse.json({
            bundle,
            licenses,
            latestBlogPosts,
        });

    } catch (error) {
        const message = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}