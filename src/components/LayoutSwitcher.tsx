// src/components/LayoutSwitcher.tsx
'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { LayoutGrid, List } from 'lucide-react';

const LayoutSwitcher = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const currentLayout = searchParams.get('layout') || 'grid';

  const handleLayoutChange = (layout: 'grid' | 'list') => {
    const params = new URLSearchParams(searchParams);
    params.set('layout', layout);
    replace(`${pathname}?${params.toString()}`);
  };

  const buttonClasses = (layout: 'grid' | 'list') => `
    p-2 rounded-full transition-colors duration-200
    ${currentLayout === layout 
      ? 'bg-brand-accent text-brand-darkest' 
      : 'bg-white/5 text-brand-light-muted hover:bg-white/10 hover:text-brand-light'}
  `;

  return (
    <div className="flex items-center gap-2 bg-brand-darkest p-1 rounded-full border border-white/10">
      <button onClick={() => handleLayoutChange('grid')} className={buttonClasses('grid')} aria-label="Grid View">
        <LayoutGrid size={18} />
      </button>
      <button onClick={() => handleLayoutChange('list')} className={buttonClasses('list')} aria-label="List View">
        <List size={18} />
      </button>
    </div>
  );
};

export default LayoutSwitcher;