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
import { getSiteConfigAction } from '@/app/actions/configActions'
// --- PERUBAHAN: Import komponen FacebookPixel baru ---
import FacebookPixel from '@/components/FacebookPixel'

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
    default: 'Stylish Type | Premium Fonts for Designers',
    template: '%s | Stylish Type',
  },
  description: 'Discover a curated collection of stunning typography.',
  other: {
    'google-adsense-account': 'ca-pub-8366879787496569'
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabaseStorageUrl = "https://fxjazgmdfhiojmapttda.supabase.co";

  // Ambil konfigurasi situs (termasuk Pixel ID)
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
      </head>
      
      <body className={`${poppins.className} bg-brand-dark-secondary h-full flex flex-col`}>
        
        {/* --- PERUBAHAN: Memanggil Komponen Pixel Terpisah --- */}
        {config?.meta_pixel_id && (
            <FacebookPixel id={config.meta_pixel_id} />
        )}
        {/* --- Akhir Perubahan Meta Pixel --- */}

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