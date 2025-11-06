// migration_script/migrate.ts
import mysql from 'mysql2/promise';
import { createClient } from '@supabase/supabase-js';
import { Database, Json, TablesInsert } from '../src/lib/database.types';
import AdmZip from 'adm-zip';
import * as opentype from 'opentype.js';
import fetch from 'node-fetch';
import https from 'https';
import path from 'path'; 
import sharp from 'sharp'; 

// --- 1. KONFIGURASI (PASTIKAN INI SUDAH BENAR) ---

const WP_DB_CONFIG = {
  host: 'stylishtype.co',
  user: 'aysavreb_wp406',
  password: 'h8]4Sp!js6',
  database: 'aysavreb_wp406',
};

// Info Supabase 
const SUPABASE_URL = 'https://fxjazgmdfhiojmapttda.supabase.co'; 
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4amF6Z21kZmhpb2ptYXB0dGRhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTk4MzM5OCwiZXhwIjoyMDc1NTU5Mzk4fQ.b_VAdC8BAVdLcWxhP0AXZZotYcu4YtPljvfbEBAGTkg'; 

// --- 2. INISIALISASI KONEKSI ---

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9-]+/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};


// --- 3. FUNGSI UTAMA MIGRATOR ---

async function main() {
  let wpDb;
  try {
    const userIdMap = new Map<number, string>();
    const fontIdMap = new Map<number, string>();
    const bundleIdMap = new Map<number, string>();
    const licenseIdMap = new Map<string, string>();
    const partnerIdMap = new Map<number, string>();
    const fontSlugMap = new Map<string, string>();

    // 1. Koneksi
    console.log('Menghubungkan ke Database WordPress...');
    wpDb = await mysql.createConnection(WP_DB_CONFIG);
    console.log('Koneksi WordPress Berhasil!');
    console.log('Mengecek koneksi Supabase...');
    const { data: testSupabase, error: testError } = await supabase.from('profiles').select('id').limit(1);
    if (testError) throw new Error(`Koneksi Supabase Gagal: ${testError.message}`);
    console.log('Koneksi Supabase Berhasil!');

    console.log('\n--- MIGRASI DIMULAI ---');

    // 2. Menjalankan migrasi (Memberikan maps sebagai argumen)
    
    await migrateLicenses(licenseIdMap);
    
    // await migrateUsers(wpDb, userIdMap);  // <-- KITA LEWATI
    // await migratePosts(wpDb);             // <-- KITA LEWATI
    
    await migrateFonts(wpDb, fontIdMap, fontSlugMap);     
    await migrateGalleryImages(wpDb, fontIdMap, fontSlugMap); 
    
    // await migrateBundles(wpDb);   // (Langkah selanjutnya)

    console.log('\n--- MIGRASI SELESAI ---');

  } catch (error) {
    console.error('\n--- MIGRASI GAGAL TOTAL ---');
    console.error(error);
  } finally {
    if (wpDb) {
      await wpDb.end();
      console.log('Koneksi WordPress ditutup.');
    }
  }
}

// --- 4. FUNGSI HELPER ---

async function migrateLicenses(licenseIdMap: Map<string, string>) {
  console.log('\nLangkah 1: Mengambil ID Lisensi dari Supabase...');
  const { data, error } = await supabase.from('licenses').select('id, name');
  if (error) throw new Error(`Gagal mengambil lisensi dari Supabase: ${error.message}`);
  
  data.forEach(license => {
    licenseIdMap.set(license.name.toLowerCase(), license.id);
  });
  console.log(`Berhasil memetakan ${licenseIdMap.size} lisensi.`);
}

async function migrateFonts(db: mysql.Connection, fontIdMap: Map<number, string>, fontSlugMap: Map<string, string>) {
  console.log('\nLangkah 4: Memigrasikan Font (Products -> Fonts)...');

  console.log('Menjalankan kueri SQL untuk mengambil produk font dari WordPress...');
  const [productsResult] = await db.execute(
    `SELECT p.ID, p.post_title, p.post_content, p.post_excerpt, p.post_name
     FROM wpng_posts p
     LEFT JOIN wpng_term_relationships tr ON (p.ID = tr.object_id)
     LEFT JOIN wpng_term_taxonomy tt ON (tr.term_taxonomy_id = tt.term_taxonomy_id)
     LEFT JOIN wpng_terms t ON (tt.term_id = t.term_id)
     WHERE p.post_type = 'product'
       AND p.post_status = 'publish'
       AND tt.taxonomy = 'product_cat'
       AND t.name != 'font_bundle'
     GROUP BY p.ID`
  );

  if (!Array.isArray(productsResult)) {
    throw new Error('Kueri WordPress untuk font tidak mengembalikan array.');
  }
  const products: any[] = productsResult;

  console.log(`Ditemukan ${products.length} produk font di WordPress.`);

  let successCount = 0;
  for (const product of products) {
    try {
      const [meta] = await db.execute("SELECT meta_key, meta_value FROM wpng_postmeta WHERE post_id = ?", [product.ID]);
      const metaMap = (meta as any[]).reduce((acc, m) => {
        acc[m.meta_key] = m.meta_value;
        return acc;
      }, {} as any);

      const [variationMeta] = await db.execute(
          `SELECT meta_value FROM wpng_postmeta
           WHERE meta_key = '_downloadable_files'
           AND post_id IN (
               SELECT ID FROM wpng_posts WHERE post_parent = ? AND post_type = 'product_variation'
           )
           LIMIT 1`,
          [product.ID]
      );

      if (!Array.isArray(variationMeta) || variationMeta.length === 0) {
          console.warn(`-> Melewatkan "${product.post_title}": Tidak ditemukan file ZIP di variasi produk.`);
          continue;
      }

      const downloadableFilesValue = (variationMeta[0] as any).meta_value;
      const match = downloadableFilesValue.match(/s:\d+:"file";s:\d+:"(.*?)"/);
      
      if (!match || !match[1]) {
          console.warn(`-> Melewatkan "${product.post_title}": Ditemukan metadata, tapi tidak ada path file .zip.`);
          continue;
      }

      const zipFileUrl = match[1];
      
      if (!zipFileUrl.startsWith('http')) {
           console.warn(`-> Melewatkan "${product.post_title}": Path file tidak valid (${zipFileUrl}).`);
           continue;
      }

      const slug = product.post_name || generateSlug(product.post_title);

      const fileData = await processAndUploadFontZip(zipFileUrl, slug);
      
      const price = 19; // Harga statis $19
      
      const category = (await getTerm(db, product.ID, 'product_cat')) || 'Sans Serif';
      const tags = (await getTerms(db, product.ID, 'product_tag')) || [];

      const fontDataToInsert: TablesInsert<'fonts'> = {
        name: product.post_title,
        slug: slug,
        main_description: product.post_content || product.post_excerpt,
        price: price,
        category: category,
        tags: tags,
        purpose_tags: [], 
        partner_id: null, 
        preview_image_urls: [], // KOSONGKAN DULU, diisi di Langkah 5
        
        download_zip_path: fileData.downloadableFileUrl,
        font_files: fileData.fontFilesJson,
        glyphs_json: fileData.glyphsJson,
        file_size_kb: fileData.fileSizeKB,
        file_types: fileData.fileTypes,

        sales_count: parseInt(metaMap.total_sales || 0),
        staff_pick: metaMap._featured === 'yes',
      };

      const { data: insertedFont, error } = await supabase.from('fonts').insert(fontDataToInsert).select('id, slug').single();
      if (error) {
        if (error.code === '23505') { 
            console.warn(`-> Font "${product.post_title}" sudah ada (slug: ${slug}). Mengambil ID...`);
            const { data: existingFont } = await supabase.from('fonts').select('id, slug').eq('slug', slug).single();
            if (existingFont) {
                fontIdMap.set(product.ID, existingFont.id);
                fontSlugMap.set(existingFont.id, existingFont.slug);
            }
        } else {
            throw error;
        }
      } else {
        fontIdMap.set(product.ID, insertedFont.id); 
        fontSlugMap.set(insertedFont.id, insertedFont.slug); 
        successCount++;
        console.log(`-> Berhasil migrasi font: "${product.post_title}"`);
      }
      
    } catch (error: any) {
      console.error(`Gagal migrasi font "${product.post_title}":`, error.message);
    }
  }
  console.log(`Langkah 4 Selesai: ${successCount} font baru berhasil dimigrasi.`);
}

async function migrateGalleryImages(db: mysql.Connection, fontIdMap: Map<number, string>, fontSlugMap: Map<string, string>) {
  console.log('\nLangkah 5: Memperbarui Font dengan Gambar Galeri (dan konversi ke WebP)...');

  let successCount = 0;
  for (const [wpProductId, supabaseFontId] of fontIdMap.entries()) {
    try {
      const fontSlug = fontSlugMap.get(supabaseFontId);
      if (!fontSlug) {
          console.warn(`-> Melewatkan galeri untuk WP ID ${wpProductId}: Slug tidak ditemukan.`);
          continue;
      }
      
      // Memanggil fungsi getGalleryImageUrls yang SUDAH DIPERBAIKI
      const imageUrls = await getGalleryImageUrls(db, wpProductId);
      
      if (imageUrls.length > 0) {
        console.log(`   ... Memproses ${imageUrls.length} gambar untuk font ${fontSlug}...`);
        
        const newSupabaseUrls: string[] = [];
        await Promise.all(imageUrls.map(async (imageUrl) => {
          const newUrl = await downloadAndUploadImage(imageUrl, fontSlug);
          newSupabaseUrls.push(newUrl);
        }));

        // Mengurutkan URL berdasarkan nama file (untuk menjaga urutan -01, -02, -03)
        // Ini PENTING agar gambar 01 tetap di depan
        newSupabaseUrls.sort();

        const { error } = await supabase
          .from('fonts')
          .update({ preview_image_urls: newSupabaseUrls })
          .eq('id', supabaseFontId);
          
        if (error) {
          throw new Error(`Gagal update galeri untuk Supabase ID ${supabaseFontId}: ${error.message}`);
        }
        successCount++;
      }
    } catch (error: any) {
      console.error(`Gagal migrasi galeri untuk WP ID ${wpProductId}:`, error.message);
    }
  }
  console.log(`Langkah 5 Selesai: ${successCount} font berhasil diperbarui dengan gambar galeri.`);
}


async function getTerm(db: mysql.Connection, postId: number, taxonomy: string): Promise<string | null> {
    const [terms] = await db.execute(
        `SELECT t.name FROM wpng_terms t
         INNER JOIN wpng_term_taxonomy tt ON t.term_id = tt.term_id
         INNER JOIN wpng_term_relationships tr ON tt.term_taxonomy_id = tr.term_taxonomy_id
         WHERE tt.taxonomy = ? AND tr.object_id = ?
         LIMIT 1`,
        [taxonomy, postId]
    );
    return (terms as any[]).length > 0 ? (terms as any[])[0].name : null;
}

async function getTerms(db: mysql.Connection, postId: number, taxonomy: string): Promise<string[]> {
    const [tags] = await db.execute(
        `SELECT t.name FROM wpng_terms t
         INNER JOIN wpng_term_taxonomy tt ON t.term_id = tt.term_id
         INNER JOIN wpng_term_relationships tr ON tt.term_taxonomy_id = tr.term_taxonomy_id
         WHERE tt.taxonomy = ? AND tr.object_id = ?`,
        [taxonomy, postId]
    );
    return (tags as any[]).map(t => t.name);
}


// ====================================================================
// === FUNGSI YANG DIPERBAIKI ADA DI BAWAH INI ===
// ====================================================================

/**
 * HELPER: Mengambil URL gambar, SEKARANG TERMASUK THUMBNAIL (Gambar 01)
 */
async function getGalleryImageUrls(db: mysql.Connection, productId: number): Promise<string[]> {
    
    // 1. Ambil meta data untuk galeri ('_product_image_gallery') DAN thumbnail ('_thumbnail_id')
    const [metaRows] = await db.execute(
        "SELECT meta_key, meta_value FROM wpng_postmeta WHERE post_id = ? AND meta_key IN ('_product_image_gallery', '_thumbnail_id')",
        [productId]
    );

    if (!Array.isArray(metaRows) || metaRows.length === 0) {
        return []; 
    }

    let thumbnailId: string | null = null;
    let galleryIds: string[] = [];

    // 2. Petakan hasil kueri ke variabel
    for (const row of (metaRows as any[])) {
        if (row.meta_key === '_thumbnail_id' && row.meta_value) {
            thumbnailId = row.meta_value;
        }
        if (row.meta_key === '_product_image_gallery' && row.meta_value) {
            galleryIds = row.meta_value.split(',').filter(Boolean);
        }
    }

    // 3. Gabungkan ID, pastikan thumbnailId ada di urutan pertama
    const allImageIds = [...(thumbnailId ? [thumbnailId] : []), ...galleryIds];

    if (allImageIds.length === 0) {
        return [];
    }
    
    const placeholders = allImageIds.map(() => '?').join(',');
    
    // 4. Ambil path file untuk SEMUA ID yang digabungkan
    const [imageRows] = await db.execute(
        `SELECT post_id, meta_value FROM wpng_postmeta 
         WHERE meta_key = '_wp_attached_file' AND post_id IN (${placeholders})`,
        allImageIds
    );

    if (!Array.isArray(imageRows) || imageRows.length === 0) {
        return [];
    }

    // 5. Buat Map dari ID -> Path
    const pathMap = new Map((imageRows as any[]).map(row => [row.post_id.toString(), row.meta_value]));

    // 6. Kembalikan URL dalam urutan yang benar sesuai `allImageIds`
    return allImageIds.map((id: string) => {
        const imagePath = pathMap.get(id);
        if (!imagePath) return null; // Gambar mungkin telah dihapus
        const cleanPath = imagePath.replace(/^(https?:)?\/\/[^\/]+\//, '');
        return `https://stylishtype.co/wp-content/uploads/` + cleanPath; 
    }).filter((url: string | null): url is string => !!url); // Filter null
}

// ====================================================================
// === AKHIR DARI FUNGSI YANG DIPERBAIKI ===
// ====================================================================


/**
 * HELPER: Mengunduh gambar, KONVERSI KE WEBP, dan mengunggahnya ke Supabase
 */
async function downloadAndUploadImage(imageUrl: string, fontSlug: string): Promise<string> {
    const agent = new https.Agent({ rejectUnauthorized: false });
    const fetchOptions = {
      agent,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36' }
    };

    let imageBuffer: Buffer; 
    try {
        // @ts-ignore
        const response = await fetch(imageUrl, fetchOptions);
        if (!response.ok) {
            const decodedUrl = decodeURI(imageUrl);
            // @ts-ignore
            const response2 = await fetch(decodedUrl, fetchOptions);
            if(!response2.ok) {
                throw new Error(`Gagal mengunduh gambar ${imageUrl}: ${response.statusText}`);
            }
            // @ts-ignore
            imageBuffer = Buffer.from(await response2.arrayBuffer());
        } else {
            imageBuffer = Buffer.from(await (response as any).arrayBuffer());
        }
    } catch (error) {
        throw new Error(`Error saat mengunduh gambar ${imageUrl}: ${(error as Error).message}`);
    }

    const originalFileName = path.basename(imageUrl);
    const baseNameWithoutExt = path.basename(originalFileName, path.extname(originalFileName));
    
    const newFileName = `${baseNameWithoutExt.replace(/[^a-zA-Z0-9-.]/g, '-').replace(/--+/g, '-')}.webp`;
    
    console.log(`   ... Mengonversi ${originalFileName} ke WebP...`);
    let webpBuffer: Buffer;
    try {
        webpBuffer = await sharp(imageBuffer)
            .webp({ quality: 80 }) 
            .toBuffer();
    } catch (error) {
        throw new Error(`Gagal mengonversi gambar ${originalFileName} ke WebP: ${(error as Error).message}`);
    }

    const supabasePath = `public/fonts/previews/${fontSlug}/${newFileName}`; 

    const { data, error } = await supabase.storage
        .from('products') 
        .upload(supabasePath, webpBuffer, { 
            cacheControl: '31536000',
            contentType: 'image/webp', 
            upsert: true 
        });
    
    if (error) {
        throw new Error(`Gagal unggah gambar ${newFileName} ke Supabase: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(data.path);
    return publicUrl;
}


/**
 * HELPER: Fungsi ini mengambil logika dari `addFontAction` Anda.
 * Mengunduh ZIP dari WP, memprosesnya, dan mengunggahnya ke Supabase.
 */
async function processAndUploadFontZip(zipFileUrl: string, slug: string) {
    const agent = new https.Agent({
      rejectUnauthorized: false
    });
    
    const fetchOptions = {
      agent,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36'
      }
    };

    console.log(`   ... Mengunduh ${zipFileUrl}`);
    let zipBuffer: Buffer;

    try {
        // @ts-ignore
        const response = await fetch(zipFileUrl, fetchOptions);
        if (!response.ok) {
            const decodedUrl = decodeURI(zipFileUrl);
            // @ts-ignore
            const response2 = await fetch(decodedUrl, fetchOptions);
            if(!response2.ok) {
                throw new Error(`Gagal mengunduh file ZIP: ${response.status} ${response.statusText} (Forbidden)`);
            }
            // @ts-ignore
            zipBuffer = Buffer.from(await response2.arrayBuffer());
        } else {
            zipBuffer = Buffer.from(await (response as any).arrayBuffer());
        }
    } catch (error) {
        throw new Error(`Error saat mengunduh ZIP ${zipFileUrl}: ${(error as Error).message}`);
    }
    
    const fileSizeKB = parseFloat((zipBuffer.length / 1024).toFixed(2));

    const zipFilePath = `protected/fonts/${slug}.zip`;
    
    const { data: zipUploadData, error: zipUploadError } = await supabase.storage
        .from('products')
        .upload(zipFilePath, zipBuffer, {
            cacheControl: '31536000', 
            upsert: true, 
        });
        
    if (zipUploadError) throw new Error(`Gagal unggah ZIP ke Supabase: ${zipUploadError.message}`);
    const downloadableFileUrl = zipUploadData.path;

    const zip = new AdmZip(zipBuffer);
    const zipEntries = zip.getEntries();
    const fontFilesForTypetester: { style: string, url: string }[] = [];
    const fileTypes = new Set<string>();
    let glyphsJson: string[] = [];
    let primaryFontScanned = false;
    const uploadedFontPreviewPaths: string[] = [];

    for (const entry of zipEntries) {
        if (!entry.isDirectory && /\.(otf|ttf|woff|woff2)$/i.test(entry.name)) {
            const fileExt = (entry.name.split('.').pop() || '').toLowerCase();
            fileTypes.add(fileExt.toUpperCase());

            if (fileExt === 'otf') {
                const fontBuffer = entry.getData();
                const styleName = getFontStyle(entry.name);
                const cleanFileName = `${slug}-${styleName}.otf`.replace(/--/g, '-');
                const fontPreviewPath = `${slug}/styles/${cleanFileName}`;
                
                const { error: fontUploadError } = await supabase.storage
                    .from('font-previews')
                    .upload(fontPreviewPath, fontBuffer, { upsert: true, cacheControl: '31536000' });
                
                if (fontUploadError) {
                    console.warn(`   ... Peringatan: Gagal unggah file preview ${entry.name}: ${fontUploadError.message}`);
                    continue;
                }
                
                uploadedFontPreviewPaths.push(fontPreviewPath);
                const { data: { publicUrl } } = supabase.storage.from('font-previews').getPublicUrl(fontPreviewPath);
                fontFilesForTypetester.push({ style: styleName, url: publicUrl });

                if (!primaryFontScanned && (styleName.toLowerCase() === 'regular' || fontFilesForTypetester.length === 1)) {
                    try {
                        const font = opentype.parse(fontBuffer.buffer);
                        const glyphSet = new Set<string>();
                        for (let i = 0; i < font.numGlyphs; i++) {
                            const glyph = font.glyphs.get(i);
                            if (glyph.unicode) {
                                const char = String.fromCodePoint(glyph.unicode);
                                if (char.trim().length > 0 || char === ' ') glyphSet.add(char);
                            }
                        }
                        glyphsJson = Array.from(glyphSet);
                        primaryFontScanned = true;
                    } catch (e) {
                        console.warn(`   ... Gagal parse glyphs untuk ${entry.name}: ${(e as Error).message}`);
                    }
                }
            }
        }
    }

    if (fontFilesForTypetester.length === 0) {
        await supabase.storage.from('products').remove([downloadableFileUrl]);
        throw new Error('Tidak ada file .otf ditemukan di dalam ZIP. File .otf wajib ada untuk preview.');
    }

    return {
        downloadableFileUrl: downloadableFileUrl,
        fontFilesJson: fontFilesForTypetester as Json,
        glyphsJson: glyphsJson,
        fileSizeKB: fileSizeKB,
        fileTypes: Array.from(fileTypes),
    };
}

function getFontStyle(fileName: string): string {
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
}

main().catch(console.error);