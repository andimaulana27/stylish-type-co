// src/components/font-detail/FontPairingPreview.tsx
'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { type Tables } from '@/lib/database.types';
import DynamicFontLoader from './DynamicFontLoader';
import SectionHeader from '../SectionHeader';
import Button from '../Button';
import FontControlRow, { type ControlState } from '@/components/font-pair/FontControlRow';

type FontForPairing = Pick<Tables<'fonts'>, 'id' | 'name' | 'slug' | 'font_files'>;
type FontFile = { style: string; url: string };

interface FontPairingPreviewProps {
  allFonts: FontForPairing[];
}

const initialControlState: ControlState = {
  font: null,
  styleName: 'Regular',
  style: {},
};

const FontPairingPreview = ({ allFonts }: FontPairingPreviewProps) => {
  const [, setHeadlineText] = useState('');
  const [, setBodyText] = useState('');

  const [headlineState, setHeadlineState] = useState<ControlState>(initialControlState);
  const [subheadlineState, setSubheadlineState] = useState<ControlState>(initialControlState);
  
  const headlineRef = useRef<HTMLDivElement>(null);
  const subheadlineRef = useRef<HTMLDivElement>(null);

  // --- PERUBAHAN DI SINI: Tambahkan state untuk ukuran font awal yang dinamis ---
  const [initialHeadlineSize, setInitialHeadlineSize] = useState(50);
  const [initialSubheadlineSize, setInitialSubheadlineSize] = useState(26);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) { // Breakpoint 'md'
        setInitialHeadlineSize(28); // Ukuran default mobile headline
        setInitialSubheadlineSize(16); // Ukuran default mobile subheadline
      } else {
        setInitialHeadlineSize(50); // Ukuran default desktop headline
        setInitialSubheadlineSize(26); // Ukuran default desktop subheadline
      }
    };
    
    handleResize(); // Panggil saat komponen dimuat
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  // --- AKHIR PERUBAHAN ---

  const defaultHeadlineFont = allFonts.find(f => f.name.toLowerCase().includes('bright kenly')) || allFonts[0];
  const defaultSubheadlineFont = allFonts.find(f => f.name.toLowerCase().includes('mighty swifta')) || allFonts[1] || allFonts[0];

  const headlineFontToLoad = useMemo(() => {
    const font = headlineState.font;
    const styleName = headlineState.styleName;
    const fontFile = (font?.font_files as FontFile[] | undefined)?.find(ff => ff.style === styleName);
    return { fontFamily: font?.name || '', url: fontFile?.url };
  }, [headlineState]);

  const bodyFontToLoad = useMemo(() => {
    const font = subheadlineState.font;
    const styleName = subheadlineState.styleName;
    const fontFile = (font?.font_files as FontFile[] | undefined)?.find(ff => ff.style === styleName);
    return { fontFamily: font?.name || '', url: fontFile?.url };
  }, [subheadlineState]);
  
  useEffect(() => {
    if (headlineRef.current) {
        const style = headlineState.style;
        Object.assign(headlineRef.current.style, {
            ...style,
            lineHeight: parseInt(((style.lineHeight || '100%') as string).replace('%', '')) / 100
        });
    }
  }, [headlineState.style]);

  useEffect(() => {
    if (subheadlineRef.current) {
        const style = subheadlineState.style;
        Object.assign(subheadlineRef.current.style, {
            ...style,
            lineHeight: parseInt(((style.lineHeight || '100%') as string).replace('%', '')) / 100
        });
    }
  }, [subheadlineState.style]);
  
  return (
    <div>
      <style jsx global>{`
        .font-pair-preview:empty::before {
          content: 'Type something to test...';
          color: #a0a0a0;
          pointer-events: none;
          cursor: text;
        }
      `}</style>
        
      <DynamicFontLoader fontFamily={headlineFontToLoad.fontFamily} fontUrl={headlineFontToLoad.url} />
      <DynamicFontLoader fontFamily={bodyFontToLoad.fontFamily} fontUrl={bodyFontToLoad.url} />

      <SectionHeader
          align="left"
          title="Font Pairing Preview"
          subtitle="See how this font works with others from our collection. Select a font below to preview the combination."
      />
      
      <div className="mt-8 border-t border-white/10 pt-8">
        <div className="space-y-2">
            <FontControlRow
              allFonts={allFonts} 
              onControlChange={setHeadlineState}
              initialState={{
                  fontId: defaultHeadlineFont.id,
                  style: 'Bold',
                  fontSize: initialHeadlineSize, // <-- Gunakan state dinamis
                  letterSpacing: 0,
                  lineHeight: 100,
                  align: 'left',
              }}
              placeholder="Search Font Headline..."
            />
            <FontControlRow
              allFonts={allFonts}
              onControlChange={setSubheadlineState}
              initialState={{
                  fontId: defaultSubheadlineFont.id,
                  style: 'Regular',
                  fontSize: initialSubheadlineSize, // <-- Gunakan state dinamis
                  letterSpacing: 0,
                  lineHeight: 100,
                  align: 'left',
              }}
              placeholder="Search Font Pairing..."
            />
        </div>

        <div className="py-12 px-4 flex flex-col -mt-8">
            <div className="flex items-center gap-6">
              <div
                  ref={headlineRef}
                  contentEditable
                  suppressContentEditableWarning={true}
                  onInput={(e) => setHeadlineText(e.currentTarget.textContent || '')}
                  className="font-pair-preview w-full flex-grow bg-transparent text-white outline-none py-4"
                  aria-label="Headline preview text"
              />
              {headlineState.font?.slug && (
                  <Button href={`/fonts/${headlineState.font.slug}`} className="flex-shrink-0 !py-2.5 !px-6 text-sm">
                      Get This Font
                  </Button>
              )}
            </div>

            <div className="flex items-center gap-6 -mt-2">
              <div
                  ref={subheadlineRef}
                  contentEditable
                  suppressContentEditableWarning={true}
                  onInput={(e) => setBodyText(e.currentTarget.textContent || '')}
                  className="font-pair-preview w-full flex-grow bg-transparent text-white outline-none py-4"
                  aria-label="Subheadline preview text"
              />
              {subheadlineState.font?.slug && (
                  <Button href={`/fonts/${subheadlineState.font.slug}`} className="flex-shrink-0 !py-2.5 !px-6 text-sm">
                      Get This Font
                  </Button>
              )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default FontPairingPreview;