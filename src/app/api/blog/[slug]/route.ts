// src/app/api/blog/[slug]/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Database } from '@/lib/database.types';
import { getRelatedPostsAction } from '@/app/actions/blogActions';

// Cache data ini selama 1 jam
export const revalidate = 3600;

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
        const { data: post, error } = await supabase
            .from('posts')
            .select('*')
            .eq('slug', slug)
            .eq('is_published', true)
            .single();
        
        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'Post not found' }, { status: 404 });
            }
            throw error;
        }

        // Tingkatkan view count di sini, karena ini hanya akan dipanggil saat halaman dirender/revalidasi
        await supabase.rpc('increment_view_count', { post_id_to_update: post.id });

        // Ambil postingan terkait
        const { posts: relatedPosts } = await getRelatedPostsAction(post.id, post.category || '');

        return NextResponse.json({
            post,
            relatedPosts,
        });

    } catch (error) {
        const message = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}