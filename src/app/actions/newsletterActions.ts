// src/app/actions/newsletterActions.ts
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

// Fungsi untuk menangani subscription dari footer
export async function subscribeToAction(formData: FormData) {
    const supabase = createSupabaseActionClient();
    const email = String(formData.get('email'));

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { error: 'Please provide a valid email address.' };
    }

    try {
        // Cek apakah email sudah terdaftar
        const { data: existingSubscriber, error: selectError } = await supabase
            .from('newsletter_subscribers')
            .select('email')
            .eq('email', email)
            .single();
        
        if (selectError && selectError.code !== 'PGRST116') { // PGRST116 = not rows found
            throw selectError;
        }

        if (existingSubscriber) {
            return { error: 'This email is already subscribed!' };
        }

        // Jika belum ada, masukkan email baru
        const { error: insertError } = await supabase
            .from('newsletter_subscribers')
            .insert({ email });

        if (insertError) throw insertError;

        revalidatePath('/admin/newsletter');
        return { success: true };

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: message };
    }
}

// Fungsi untuk mendapatkan daftar subscriber untuk halaman admin
export async function getNewsletterSubscribersAction(options: { page: number, limit: number, searchTerm?: string }) {
    const { page, limit, searchTerm } = options;
    const supabase = createSupabaseActionClient();

    try {
        let query = supabase
            .from('newsletter_subscribers')
            .select('*', { count: 'exact' });

        if (searchTerm) {
            query = query.ilike('email', `%${searchTerm}%`);
        }

        const start = (page - 1) * limit;
        const end = start + limit - 1;

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(start, end);

        if (error) throw error;
        
        return { data, count, error: null };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { data: [], count: 0, error: message };
    }
}

// Fungsi untuk menghapus subscriber dari halaman admin
export async function deleteNewsletterSubscriberAction(id: string) {
    const supabase = createSupabaseActionClient();
    try {
        const { error } = await supabase
            .from('newsletter_subscribers')
            .delete()
            .eq('id', id);

        if (error) throw error;
        revalidatePath('/admin/newsletter');
        return { success: 'Subscriber removed successfully!' };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: message };
    }
}