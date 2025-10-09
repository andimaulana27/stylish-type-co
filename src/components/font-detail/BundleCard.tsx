// src/components/font-detail/BundleCard.tsx
'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import Link from 'next/link';
import { Percent, ShoppingCart, Loader2 } from 'lucide-react';
import type { ProductData } from '@/lib/dummy-data';
import { useUI } from '@/context/UIContext';
import { getStandardLicenseAction } from '@/app/actions/licenseActions';
import toast from 'react-hot-toast';
import StaffPickIcon from '../icons/StaffPickIcon';

type BundleCardProps = {
  font: ProductData;
  className?: string;
  style?: React.CSSProperties;
};

const StaffPickLabel = () => (
  <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-brand-secondary-purple text-white text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1 z-10 md:text-xs md:px-3 md:py-1.5 md:gap-1.5">
    <StaffPickIcon className="w-3 h-3 md:w-4 md:h-4" />
    <span>Staff Picks</span>
  </div>
);

const DiscountLabel = ({ discount }: { discount: string }) => (
  <div className="absolute top-2 left-2 md:top-3 md:left-3 bg-brand-secondary-red/90 text-white text-[9px] font-bold px-2 py-1 rounded-full z-10 flex items-center gap-1">
    <Percent size={10} className="md:w-3.5 md:h-3.5"/>
    <span>{discount}</span>
  </div>
);

const BundleCard = ({ font, className = '', style }: BundleCardProps) => {
  const { addToCart } = useUI();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAdding(true);

    const { license, error } = await getStandardLicenseAction();
    
    if (error || !license) {
      toast.error(error || 'Could not find standard license for bundle.');
      setIsAdding(false);
      return;
    }

    const cartItem = {
      id: `${font.id}-${license.id}`,
      productId: font.id,
      name: font.name,
      slug: font.slug,
      imageUrl: font.imageUrl,
      price: font.price,
      originalPrice: font.originalPrice,
      license: {
        id: license.id,
        name: license.name,
      },
      type: font.type,
      quantity: 1,
    };
    
    addToCart(cartItem);
    setIsAdding(false);
  };

  return (
    <div className={`group/card ${className}`} style={style}>
      <div className="transition-transform duration-300 ease-in group-hover/card:scale-105 h-full flex flex-col">
        <Link href={`/bundles/${font.slug}`}>
          <div className="relative w-full aspect-[3/2] rounded-lg overflow-hidden bg-brand-gray-light">
            <Image
              src={font.imageUrl}
              alt={`Preview of ${font.name} font`}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover"
            />
            {font.discount && <DiscountLabel discount={font.discount} />}
            {font.staffPick && <StaffPickLabel />}
            
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 ease-in"></div>
            <div className="absolute bottom-2 md:bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] opacity-0 transform translate-y-4 group-hover/card:opacity-100 group-hover/card:translate-y-0 transition-all duration-300 ease-in">
              <button 
                onClick={handleAddToCart}
                disabled={isAdding}
                className="w-full flex items-center justify-center gap-1.5 bg-brand-accent text-brand-darkest font-medium py-2 text-xs md:py-2.5 md:text-sm rounded-full hover:brightness-110 transition-all disabled:opacity-70"
              >
                {isAdding ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <ShoppingCart className="w-4 h-4" />
                )}
                <span>{isAdding ? 'Adding...' : 'Add to Cart'}</span>
              </button>
            </div>
          </div>
        </Link>
        
        <div className="pt-4 flex flex-col flex-grow">
          <div className="flex justify-between items-start flex-grow">
            <div className="flex-grow pr-2">
              {/* --- PERUBAHAN DI SINI --- */}
              <h3 
                className="text-base md:text-lg font-medium text-brand-light leading-tight transition-colors duration-300 group-hover/card:text-brand-accent"
                title={font.name}
              >
                {font.name}
              </h3>
              <p className="text-sm text-brand-light-muted mt-1">{font.description}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-lg font-bold text-brand-light flex-shrink-0 transition-colors duration-300 group-hover/card:text-brand-accent">
                ${font.price.toFixed(2)}
              </p>
              {font.originalPrice && (
                <p className="text-sm font-light text-brand-light-muted line-through">
                  ${font.originalPrice.toFixed(2)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BundleCard;