// src/app/api/homepage/popular-bundles/route.get.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';
import type { ProductData } from '@/lib/dummy-data';

// Fungsi ini akan diekspor dan digunakan langsung di page.tsx
export async function getPopularBundles() {
    const cookieStore = cookies();
    const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
    );

    try {
        const { data: config } = await supabase.from('homepage_sections').select('*').eq('section_key', 'popular_bundles').single();

        let query = supabase.from('bundles').select('*, discounts ( name, percentage )');

        if (config && config.product_ids && config.product_ids.length > 0) {
            query = query.in('id', config.product_ids).limit(4);
        } else {
            query = query.order('created_at', { ascending: false }).limit(4);
        }

        const { data: bundles } = await query;
        
        const popularBundlesData: ProductData[] = (bundles || []).map(bundle => {
            const discountInfo = bundle.discounts;
            const originalPrice = bundle.price ?? 0;
            let finalPrice = originalPrice;
            let discountString: string | undefined = undefined;

            if (discountInfo && discountInfo.percentage > 0) {
                finalPrice = originalPrice - (originalPrice * discountInfo.percentage / 100);
                discountString = `${discountInfo.percentage}% OFF`;
            }

            return {
                id: bundle.id,
                name: bundle.name,
                slug: bundle.slug,
                imageUrl: bundle.preview_image_urls?.[0] ?? '/images/dummy/placeholder.jpg',
                price: finalPrice,
                originalPrice: discountInfo ? originalPrice : undefined,
                description: 'Bundle',
                type: 'bundle',
                discount: discountString,
                staffPick: bundle.staff_pick ?? false,
            };
        });

        return { products: popularBundlesData };

    } catch (error) {
        console.error("Error fetching popular bundles:", error);
        return { products: [] };
    }
}