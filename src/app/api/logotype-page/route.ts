// src/app/api/logotype-page/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';
import { type LogotypeFont } from '@/components/LogotypeCard';
import { getLatestPostsAction } from '@/app/actions/blogActions';
import { getAllFontsForMarqueeAction } from '@/app/actions/productActions';
import { type CardPost } from '@/components/blog/BlogCard';

export const revalidate = 3600; // Cache selama 1 jam

const getPreviewTextFromName = (name: string): string => {
  const nameWithoutStyle = name.split('-')[0].trim();
  const words = nameWithoutStyle.split(' ');
  return words.slice(0, 3).join(' ');
};

export async function GET() {
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
        // Jalankan semua pengambilan data secara paralel
        const [fontsRes, postsRes, marqueeRes] = await Promise.all([
            supabase.from('fonts').select('name, slug, font_files').order('created_at', { ascending: false }),
            getLatestPostsAction(),
            getAllFontsForMarqueeAction()
        ]);

        const { data: fonts, error } = fontsRes;
        if (error) throw error;

        // Proses data fonts
        const allLogotypeFonts = (fonts || []).reduce((accumulator: LogotypeFont[], font) => {
            const fontFiles = (font.font_files as { style: string; url: string }[] | null) || [];
            let displayFontFile = fontFiles.find(f => f.style.toLowerCase() === 'regular') || fontFiles[0];
            if (displayFontFile && font.slug) {
                accumulator.push({
                    name: font.name,
                    slug: font.slug,
                    fontFamily: `logotype-${font.slug}`,
                    url: displayFontFile.url,
                    initialPreviewText: getPreviewTextFromName(font.name),
                });
            }
            return accumulator;
        }, []);

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

        return NextResponse.json({ allLogotypeFonts, latestBlogPosts, marqueeFonts });

    } catch (error) {
        const message = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}