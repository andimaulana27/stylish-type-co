// src/components/account/PurchasedProductCard.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Download, ArrowUpRight, Loader2, Award } from 'lucide-react'; // Impor Award
import { useState } from 'react';
import { getDownloadUrlAction } from '@/app/actions/userActions';
import toast from 'react-hot-toast';

type Product = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  description: string | null;
  type: 'font' | 'bundle';
  licenseName: string | null; // <-- Tambahkan licenseName
};

export default function PurchasedProductCard({ product }: { product: Product }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const href = product.type === 'bundle'
    ? `/bundles/${product.slug}`
    : `/fonts/${product.slug}`;

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDownloading(true);
    toast.loading('Preparing your download...');

    const result = await getDownloadUrlAction(product.id, product.type);

    toast.dismiss();

    if (result.error) {
        toast.error(result.error);
    } else if (result.url) {
        // Memicu unduhan di browser
        window.location.href = result.url;
        toast.success(`Downloading ${product.name}...`);
    }

    setIsDownloading(false);
  };

  return (
    <div className="group/card h-full flex flex-col bg-brand-dark-secondary/40 p-4 rounded-lg border border-transparent hover:border-white/10 transition-colors duration-300">

      <div className="relative w-full aspect-[3/2] rounded-md overflow-hidden bg-brand-gray-light">
        <Image
          src={product.imageUrl}
          alt={`Preview of ${product.name}`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw, 33vw"
          className="object-cover transition-transform duration-300 ease-in-out group-hover/card:scale-105"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 ease-in flex items-center justify-center">
            <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex items-center justify-center gap-2 bg-brand-accent text-brand-darkest font-medium py-2.5 px-6 rounded-full transition-all duration-300 ease-in-out transform scale-90 group-hover/card:scale-100 hover:shadow-lg hover:shadow-brand-accent/40 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {isDownloading ? (
                    <Loader2 size={16} className="animate-spin" />
                ) : (
                    <Download size={16} />
                )}
                <span className="leading-none">{isDownloading ? 'Preparing...' : 'Download'}</span>
            </button>
        </div>
      </div>

      <div className="pt-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="font-semibold text-lg text-brand-light leading-tight">
                    {product.name}
                </h3>
                {/* --- Tampilkan Nama Lisensi di Sini --- */}
                {product.licenseName && (
                    <div className="flex items-center gap-1 text-xs text-brand-light-muted mt-1">
                       <Award size={12} className="text-brand-accent"/> <span>{product.licenseName} License</span>
                    </div>
                )}
                 {/* --- Tampilkan Tipe Produk Jika Tidak Ada Lisensi (Misal dari Grant) --- */}
                 {!product.licenseName && (
                      <p className="text-sm text-brand-light-muted mt-1 capitalize">
                          {product.type}
                      </p>
                 )}
            </div>
            <Link href={href} className="p-2 -m-2 text-brand-light-muted hover:text-brand-accent transition-colors">
                <ArrowUpRight size={20} />
            </Link>
        </div>
      </div>
    </div>
  );
}