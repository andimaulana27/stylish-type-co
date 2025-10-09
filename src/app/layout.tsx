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

// Path diubah dari ../fonts/ menjadi ../product/
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // URL diperbarui sesuai .env.local untuk proyek StylishType
  const supabaseStorageUrl = "https://fxjazgmdfhiojmapttda.supabase.co"; // DIUBAH

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