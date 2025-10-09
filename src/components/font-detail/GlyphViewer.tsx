// src/components/font-detail/GlyphViewer.tsx
'use client';

import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';

type GlyphViewerProps = {
  fontFamily: string;
  glyphs: string[]; 
};

type CategorizedGlyphs = {
  'Alternates & Ligatures': string[];
  Letters: string[];
  Numbers: string[];
  Punctuation: string[];
  Symbols: string[];
};

type Category = keyof CategorizedGlyphs;

const INITIAL_VISIBLE_GLYPHS = 96;

const GlyphCategorySection = ({ 
  categoryName, 
  glyphs, 
  fontFamily 
}: { 
  categoryName: string, 
  glyphs: string[], 
  fontFamily: string 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const glyphsToShow = isExpanded ? glyphs : glyphs.slice(0, INITIAL_VISIBLE_GLYPHS);

  const copyToClipboard = (glyph: string) => {
    navigator.clipboard.writeText(glyph);
    toast.success(`Glyph "${glyph}" copied to clipboard!`);
  };
  
  if (glyphs.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="border-b border-white/10 pb-2">
        <h4 className="text-xl font-medium text-brand-light">{categoryName}</h4>
      </div>
      <div
        className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2 text-center text-4xl"
        style={{ fontFamily: `'${fontFamily}', sans-serif` }}
      >
        {glyphsToShow.map((char, index) => (
          <div
            key={`${categoryName}-${index}`}
            onClick={() => copyToClipboard(char)}
            className="flex items-center justify-center aspect-square bg-white/5 rounded-md cursor-pointer hover:bg-brand-accent hover:text-brand-darkest transition-colors"
            title="Click to copy"
          >
            {char}
          </div>
        ))}
      </div>
      {glyphs.length > INITIAL_VISIBLE_GLYPHS && (
        <div className="text-center mt-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-8 py-3 font-medium rounded-full text-center bg-brand-accent text-brand-darkest transition-all duration-300 ease-in-out hover:brightness-110 hover:shadow-lg hover:shadow-brand-accent/30"
          >
            {isExpanded ? 'Show Less' : `Show All ${glyphs.length} Glyphs`}
          </button>
        </div>
      )}
    </div>
  );
};


const GlyphViewer = ({ fontFamily, glyphs }: GlyphViewerProps) => {
  
  const categorizedGlyphs = useMemo<CategorizedGlyphs>(() => {
    const categories: CategorizedGlyphs = {
      'Alternates & Ligatures': [],
      Letters: [],
      Numbers: [],
      Punctuation: [],
      Symbols: [],
    };
    
    glyphs.forEach((char) => {
      const code = char.charCodeAt(0);
      
      if (char.length > 1 || (code >= 0xE000 && code <= 0xF8FF) || (code >= 0xFB00 && code <= 0xFB4F)) {
        categories['Alternates & Ligatures'].push(char);
      }
      else if (/\p{L}/u.test(char)) {
        categories.Letters.push(char);
      }
      else if (/\p{N}/u.test(char)) {
        categories.Numbers.push(char);
      }
      else if (/\p{P}/u.test(char)) {
        categories.Punctuation.push(char);
      }
      else {
        categories.Symbols.push(char);
      }
    });

    return categories;
  }, [glyphs]);


  const categoriesToShow: Category[] = ['Alternates & Ligatures', 'Letters', 'Numbers', 'Punctuation', 'Symbols'];

  if (!glyphs || glyphs.length === 0) {
    return <p className="text-center text-brand-light-muted">No scannable glyphs found in this font.</p>;
  }

  return (
    <div className="flex flex-col h-full gap-12">
      {/* --- <Toaster /> DIHAPUS DARI SINI --- */}
      {categoriesToShow.map((categoryName) => (
        <GlyphCategorySection
          key={categoryName}
          categoryName={categoryName}
          glyphs={categorizedGlyphs[categoryName]}
          fontFamily={fontFamily}
        />
      ))}
    </div>
  );
};

export default GlyphViewer;