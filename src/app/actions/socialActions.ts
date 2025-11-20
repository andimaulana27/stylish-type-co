// src/app/actions/socialActions.ts
'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { Database, TablesInsert, TablesUpdate } from '@/lib/database.types';

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

// --- (A) FUNGSI UNTUK MENGAMBIL DATA OLEH FOOTER ---
export async function getSocialLinksAction() {
    const supabase = createSupabaseActionClient();
    try {
        const { data, error } = await supabase
            .from('social_links')
            .select('*')
            // --- PERUBAHAN: Diurutkan berdasarkan nama (A-Z) ---
            .order('name', { ascending: true });

        if (error) throw error;
        return { links: data };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: message, links: [] };
    }
}

// --- (B) FUNGSI UNTUK PANEL ADMIN ---

export async function addSocialLinkAction(formData: FormData) {
    const supabase = createSupabaseActionClient();
    try {
        const linkData: TablesInsert<'social_links'> = {
            name: String(formData.get('name')),
            url: String(formData.get('url')),
            icon_key: String(formData.get('icon_key')),
            // sort_order: DIHAPUS
        };
        
        const { error } = await supabase.from('social_links').insert(linkData);
        if (error) throw error;

        revalidatePath('/admin/social-links');
        revalidatePath('/', 'layout'); // Revalidasi layout utama
        return { success: 'Social link added!' };
    } catch (error: unknown) {
        return { error: (error as Error).message };
    }
}

export async function updateSocialLinkAction(id: string, formData: FormData) {
    const supabase = createSupabaseActionClient();
    try {
        const linkData: TablesUpdate<'social_links'> = {
            name: String(formData.get('name')),
            url: String(formData.get('url')),
            icon_key: String(formData.get('icon_key')),
            // sort_order: DIHAPUS
        };

        const { error } = await supabase.from('social_links').update(linkData).eq('id', id);
        if (error) throw error;

        revalidatePath('/admin/social-links');
        revalidatePath('/', 'layout'); // Revalidasi layout utama
        return { success: 'Social link updated!' };
    } catch (error: unknown) {
        return { error: (error as Error).message };
    }
}

export async function deleteSocialLinkAction(id: string) {
    const supabase = createSupabaseActionClient();
    try {
        const { error } = await supabase.from('social_links').delete().eq('id', id);
        if (error) throw error;

        revalidatePath('/admin/social-links');
        revalidatePath('/', 'layout'); // Revalidasi layout utama
        return { success: 'Social link deleted!' };
    } catch (error: unknown) {
        return { error: (error as Error).message };
    }
}