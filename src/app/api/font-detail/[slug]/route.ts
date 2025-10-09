// src/app/api/font-detail/[slug]/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Database, Tables } from '@/lib/database.types';
import { getAllFontsForPairingAction } from '@/app/actions/productActions';
import { getLatestPostsAction } from '@/app/actions/blogActions';

// Cache data ini selama 1 jam
export const revalidate = 3600;

type FontWithPartnerAndDiscount = Tables<'fonts'> & { 
    partners: { name: string, slug: string } | null;
    discounts: { name: string, percentage: number } | null;
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
        const [fontRes, licensesRes, bundlesRes, allFontsForPairingRes, latestPostsRes] = await Promise.all([
            supabase.from('fonts').select('*, partners(name, slug), discounts(name, percentage)').eq('slug', slug).single(),
            supabase.from('licenses').select('*').order('created_at'),
            supabase.from('bundles').select('*, discounts(name, percentage)').order('created_at', { ascending: false }).limit(4),
            getAllFontsForPairingAction(),
            getLatestPostsAction(),
        ]);

        if (fontRes.error) {
            // Jika font tidak ditemukan, kembalikan status 404
            if (fontRes.error.code === 'PGRST116') {
                 return NextResponse.json({ error: 'Font not found' }, { status: 404 });
            }
            throw fontRes.error;
        }

        const font = fontRes.data as FontWithPartnerAndDiscount;
        const licenses = licensesRes.data || [];
        const allFontsForPairing = allFontsForPairingRes.fonts || [];
        
        const formattedBundles = (bundlesRes.data || []).map(bundle => {
            const discountInfo = bundle.discounts;
            const originalPrice = bundle.price ?? 0;
            let finalPrice = originalPrice;
            let discountString: string | undefined = undefined;

            if (discountInfo && discountInfo.percentage > 0) {
                finalPrice = originalPrice - (originalPrice * discountInfo.percentage / 100);
                discountString = `${discountInfo.percentage}% OFF`;
            }
            return {
                id: bundle.id, name: bundle.name, slug: bundle.slug,
                imageUrl: bundle.preview_image_urls?.[0] ?? '/images/dummy/placeholder.jpg',
                price: finalPrice, originalPrice: discountInfo ? originalPrice : undefined,
                description: 'Bundle', type: 'bundle' as const, discount: discountString,
                staffPick: bundle.staff_pick ?? false,
            };
        });

        const latestBlogPosts = (latestPostsRes.posts || []).map(post => ({
            slug: post.slug, title: post.title, imageUrl: post.image_url || '/images/dummy/placeholder.jpg',
            category: post.category || 'Uncategorized', date: post.created_at, author: post.author_name || 'Anonymous',
            readTime: Math.ceil((post.content?.split(' ').length || 0) / 200),
            comments: 0, views: 0,
        })).slice(0, 4);
        
        return NextResponse.json({
            font,
            licenses,
            formattedBundles,
            allFontsForPairing,
            latestBlogPosts,
        });

    } catch (error) {
        const message = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}