// src/components/partner/PartnerFontsClient.tsx
'use client'; 

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { ProductData } from '@/lib/dummy-data';
import { type Tables } from '@/lib/database.types';

import ProductCard from '@/components/ProductCard';
import Pagination from '@/components/Pagination';
import FilterDropdown from '@/components/FilterDropdown';
import SearchInput from '@/components/SearchInput';
import LayoutSwitcher from '@/components/LayoutSwitcher';
import FontListCard from '@/components/FontListCard';
import TypeTesterControls from '@/components/TypeTesterControls';

type FormattedFont = ProductData & {
    font_files: Tables<'fonts'>['font_files'];
    partner: { name: string; slug: string } | null;
};

const sortOptions = ["Newest", "Oldest", "A to Z", "Z to A"];

// Komponen Skeleton
const SkeletonGrid = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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

interface PartnerFontsClientProps {
  initialFonts: FormattedFont[];
  initialTotalPages: number;
}

export default function PartnerFontsClient({ initialFonts, initialTotalPages }: PartnerFontsClientProps) {
    const searchParams = useSearchParams();
    const layout = searchParams.get('layout') || 'grid';
    const currentPage = Number(searchParams.get('page')) || 1;
    const isListLayout = layout === 'list';

    // State untuk type tester
    const [fontSize, setFontSize] = useState(48);
    const [previewText, setPreviewText] = useState('');

    // Karena data sekarang di-fetch di server, kita tidak perlu state loading & useEffect lagi
    const fonts = initialFonts;
    const totalPages = initialTotalPages;

    return (
        <>
            <section className="container mx-auto px-6 py-4 sticky top-24 z-30 bg-brand-dark-secondary/80 backdrop-blur-sm rounded-lg">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="w-full md:w-1/3">
                        <SearchInput placeholder="Search font by name..." />
                    </div>
                    <div className="flex w-full md:w-auto items-center gap-4">
                        <FilterDropdown paramName="sort" options={sortOptions} label="Sort by" />
                        <LayoutSwitcher />
                    </div>
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
                {fonts.length > 0 ? (
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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
                        No fonts found for this partner matching your criteria.
                    </p>
                )}
            </section>
        </>
    );
}