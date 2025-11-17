// src/app/sitemap.ts
import { MetadataRoute } from 'next';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';

export const revalidate = 3600; // Update sitemap setiap jam

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // --- PERBAIKAN 1: Ganti domain default ke stylishtype.co ---
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylishtype.co';

  // Inisialisasi Supabase client khusus untuk server
  const cookieStore = cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
      },
    }
  );

  // 1. Ambil semua slug dari 'fonts'
  const { data: fonts } = await supabase.from('fonts').select('slug, created_at');
  const fontUrls = fonts?.map(font => ({
    // --- PERBAIKAN 2: Sesuaikan path font menjadi /product (sesuai struktur folder baru) ---
    url: `${baseUrl}/product/${font.slug}`,
    lastModified: new Date(font.created_at),
  })) || [];

  // 2. Ambil semua slug dari 'bundles'
  const { data: bundles } = await supabase.from('bundles').select('slug, created_at');
  const bundleUrls = bundles?.map(bundle => ({
    url: `${baseUrl}/bundles/${bundle.slug}`,
    lastModified: new Date(bundle.created_at),
  })) || [];

  // 3. Ambil semua slug dari 'posts' yang sudah terpublikasi
  const { data: posts } = await supabase.from('posts').select('slug, updated_at').eq('is_published', true);
  const postUrls = posts?.map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at),
  })) || [];

  // 4. Ambil semua slug dari 'partners'
  const { data: partners } = await supabase.from('partners').select('slug, created_at');
  const partnerUrls = partners?.map(partner => ({
    url: `${baseUrl}/partners/${partner.slug}`,
    lastModified: new Date(partner.created_at),
  })) || [];

  // 5. Daftar halaman statis
  const staticUrls = [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/bundles`, lastModified: new Date() },
    // --- PERBAIKAN 3: Ganti /fonts menjadi /product ---
    { url: `${baseUrl}/product`, lastModified: new Date() },
    { url: `${baseUrl}/logotype`, lastModified: new Date() },
    { url: `${baseUrl}/font-pair`, lastModified: new Date() },
    { url: `${baseUrl}/subscription`, lastModified: new Date() },
    { url: `${baseUrl}/license`, lastModified: new Date() },
    { url: `${baseUrl}/partners`, lastModified: new Date() },
    { url: `${baseUrl}/blog`, lastModified: new Date() },
    { url: `${baseUrl}/about`, lastModified: new Date() },
    { url: `${baseUrl}/contact`, lastModified: new Date() },
    { url: `${baseUrl}/faq`, lastModified: new Date() },
    { url: `${baseUrl}/privacy`, lastModified: new Date() },
    { url: `${baseUrl}/terms`, lastModified: new Date() },
  ];

  // Gabungkan semua URL
  return [...staticUrls, ...fontUrls, ...bundleUrls, ...postUrls, ...partnerUrls];
}