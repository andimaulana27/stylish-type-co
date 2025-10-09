// src/components/SearchDropdownSuggestions.tsx
'use client';

import SearchSuggestionItem from "./SearchSuggestionItem";

// --- PERUBAHAN DI SINI: Tipe data diperbarui ---
export type SuggestionProduct = {
    id: string;
    name: string;
    slug: string;
    imageUrl: string;
    price: number;
    originalPrice?: number; // Ditambahkan
    category: string;
    type: 'font' | 'bundle';
    discount?: string; // Ditambahkan
    staffPick?: boolean; // Ditambahkan
};
  
export const SearchDropdownSuggestions = ({
    onClose,
    featuredFonts,
    latestBundles,
}: {
    onClose: () => void;
    featuredFonts: SuggestionProduct[];
    latestBundles: SuggestionProduct[];
}) => {
    return (
        <>
            {featuredFonts && featuredFonts.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-brand-light/75 tracking-wider">FEATURED PRODUCTS</h3>
                    {featuredFonts.map(product => (
                        <SearchSuggestionItem key={`featured-${product.id}`} product={product} onClose={onClose} />
                    ))}
                </div>
            )}
            {latestBundles && latestBundles.length > 0 && (
                <div className="space-y-4 mt-6">
                    <h3 className="text-sm font-semibold text-brand-light/75 tracking-wider">LATEST BUNDLES</h3>
                    {latestBundles.map(product => (
                        <SearchSuggestionItem key={`bundle-${product.id}`} product={product} onClose={onClose} />
                    ))}
                </div>
            )}
        </>
    );
}