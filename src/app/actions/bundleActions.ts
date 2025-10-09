// src/app/actions/bundleActions.ts
'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Database, Json, TablesInsert, TablesUpdate } from '@/lib/database.types';

type BundleFontPreview = { name: string; style: string; url: string; };

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9-]+/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
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

export async function updateBundleInTableAction(bundleId: string, updates: { price?: number }) {
    const supabase = createSupabaseActionClient();
    try {
        const { error } = await supabase.from('bundles').update(updates).eq('id', bundleId);
        if (error) throw new Error(`Database update failed: ${error.message}`);
    } catch (error: unknown) {
        if (error instanceof Error) return { error: error.message };
        return { error: 'An unexpected error occurred.' };
    }
    revalidatePath('/admin/products/bundles');
    return { success: 'Bundle updated successfully!' };
}

export async function addBundleAction(formData: FormData) {
  const supabase = createSupabaseActionClient();
  
  try {
    const name = String(formData.get('name'));
    const slug = generateSlug(name);
    const downloadableFileUrl = String(formData.get('downloadable_file_url'));
    const bundleFontPreviews: BundleFontPreview[] = JSON.parse(String(formData.get('bundle_font_previews_json')));
    const fontIds = formData.getAll('font_ids').map(String);
    
    if (!downloadableFileUrl) throw new Error('Bundle ZIP path is missing.');
    if (!bundleFontPreviews) throw new Error('Bundle font previews data is missing.');

    const bundleDataToInsert: TablesInsert<'bundles'> = {
      name,
      slug,
      price: Number(formData.get('price')),
      main_description: String(formData.get('main_description')),
      tags: String(formData.get('tags')).split(',').map(tag => tag.trim()).filter(Boolean),
      purpose_tags: String(formData.get('purpose_tags')).split(',').map(tag => tag.trim()).filter(Boolean),
      preview_image_urls: formData.getAll('preview_image_urls').map(String),
      download_zip_path: downloadableFileUrl,
      bundle_font_previews: bundleFontPreviews as Json,
      staff_pick: false,
    };

    const { data: newBundle, error: insertError } = await supabase.from('bundles').insert(bundleDataToInsert).select().single();
    if (insertError) throw new Error(`Database insert failed: ${insertError.message}`);

    if (fontIds.length > 0) {
        const bundleFontsData = fontIds.map(fontId => ({ bundle_id: newBundle.id, font_id: fontId }));
        await supabase.from('bundle_fonts').insert(bundleFontsData);
    }

  } catch (error: unknown) {
    if (error instanceof Error) return { error: error.message };
    return { error: 'An unexpected error occurred.' };
  }

  revalidatePath('/admin/products/bundles');
  revalidatePath('/bundles');
  redirect('/admin/products/bundles');

}

export async function findFontsByNamesAction(fileNames: string[]): Promise<{ id: string, name: string }[]> {
    const supabase = createSupabaseActionClient();
    if (fileNames.length === 0) return [];
    
    const baseNames = fileNames.map(name => {
        const cleanName = name.replace(/\.[^/.]+$/, ""); 
        const styleRegex = /[-_ ](thin|extralight|light|regular|medium|semibold|bold|extrabold|black|italic|bolditalic)/i;
        return cleanName.replace(styleRegex, '').trim();
    });

    const uniqueBaseNames = [...new Set(baseNames)];

    const { data, error } = await supabase
        .from('fonts')
        .select('id, name')
        .in('name', uniqueBaseNames);
        
    if (error) {
        console.error("Error finding fonts by name:", error);
        return [];
    }
    
    return data;
}


export async function updateBundleAction(bundleId: string, formData: FormData) {
  const supabase = createSupabaseActionClient();
  const name = String(formData.get('name'));
  const slug = generateSlug(name);

  try {
    const bundleDataToUpdate: TablesUpdate<'bundles'> = {
      name,
      slug,
      price: Number(formData.get('price')),
      main_description: String(formData.get('main_description')),
      tags: String(formData.get('tags')).split(',').map(tag => tag.trim()).filter(Boolean),
      purpose_tags: String(formData.get('purpose_tags')).split(',').map(tag => tag.trim()).filter(Boolean),
      preview_image_urls: formData.getAll('preview_image_urls').map(String),
    };

    const { error: updateError } = await supabase
      .from('bundles')
      .update(bundleDataToUpdate)
      .eq('id', bundleId);
    if (updateError) throw new Error(`Failed to update bundle details: ${updateError.message}`);

    const fontIds = formData.getAll('font_ids').map(String);

    const { error: deleteRelError } = await supabase
      .from('bundle_fonts')
      .delete()
      .eq('bundle_id', bundleId);
    if (deleteRelError) throw new Error(`Failed to clear old font relations: ${deleteRelError.message}`);
    
    if (fontIds.length > 0) {
        const bundleFontsData = fontIds.map(fontId => ({
            bundle_id: bundleId,
            font_id: fontId,
        }));
        const { error: insertRelError } = await supabase.from('bundle_fonts').insert(bundleFontsData);
        if (insertRelError) throw new Error(`Failed to add new font relations: ${insertRelError.message}`);
    }

  } catch (error: unknown) {
      if (error instanceof Error) return { error: error.message };
      return { error: 'An unexpected error occurred during bundle update.' };
  }

  revalidatePath('/admin/products/bundles');
  revalidatePath(`/bundles/${slug}`);
  revalidatePath(`/admin/products/bundles/${bundleId}/edit`);
  redirect('/admin/products/bundles');
}

export async function deleteBundleAction(bundleId: string) {
    const supabase = createSupabaseActionClient();
    try {
        const { data: bundle, error: fetchError } = await supabase
            .from('bundles')
            .select('download_zip_path, preview_image_urls, bundle_font_previews')
            .eq('id', bundleId)
            .single();
        
        if (fetchError) throw new Error(`Failed to fetch bundle data: ${fetchError.message}`);

        const filesToRemoveFromProducts: string[] = [];
        if (bundle.download_zip_path) filesToRemoveFromProducts.push(bundle.download_zip_path);
        if (bundle.preview_image_urls) {
            const imagePaths = bundle.preview_image_urls.map(url => new URL(url).pathname.split('/products/')[1]).filter(Boolean);
            filesToRemoveFromProducts.push(...imagePaths);
        }
        if (filesToRemoveFromProducts.length > 0) {
            await supabase.storage.from('products').remove(filesToRemoveFromProducts);
        }

        if (bundle.bundle_font_previews && Array.isArray(bundle.bundle_font_previews)) {
          const fontPreviewPaths = (bundle.bundle_font_previews as BundleFontPreview[]).map(p => new URL(p.url).pathname.split('/font-previews/')[1]).filter(Boolean);
          if (fontPreviewPaths.length > 0) {
            await supabase.storage.from('font-previews').remove(fontPreviewPaths);
          }
        }

        const { error: deleteError } = await supabase.from('bundles').delete().eq('id', bundleId);
        if (deleteError) throw new Error(`Failed to delete bundle: ${deleteError.message}`);

    } catch (error: unknown) {
        if (error instanceof Error) return { error: error.message };
        return { error: 'An unexpected error occurred during deletion.' };
    }
    revalidatePath('/admin/products/bundles');
    return { success: 'Bundle deleted successfully!' };
}

export async function bulkDeleteBundlesAction(bundleIds: string[]) {
    const supabase = createSupabaseActionClient();
    try {
        const { data: bundles, error: fetchError } = await supabase
            .from('bundles')
            .select('download_zip_path, preview_image_urls, bundle_font_previews')
            .in('id', bundleIds);
        if (fetchError) throw fetchError;

        const productFilesToRemove = bundles.flatMap(b => {
            const paths = [];
            if (b.download_zip_path) paths.push(b.download_zip_path);
            if (b.preview_image_urls) {
                const imagePaths = b.preview_image_urls.map(url => new URL(url).pathname.split('/products/')[1]).filter(Boolean);
                paths.push(...imagePaths);
            }
            return paths;
        });
        
        const previewFilesToRemove = bundles.flatMap(b => {
           if (b.bundle_font_previews && Array.isArray(b.bundle_font_previews)) {
              return (b.bundle_font_previews as BundleFontPreview[]).map(p => new URL(p.url).pathname.split('/font-previews/')[1]).filter(Boolean);
           }
           return [];
        });

        if (productFilesToRemove.length > 0) {
            await supabase.storage.from('products').remove(productFilesToRemove);
        }
        if (previewFilesToRemove.length > 0) {
            await supabase.storage.from('font-previews').remove(previewFilesToRemove);
        }
        
        const { error: deleteError } = await supabase.from('bundles').delete().in('id', bundleIds);
        if (deleteError) throw deleteError;

    } catch (error: unknown) {
        if (error instanceof Error) return { error: error.message };
        return { error: 'An unexpected error occurred.' };
    }
    revalidatePath('/admin/products/bundles');
    return { success: `${bundleIds.length} bundles deleted.` };
}

export async function updateBundleStaffPickAction(bundleId: string, isStaffPick: boolean) {
  const supabase = createSupabaseActionClient();
  try {
    const { error } = await supabase.from('bundles').update({ staff_pick: isStaffPick }).eq('id', bundleId);
    if (error) throw error;
  } catch (error: unknown) {
    if (error instanceof Error) return { error: error.message };
    return { error: 'An unexpected error occurred.' };
  }
  revalidatePath('/admin/products/bundles');
  return { success: `Staff Pick status updated.` };
}

export async function bulkApplyStaffPicksBundlesAction(bundleIds: string[], isStaffPick: boolean) {
  const supabase = createSupabaseActionClient();
  try {
    const { error } = await supabase.from('bundles').update({ staff_pick: isStaffPick }).in('id', bundleIds);
    if (error) throw error;
  } catch (error: unknown) {
    if (error instanceof Error) return { error: error.message };
    return { error: 'An unexpected error occurred.' };
  }
  revalidatePath('/admin/products/bundles');
  return { success: `Staff Pick status updated.` };
}

export async function updateBundleDiscountAction(bundleId: string, discountId: string | null) {
    const supabase = createSupabaseActionClient();
    try {
        const { error } = await supabase.from('bundles').update({ discount_id: discountId }).eq('id', bundleId);
        if (error) throw error;
    } catch (error: unknown) {
        if (error instanceof Error) return { error: error.message };
        return { error: 'An unexpected error occurred.' };
    }
    revalidatePath('/admin/products/bundles');
    return { success: `Discount updated.` };
}


export async function bulkApplyDiscountBundlesAction(bundleIds: string[], discountId: string | null) {
    const supabase = createSupabaseActionClient();
    try {
        const { error } = await supabase.from('bundles').update({ discount_id: discountId }).in('id', bundleIds);
        if (error) throw error;
    } catch (error: unknown) {
        if (error instanceof Error) return { error: error.message };
        return { error: 'An unexpected error occurred.' };
    }
    revalidatePath('/admin/products/bundles');
    return { success: `Discount updated.` };
}

export async function bulkApplyDiscountToAllBundlesAction(discountId: string | null): Promise<{ success?: string, error?: string }> {
    const supabase = createSupabaseActionClient();
    try {
        const { error } = await supabase
            .from('bundles')
            .update({ discount_id: discountId })
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Kondisi 'where' untuk mengupdate semua baris
        if (error) throw new Error(`Database bulk update for all bundles failed: ${error.message}`);
    } catch (error: unknown) {
        if (error instanceof Error) return { error: error.message };
        return { error: 'An unexpected error occurred during bulk discount update for all bundles.' };
    }
    revalidatePath('/admin/products/bundles');
    revalidatePath('/bundles');
    return { success: 'Discount successfully applied to all bundles!' };
}