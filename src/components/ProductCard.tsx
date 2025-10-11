// src/components/ProductCard.tsx
'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import Link from 'next/link';
import { Percent, ShoppingCart, Loader2 } from 'lucide-react';
import type { ProductData } from '@/lib/dummy-data';
import StaffPickIcon from './icons/StaffPickIcon';
import { useUI } from '@/context/UIContext';
import { useAuth } from '@/context/AuthContext';
import { getStandardLicenseAction } from '@/app/actions/licenseActions';
import toast from 'react-hot-toast';

type ProductCardProps = {
  font: ProductData;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
};

const StaffPickLabel = () => (
  <div className="absolute top-2 right-2 bg-brand-secondary-purple text-white text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1 z-10 md:text-xs md:px-3 md:py-1.5 md:gap-1.5">
    <StaffPickIcon className="w-3 h-3 md:w-4 md:h-4" />
    <span>Staff Picks</span>
  </div>
);

const DiscountLabel = ({ discount }: { discount: string }) => (
  <div className="absolute top-2 left-2 bg-brand-secondary-red text-white text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-0.5 z-10 md:text-xs md:px-3 md:py-1.5 md:gap-1">
    <Percent size={10} className="md:w-3.5 md:h-3.5" />
    <span>{discount}</span>
  </div>
);

const ProductCard = ({ font, className = '', style, priority = false }: ProductCardProps) => {
  const { addToCart } = useUI();
  const { activeSubscription } = useAuth();
  const [isAdding, setIsAdding] = useState(false);

  const href = font.type === 'bundle' 
    ? `/bundles/${font.slug}` 
    : `/product/${font.slug}`;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAdding(true);

    const { license, error } = await getStandardLicenseAction();
    
    if (error || !license) {
      toast.error(error || 'Could not find standard license.');
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
        <Link href={href}>
          <div className="relative w-full aspect-[3/2] rounded-lg overflow-hidden bg-brand-gray-light">
            <Image
              src={font.imageUrl}
              alt={`Preview of ${font.name} font`}
              fill
              // --- PERUBAHAN UTAMA DI SINI ---
              // Ini memberitahu browser ukuran gambar yang sebenarnya berdasarkan layout grid
              // 50vw: di layar kecil (2 kolom), gambar memakan 50% lebar viewport
              // 25vw: di layar besar (4 kolom), gambar memakan 25% lebar viewport
              sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 25vw"
              // --- AKHIR PERUBAHAN ---
              className="object-cover"
              priority={priority}
            />
            {font.discount && <DiscountLabel discount={font.discount} />}
            {font.staffPick && <StaffPickLabel />}

            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 ease-in"></div>
            
            {(!activeSubscription || font.type === 'bundle') && (
              <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] md:w-[calc(100%-2rem)] opacity-0 transform translate-y-4 group-hover/card:opacity-100 group-hover/card:translate-y-0 transition-all duration-300 ease-in">
                <button 
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className="w-full flex items-center justify-center gap-1.5 bg-brand-accent text-brand-darkest font-medium py-2 text-xs md:py-2.5 md:text-sm rounded-full hover:brightness-110 transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-brand-accent/30 disabled:opacity-70"
                >
                  {isAdding ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <ShoppingCart size={14} />
                  )}
                  <span>{isAdding ? 'Adding...' : 'Add to Cart'}</span>
                </button>
              </div>
            )}

          </div>
        </Link>
        
        <div className="pt-4 h-28 flex flex-col">
          <div className="flex justify-between items-start flex-grow">
            <div className="flex-grow pr-2">
              <h3 className="font-medium text-base md:text-lg text-brand-light transition-colors duration-300 group-hover/card:text-brand-accent leading-tight">
                {font.name}
              </h3>
              <p className="text-sm text-brand-light-muted mt-1">
                {font.type === 'bundle' ? 'Bundle' : font.description}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-lg font-medium text-brand-light transition-colors duration-300 group-hover/card:text-brand-accent">
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

export default ProductCard;