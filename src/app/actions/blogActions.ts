// src/app/actions/blogActions.ts
'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { Database, TablesInsert, TablesUpdate, Tables } from '@/lib/database.types'; // <-- Pastikan Tables diimpor

type PostForDeletion = Pick<Database['public']['Tables']['posts']['Row'], 'id' | 'image_url'>;

export type AdSlotConfig = {
    position: string;
    ad_type: string;
    google_script: string | null;
    banner_image_url: string | null;
};

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

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};


type ActionResult = {
    success?: string;
    error?: string;
};

// --- FUNGSI BARU: Mengambil detail blog berdasarkan array slug ---
export async function getBlogDetailsBySlugsAction(slugs: string[]): Promise<{ data: Pick<Tables<'posts'>, 'title' | 'slug' | 'image_url'>[], error?: string }> {
    if (!slugs || slugs.length === 0) {
        return { data: [] };
    }
    const supabase = createSupabaseActionClient();
    try {
        const { data, error } = await supabase
            .from('posts')
            .select('title, slug, image_url')
            .in('slug', slugs)
            .eq('is_published', true); // Hanya ambil yang sudah publish

        if (error) throw error;

        // Pastikan urutan data sesuai dengan urutan slug input jika memungkinkan
        const sortedData = slugs.map(slug => data?.find(post => post.slug === slug)).filter(Boolean) as Pick<Tables<'posts'>, 'title' | 'slug' | 'image_url'>[];

        return { data: sortedData };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        console.error("Error fetching blog details by slugs:", message);
        return { data: [], error: message };
    }
}
// --- AKHIR FUNGSI BARU ---


export async function bulkDeletePostsAction(postsToDelete: PostForDeletion[]) {
    // ... (kode fungsi ini tetap sama)
    if (!postsToDelete || postsToDelete.length === 0) {
        return { error: 'No posts selected for deletion.' };
    }
    const supabase = createSupabaseActionClient();
    try {
        const imagePaths = postsToDelete
            .map(post => post.image_url ? new URL(post.image_url).pathname.split('/blog_images/')[1] : null)
            .filter((p): p is string => p !== null);

        if (imagePaths.length > 0) {
            await supabase.storage.from('blog_images').remove(imagePaths);
        }

        const postIds = postsToDelete.map(post => post.id);
        const { error: dbError } = await supabase
            .from('posts')
            .delete()
            .in('id', postIds);

        if (dbError) throw dbError;

        revalidatePath('/admin/blog');
        revalidatePath('/blog');
        return { success: `${postsToDelete.length} post(s) deleted successfully!` };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: message };
    }
}


export async function getPostsForMegaMenuAction() {
    // ... (kode fungsi ini tetap sama)
    const supabase = createSupabaseActionClient();
    try {
        const [newPostsRes, popularPostsRes] = await Promise.all([
            supabase
                .from('posts')
                .select('*')
                .eq('is_published', true)
                .order('created_at', { ascending: false })
                .limit(2),
            supabase
                .from('posts')
                .select('*')
                .eq('is_published', true)
                .order('view_count', { ascending: false })
                .limit(2)
        ]);

        if (newPostsRes.error) throw newPostsRes.error;
        if (popularPostsRes.error) throw popularPostsRes.error;

        return { success: true, newPosts: newPostsRes.data, popularPosts: popularPostsRes.data };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: message, newPosts: [], popularPosts: [] };
    }
}

export async function getRelatedPostsAction(currentPostId: string, category: string) {
    // ... (kode fungsi ini tetap sama)
    const supabase = createSupabaseActionClient();
    try {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('is_published', true)
            .eq('category', category)
            .neq('id', currentPostId)
            .order('created_at', { ascending: false })
            .limit(8);

        if (error) throw error;
        return { success: true, posts: data };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: message, posts: [] };
    }
}

export async function getLatestPostsAction() {
    // ... (kode fungsi ini tetap sama)
    const supabase = createSupabaseActionClient();
    try {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('is_published', true)
            .order('created_at', { ascending: false })
            .limit(4);

        if (error) throw error;
        return { success: true, posts: data };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: message, posts: [] };
    }
}

export async function createPostAction(formData: FormData): Promise<ActionResult> {
    // ... (kode fungsi ini tetap sama)
    const supabase = createSupabaseActionClient();

    try {
        const title = String(formData.get('title'));
        const postData: TablesInsert<'posts'> = {
            title: title,
            slug: generateSlug(title),
            content: String(formData.get('content')),
            excerpt: String(formData.get('excerpt')),
            image_url: String(formData.get('image_url')),
            author_name: String(formData.get('author_name')),
            category: String(formData.get('category')),
            tags: String(formData.get('tags')).split(',').map(tag => tag.trim()).filter(Boolean),
            is_published: formData.get('status') === 'Published',
            show_toc: formData.get('show_toc') === 'Show',
        };

        const { error } = await supabase.from('posts').insert(postData).select().single();
        if (error) throw error;

        revalidatePath('/admin/blog');
        revalidatePath('/blog');
        return { success: 'Post created successfully!' };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: message };
    }
}

export async function updatePostAction(postId: string, formData: FormData): Promise<ActionResult> {
    // ... (kode fungsi ini tetap sama)
    const supabase = createSupabaseActionClient();

    try {
        const title = String(formData.get('title'));
        const postData: TablesUpdate<'posts'> = {
            title: title,
            slug: generateSlug(title),
            content: String(formData.get('content')),
            excerpt: String(formData.get('excerpt')),
            image_url: String(formData.get('image_url')),
            author_name: String(formData.get('author_name')),
            category: String(formData.get('category')),
            tags: String(formData.get('tags')).split(',').map(tag => tag.trim()).filter(Boolean),
            is_published: formData.get('status') === 'Published',
            show_toc: formData.get('show_toc') === 'Show',
        };

        const { error } = await supabase.from('posts').update(postData).eq('id', postId);
        if (error) throw error;

        revalidatePath('/admin/blog');
        revalidatePath('/blog');
        revalidatePath(`/blog/${postData.slug}`);
        return { success: 'Post updated successfully!' };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: message };
    }
}

export async function deletePostAction(postId: string): Promise<ActionResult> {
    // ... (kode fungsi ini tetap sama)
    const supabase = createSupabaseActionClient();
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Authentication required.');

        const { data: post } = await supabase.from('posts').select('image_url').eq('id', postId).single();
        if(post?.image_url) {
            const filePath = new URL(post.image_url).pathname.split('/blog_images/')[1];
            if(filePath) {
                await supabase.storage.from('blog_images').remove([filePath]);
            }
        }

        const { error } = await supabase.from('posts').delete().eq('id', postId);
        if (error) throw error;

        revalidatePath('/admin/blog');
        revalidatePath('/blog');
        return { success: 'Post deleted successfully.' };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: message };
    }
}

export async function getBlogAdsConfigAction() {
    // ... (kode fungsi ini tetap sama)
    const supabase = createSupabaseActionClient();
    try {
        const { data, error } = await supabase
            .from('blog_ads')
            .select('*');

        if (error) throw error;
        return { success: true, config: data };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: message, config: [] };
    }
}

export async function updateBlogAdsConfigAction(configs: AdSlotConfig[]) {
    // ... (kode fungsi ini tetap sama)
    const supabase = createSupabaseActionClient();
    try {
        const upsertData = configs.map(config => ({
            position: config.position,
            ad_type: config.ad_type,
            google_script: config.ad_type === 'google_ads' ? config.google_script : null,
            banner_image_url: config.ad_type === 'banner' ? config.banner_image_url : null,
            is_active: true,
        }));

        const { error } = await supabase.from('blog_ads').upsert(upsertData, { onConflict: 'position' });

        if (error) throw error;

        revalidatePath('/admin/blog/ads');
        revalidatePath('/blog', 'layout');
        return { success: 'Ad configurations saved successfully!' };

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: message };
    }
}

export async function getBlogCategoriesAction() {
    // ... (kode fungsi ini tetap sama)
    const supabase = createSupabaseActionClient();
    try {
        const { data, error } = await supabase
            .from('posts')
            .select('category')
            .eq('is_published', true);

        if (error) throw error;

        const uniqueCategories = [
            ...new Set(data.map(item => item.category).filter((c): c is string => c !== null))
        ].sort();

        return { success: true, categories: uniqueCategories };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: message, categories: [] };
    }
}