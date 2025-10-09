// src/app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.timelesstype.co';

  return {
    rules: [
      {
        userAgent: '*', // Berlaku untuk semua robot (Googlebot, Bingbot, dll.)
        allow: '/', // Izinkan untuk merayapi semua halaman
        disallow: [
            '/admin/', // Jangan rayapi halaman admin
            '/account/', // Jangan rayapi halaman akun pengguna
            '/checkout/', // Jangan rayapi halaman checkout
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`, // Tunjukkan lokasi sitemap Anda
  };
}