// next.config.mjs

/**
 * Konfigurasi untuk Content Security Policy (CSP) - Versi Final.
 * Telah ditambahkan semua domain yang dibutuhkan oleh PayPal dan perbaikan sintaks.
 */
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' *.paypal.com *.sandbox.paypal.com *.googlesyndication.com *.google.com *.google-analytics.com *.googletagmanager.com *.adtrafficquality.google blob:;
  style-src 'self' 'unsafe-inline' fonts.googleapis.com;
  img-src 'self' data: blob: fxjazgmdfhiojmapttda.supabase.co avatar.iran.liara.run lh3.googleusercontent.com *.paypal.com *.sandbox.paypal.com *.paypalobjects.com *.adtrafficquality.google;
  connect-src 'self' *.supabase.co *.supabase.io wss://*.supabase.co wss://*.supabase.io vitals.vercel-insights.com *.paypal.com *.sandbox.paypal.com *.google-analytics.com *.analytics.google.com *.adtrafficquality.google *.google.com *.googlesyndication.com;
  font-src 'self' fonts.gstatic.com fxjazgmdfhiojmapttda.supabase.co blob:;
  frame-src 'self' *.paypal.com *.sandbox.paypal.com *.google.com *.googlesyndication.com *.doubleclick.net *.adtrafficquality.google;
  object-src 'none';
  base-uri 'self';
  form-action 'self' *.paypal.com *.sandbox.paypal.com;
  frame-ancestors 'none';
`.replace(/\s{2,}/g, ' ').trim();


/**
 * Daftar semua header keamanan yang akan diterapkan.
 */
const securityHeaders = [
  // Mencegah browser menebak tipe konten
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // Mencegah clickjacking
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  // Mengontrol informasi referrer
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // Mengontrol akses API browser
  {
    key: 'Permissions-Policy',
    value: "camera=(), microphone=(), geolocation=()",
  },
  // Mencegah DNS prefetching
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  // Memaksa penggunaan HTTPS
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  },
  // Menerapkan Content Security Policy
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy,
  }
];


/** @type {import('next').NextConfig} */
const nextConfig = {
  // Menambahkan fungsi async untuk headers
  async headers() {
    return [
      {
        // Terapkan header ini ke semua rute di aplikasi
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fxjazgmdfhiojmapttda.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'avatar.iran.liara.run',
        port: '',
        pathname: '/public/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      // Menambahkan hostname PayPal untuk gambar
      {
        protocol: 'https',
        hostname: 'www.sandbox.paypal.com',
      },
      {
        protocol: 'https',
        hostname: 'www.paypalobjects.com',
      },
    ],
  },
};

export default nextConfig;