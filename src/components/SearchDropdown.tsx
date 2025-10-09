// src/components/SearchDropdown.tsx
'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { useDebouncedCallback } from 'use-debounce';
import { searchProductsByNameAction } from '@/app/actions/productActions';
import { SearchDropdownSuggestions, type SuggestionProduct } from './SearchDropdownSuggestions';
import SearchSuggestionItem from './SearchSuggestionItem';
import { X } from 'lucide-react'; // Impor ikon X

type SearchResult = SuggestionProduct;

type SearchDropdownProps = {
  isOpen: boolean;
  onClose: () => void;
  featuredFonts: SuggestionProduct[];
  latestBundles: SuggestionProduct[];
};

const SearchDropdown = ({ isOpen, onClose, featuredFonts, latestBundles }: SearchDropdownProps) => {
  const contentRef = useRef<HTMLDivElement>(null); // Ref untuk panel konten
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, startSearchTransition] = useTransition();

  const handleSearch = useDebouncedCallback((term: string) => {
    if (term.length > 1) {
      startSearchTransition(async () => {
        const { products } = await searchProductsByNameAction(term);
        setResults(products || []);
      });
    } else {
      setResults([]);
    }
  }, 300);

  useEffect(() => {
    // Menambahkan/menghapus class pada body untuk mencegah scroll di latar belakang
    if (isOpen) {
      document.body.classList.add('overflow-hidden', 'md:overflow-auto');
    } else {
      document.body.classList.remove('overflow-hidden', 'md:overflow-auto');
    }
    // Cleanup function
    return () => {
      document.body.classList.remove('overflow-hidden', 'md:overflow-auto');
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Sekarang kita cek klik di luar panel konten, bukan seluruh overlay
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    // --- PERUBAHAN UTAMA DI SINI ---
    // Kontainer luar sekarang menjadi overlay di mobile
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 p-4 pt-20
                 md:absolute md:top-full md:right-0 md:left-auto md:mt-4 md:w-[36rem] md:bg-transparent md:backdrop-blur-none md:p-0"
    >
      {/* Panel konten yang sebenarnya */}
      <div
        ref={contentRef}
        className="relative w-full max-w-xl mx-auto bg-[#1e1e1e] text-brand-light rounded-lg shadow-2xl border border-brand-gray-light p-6
                   md:w-full md:max-w-none"
      >
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Search for fonts & bundles..."
            className="w-full bg-brand-dark-secondary text-brand-light placeholder-brand-light/50 rounded-full pl-4 pr-10 py-3 border border-brand-gray-light focus:outline-none hover:border-brand-accent focus:border-brand-accent transition-colors"
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              handleSearch(e.target.value);
            }}
          />
          {/* Tombol Close untuk Mobile */}
          <button onClick={onClose} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-light-muted hover:text-white md:hidden">
            <X size={24} />
          </button>
        </div>

        <div className="mt-6 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {results.length > 0 ? (
              <div className='space-y-4'>
                   <h3 className="text-sm font-semibold text-brand-light/75 tracking-wider">Search Results</h3>
                  {results.map(product => (
                      <SearchSuggestionItem key={`${product.type}-${product.slug}`} product={product} onClose={onClose} />
                  ))}
              </div>
          ) : query.length > 1 && !isSearching ? (
               <p className="text-center text-brand-light-muted py-8">No results found for &quot;{query}&quot;.</p>
          ) : (
              <SearchDropdownSuggestions 
                  onClose={onClose} 
                  featuredFonts={featuredFonts}
                  latestBundles={latestBundles}
              />
          )}
        </div>
        
        <div className="mt-6 border-t border-brand-gray-light pt-6">
          <Link 
            href={query.length > 1 ? `/fonts?search=${query}` : "/fonts"}
            onClick={onClose}
            className="block w-full px-8 py-3 font-medium rounded-full text-center bg-brand-accent text-brand-darkest transition-all duration-300 ease-in-out transform hover:shadow-lg hover:shadow-brand-accent/40"
          >
            {query.length > 1 ? 'View All Results' : 'Explore All Fonts'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SearchDropdown;