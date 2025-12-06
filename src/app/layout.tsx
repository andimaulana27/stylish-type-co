// src/app/layout.tsx
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Poppins, Luxurious_Script } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'
import { UIProvider } from '@/context/UIContext'
import { AuthProvider } from '@/context/AuthContext'
import { Toaster } from 'react-hot-toast'
import { GoogleAnalytics } from '@/components/GoogleAnalytics'
import Script from 'next/script' // <-- 1. Impor 'Script'
import { getSiteConfigAction } from '@/app/actions/configActions' // <-- 2. Impor action baru

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

const luxuriousScript = Luxurious_Script({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-luxurious-script',
  display: 'swap',
});

const misturSleuth = localFont({
  src: '../product/Mistur Sleuth.otf', 
  variable: '--font-mistur-sleuth',
  display: 'swap',
});

export const metadata: Metadata = {
   title: {
    default: 'Stylish Type | Premium Fonts for Designers', // DIUBAH
    template: '%s | Stylish Type', // DIUBAH
  },
  description: 'Discover a curated collection of stunning typography. Explore premium fonts, versatile bundles, and find the perfect typeface for your next design project.',
  other: {
    'google-adsense-account': 'ca-pub-8366879787496569'
  }
}

// --- 3. Ubah RootLayout menjadi 'async' ---
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabaseStorageUrl = "https://fxjazgmdfhiojmapttda.supabase.co";

  // --- 4. Ambil konfigurasi situs (termasuk Pixel ID) ---
  const { data: config } = await getSiteConfigAction();

  return (
    <html lang="en" className={`${poppins.variable} ${luxuriousScript.variable} ${misturSleuth.variable} h-full`}>
      <head>
        <link
          rel="preconnect"
          href={supabaseStorageUrl}
          crossOrigin="anonymous"
        />
        
        <Suspense>
          <GoogleAnalytics />
        </Suspense>
        
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_GA_ADS_CLIENT_ID}`}
          crossOrigin="anonymous"
        ></script>

        {/* --- 5. Tambahkan Meta Pixel Script di sini --- */}
        {config?.meta_pixel_id && (
          <>
            <Script id="meta-pixel-script" strategy="beforeInteractive">
              {`
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${config.meta_pixel_id}');
                fbq('track', 'PageView');
              `}
            </Script>
            <noscript>
              <img height="1" width="1" style={{display:'none'}}
                src={`https://www.facebook.com/tr?id=${config.meta_pixel_id}&ev=PageView&noscript=1`}
              />
            </noscript>
          </>
        )}
        {/* --- Akhir Meta Pixel Script --- */}
        
      </head>
      <body className={`${poppins.className} bg-brand-dark-secondary h-full flex flex-col`}>
        <UIProvider>
          <AuthProvider>
            <Toaster 
              position="top-center"
              toastOptions={{
                style: {
                  background: '#1e1e1e',
                  color: '#FFFFFF',
                  border: '1px solid #2A2A2A',
                },
              }}
            />
            <div id="__next" className="flex-1 flex flex-col">
              {children}
            </div>
          </AuthProvider>
        </UIProvider>
      </body>
    </html>
  )
}