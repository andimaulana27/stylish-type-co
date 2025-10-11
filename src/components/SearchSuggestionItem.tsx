// src/components/SearchSuggestionItem.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { type SuggestionProduct } from './SearchDropdownSuggestions';
import StaffPickIcon from './icons/StaffPickIcon';
import { Percent } from 'lucide-react';

type SuggestionItemProps = {
    product: SuggestionProduct;
    onClose?: () => void;
};

const StaffPickLabel = () => (
  <div className="absolute top-1.5 right-1.5 bg-brand-secondary-purple text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 z-10">
    <StaffPickIcon className="w-2.5 h-2.5" />
    <span>Picks</span>
  </div>
);

const DiscountLabel = ({ discount }: { discount: string }) => (
  <div className="absolute top-1.5 left-1.5 bg-brand-secondary-red text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 z-10">
    <Percent size={10} />
    <span>{discount}</span>
  </div>
);

const SearchSuggestionItem = ({ product, onClose }: SuggestionItemProps) => {
    const href = product.type === 'bundle' ? `/bundles/${product.slug}` : `/product/${product.slug}`;
    
    return (
      <Link href={href} className="flex items-start gap-4 group/item p-2 -m-2 rounded-lg hover:bg-white/5 transition-colors" onClick={onClose}>
        <div className="relative flex-shrink-0">
          {/* --- PERUBAHAN UKURAN GAMBAR DI SINI --- */}
          <Image src={product.imageUrl} alt={product.name} width={140} height={100} className="rounded-md bg-brand-gray-light object-cover aspect-[3/2]" />
          {product.discount && <DiscountLabel discount={product.discount} />}
          {product.staffPick && <StaffPickLabel />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h4 className="font-semibold text-brand-light group-hover/item:text-brand-accent transition-colors duration-200 text-base leading-tight pr-2">{product.name}</h4>
            <div className="text-right">
              <p className="text-base font-bold text-brand-light group-hover/item:text-brand-accent transition-colors duration-200 flex-shrink-0">${product.price.toFixed(2)}</p>
              {product.originalPrice && (
                  <p className="text-sm font-light text-brand-light-muted line-through">${product.originalPrice.toFixed(2)}</p>
              )}
            </div>
          </div>
          <p className="text-sm text-brand-light-muted mt-1">{product.category}</p>
        </div>
      </Link>
    );
};

export default SearchSuggestionItem;