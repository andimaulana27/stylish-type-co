// src/components/font-detail/LatestBundlesSection.tsx
'use client'; // <-- Menjadi Client Component

import type { ProductData } from '@/lib/dummy-data';
import BundleCard from './BundleCard';

// Komponen sekarang menerima 'bundles' sebagai properti (props)
export default function LatestBundlesSection({ bundles }: { bundles: ProductData[] }) {
  
  // Jika tidak ada data, jangan tampilkan apa-apa
  if (!bundles || bundles.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <div className="grid grid-cols-1 gap-4">
        {bundles.map((bundle) => (
          <BundleCard key={bundle.id} font={bundle} />
        ))}
      </div>
    </div>
  );
}