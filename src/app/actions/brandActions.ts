// src/app/actions/brandActions.ts
'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { Database } from '@/lib/database.types';

type BrandForDeletion = Pick<Database['public']['Tables']['brands']['Row'], 'id' | 'logo_url'>;

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

// Mengambil semua logo brand
export async function getBrandsAction() {
    const supabase = createSupabaseActionClient();
    try {
        const { data, error } = await supabase
            .from('brands')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { success: true, brands: data };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: message, brands: [] };
    }
}

// Menambah logo brand baru
export async function addBrandAction(name: string, logoUrl: string) {
    const supabase = createSupabaseActionClient();
    try {
        const { error } = await supabase
            .from('brands')
            .insert({ name, logo_url: logoUrl });
        
        if (error) throw error;

        revalidatePath('/admin/brands');
        revalidatePath('/');
        return { success: 'Brand logo added successfully!' };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: message };
    }
}

// Menghapus satu logo brand
export async function deleteBrandAction(id: string, logoUrl: string) {
    const supabase = createSupabaseActionClient();
    try {
        const filePath = new URL(logoUrl).pathname.split('/brand_logos/')[1];
        if (filePath) {
            await supabase.storage.from('brand_logos').remove([filePath]);
        }

        const { error: dbError } = await supabase
            .from('brands')
            .delete()
            .eq('id', id);
        
        if (dbError) throw dbError;

        revalidatePath('/admin/brands');
        revalidatePath('/');
        return { success: 'Brand logo deleted successfully!' };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: message };
    }
}

// Fungsi untuk hapus massal
export async function bulkDeleteBrandsAction(brandsToDelete: BrandForDeletion[]) {
    if (!brandsToDelete || brandsToDelete.length === 0) {
        return { error: 'No brands selected for deletion.' };
    }
    const supabase = createSupabaseActionClient();
    try {
        const filePaths = brandsToDelete
            .map(brand => new URL(brand.logo_url).pathname.split('/brand_logos/')[1])
            .filter(Boolean);
        
        const brandIds = brandsToDelete.map(brand => brand.id);

        if (filePaths.length > 0) {
            const { error: storageError } = await supabase.storage.from('brand_logos').remove(filePaths);
            if (storageError) throw storageError;
        }

        const { error: dbError } = await supabase
            .from('brands')
            .delete()
            .in('id', brandIds);

        if (dbError) throw dbError;

        revalidatePath('/admin/brands');
        revalidatePath('/');
        return { success: `${brandsToDelete.length} brand(s) deleted successfully!` };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: message };
    }
}