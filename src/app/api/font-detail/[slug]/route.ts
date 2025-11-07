// src/app/api/font-detail/[slug]/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Database, Tables } from '@/lib/database.types';
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
        // --- Langkah 1: Ambil data font utama ---
        const { data: font, error: fontError } = await supabase
            .from('fonts')
            .select('*, partners(name, slug), discounts(name, percentage)')
            .eq('slug', slug)
            .single();

        if (fontError) {
            if (fontError.code === 'PGRST116') {
                 return NextResponse.json({ error: 'Font not found' }, { status: 404 });
            }
            throw fontError;
        }

        const typedFont = font as FontWithPartnerAndDiscount;


        // --- PERUBAHAN UTAMA DI SINI: Kueri font terkait ---

        // 1. Buat kueri dasar
        let relatedFontsQuery = supabase
            .from('fonts')
            .select('*, discounts(name, percentage)')
            .neq('id', typedFont.id); // Selalu kecualikan font ini

        // 2. Filter HANYA berdasarkan kategori yang sama.
        //    Jika font ini punya kategori, cari kategori itu.
        //    Jika font ini TIDAK punya kategori, cari font lain yang TIDAK punya kategori.
        if (typedFont.category) {
            relatedFontsQuery = relatedFontsQuery.eq('category', typedFont.category);
        } else {
            // Ini akan mencari font lain yang juga 'category' nya NULL
            relatedFontsQuery = relatedFontsQuery.is('category', null);
        }

        // 3. Batasi hasil dan urutkan (mengambil 16 font)
        relatedFontsQuery = relatedFontsQuery
            .order('created_at', { ascending: false })
            .limit(16);

        // --- AKHIR PERUBAHAN ---


        // --- Langkah 2: Ambil data lain secara paralel (termasuk font terkait) ---
        const [licensesRes, bundlesRes, latestPostsRes, relatedFontsRes] = await Promise.all([
            supabase.from('licenses').select('*').order('created_at'),
            supabase.from('bundles').select('*, discounts(name, percentage)').order('created_at', { ascending: false }).limit(4),
            getLatestPostsAction(),
            // --- Kueri yang sudah kita bangun di atas dijalankan di sini ---
            relatedFontsQuery
        ]);
        
        const licenses = licensesRes.data || [];
        
        // Format Bundles
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

        // Format Blog Posts
        const latestBlogPosts = (latestPostsRes.posts || []).map(post => ({
            slug: post.slug, title: post.title, imageUrl: post.image_url || '/images/dummy/placeholder.jpg',
            category: post.category || 'Uncategorized', date: post.created_at, author: post.author_name || 'Anonymous',
            readTime: Math.ceil((post.content?.split(' ').length || 0) / 200),
            comments: 0, views: 0,
        })).slice(0, 4);

        // --- Format BARU untuk font terkait ---
        const relatedFonts = (relatedFontsRes.data || []).map(rFont => {
            const discountInfo = rFont.discounts;
            const originalPrice = rFont.price ?? 0;
            let finalPrice = originalPrice;
            let discountString: string | undefined = undefined;

            if (discountInfo && discountInfo.percentage > 0) {
                finalPrice = originalPrice - (originalPrice * discountInfo.percentage / 100);
                discountString = `${discountInfo.percentage}% OFF`;
            }
            return {
                id: rFont.id, name: rFont.name, slug: rFont.slug,
                imageUrl: rFont.preview_image_urls?.[0] ?? '/images/dummy/placeholder.jpg',
                price: finalPrice, originalPrice: discountInfo ? originalPrice : undefined,
                description: rFont.category ?? 'Font', type: 'font' as const,
                discount: discountString, staffPick: rFont.staff_pick ?? false,
            };
        });
        
        return NextResponse.json({
            font: typedFont, // Kembalikan font utama
            licenses,
            formattedBundles,
            latestBlogPosts,
            relatedFonts, // <-- Data ini dikirim ke halaman
        });

    } catch (error) {
        const message = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}