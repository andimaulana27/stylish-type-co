// src/components/GoogleAnalytics.tsx
'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import Script from 'next/script'
import { useEffect, Suspense } from 'react'

declare global {
  interface Window {
    gtag(command: 'config', targetId: string, params?: { page_path?: string }): void;
    gtag(command: 'js', date: Date): void;
  }
}

const pageview = (url: string) => {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (typeof window.gtag !== 'undefined' && measurementId) {
    window.gtag('config', measurementId, {
      page_path: url,
    })
  }
}

function AnalyticsTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
    pageview(url)
  }, [pathname, searchParams])

  return null
}

export const GoogleAnalytics = () => {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!measurementId) {
    return null;
  }

  return (
    <>
      {/* --- PERBAIKAN UTAMA DI SINI --- */}
      {/* Mengubah 'afterInteractive' menjadi 'lazyOnload' untuk menunda pemuatan */}
      <Script
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      <Script
        id="google-analytics"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
      {/* --- AKHIR PERBAIKAN --- */}
      
      <Suspense>
        <AnalyticsTracker />
      </Suspense>
    </>
  )
}