// src/components/Pagination.tsx
'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ totalPages, currentPage }: { totalPages: number, currentPage: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  if (totalPages <= 1) return null;

  // --- PERUBAHAN: Logika untuk menampilkan nomor halaman ---
  const getPageNumbers = () => {
    const pageNumbers = [];
    // Selalu tampilkan halaman pertama
    if (totalPages > 0) pageNumbers.push(1);

    // Tampilkan '...' jika halaman saat ini jauh dari awal
    if (currentPage > 3) pageNumbers.push('...');

    // Tampilkan halaman sebelum dan sesudah halaman saat ini
    for (let i = currentPage - 1; i <= currentPage + 1; i++) {
      if (i > 1 && i < totalPages) {
        pageNumbers.push(i);
      }
    }
    
    // Tampilkan '...' jika halaman saat ini jauh dari akhir
    if (currentPage < totalPages - 2) pageNumbers.push('...');
    
    // Selalu tampilkan halaman terakhir
    if (totalPages > 1) pageNumbers.push(totalPages);
    
    // Hapus duplikat
    return [...new Set(pageNumbers)];
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex justify-center items-center mt-16 space-x-2">
      {/* Previous Button */}
      <Link
        href={createPageURL(currentPage - 1)}
        className={`p-3 rounded-md transition-colors ${
          currentPage <= 1 ? 'text-white/20 pointer-events-none' : 'text-brand-light hover:bg-white/10'
        }`}
      >
        <ChevronLeft size={20} />
      </Link>

      {/* Page Numbers */}
      <div className="flex items-center space-x-2">
          {pageNumbers.map((page, index) =>
              typeof page === 'number' ? (
                  <Link
                      key={page}
                      href={createPageURL(page)}
                      className={`px-4 py-2 rounded-md text-sm transition-colors ${
                          currentPage === page
                              ? 'bg-brand-accent text-brand-darkest font-bold'
                              : 'bg-brand-darkest text-brand-light hover:bg-white/10'
                      }`}
                  >
                      {page}
                  </Link>
              ) : (
                  <span key={`ellipsis-${index}`} className="px-4 py-2 text-sm text-brand-light-muted">
                      {page}
                  </span>
              )
          )}
      </div>

      {/* Next Button */}
      <Link
        href={createPageURL(currentPage + 1)}
        className={`p-3 rounded-md transition-colors ${
          currentPage >= totalPages ? 'text-white/20 pointer-events-none' : 'text-brand-light hover:bg-white/10'
        }`}
      >
        <ChevronRight size={20} />
      </Link>
    </div>
  );
}