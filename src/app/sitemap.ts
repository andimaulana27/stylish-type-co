// src/app/sitemap.ts
import { MetadataRoute } from 'next';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';

export const revalidate = 3600; // Update sitemap setiap 1 jam

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // KOREKSI: Menghapus 'www' agar konsisten dengan settingan domain utama Vercel
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://stylishtype.co';

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
    url: `${baseUrl}/product/${font.slug}`,
    lastModified: new Date(font.created_at),
    changeFrequency: 'weekly' as const, // Opsional: Memberi tahu Google frekuensi update
    priority: 0.8, // Opsional: Prioritas tinggi untuk produk
  })) || [];

  // 2. Ambil semua slug dari 'bundles'
  const { data: bundles } = await supabase.from('bundles').select('slug, created_at');
  const bundleUrls = bundles?.map(bundle => ({
    url: `${baseUrl}/bundles/${bundle.slug}`,
    lastModified: new Date(bundle.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  })) || [];

  // 3. Ambil semua slug dari 'posts' yang sudah terpublikasi
  const { data: posts } = await supabase.from('posts').select('slug, updated_at').eq('is_published', true);
  const postUrls = posts?.map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  })) || [];

  // 4. Ambil semua slug dari 'partners'
  const { data: partners } = await supabase.from('partners').select('slug, created_at');
  const partnerUrls = partners?.map(partner => ({
    url: `${baseUrl}/partners/${partner.slug}`,
    lastModified: new Date(partner.created_at),
    priority: 0.6,
  })) || [];

  // 5. Daftar halaman statis
  const staticRoutes = [
    '', // Homepage
    '/bundles',
    '/product',
    '/logotype',
    '/font-pair',
    '/subscription',
    '/license',
    '/partners',
    '/blog',
    '/about',
    '/contact',
    '/faq',
    '/privacy',
    '/terms',
  ];

  const staticUrls = staticRoutes.map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.5, // Homepage prioritas tertinggi
  }));

  // Gabungkan semua URL
  return [...staticUrls, ...fontUrls, ...bundleUrls, ...postUrls, ...partnerUrls];
}