// src/app/actions/productActions.ts
'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import AdmZip from 'adm-zip';
import { Database, Json, Tables, TablesInsert, TablesUpdate } from '@/lib/database.types';
import type { ProductData } from '@/lib/dummy-data';

type FontFile = {
  style: string;
  url: string;
};
type Discount = Tables<'discounts'>;

type BundleWithDiscounts = Tables<'bundles'> & {
  discounts: Pick<Discount, 'name' | 'percentage'> | null;
};
type FontWithDiscounts = Tables<'fonts'> & {
  discounts: Pick<Discount, 'name' | 'percentage'> | null;
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

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9-]+/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

const getFileSizeInKB = (bytes: number): number => (bytes === 0 ? 0 : parseFloat((bytes / 1024).toFixed(2)));

const getFontStyle = (fileName: string): string => {
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
  const nameParts = nameWithoutExt.split(/[-_ ]+/);
  const styleKeywords: { [key: string]: string } = {
    'thin': 'Thin', 'extralight': 'ExtraLight', 'light': 'Light', 'regular': 'Regular',
    'medium': 'Medium', 'semibold': 'SemiBold', 'bold': 'Bold', 'extrabold': 'ExtraBold',
    'black': 'Black', 'italic': 'Italic', 'bolditalic': 'Bold Italic'
  };
  for (let i = nameParts.length - 1; i >= 0; i--) {
    const part = nameParts[i].toLowerCase();
    if (styleKeywords[part]) return styleKeywords[part];
  }
  return 'Regular';
};

export async function addFontAction(formData: FormData) {
  const supabase = createSupabaseActionClient();
  const name = String(formData.get('name'));
  const slug = generateSlug(name);

  const downloadableFileUrl = String(formData.get('downloadable_file_url'));
  const uploadedFontPreviewPaths: string[] = [];

  try {
    const category = String(formData.get('category')) || null;
    const partnerId = String(formData.get('partner_id')) || null;
    const tags = String(formData.get('tags')).split(',').map(tag => tag.trim()).filter(Boolean);
    const purpose_tags = String(formData.get('purpose_tags')).split(',').map(tag => tag.trim()).filter(Boolean);
    const price = Number(formData.get('price'));
    const main_description = String(formData.get('main_description')) || null;
    const glyphs_json = JSON.parse(String(formData.get('glyphs_json') || '[]'));
    const preview_image_urls = formData.getAll('preview_image_urls').map(String);

    if (!downloadableFileUrl) throw new Error('Font ZIP path is missing.');

    if (preview_image_urls.length > 20) {
        throw new Error('A maximum of 20 preview images is allowed.');
    }

    if (!name) throw new Error('Font name is required.');
    if (isNaN(price)) throw new Error('Price must be a valid number.');

    const { data: zipBlob, error: downloadError } = await supabase.storage
        .from('products')
        .download(downloadableFileUrl);

    if (downloadError) throw new Error(`Failed to download ZIP from storage: ${downloadError.message}`);

    const zipBuffer = Buffer.from(await zipBlob.arrayBuffer());
    const zip = new AdmZip(zipBuffer);
    const zipEntries = zip.getEntries();
    const fontFilesForTypetester: FontFile[] = [];
    const fileTypes = new Set<string>();

    for (const entry of zipEntries) {
      const isFontFile = !entry.isDirectory && /\.(otf|ttf|woff|woff2)$/i.test(entry.name);
      if (isFontFile) {
        const fileExt = entry.name.split('.').pop()!.toLowerCase();
        fileTypes.add(fileExt.toUpperCase());

        if (fileExt === 'otf') {
          const fontBuffer = entry.getData();
          const styleName = getFontStyle(entry.name);

          const fontPreviewPath = `${slug}/styles/${entry.name}`;
          const { error: fontUploadError } = await supabase.storage
              .from('font-previews')
              .upload(fontPreviewPath, fontBuffer, { upsert: true, cacheControl: '31536000' });

          if (fontUploadError) throw new Error(`Failed to upload ${entry.name} for preview: ${fontUploadError.message}`);

          uploadedFontPreviewPaths.push(fontPreviewPath);

          const { data: { publicUrl } } = supabase.storage.from('font-previews').getPublicUrl(fontPreviewPath);
          fontFilesForTypetester.push({ style: styleName, url: publicUrl });
        }
      }
    }

    if (fontFilesForTypetester.length === 0) {
        throw new Error('No .otf font files found in the ZIP archive for Typetester. Please include at least one .otf file.');
    }

    const fontDataToInsert: TablesInsert<'fonts'> = {
      name, slug, category, tags, price, main_description,
      partner_id: partnerId === 'null' ? null : partnerId,
      purpose_tags,
      preview_image_urls,
      font_files: fontFilesForTypetester as Json,
      glyphs_json,
      download_zip_path: downloadableFileUrl,
      staff_pick: false,
      file_size_kb: getFileSizeInKB(zipBlob.size),
      file_types: Array.from(fileTypes),
    };

    const { error: insertError } = await supabase.from('fonts').insert(fontDataToInsert);
    if (insertError) throw new Error(`Database insert failed: ${insertError.message}`);

  } catch (error: unknown) {
    if (uploadedFontPreviewPaths.length > 0) {
        await supabase.storage.from('font-previews').remove(uploadedFontPreviewPaths);
    }
    if (downloadableFileUrl) {
        await supabase.storage.from('products').remove([downloadableFileUrl]);
    }
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unexpected error occurred during font creation.' };
  }

  revalidatePath('/admin/products/fonts');
  revalidatePath('/fonts');
  redirect('/admin/products/fonts');
}


export async function getAllProductsForMarqueeAction({
  productType,
}: {
  productType: 'font' | 'bundle';
}) {
  const supabase = createSupabaseActionClient();

  try {
    if (productType === 'bundle') {
      const { data, error } = await supabase
        .from('bundles')
        .select('*, discounts ( name, percentage )')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        products: ((data as BundleWithDiscounts[]) || []).map(bundle => {
          const discountInfo = bundle.discounts;
          const originalPrice = bundle.price ?? 0;
          let finalPrice = originalPrice;
          let discountString: string | undefined = undefined;

          if (discountInfo && discountInfo.percentage > 0) {
              finalPrice = originalPrice - (originalPrice * discountInfo.percentage / 100);
              discountString = `${discountInfo.percentage}% OFF`;
          }

          return {
            id: bundle.id, name: bundle.name, slug: bundle.slug,
            imageUrl: bundle.preview_image_urls?.[0] ?? '/images/dummy/placeholder.jpg',
            price: finalPrice,
            originalPrice: discountInfo ? originalPrice : undefined,
            description: 'Bundle', type: 'bundle' as const,
            discount: discountString,
            staffPick: bundle.staff_pick ?? false,
          };
        }),
      };
    } else { // 'font'
      const { data, error } = await supabase
        .from('fonts')
        .select('*, discounts ( name, percentage )')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        products: ((data as FontWithDiscounts[]) || []).map(font => {
          const discountInfo = font.discounts;
          const originalPrice = font.price ?? 0;
          let finalPrice = originalPrice;
          let discountString: string | undefined = undefined;

          if (discountInfo && discountInfo.percentage > 0) {
              finalPrice = originalPrice - (originalPrice * discountInfo.percentage / 100);
              discountString = `${discountInfo.percentage}% OFF`;
          }

          return {
            id: font.id, name: font.name, slug: font.slug,
            imageUrl: font.preview_image_urls?.[0] ?? '/images/dummy/placeholder.jpg',
            price: finalPrice,
            originalPrice: discountInfo ? originalPrice : undefined,
            description: font.category ?? 'Font', type: 'font' as const,
            discount: discountString,
            staffPick: font.staff_pick ?? false,
          };
        }),
      };
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { error: message, products: [] };
  }
}


export async function getAllFontsForMarqueeAction() {
    const supabase = createSupabaseActionClient();
    try {
        const { data: fonts, error } = await supabase
            .from('fonts')
            .select('*, discounts ( name, percentage )')
            .eq('staff_pick', true)
            .order('created_at', { ascending: false })
            .limit(30);

        if (error) throw error;

        const formattedFonts: ProductData[] = ((fonts as FontWithDiscounts[]) || []).map(font => {
            const discountInfo = font.discounts;
            const originalPrice = font.price ?? 0;
            let finalPrice = originalPrice;
            let discountString: string | undefined = undefined;

            if (discountInfo && discountInfo.percentage > 0) {
                finalPrice = originalPrice - (originalPrice * discountInfo.percentage / 100);
                discountString = `${discountInfo.percentage}% OFF`;
            }

            return {
                id: font.id,
                name: font.name,
                slug: font.slug,
                imageUrl: font.preview_image_urls?.[0] ?? '/images/dummy/placeholder.jpg',
                price: finalPrice,
                originalPrice: discountInfo ? originalPrice : undefined,
                description: font.category ?? 'Font',
                type: 'font',
                discount: discountString,
                staffPick: font.staff_pick ?? false,
            };
        });

        return { products: formattedFonts };

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: message, products: [] };
    }
}


export async function getAllFontsForPairingAction() {
    const supabase = createSupabaseActionClient();
    try {
        const { data, error } = await supabase
            .from('fonts')
            .select('id, name, slug, font_files')
            .order('name', { ascending: true });
        if (error) throw error;
        return { fonts: data };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: message, fonts: [] };
    }
}

export async function getMegaMenuProductsAction() {
  const supabase = createSupabaseActionClient();
  try {
    const [latestFontsRes, latestBundlesRes] = await Promise.all([
      supabase
        .from('fonts')
        .select('id, name, slug, preview_image_urls, price, category, staff_pick, discounts ( name, percentage )')
        .order('created_at', { ascending: false })
        .limit(2),
      supabase
        .from('bundles')
        .select('id, name, slug, preview_image_urls, price, staff_pick, discounts ( name, percentage )')
        .order('created_at', { ascending: false })
        .limit(2),
    ]);

    if (latestFontsRes.error) throw latestFontsRes.error;
    if (latestBundlesRes.error) throw latestBundlesRes.error;

    // --- PERBAIKAN DI SINI ---
    const formatProduct = (product: any, type: 'font' | 'bundle'): ProductData & { category: string } => {
        const discountInfo = product.discounts;
        const originalPrice = product.price ?? 0;
        let finalPrice = originalPrice;
        let discountString: string | undefined = undefined;

        if (discountInfo && discountInfo.percentage > 0) {
            finalPrice = originalPrice - (originalPrice * discountInfo.percentage / 100);
            discountString = `${discountInfo.percentage}% OFF`;
        }
        const description = type === 'font' ? (product.category ?? 'Font') : 'Styles: Various';

        return {
          id: product.id,
          name: product.name,
          slug: product.slug,
          imageUrl: product.preview_image_urls?.[0] ?? '/images/dummy/placeholder.jpg',
          price: finalPrice,
          originalPrice: discountInfo ? originalPrice : undefined,
          description: description,
          // --- PERBAIKAN TIPE ERROR ---
          // Ganti 'undefined' menjadi string 'Bundle'
          category: type === 'font' ? (product.category ?? 'Font') : 'Bundle',
          type: type,
          discount: discountString,
          staffPick: product.staff_pick ?? false,
        };
    };
    // --- AKHIR PERBAIKAN ---

    const latestFonts = ((latestFontsRes.data as FontWithDiscounts[]) || []).map(f => formatProduct(f, 'font'));
    const latestBundles = ((latestBundlesRes.data as BundleWithDiscounts[]) || []).map(b => formatProduct(b, 'bundle'));

    return { latestFonts, latestBundles };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    console.error("Mega Menu Action Error:", message);
    return { error: message, latestFonts: [], latestBundles: [] };
  }
}
export async function getRecommendedProductsAction({
  productType,
  currentProductId,
}: {
  productType: 'font' | 'bundle';
  currentProductId?: string;
}) {
  const supabase = createSupabaseActionClient();
  const limit = 30;

  try {
    if (productType === 'bundle') {
      let query = supabase
        .from('bundles')
        .select('*')
        .eq('staff_pick', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (currentProductId) {
        query = query.neq('id', currentProductId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return {
        products: (data || []).map(bundle => ({
          id: bundle.id,
          name: bundle.name,
          slug: bundle.slug,
          imageUrl: bundle.preview_image_urls?.[0] ?? '/images/dummy/placeholder.jpg',
          price: bundle.price ?? 0,
          description: 'Bundle',
          type: 'bundle' as const,
          staffPick: bundle.staff_pick ?? false,
        })),
      };
    } else { // 'font'
      let query = supabase
        .from('fonts')
        .select('*')
        .eq('staff_pick', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (currentProductId) {
        query = query.neq('id', currentProductId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return {
        products: (data || []).map(font => ({
          id: font.id,
          name: font.name,
          slug: font.slug,
          imageUrl: font.preview_image_urls?.[0] ?? '/images/dummy/placeholder.jpg',
          price: font.price ?? 0,
          description: font.category ?? 'Font',
          type: 'font' as const,
          staffPick: font.staff_pick ?? false,
        })),
      };
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { error: message, products: [] };
  }
}

export async function getStaffPickFontsForMarqueeAction(currentProductId?: string) {
    const supabase = createSupabaseActionClient();
    const limit = 30;

    try {
        let query = supabase
            .from('fonts')
            .select('*, discounts(name, percentage)')
            .eq('staff_pick', true)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (currentProductId) {
            query = query.neq('id', currentProductId);
        }

        const { data, error } = await query;
        if (error) throw error;

        const formattedFonts: ProductData[] = ((data as FontWithDiscounts[]) || []).map(font => {
            const discountInfo = font.discounts;
            const originalPrice = font.price ?? 0;
            let finalPrice = originalPrice;
            let discountString: string | undefined = undefined;

            if (discountInfo && discountInfo.percentage > 0) {
                finalPrice = originalPrice - (originalPrice * discountInfo.percentage / 100);
                discountString = `${discountInfo.percentage}% OFF`;
            }

            return {
                id: font.id,
                name: font.name,
                slug: font.slug,
                imageUrl: font.preview_image_urls?.[0] ?? '/images/dummy/placeholder.jpg',
                price: finalPrice,
                originalPrice: discountInfo ? originalPrice : undefined,
                description: font.category ?? 'Font',
                type: 'font' as const,
                discount: discountString,
                staffPick: font.staff_pick ?? false,
            };
        });

        return { products: formattedFonts };

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: message, products: [] };
    }
}

export async function updateFontInTableAction(fontId: string, updates: { price?: number; category?: string }) {
    const supabase = createSupabaseActionClient();
    try {
        const { error } = await supabase.from('fonts').update(updates).eq('id', fontId);
        if (error) throw new Error(`Database update failed: ${error.message}`);
    } catch (error: unknown) {
        if (error instanceof Error) return { error: error.message };
        return { error: 'An unexpected error occurred.' };
    }
    revalidatePath('/admin/products/fonts');
    return { success: 'Font updated successfully!' };
}

export async function updateFontAction(fontId: string, formData: FormData) {
  const supabase = createSupabaseActionClient();
  const slug = String(formData.get('slug'));
  const partnerId = String(formData.get('partner_id')) || null;

  // Data file baru (jika ada)
  const newDownloadableFileUrl = formData.get('downloadable_file_url') as string | null;
  // Data file lama (untuk dihapus)
  const existingDownloadZipPath = formData.get('existing_download_zip_path') as string | null;
  const existingFontFiles: FontFile[] = JSON.parse(formData.get('existing_font_files_json') as string || '[]');

  const uploadedFontPreviewPaths: string[] = []; // Untuk cleanup jika gagal
  const filesToDeleteFromProducts: string[] = [];
  const filesToDeleteFromPreviews: string[] = [];

  try {
    const fontDataToUpdate: TablesUpdate<'fonts'> = {
      name: String(formData.get('name')),
      slug: slug,
      price: Number(formData.get('price')),
      main_description: String(formData.get('main_description')),
      category: String(formData.get('category')),
      partner_id: partnerId === 'null' ? null : partnerId,
      tags: String(formData.get('tags')).split(',').map(tag => tag.trim()).filter(Boolean),
      purpose_tags: String(formData.get('purpose_tags')).split(',').map(tag => tag.trim()).filter(Boolean),
      preview_image_urls: formData.getAll('preview_image_urls').map(String),
    };

    // --- LOGIKA PEMBARUAN FILE ---
    if (newDownloadableFileUrl) {
        fontDataToUpdate.download_zip_path = newDownloadableFileUrl;
        fontDataToUpdate.glyphs_json = JSON.parse(String(formData.get('glyphs_json') || '[]'));

        // Unduh dan proses ZIP baru (seperti di addFontAction)
        const { data: zipBlob, error: downloadError } = await supabase.storage
            .from('products')
            .download(newDownloadableFileUrl);
        if (downloadError) throw new Error(`Failed to download new ZIP: ${downloadError.message}`);

        const zipBuffer = Buffer.from(await zipBlob.arrayBuffer());
        const zip = new AdmZip(zipBuffer);
        const zipEntries = zip.getEntries();
        const fontFilesForTypetester: FontFile[] = [];
        const fileTypes = new Set<string>();

        for (const entry of zipEntries) {
            const isFontFile = !entry.isDirectory && /\.(otf|ttf|woff|woff2)$/i.test(entry.name);
            if (isFontFile) {
                const fileExt = entry.name.split('.').pop()!.toLowerCase();
                fileTypes.add(fileExt.toUpperCase());

                if (fileExt === 'otf') {
                    const fontBuffer = entry.getData();
                    const styleName = getFontStyle(entry.name);
                    const fontPreviewPath = `${slug}/styles/${entry.name}`;
                    
                    const { error: fontUploadError } = await supabase.storage
                        .from('font-previews')
                        .upload(fontPreviewPath, fontBuffer, { upsert: true, cacheControl: '31536000' });
                    if (fontUploadError) throw new Error(`Failed to upload ${entry.name} for preview: ${fontUploadError.message}`);

                    uploadedFontPreviewPaths.push(fontPreviewPath); // Lacak file baru
                    const { data: { publicUrl } } = supabase.storage.from('font-previews').getPublicUrl(fontPreviewPath);
                    fontFilesForTypetester.push({ style: styleName, url: publicUrl });
                }
            }
        }

        if (fontFilesForTypetester.length === 0) {
            throw new Error('No .otf font files found in the new ZIP. Update failed.');
        }

        // Tambahkan data file baru ke update
        fontDataToUpdate.font_files = fontFilesForTypetester as Json;
        fontDataToUpdate.file_size_kb = getFileSizeInKB(zipBlob.size);
        fontDataToUpdate.file_types = Array.from(fileTypes);

        // Tandai file lama untuk dihapus
        if (existingDownloadZipPath) {
            filesToDeleteFromProducts.push(existingDownloadZipPath);
        }
        if (existingFontFiles.length > 0) {
            const oldPreviewPaths = existingFontFiles
                .map(f => {
                    try { return new URL(f.url).pathname.split('/font-previews/')[1]; } 
                    catch { return null; }
                })
                .filter((p): p is string => p !== null);
            filesToDeleteFromPreviews.push(...oldPreviewPaths);
        }
    }
    // --- AKHIR LOGIKA PEMBARUAN FILE ---

    const { error } = await supabase
      .from('fonts')
      .update(fontDataToUpdate)
      .eq('id', fontId);

    if (error) {
      throw new Error(`Database update failed: ${error.message}`);
    }

    // --- HAPUS FILE LAMA SETELAH DB SUKSES ---
    if (filesToDeleteFromProducts.length > 0) {
        await supabase.storage.from('products').remove(filesToDeleteFromProducts);
    }
    if (filesToDeleteFromPreviews.length > 0) {
        await supabase.storage.from('font-previews').remove(filesToDeleteFromPreviews);
    }
    // --- AKHIR PENGHAPUSAN ---

  } catch (error: unknown) {
    // --- CLEANUP JIKA GAGAL ---
    // Jika update gagal, hapus file baru yang mungkin sudah terupload
    if (newDownloadableFileUrl) {
        await supabase.storage.from('products').remove([newDownloadableFileUrl]);
    }
    if (uploadedFontPreviewPaths.length > 0) {
        await supabase.storage.from('font-previews').remove(uploadedFontPreviewPaths);
    }
    // --- AKHIR CLEANUP ---

    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unexpected error occurred during font update.' };
  }

  revalidatePath('/admin/products/fonts');
  revalidatePath(`/fonts/${slug}`);
  revalidatePath(`/admin/products/fonts/${fontId}/edit`);
  // Tidak perlu redirect di sini, biarkan UI client yang menangani
}

export async function deleteFontAction(fontId: string) {
    const supabase = createSupabaseActionClient();

    try {
        const { data: font, error: fetchError } = await supabase
            .from('fonts')
            .select('slug, download_zip_path, preview_image_urls, font_files')
            .eq('id', fontId)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') throw new Error(`Failed to fetch font data: ${fetchError.message}`);
        if (!font) {
          console.warn(`Font with ID ${fontId} not found for deletion.`);
          return { success: 'Font already deleted or not found.' }; // Anggap sukses jika tidak ditemukan
        }


        const filesToRemoveFromProducts: string[] = [];
        const filesToRemoveFromPreviews: string[] = [];

        if(font.preview_image_urls) {
            const imagePaths = font.preview_image_urls.map(url => {
                try {
                    const urlObject = new URL(url);
                    // Ambil path setelah '/products/'
                    const parts = urlObject.pathname.split('/products/');
                    if (parts.length > 1) return parts[1];
                    return null;
                } catch { return null; }
            }).filter((p): p is string => p !== null);
            filesToRemoveFromProducts.push(...imagePaths);
        }

        if (font.download_zip_path) filesToRemoveFromProducts.push(font.download_zip_path);

        if (font.font_files && Array.isArray(font.font_files)) {
            const typedFontFiles = font.font_files as FontFile[];
            const fontPreviewPaths = typedFontFiles.map(f => {
                try {
                    const urlObject = new URL(f.url);
                    // Ambil path setelah '/font-previews/'
                     const parts = urlObject.pathname.split('/font-previews/');
                     if (parts.length > 1) return parts[1];
                     return null;
                } catch { return null; }
            }).filter((p): p is string => p !== null);
            filesToRemoveFromPreviews.push(...fontPreviewPaths);
        }

        // Hapus file dari storage (jangan throw error jika gagal, log saja)
        if (filesToRemoveFromProducts.length > 0) {
            const { error: productStorageError } = await supabase.storage.from('products').remove(filesToRemoveFromProducts);
            if(productStorageError) console.warn("Error removing product files from storage:", productStorageError.message);
        }
        if (filesToRemoveFromPreviews.length > 0) {
            const { error: previewStorageError } = await supabase.storage.from('font-previews').remove(filesToRemoveFromPreviews);
            if(previewStorageError) console.warn("Error removing font preview files from storage:", previewStorageError.message);
        }

        // Hapus data dari database
        const { error: deleteError } = await supabase.from('fonts').delete().eq('id', fontId);
        if (deleteError) throw new Error(`Failed to delete font from database: ${deleteError.message}`);

    } catch (error: unknown) {
        if (error instanceof Error) return { error: error.message };
        return { error: 'An unexpected error occurred during deletion.' };
    }

    revalidatePath('/admin/products/fonts');
    revalidatePath('/fonts');
    return { success: 'Font deleted successfully!' };
}


export async function bulkDeleteFontsAction(fontIds: string[]) {
  const supabase = createSupabaseActionClient();
  let deletedCount = 0;
  const errors: string[] = [];

  try {
    const { data: fonts, error: fetchError } = await supabase
      .from('fonts')
      .select('id, slug, download_zip_path, preview_image_urls, font_files') // Ambil ID juga
      .in('id', fontIds);

    if (fetchError) throw new Error(`Failed to fetch fonts for deletion: ${fetchError.message}`);
    if (!fonts || fonts.length === 0) return { success: 'No matching fonts found to delete.' };

    const existingFontIds = fonts.map(f => f.id); // ID font yang benar-benar ada

    const filesToRemoveFromProducts: string[] = [];
    const filesToRemoveFromPreviews: string[] = [];

    fonts.forEach(font => {
      if (font.download_zip_path) filesToRemoveFromProducts.push(font.download_zip_path);
      if (font.preview_image_urls) {
         const imagePaths = font.preview_image_urls.map(url => {
                try {
                    const urlObject = new URL(url);
                    const parts = urlObject.pathname.split('/products/');
                    if (parts.length > 1) return parts[1];
                    return null;
                } catch { return null; }
            }).filter((p): p is string => p !== null);
         filesToRemoveFromProducts.push(...imagePaths);
      }
      if (font.font_files && Array.isArray(font.font_files)) {
         const fontFilePaths = (font.font_files as FontFile[]).map(f => {
                try {
                    const urlObject = new URL(f.url);
                    const parts = urlObject.pathname.split('/font-previews/');
                    if (parts.length > 1) return parts[1];
                    return null;
                } catch { return null; }
            }).filter((p): p is string => p !== null);
         filesToRemoveFromPreviews.push(...fontFilePaths);
      }
    });

     // Hapus file dari storage (jangan throw error jika gagal, log saja)
    if (filesToRemoveFromProducts.length > 0) {
        const { error: productStorageError } = await supabase.storage.from('products').remove(filesToRemoveFromProducts);
        if(productStorageError) errors.push(`Storage (products): ${productStorageError.message}`);
    }
    if (filesToRemoveFromPreviews.length > 0) {
        const { error: previewStorageError } = await supabase.storage.from('font-previews').remove(filesToRemoveFromPreviews);
        if(previewStorageError) errors.push(`Storage (previews): ${previewStorageError.message}`);
    }

    // Hapus data dari database
    const { error: deleteError } = await supabase.from('fonts').delete().in('id', existingFontIds);
    if (deleteError) {
        throw new Error(`Database bulk delete failed: ${deleteError.message}`);
    } else {
        deletedCount = existingFontIds.length;
    }

  } catch (error: unknown) {
      if (error instanceof Error) errors.push(error.message);
      else errors.push('An unexpected error occurred during bulk deletion.');
  }

  revalidatePath('/admin/products/fonts');
  revalidatePath('/fonts'); // Revalidate halaman publik juga

  if (errors.length > 0) {
    return { error: `Bulk delete partially failed. ${deletedCount} deleted. Errors: ${errors.join(', ')}` };
  }
  return { success: `${deletedCount} fonts deleted successfully!` };
}


export async function updateFontStaffPickAction(fontId: string, isStaffPick: boolean) {
  const supabase = createSupabaseActionClient();
  try {
    const { error } = await supabase.from('fonts').update({ staff_pick: isStaffPick }).eq('id', fontId);
    if (error) throw new Error(`Database update for Staff Picks failed: ${error.message}`);
  } catch (error: unknown) {
    if (error instanceof Error) return { error: error.message };
    return { error: 'An unexpected error occurred.' };
  }
  revalidatePath('/admin/products/fonts');
  return { success: `Staff Pick status updated!` };
}

export async function bulkApplyStaffPicksAction(fontIds: string[], isStaffPick: boolean) {
  const supabase = createSupabaseActionClient();
  try {
    const { error } = await supabase.from('fonts').update({ staff_pick: isStaffPick }).in('id', fontIds);
    if (error) throw new Error(`Database bulk update for Staff Picks failed: ${error.message}`);
  } catch (error: unknown) {
    if (error instanceof Error) return { error: error.message };
    return { error: 'An unexpected error occurred.' };
  }
  revalidatePath('/admin/products/fonts');
  return { success: `Staff Pick status updated for ${fontIds.length} fonts!` };
}

export async function getDiscountsAction(): Promise<{ discounts?: Discount[], error?: string }> {
    const supabase = createSupabaseActionClient();
    const { data, error } = await supabase.from('discounts').select('*').order('created_at', { ascending: false });
    if (error) return { error: error.message };
    return { discounts: data };
}

export async function createDiscountAction(name: string, percentage: number): Promise<{ success?: boolean, error?: string }> {
    const supabase = createSupabaseActionClient();
    const { error } = await supabase.from('discounts').insert({ name, percentage });
    if (error) return { error: error.message };
    revalidatePath('/admin/products/fonts');
    revalidatePath('/admin/products/bundles'); // Revalidate bundles juga
    return { success: true };
}

export async function deleteDiscountAction(discountId: string): Promise<{ success?: boolean, error?: string }> {
    const supabase = createSupabaseActionClient();
    const { error } = await supabase.from('discounts').delete().eq('id', discountId);
    if (error) return { error: error.message };
    revalidatePath('/admin/products/fonts');
    revalidatePath('/admin/products/bundles'); // Revalidate bundles juga
    return { success: true };
}

export async function updateFontDiscountAction(fontId: string, discountId: string | null): Promise<{ success?: boolean, error?: string }> {
    const supabase = createSupabaseActionClient();
    const { error } = await supabase.from('fonts').update({ discount_id: discountId }).eq('id', fontId);
    if (error) return { error: error.message };
    revalidatePath('/admin/products/fonts');
    return { success: true };
}

export async function bulkApplyDiscountAction(fontIds: string[], discountId: string | null): Promise<{ success?: boolean, error?: string }> {
    const supabase = createSupabaseActionClient();
    const { error } = await supabase.from('fonts').update({ discount_id: discountId }).in('id', fontIds);
    if (error) return { error: error.message };
    revalidatePath('/admin/products/fonts');
    return { success: true };
}

export async function bulkApplyDiscountToAllFontsAction(discountId: string | null): Promise<{ success?: string, error?: string }> {
    const supabase = createSupabaseActionClient();
    try {
        const { error } = await supabase
            .from('fonts')
            .update({ discount_id: discountId })
            // Menggunakan neq untuk memastikan ada kondisi where (lebih aman)
            .neq('id', '00000000-0000-0000-0000-000000000000');
        if (error) throw new Error(`Database bulk update for all fonts failed: ${error.message}`);
    } catch (error: unknown) {
        if (error instanceof Error) return { error: error.message };
        return { error: 'An unexpected error occurred during bulk discount update for all fonts.' };
    }
    revalidatePath('/admin/products/fonts');
    revalidatePath('/fonts');
    return { success: 'Discount successfully applied to all fonts!' };
}

export async function searchProductsByNameAction(query: string) {
    const supabase = createSupabaseActionClient();
    if (!query) {
        return { products: [] };
    }

    try {
        const [fontsRes, bundlesRes] = await Promise.all([
            supabase.from('fonts').select('id, name, slug, preview_image_urls, price, category').ilike('name', `%${query}%`).limit(4),
            supabase.from('bundles').select('id, name, slug, preview_image_urls, price').ilike('name', `%${query}%`).limit(2)
        ]);

        if (fontsRes.error) throw fontsRes.error;
        if (bundlesRes.error) throw bundlesRes.error;

        const fonts = (fontsRes.data || []).map(f => ({
            id: f.id,
            name: f.name,
            slug: f.slug,
            imageUrl: f.preview_image_urls?.[0] || '/images/dummy/placeholder.jpg', // Default image
            price: f.price,
            description: f.category || 'Font', // Gunakan category sbg description
            // --- PERBAIKAN DI SINI ---
            category: f.category || 'Font', // Tambahkan properti category
            type: 'font' as const
        }));

        const bundles = (bundlesRes.data || []).map(b => ({
            id: b.id,
            name: b.name,
            slug: b.slug,
            imageUrl: b.preview_image_urls?.[0] || '/images/dummy/placeholder.jpg', // Default image
            price: b.price,
            description: 'Bundle', // Description standar untuk bundle
            // --- PERBAIKAN DI SINI ---
            category: 'Bundle', // Tambahkan properti category
            type: 'bundle' as const
        }));

        // --- PERBAIKAN DI SINI ---
        // Pastikan hasil sesuai tipe ProductData & { category: string }
        const products: (ProductData & { category: string })[] = [...fonts, ...bundles];

        return { products };

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Search Action Error:", error.message);
            return { error: error.message };
        }
        return { error: 'An unexpected error occurred.' };
    }
}

export async function getSuggestionProductsAction() {
    const supabase = createSupabaseActionClient();
    try {
        const [featuredFontsRes, latestBundlesRes] = await Promise.all([
            supabase.from('fonts')
                .select('id, name, slug, preview_image_urls, price, category, staff_pick, discounts ( name, percentage )')
                .eq('staff_pick', true)
                .order('created_at', { ascending: false })
                .limit(2),
            supabase.from('bundles')
                .select('id, name, slug, preview_image_urls, price, staff_pick, discounts ( name, percentage )')
                .order('created_at', { ascending: false })
                .limit(2)
        ]);

        if (featuredFontsRes.error) throw featuredFontsRes.error;
        if (latestBundlesRes.error) throw latestBundlesRes.error;

        // --- PERBAIKAN DI SINI: MENYESUAIKAN TIPE RETURN ---
        const formatProduct = (product: any, type: 'font' | 'bundle'): ProductData & { category: string } => {
            const discountInfo = product.discounts;
            const originalPrice = product.price ?? 0;
            let finalPrice = originalPrice;
            let discountString: string | undefined = undefined;

            if (discountInfo && discountInfo.percentage > 0) {
                finalPrice = originalPrice - (originalPrice * discountInfo.percentage / 100);
                discountString = `${discountInfo.percentage}% OFF`;
            }
            const description = type === 'font' ? (product.category ?? 'Font') : 'Styles: Various';

            return {
                id: product.id,
                name: product.name,
                slug: product.slug,
                imageUrl: product.preview_image_urls?.[0] ?? '/images/dummy/placeholder.jpg',
                price: finalPrice,
                originalPrice: discountInfo ? originalPrice : undefined,
                description: description,
                // --- PERBAIKAN TIPE ERROR ---
                // Ganti 'undefined' menjadi string 'Bundle'
                category: type === 'font' ? (product.category ?? 'Font') : 'Bundle',
                type: type,
                discount: discountString,
                staffPick: product.staff_pick ?? false,
            };
        };
        // --- AKHIR PERBAIKAN ---


        const featuredFonts = ((featuredFontsRes.data as FontWithDiscounts[]) || []).map(f => formatProduct(f, 'font'));
        const latestBundles = ((latestBundlesRes.data as BundleWithDiscounts[]) || []).map(b => formatProduct(b, 'bundle'));


        return { featuredFonts, latestBundles };
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Suggestion Action Error:", error.message);
            return { error: error.message, featuredFonts: [], latestBundles: [] };
        }
        return { error: 'An unexpected error occurred.', featuredFonts: [], latestBundles: [] };
    }
}

export async function getFontCategoriesAction() {
    const supabase = createSupabaseActionClient();
    try {
        const { data, error } = await supabase
            .from('fonts')
            .select('category');

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

// --- FUNGSI BARU UNTUK MENGAMBIL SEMUA PRODUK UNTUK NEWSLETTER ---
export async function getAllProductsForNewsletterAction(): Promise<{ products: ProductData[], error?: string }> {
    const supabase = createSupabaseActionClient();
    const PRODUCTS_LIMIT = 500; // Batasi jumlah produk yang diambil (sesuaikan jika perlu)

    try {
        const [fontsRes, bundlesRes] = await Promise.all([
            supabase
                .from('fonts')
                .select('id, name, slug, preview_image_urls, price, category, staff_pick, discounts ( name, percentage )')
                .order('created_at', { ascending: false })
                .limit(PRODUCTS_LIMIT),
            supabase
                .from('bundles')
                .select('id, name, slug, preview_image_urls, price, staff_pick, discounts ( name, percentage )')
                .order('created_at', { ascending: false })
                .limit(PRODUCTS_LIMIT)
        ]);

        if (fontsRes.error) throw fontsRes.error;
        if (bundlesRes.error) throw bundlesRes.error;

        const formatProduct = (product: any, type: 'font' | 'bundle'): ProductData => {
            const discountInfo = product.discounts;
            const originalPrice = product.price ?? 0;
            let finalPrice = originalPrice;
            let discountString: string | undefined = undefined;

            if (discountInfo && discountInfo.percentage > 0) {
                finalPrice = originalPrice - (originalPrice * discountInfo.percentage / 100);
                discountString = `${discountInfo.percentage}% OFF`;
            }

            const description = type === 'font' ? (product.category ?? 'Font') : 'Bundle';

            return {
                id: product.id,
                name: product.name,
                slug: product.slug,
                imageUrl: product.preview_image_urls?.[0] ?? '/images/dummy/placeholder.jpg',
                price: finalPrice,
                originalPrice: discountInfo ? originalPrice : undefined,
                description: description,
                type: type,
                discount: discountString,
                staffPick: product.staff_pick ?? false,
            };
        };

        const allProducts = [
            ...(fontsRes.data || []).map(f => formatProduct(f, 'font')),
            ...(bundlesRes.data || []).map(b => formatProduct(b, 'bundle'))
        ];

        return { products: allProducts.slice(0, PRODUCTS_LIMIT) }; // Batasi lagi setelah digabung

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred while fetching products for newsletter.';
        console.error("Error in getAllProductsForNewsletterAction:", message);
        return { products: [], error: message };
    }
}