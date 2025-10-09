// src/app/actions/bannerActions.ts
'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { Database, TablesInsert, TablesUpdate } from '@/lib/database.types';

type SlideForDeletion = Pick<Database['public']['Tables']['banner_slides']['Row'], 'id' | 'image_url'>;

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

// Mengambil semua slide banner
export async function getBannerSlidesAction() {
    const supabase = createSupabaseActionClient();
    try {
        const { data, error } = await supabase
            .from('banner_slides')
            .select('*')
            .order('sort_order', { ascending: true })
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { success: true, slides: data };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: message, slides: [] };
    }
}

// Menambah slide banner baru
export async function addBannerSlideAction(slideData: TablesInsert<'banner_slides'>) {
    const supabase = createSupabaseActionClient();
    try {
        const { error } = await supabase
            .from('banner_slides')
            .insert(slideData);
        
        if (error) throw error;

        revalidatePath('/admin/homepage/banner');
        revalidatePath('/', 'layout');
        return { success: 'Banner slide added successfully!' };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: message };
    }
}

// Menghapus slide banner
export async function deleteBannerSlideAction(slide: SlideForDeletion) {
    const supabase = createSupabaseActionClient();
    try {
        const filePath = new URL(slide.image_url).pathname.split('/banner_images/')[1];
        if (filePath) {
            await supabase.storage.from('banner_images').remove([filePath]);
        }

        const { error } = await supabase
            .from('banner_slides')
            .delete()
            .eq('id', slide.id);
        
        if (error) throw error;

        revalidatePath('/admin/homepage/banner');
        revalidatePath('/', 'layout');
        return { success: 'Banner slide deleted successfully!' };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: message };
    }
}

// Fungsi untuk update slide
export async function updateBannerSlideAction(slideId: string, formData: FormData) {
    const supabase = createSupabaseActionClient();
    try {
        const newImageUrl = formData.get('new_image_url') as string | null;
        const existingImageUrl = formData.get('existing_image_url') as string;

        const dataToUpdate: TablesUpdate<'banner_slides'> = {
            link_href: formData.get('link_href') as string,
            alt_text: formData.get('alt_text') as string,
            image_url: newImageUrl || existingImageUrl,
        };

        if (newImageUrl && existingImageUrl) {
            const oldFilePath = new URL(existingImageUrl).pathname.split('/banner_images/')[1];
            if (oldFilePath) {
                await supabase.storage.from('banner_images').remove([oldFilePath]);
            }
        }

        const { error } = await supabase
            .from('banner_slides')
            .update(dataToUpdate)
            .eq('id', slideId);

        if (error) throw error;

        revalidatePath('/admin/homepage/banner');
        revalidatePath('/', 'layout');
        return { success: 'Slide updated successfully!' };

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: message };
    }
}