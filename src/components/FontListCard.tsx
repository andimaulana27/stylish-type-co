// src/components/FontListCard.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { ProductData } from '@/lib/dummy-data';
import DynamicFontLoader from '@/components/font-detail/DynamicFontLoader';
import { Tables } from '@/lib/database.types';

type FontFile = { style: string; url: string; };

type FontListCardProps = {
  font: ProductData & { font_files: Tables<'fonts'>['font_files'] };
  previewText: string;
  fontSize: number;
};

const FontListCard = ({ font, previewText, fontSize }: FontListCardProps) => {
  const fontFiles = (font.font_files as FontFile[]) || [];
  
  let regularFont = fontFiles.find(f => f.style.toLowerCase() === 'regular');
  if (!regularFont) {
    regularFont = fontFiles.find(f => f.style.toLowerCase() === 'medium');
  }
  if (!regularFont && fontFiles.length > 0) {
    regularFont = fontFiles[0];
  }

  const dynamicFontFamily = regularFont ? `dynamic-${font.slug}-regular-list` : 'sans-serif';

  // --- PERBAIKAN UTAMA DI SINI: Menggunakan Regex yang lebih andal ---
  // Regex ini akan memotong string pada karakter -, –, atau — dengan atau tanpa spasi
  const displayName = font.name.split(/\s*[-–—]\s*/)[0].trim();
  // --- AKHIR PERBAIKAN ---

  return (
    <>
      {regularFont && <DynamicFontLoader fontFamily={dynamicFontFamily} fontUrl={regularFont.url} />}
      <div className="group/card flex flex-col md:flex-row items-start w-full gap-8 py-6 border-b border-white/10">
        <div className="w-full md:w-1/4 flex-shrink-0">
          <Link href={`/product/${font.slug}`}>
            <div className="relative w-full aspect-[3/2] rounded-lg overflow-hidden bg-brand-gray-light">
              <Image
                src={font.imageUrl}
                alt={`Preview of ${font.name}`}
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover transition-transform duration-300 group-hover/card:scale-105"
              />
            </div>
          </Link>
        </div>
        <div className="w-full md:w-3/4 flex flex-col justify-center">
          <div className="flex justify-between items-start w-full mb-2">
            <div>
              {/* --- PERBAIKAN: Judul dikembalikan untuk menampilkan nama LENGKAP --- */}
              <h3 className="font-medium text-lg text-brand-light transition-colors duration-300 group-hover/card:text-brand-accent">
                <Link href={`/product/${font.slug}`}>{font.name}</Link>
              </h3>
              <p className="text-sm text-brand-light-muted mt-1">{font.description}</p>
            </div>
            <div className="text-right flex-shrink-0">
                <p className="text-lg font-bold text-brand-accent">
                  ${font.price.toFixed(2)}
                </p>
                {font.originalPrice && (
                  <p className="text-sm font-light text-brand-light-muted line-through">
                    ${font.originalPrice.toFixed(2)}
                  </p>
                )}
            </div>
          </div>
          <div className="w-full">
            <p
              className="text-brand-light break-words transition-colors duration-300 group-hover/card:text-brand-accent"
              style={{
                fontFamily: `'${dynamicFontFamily}', sans-serif`,
                fontSize: `${fontSize}px`,
                lineHeight: 1.2,
              }}
              title={previewText || displayName}
            >
              {previewText || displayName}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default FontListCard;