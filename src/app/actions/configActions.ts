// src/app/actions/configActions.ts
'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { Database, TablesUpdate } from '@/lib/database.types';

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

// Fungsi untuk mengambil SEMUA konfigurasi situs
export async function getSiteConfigAction() {
    const supabase = createSupabaseActionClient();
    try {
        // Ambil satu baris konfigurasi (dengan id = 1)
        const { data, error } = await supabase
            .from('site_config')
            .select('meta_pixel_id, google_analytics_id')
            .eq('id', 1)
            .limit(1)
            .single();

        if (error) throw error;
        return { data };
    } catch (error: unknown) {
        return { error: (error as Error).message, data: null };
    }
}

// Fungsi untuk MEMPERBARUI konfigurasi situs
export async function updateSiteConfigAction(formData: FormData) {
    const supabase = createSupabaseActionClient();
    try {
        const configData: TablesUpdate<'site_config'> = {
            meta_pixel_id: String(formData.get('meta_pixel_id')) || null,
            // Anda bisa tambahkan field lain di sini di masa depan
            // google_analytics_id: String(formData.get('google_analytics_id')) || null,
            updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
            .from('site_config')
            .update(configData)
            .eq('id', 1); // Selalu update baris dengan id = 1

        if (error) throw error;

        // Revalidasi seluruh layout situs agar script baru dimuat
        revalidatePath('/', 'layout'); 
        return { success: 'Site settings updated!' };
    } catch (error: unknown) {
        return { error: (error as Error).message };
    }
}