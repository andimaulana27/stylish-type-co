// src/app/(admin)/admin/products/fonts/page.tsx
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database, type Tables } from '@/lib/database.types';

// Komponen baru yang berisi semua logika client-side
import FontsClient from './FontsClient';

const ITEMS_PER_PAGE = 50;

type Discount = Tables<'discounts'>;
type Font = Tables<'fonts'> & {
  discounts: Pick<Discount, 'name' | 'percentage'> | null;
};

// Halaman utama sekarang adalah Server Component async
export default async function ManageFontsPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
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

    const currentPage = Number(searchParams.page) || 1;
    const searchTerm = (searchParams.search as string) || '';
    const selectedCategory = (searchParams.category as string) || 'All';

    let fonts: Font[] = [];
    let totalPages = 0;
    let discounts: Discount[] = [];
    let error: string | null = null;

    try {
        // Ambil data font dan diskon secara paralel untuk efisiensi
        const [fontsResponse, discountsResponse] = await Promise.all([
            (() => {
                let query = supabase.from('fonts').select('*, discounts ( name, percentage )', { count: 'exact' }).order('created_at', { ascending: false });
                if (searchTerm) query = query.ilike('name', `%${searchTerm}%`);
                if (selectedCategory !== 'All') query = query.eq('category', selectedCategory);
                const from = (currentPage - 1) * ITEMS_PER_PAGE;
                const to = from + ITEMS_PER_PAGE - 1;
                return query.range(from, to);
            })(),
            supabase.from('discounts').select('*').order('created_at', { ascending: false })
        ]);

        const { data: fontData, error: fontError, count } = fontsResponse;
        const { data: discountData, error: discountError } = discountsResponse;

        if (fontError) throw fontError;
        if (discountError) throw discountError;
        
        fonts = fontData as Font[];
        totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE);
        discounts = discountData;

    } catch (e) {
        // Di Server Component, kita bisa log error di sisi server
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
        console.error('Error fetching data for Manage Fonts page:', errorMessage);
        error = "Failed to load page data. Please try refreshing the page.";
    }

    // Jika terjadi error saat fetching, kita tetap render client component dengan data kosong dan pesan error
    if (error) {
        return (
            <div className="bg-red-900/20 border border-red-500/30 text-red-300 p-6 rounded-lg">
                <h2 className="font-bold">Error Loading Data</h2>
                <p className="text-sm mt-2">{error}</p>
            </div>
        );
    }

    return (
        <FontsClient 
            initialFonts={fonts}
            initialTotalPages={totalPages}
            initialDiscounts={discounts}
        />
    );
}