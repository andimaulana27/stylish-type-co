// src/components/NotFoundSearch.tsx
'use client';

import { useState, useTransition } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { searchProductsByNameAction } from '@/app/actions/productActions';
import { Loader2, Search } from 'lucide-react';
import SearchSuggestionItem from './SearchSuggestionItem';
// --- PERUBAHAN 1: Impor tipe data yang benar ---
import { type SuggestionProduct } from './SearchDropdownSuggestions';

// --- PERUBAHAN 2: Hapus definisi tipe 'SearchResult' yang lama dan tidak lengkap ---
// type SearchResult = { ... }; // Dihapus

const NotFoundSearch = () => {
  const [query, setQuery] = useState('');
  // --- PERUBAHAN 3: Gunakan tipe data 'SuggestionProduct' yang benar untuk state ---
  const [results, setResults] = useState<SuggestionProduct[]>([]);
  const [isSearching, startSearchTransition] = useTransition();
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useDebouncedCallback((term: string) => {
    setHasSearched(true);
    if (term.length > 1) {
      startSearchTransition(async () => {
        const { products } = await searchProductsByNameAction(term);
        // Data yang datang dari action sudah memiliki 'id', jadi sekarang tipenya cocok
        setResults(products || []);
      });
    } else {
      setResults([]);
    }
  }, 300);

  return (
    <div className="w-full max-w-lg">
      <div className="relative flex items-center">
        <Search className="absolute left-4 h-5 w-5 text-brand-light-muted peer-focus:text-brand-accent peer-hover:text-brand-accent transition-colors duration-200" />
        <input
          className="peer block w-full rounded-full border border-white/10 py-3 pl-12 text-sm outline-none placeholder:text-brand-light-muted bg-white/5 text-white focus:border-brand-accent transition-colors duration-200"
          placeholder="Or try searching for a font..."
          onChange={(e) => {
            setQuery(e.target.value);
            handleSearch(e.target.value);
          }}
          value={query}
        />
        {isSearching && <Loader2 className="animate-spin absolute right-4 text-brand-light-muted" />}
      </div>
      
      {hasSearched && (
        <div className="mt-4 text-left bg-brand-darkest/50 backdrop-blur-sm border border-white/10 rounded-lg p-4 max-h-96 overflow-y-auto">
          {isSearching ? (
            <p className="text-center text-brand-light-muted">Searching...</p>
          ) : results.length > 0 ? (
            <div className="space-y-4">
              {results.map(product => (
                <SearchSuggestionItem key={`${product.type}-${product.slug}`} product={product} />
              ))}
            </div>
          ) : query.length > 1 ? (
            <p className="text-center text-brand-light-muted">No results found for &quot;{query}&quot;.</p>
          ) : (
            <p className="text-center text-brand-light-muted">Type at least 2 characters to search.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default NotFoundSearch;