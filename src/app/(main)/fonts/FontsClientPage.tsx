// src/app/(main)/fonts/FontsClientPage.tsx
'use client'; 

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import type { ProductData } from '@/lib/dummy-data';
import Pagination from '@/components/Pagination';
import LayoutSwitcher from '@/components/LayoutSwitcher';
import FontListCard from '@/components/FontListCard';
import TypeTesterControls from '@/components/TypeTesterControls';
import { type Tables } from '@/lib/database.types';
import SearchInput from '@/components/SearchInput';
import FilterDropdown from '@/components/FilterDropdown';

type FormattedFont = ProductData & {
    font_files: Tables<'fonts'>['font_files'];
    partner: { name: string; slug: string } | null;
};

interface FontsClientPageProps {
  initialFonts: FormattedFont[];
  initialTotalPages: number;
}

const categoryOptions = ["All", "Serif Display", "Sans Serif", "Slab Serif", "Groovy", "Script", "Blackletter", "Western", "Sport", "Sci-Fi"];
const sortOptions = ["Newest", "Oldest", "A to Z", "Z to A", "Popular", "Staff Pick"];

const SkeletonGrid = () => (
  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="bg-white/5 aspect-[3/2] rounded-lg"></div>
        <div className="mt-4 h-6 bg-white/5 rounded w-3/4"></div>
        <div className="mt-2 h-4 bg-white/5 rounded w-1/2"></div>
      </div>
    ))}
  </div>
);

const SkeletonList = () => (
    <div className="flex flex-col gap-6">
        {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse flex gap-8 py-6 border-b border-white/10">
                <div className="w-1/4">
                    <div className="bg-white/5 aspect-[3/2] rounded-lg"></div>
                    <div className="mt-4 h-6 bg-white/5 rounded w-3/4"></div>
                </div>
                <div className="w-3/4 flex items-center">
                    <div className="h-10 bg-white/5 rounded w-full"></div>
                </div>
            </div>
        ))}
    </div>
);

export default function FontsClientPage({ initialFonts, initialTotalPages }: FontsClientPageProps) {
  const searchParams = useSearchParams();
  const [fonts, setFonts] = useState<FormattedFont[]>(initialFonts);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [loading, setLoading] = useState(false);

  const layout = searchParams.get('layout') || 'grid';
  const [fontSize, setFontSize] = useState(48);
  const [previewText, setPreviewText] = useState('');

  useEffect(() => {
    if (initialFonts.length === 0) {
      setLoading(true);
      const params = new URLSearchParams(searchParams.toString());
      
      fetch(`/api/fonts?${params.toString()}`)
        .then(res => res.json())
        .then(data => {
          setFonts(data.fonts);
          setTotalPages(data.totalPages);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [searchParams, initialFonts]);

  const currentPage = Number(searchParams.get('page')) || 1;
  const isListLayout = layout === 'list';

  return (
    <>
        <section className="container mx-auto px-6 py-4 sticky top-24 z-30 bg-brand-dark-secondary/80 backdrop-blur-sm rounded-lg">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="w-full md:w-1/3">
                    <SearchInput placeholder="Search font by name..." />
                </div>
                
                {/* --- PERUBAHAN UTAMA DI SINI --- */}
                {/* Wrapper baru untuk mengontrol layout filter & switcher */}
                <div className="flex w-full items-center justify-between md:w-auto md:justify-end md:gap-4">
                    {/* Grup ini memastikan filter tetap bersama di kiri (mobile) atau di kanan (desktop) */}
                    <div className="flex items-center gap-2 md:gap-4">
                        <FilterDropdown paramName="category" options={categoryOptions} label="Category" />
                        <FilterDropdown paramName="sort" options={sortOptions} label="Sort by" />
                    </div>
                    
                    {/* Switcher sekarang terpisah, sehingga bisa didorong ke kanan pada mobile */}
                    <LayoutSwitcher />
                </div>
                {/* --- AKHIR PERUBAHAN --- */}
            </div>
            
            <div className={`mt-6 transition-all duration-300 ${isListLayout ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0 invisible'}`}>
                <div className="border-t border-white/10 pt-4">
                    <TypeTesterControls 
                        isDisabled={!isListLayout}
                        fontSize={fontSize}
                        setFontSize={setFontSize}
                        setPreviewText={setPreviewText}
                    />
                </div>
            </div>

            <div className="border-b border-white/10 mt-6"></div>
        </section>

        <section className="container mx-auto px-6 pt-8 pb-24 min-h-[50vh]">
            {loading ? (
            isListLayout ? <SkeletonList /> : <SkeletonGrid />
            ) : fonts.length > 0 ? (
            <>
                {isListLayout ? (
                    <div className="flex flex-col">
                        {fonts.map((font) => (
                            <FontListCard 
                                key={font.id} 
                                font={font} 
                                previewText={previewText}
                                fontSize={fontSize}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {fonts.map((font) => (
                            <ProductCard key={font.id} font={font} />
                        ))}
                    </div>
                )}
                
                {totalPages > 1 && (
                <Pagination currentPage={currentPage} totalPages={totalPages} />
                )}
            </>
            ) : (
            <p className="text-center col-span-full py-16 text-brand-light-muted">
                No fonts found matching your criteria.
            </p>
            )}
        </section>
    </>
  );
}