import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';
import BlogClient from './BlogClient'; // Impor komponen klien yang baru

const ITEMS_PER_PAGE = 50;

// Halaman utama sekarang adalah Server Component async
export default async function ManageBlogPage({
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

    let posts: Database['public']['Tables']['posts']['Row'][] = [];
    let totalPages = 0;
    let error: string | null = null;

    try {
        let query = supabase.from('posts').select('*', { count: 'exact' });
                
        if (searchTerm) {
            query = query.ilike('title', `%${searchTerm}%`);
        }
        if (selectedCategory && selectedCategory !== 'All') {
            query = query.eq('category', selectedCategory);
        }
        
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE - 1;
        
        const { data, error: queryError, count } = await query
            .order('created_at', { ascending: false })
            .range(start, end);

        if (queryError) throw queryError;

        posts = data || [];
        totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE);

    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
        console.error('Error fetching data for Manage Blog page:', errorMessage);
        error = "Failed to load blog posts. Please try refreshing the page.";
    }

    if (error) {
        return (
            <div className="bg-red-900/20 border border-red-500/30 text-red-300 p-6 rounded-lg">
                <h2 className="font-bold">Error Loading Data</h2>
                <p className="text-sm mt-2">{error}</p>
            </div>
        );
    }

    return (
        <BlogClient
            initialPosts={posts}
            initialTotalPages={totalPages}
        />
    );
}