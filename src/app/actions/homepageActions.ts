// src/app/actions/homepageActions.ts
'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { Database } from '@/lib/database.types';

const createSupabaseActionClient = () => {
    const cookieStore = cookies();
    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) { return cookieStore.get(name)?.value; },
                set(name: string, value: string, options: CookieOptions) { cookieStore.set(name, value, options); },
                remove(name: string, options: CookieOptions) { cookieStore.set(name, '', options); },
            },
        }
    );
};

export async function getHomepageConfigAction() {
    const supabase = createSupabaseActionClient();
    const { data, error } = await supabase.from('homepage_sections').select('*');
    if (error) {
        console.error('Error fetching homepage config:', error);
        return [];
    }
    return data;
}

export async function getProductsByIdsAction(productIds: string[]) {
    if (!productIds || productIds.length === 0) {
        return [];
    }
    const supabase = createSupabaseActionClient();

    const [fontsRes, bundlesRes] = await Promise.all([
        supabase.from('fonts').select('id, name').in('id', productIds),
        supabase.from('bundles').select('id, name').in('id', productIds)
    ]);

    if (fontsRes.error) console.error("Error fetching fonts by ID:", fontsRes.error.message);
    if (bundlesRes.error) console.error("Error fetching bundles by ID:", bundlesRes.error.message);

    const products = [
        ...(fontsRes.data || []).map(f => ({ ...f, type: 'font' as const })),
        ...(bundlesRes.data || []).map(b => ({ ...b, type: 'bundle' as const }))
    ];

    return productIds.map(id => products.find(p => p.id === id)).filter(Boolean);
}


// --- PERBAIKAN UTAMA: Menambahkan parameter staffPickOnly ---
export async function getProductsForManagerAction(
    type: 'font' | 'bundle' | 'all',
    searchTerm: string,
    staffPickOnly: boolean = false // Parameter baru
) {
    const supabase = createSupabaseActionClient();
    const SEARCH_LIMIT = 50; // Tingkatkan limit agar lebih banyak staff pick muncul

    try {
        if (type === 'font') {
            let query = supabase.from('fonts').select('id, name').ilike('name', `%${searchTerm}%`);
            if (staffPickOnly) {
                query = query.eq('staff_pick', true); // Filter berdasarkan staff_pick
            }
            const { data, error } = await query.limit(SEARCH_LIMIT);
            if (error) throw error;
            return { products: data.map(f => ({ ...f, type: 'font' as const })) };
        }
        if (type === 'bundle') {
             let query = supabase.from('bundles').select('id, name').ilike('name', `%${searchTerm}%`);
            if (staffPickOnly) {
                query = query.eq('staff_pick', true);
            }
            const { data, error } = await query.limit(SEARCH_LIMIT);
            if (error) throw error;
            return { products: data.map(b => ({ ...b, type: 'bundle' as const })) };
        }
        
        // Tipe 'all' untuk featured products
        const [fonts, bundles] = await Promise.all([
            supabase.from('fonts').select('id, name').ilike('name', `%${searchTerm}%`).eq('staff_pick', staffPickOnly ? true : false),
            supabase.from('bundles').select('id, name').ilike('name', `%${searchTerm}%`).eq('staff_pick', staffPickOnly ? true : false)
        ]);

        if (fonts.error) throw fonts.error;
        if (bundles.error) throw bundles.error;

        const allProducts = [
            ...(fonts.data || []).map(f => ({ ...f, type: 'font' as const })),
            ...(bundles.data || []).map(b => ({ ...b, type: 'bundle' as const }))
        ];

        return { products: allProducts };

    } catch (error: unknown) {
        if (error instanceof Error) console.error(`Error in getProductsForManagerAction: ${error.message}`);
        return { products: [] };
    }
}


export async function updateHomepageSectionAction(sectionKey: string, productIds: string[]) {
    const supabase = createSupabaseActionClient();
    try {
        const { error } = await supabase
            .from('homepage_sections')
            .update({ product_ids: productIds })
            .eq('section_key', sectionKey);
        
        if (error) throw error;

    } catch (error: unknown) {
        if (error instanceof Error) return { error: error.message };
        return { error: 'An unexpected error occurred.' };
    }

    revalidatePath('/admin/homepage');
    revalidatePath('/');
    return { success: `Section "${sectionKey}" updated successfully!` };
}