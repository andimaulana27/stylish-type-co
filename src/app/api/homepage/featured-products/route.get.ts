// src/app/api/homepage/featured-products/route.get.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database, Tables } from '@/lib/database.types';
import type { ProductData } from '@/lib/dummy-data';

type ProductWithDiscount = (Tables<'fonts'> | Tables<'bundles'>) & {
    discounts: Pick<Tables<'discounts'>, 'name' | 'percentage'> | null;
};

export async function getFeaturedProducts() {
    const cookieStore = cookies();
    const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
    );

    try {
        const { data: config } = await supabase.from('homepage_sections').select('*').eq('section_key', 'featured_products').single();

        let productIds: string[] = [];

        if (config && config.product_ids && config.product_ids.length > 0) {
            productIds = config.product_ids;
        } else {
            const { data: staffPickedFonts } = await supabase
                .from('fonts')
                .select('id')
                .eq('staff_pick', true)
                .limit(8);
            
            if (staffPickedFonts) {
                productIds = staffPickedFonts.map(f => f.id);
            }
        }

        if (productIds.length === 0) {
            return { products: [] };
        }

        const [fontsRes, bundlesRes] = await Promise.all([
            supabase.from('fonts').select('*, discounts ( name, percentage )').in('id', productIds),
            supabase.from('bundles').select('*, discounts ( name, percentage )').in('id', productIds)
        ]);
        
        const formatProduct = (product: ProductWithDiscount, type: 'font' | 'bundle'): ProductData => {
            const discountInfo = product.discounts;
            const originalPrice = product.price ?? 0;
            let finalPrice = originalPrice;
            let discountString: string | undefined = undefined;

            if (discountInfo && discountInfo.percentage > 0) {
                finalPrice = originalPrice - (originalPrice * discountInfo.percentage / 100);
                discountString = `${discountInfo.percentage}% OFF`;
            }

            return {
                id: product.id,
                name: product.name,
                slug: product.slug,
                imageUrl: product.preview_image_urls?.[0] ?? '/images/dummy/placeholder.jpg',
                price: finalPrice,
                originalPrice: discountInfo ? originalPrice : undefined,
                description: type === 'font' ? (product as Tables<'fonts'>).category ?? 'Font' : 'Bundle',
                type: type,
                discount: discountString,
                staffPick: product.staff_pick ?? false,
            };
        };
        
        const allFeatured = [
            ...(fontsRes.data || []).map(p => formatProduct(p as ProductWithDiscount, 'font')),
            ...(bundlesRes.data || []).map(p => formatProduct(p as ProductWithDiscount, 'bundle'))
        ];

        const featuredProductsData = productIds.map(id => allFeatured.find(p => p.id === id)).filter(Boolean) as ProductData[];
        
        return { products: featuredProductsData };

    } catch (error) {
        console.error("Error fetching featured products:", error);
        return { products: [] };
    }
}