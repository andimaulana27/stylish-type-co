// src/components/bundle-detail/BundleFontsPreview.tsx
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import DynamicFontLoader from '@/components/font-detail/DynamicFontLoader';
import BundleTypeTester from '@/components/bundle-detail/BundleTypeTester';
import React from 'react';

export type FontStyle = {
  styleName: string;
  fontFamily: string;
  url: string;
};

export type GroupedFont = {
  familyName: string;
  slug?: string; 
  styles: FontStyle[];
};

const INITIAL_VISIBLE_FONTS = 20;

const FontFamilyRow = ({ family, previewText, activeStyle, fontSize, lineHeight, letterSpacing }: { 
  family: GroupedFont, 
  previewText: string, 
  activeStyle: string,
  fontSize: number,
  lineHeight: number,
  letterSpacing: number
}) => {
  
  const styleToDisplay = useMemo(() => {
    let bestMatch = family.styles.find(s => s.styleName.toLowerCase() === activeStyle.toLowerCase());
    if (bestMatch) return bestMatch;
    bestMatch = family.styles.find(s => s.styleName.toLowerCase().includes(activeStyle.toLowerCase()));
    if (bestMatch) return bestMatch;
    bestMatch = family.styles.find(s => s.styleName.toLowerCase() === 'regular');
    if (bestMatch) return bestMatch;
    return family.styles[0];
  }, [family.styles, activeStyle]);

  // --- PERUBAHAN UTAMA DI SINI ---
  // Wrapper sekarang selalu div dengan kelas 'group/row' untuk efek hover yang konsisten.
  // Tautan hanya akan dirender di dalamnya jika 'slug' ada.
  const content = (
    <div className="border-b border-white/10 py-6 px-4 -mx-4 rounded-lg transition-colors duration-200 group-hover/row:bg-white/5">
      <div className="flex justify-between items-center mb-3">
        <p className="text-sm text-brand-light-muted">{family.familyName}</p>
        <p className="text-sm font-medium text-brand-accent">{styleToDisplay.styleName}</p>
      </div>
      <p
        className="text-brand-light break-words transition-colors duration-300 group-hover/row:text-brand-accent"
        style={{ 
          fontFamily: `'${styleToDisplay.fontFamily}', sans-serif`,
          fontSize: `${fontSize}px`,
          lineHeight: lineHeight / 100,
          letterSpacing: `${letterSpacing}px`,
          fontStyle: styleToDisplay.styleName.toLowerCase().includes('italic') ? 'italic' : 'normal'
        }}
        title={previewText || family.familyName}
      >
        {previewText || family.familyName}
      </p>
    </div>
  );
  // --- AKHIR PERUBAHAN ---

  return (
    <>
      {family.styles.map(style => (
        <DynamicFontLoader key={style.fontFamily} fontFamily={style.fontFamily} fontUrl={style.url} />
      ))}
      <div className="block group/row">
        {family.slug ? (
          <Link href={`/product/${family.slug}`} className="block">
            {content}
          </Link>
        ) : (
          content
        )}
      </div>
    </>
  );
};


const BundleFontsPreview = ({ groupedFonts }: { groupedFonts: GroupedFont[] }) => {
  const [previewText, setPreviewText] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [activeStyle, setActiveStyle] = useState('Regular');
  const [fontSize, setFontSize] = useState(48);
  const [lineHeight, setLineHeight] = useState(100);
  const [letterSpacing, setLetterSpacing] = useState(0);

  const availableStyles = useMemo(() => {
    const styles = new Set<string>();
    groupedFonts.forEach(family => {
      family.styles.forEach(style => {
        if (style.styleName.toLowerCase().includes('italic')) styles.add('Italic');
        if (style.styleName.toLowerCase().includes('bold')) styles.add('Bold');
        styles.add('Regular');
      });
    });
    return ['Regular', ...Array.from(styles).filter(s => s !== 'Regular').sort()];
  }, [groupedFonts]);

  const fontsToShow = showAll ? groupedFonts : groupedFonts.slice(0, INITIAL_VISIBLE_FONTS);

  return (
    <>
        <BundleTypeTester 
          onPreviewTextChange={setPreviewText}
          availableStyles={availableStyles}
          activeStyle={activeStyle}
          onStyleChange={setActiveStyle}
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
          lineHeight={lineHeight}
          onLineHeightChange={setLineHeight}
          letterSpacing={letterSpacing}
          onLetterSpacingChange={setLetterSpacing}
        />
        
        <div className='mt-16'>
            <h2 className="text-3xl font-medium text-brand-light mb-2 text-left">Fonts Included ({groupedFonts.length})</h2>
            <div className="w-16 h-1 bg-brand-accent text-left my-4"></div>
            
            <div className="flex flex-col">
                {fontsToShow.map((fontFamilyGroup) => (
                  <FontFamilyRow 
                    key={fontFamilyGroup.familyName} 
                    family={fontFamilyGroup} 
                    previewText={previewText}
                    activeStyle={activeStyle}
                    fontSize={fontSize}
                    lineHeight={lineHeight}
                    letterSpacing={letterSpacing}
                  />
                ))}
            </div>

            {groupedFonts.length > INITIAL_VISIBLE_FONTS && (
                <div className="text-center mt-12">
                <button
                    onClick={() => setShowAll(!showAll)}
                    className="px-8 py-3 font-medium rounded-full text-center bg-brand-accent text-brand-darkest transition-all duration-300 ease-in-out transform hover:brightness-110 hover:shadow-lg hover:shadow-brand-accent/30"
                >
                    {showAll ? 'Show Less' : `View All ${groupedFonts.length} Font Families`}
                </button>
                </div>
            )}
        </div>
    </>
  );
};

export default BundleFontsPreview;