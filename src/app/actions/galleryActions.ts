// src/app/actions/galleryActions.ts
'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { Database } from '@/lib/database.types';

type ImageForDeletion = Pick<Database['public']['Tables']['gallery_images']['Row'], 'id' | 'image_url'>;

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

// Mengambil semua gambar dari galeri
export async function getGalleryImagesAction() {
    const supabase = createSupabaseActionClient();
    try {
        const { data, error } = await supabase
            .from('gallery_images')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { success: true, images: data };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: message };
    }
}

// --- FUNGSI DIPERBARUI: Menambah beberapa gambar sekaligus ---
export async function bulkAddGalleryImagesAction(images: { imageUrl: string; altText: string }[]) {
    const supabase = createSupabaseActionClient();
    if (!images || images.length === 0) return { error: 'No images to add.' };
    
    try {
        const imagesToInsert = images.map(img => ({
            image_url: img.imageUrl,
            alt_text: img.altText
        }));

        const { error } = await supabase
            .from('gallery_images')
            .insert(imagesToInsert);
        
        if (error) throw error;

        revalidatePath('/admin/gallery');
        revalidatePath('/');
        return { success: `${images.length} image(s) added to gallery!` };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: message };
    }
}


// --- FUNGSI DIPERBARUI: Menghapus beberapa gambar sekaligus ---
export async function bulkDeleteGalleryImagesAction(imagesToDelete: ImageForDeletion[]) {
    if (!imagesToDelete || imagesToDelete.length === 0) {
        return { error: 'No images selected for deletion.' };
    }
    const supabase = createSupabaseActionClient();
    try {
        const filePaths = imagesToDelete
            .map(img => new URL(img.image_url).pathname.split('/gallery_images/')[1])
            .filter(Boolean);
        
        const imageIds = imagesToDelete.map(img => img.id);

        if (filePaths.length > 0) {
            await supabase.storage.from('gallery_images').remove(filePaths);
        }

        const { error: dbError } = await supabase
            .from('gallery_images')
            .delete()
            .in('id', imageIds);
        
        if (dbError) throw dbError;

        revalidatePath('/admin/gallery');
        revalidatePath('/');
        return { success: `${imagesToDelete.length} image(s) deleted successfully!` };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: message };
    }
}