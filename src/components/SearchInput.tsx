// src/components/SearchInput.tsx
'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { Search } from 'lucide-react'; // <-- PERBAIKAN: Impor dari lucide-react

export default function SearchInput({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    if (term) {
      params.set('search', term);
    } else {
      params.delete('search');
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div className="relative w-full">
      {/* --- PERBAIKAN: Menggunakan ikon Search dari Lucide --- */}
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-light-muted" />
      
      <input
        className="w-full bg-brand-darkest border border-white/20 rounded-full pl-10 pr-4 py-2 text-brand-light placeholder:text-brand-light-muted focus:outline-none focus:border-brand-accent transition-colors"
        placeholder={placeholder}
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
        defaultValue={searchParams.get('search')?.toString()}
      />
    </div>
  );
}