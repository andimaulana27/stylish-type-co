// src/app/api/fonts/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Database, Tables } from '@/lib/database.types';
import type { ProductData } from '@/lib/dummy-data';

const ITEMS_PER_PAGE = 32;

type FormattedFont = ProductData & {
    font_files: Tables<'fonts'>['font_files'];
    partner: {
        name: string;
        slug: string;
    } | null;
};

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const cookieStore = cookies();
    const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
            },
        }
    );

    const searchTerm = searchParams.get('search') || '';
    const selectedCategory = searchParams.get('category') || 'All';
    const sortBy = searchParams.get('sort') || 'Newest';
    const currentPage = Number(searchParams.get('page')) || 1;
    const partnerId = searchParams.get('partnerId') || null;
    const partnerSlug = searchParams.get('partner') || null;
    const selectedTag = searchParams.get('tag') || null;

    try {
        let query = supabase.from('fonts').select('*, discounts ( name, percentage ), partners ( name, slug )', { count: 'exact' });

        if (searchTerm) {
            query = query.ilike('name', `%${searchTerm}%`);
        }
        if (selectedCategory !== 'All') {
            query = query.eq('category', selectedCategory);
        }
        
        if (partnerId) {
            query = query.eq('partner_id', partnerId);
        } else if (partnerSlug) {
            // --- PERUBAHAN DI SINI ---
            if (partnerSlug === 'stylishtype') {
                query = query.is('partner_id', null);
            }
        }
        
        if (sortBy === 'Staff Pick') {
            query = query.eq('staff_pick', true);
        }

        if (selectedTag) {
            query = query.or(`tags.cs.{${selectedTag}},purpose_tags.cs.{${selectedTag}}`);
        }

        if (sortBy === 'Popular') {
            query = query.order('sales_count', { ascending: false });
        } else if (sortBy === 'Newest') {
            query = query.order('created_at', { ascending: false });
        } else if (sortBy === 'Oldest') {
            query = query.order('created_at', { ascending: true });
        } else if (sortBy === 'A to Z') {
            query = query.order('name', { ascending: true });
        } else if (sortBy === 'Z to A') {
            query = query.order('name', { ascending: false });
        } else { 
            query = query.order('created_at', { ascending: false });
        }

        const from = (currentPage - 1) * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;
        query = query.range(from, to);

        const { data, error, count } = await query;

        if (error) {
            throw error;
        }

        const totalItems = count ?? 0;
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

        const formattedFonts: FormattedFont[] = (data || []).map(font => {
            const discountInfo = font.discounts;
            const originalPrice = font.price ?? 0;
            let finalPrice = originalPrice;
            let discountString: string | undefined = undefined;

            if (discountInfo && discountInfo.percentage > 0) {
                finalPrice = originalPrice - (originalPrice * discountInfo.percentage / 100);
                discountString = `${discountInfo.percentage}% OFF`;
            }

            return {
                id: font.id,
                name: font.name,
                slug: font.slug,
                imageUrl: font.preview_image_urls?.[0] ?? '/images/dummy/placeholder.jpg',
                price: finalPrice,
                originalPrice: discountInfo ? originalPrice : undefined,
                description: font.category ?? 'Font',
                type: 'font',
                discount: discountString,
                staffPick: font.staff_pick ?? false,
                font_files: font.font_files,
                partner: Array.isArray(font.partners) ? null : font.partners,
            };
        });
        
        const response = NextResponse.json({ fonts: formattedFonts, totalPages });
        response.headers.set('Cache-Control', 's-maxage=600, stale-while-revalidate=3000');
        return response;

    } catch (error) {
        console.error('API Error fetching fonts:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ error: 'Failed to fetch fonts', details: errorMessage }, { status: 500 });
    }
}