// src/components/LogotypeGrid.tsx
'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Pagination from './Pagination';
import LogotypeCard, { type LogotypeFont } from './LogotypeCard';
import DynamicFontLoader from './font-detail/DynamicFontLoader';

const ITEMS_PER_PAGE = 40;

type LogotypeGridProps = {
  allLogotypeFonts: LogotypeFont[];
};

export default function LogotypeGrid({ allLogotypeFonts }: LogotypeGridProps) {
  const [previewText, setPreviewText] = useState('');
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;

  const totalItems = allLogotypeFonts.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const paginatedFonts = allLogotypeFonts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <>
      {paginatedFonts.map(font => (
        <DynamicFontLoader key={font.fontFamily} fontFamily={font.fontFamily} fontUrl={font.url} />
      ))}

      <div className="container mx-auto px-6 text-center -mt-6 mb-12">
        <div className="max-w-2xl mx-auto">
          <input
            type="text"
            placeholder="Write something here..."
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            className="bg-transparent border-b-2 border-brand-gray-light text-center text-4xl font-medium text-brand-light placeholder:text-brand-light-muted placeholder:text-3xl placeholder:font-light focus:outline-none focus:border-brand-accent transition-colors duration-300 pb-4 w-full"
          />
        </div>
      </div>

      <section className="container mx-auto px-6 pt-8 pb-24 min-h-[50vh]">
        {paginatedFonts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
              {paginatedFonts.map((font, index) => (
                <LogotypeCard 
                  key={`${font.slug}-${index}`} 
                  font={font} 
                  // --- PERBAIKAN DI SINI: Hanya teruskan `previewText` dari input pengguna ---
                  previewText={previewText} 
                />
              ))}
            </div>
            {totalPages > 1 && (
              <Pagination currentPage={currentPage} totalPages={totalPages} />
            )}
          </>
        ) : (
          <p className="text-center col-span-full py-16 text-brand-light-muted">
            No fonts found.
          </p>
        )}
      </section>
    </>
  );
}