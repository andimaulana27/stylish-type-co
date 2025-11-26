// src/app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  // PERBAIKAN: Gunakan domain baru (stylishtype.co) dan hapus 'www' agar konsisten
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://stylishtype.co';

  return {
    rules: {
      userAgent: '*', // Berlaku untuk semua robot
      allow: '/',
      disallow: [
        '/admin/',    // Halaman admin
        '/account/',  // Dashboard user
        '/checkout/', // Proses pembayaran
        '/auth/',     // Halaman sistem login/register
        '/api/',      // Endpoint API backend
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`, // Lokasi sitemap
  };
}