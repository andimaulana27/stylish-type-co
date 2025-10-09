// src/app/(main)/font-pair/FontPairClientPage.tsx
'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import SectionHeader from '@/components/SectionHeader';
import FontControlRow, { type ControlState } from '@/components/font-pair/FontControlRow';
import DynamicFontLoader from '@/components/font-detail/DynamicFontLoader';
import { type Tables } from '@/lib/database.types';
import Button from '@/components/Button';

type FontForPairing = Pick<Tables<'fonts'>, 'id' | 'name' | 'slug' | 'font_files'>;
type FontFile = { style: string; url: string; };

interface FontPairClientPageProps {
  allFonts: FontForPairing[];
}

const initialControlState: ControlState = {
  font: null,
  styleName: 'Regular',
  style: {},
};

export default function FontPairClientPage({ allFonts }: FontPairClientPageProps) {
  const [headlineState, setHeadlineState] = useState<ControlState>(initialControlState);
  const [subheadlineState, setSubheadlineState] = useState<ControlState>(initialControlState);
  
  const headlineRef = useRef<HTMLDivElement>(null);
  const subheadlineRef = useRef<HTMLDivElement>(null);
  
  // --- PERUBAHAN DI SINI: Tambahkan state untuk ukuran font awal ---
  const [initialHeadlineSize, setInitialHeadlineSize] = useState(72);
  const [initialSubheadlineSize, setInitialSubheadlineSize] = useState(36);

  useEffect(() => {
    // Cek lebar layar hanya di sisi klien
    const handleResize = () => {
      if (window.innerWidth < 768) { // 768px adalah breakpoint 'md' tailwind
        setInitialHeadlineSize(28);
        setInitialSubheadlineSize(16);
      } else {
        setInitialHeadlineSize(72);
        setInitialSubheadlineSize(36);
      }
    };
    
    // Panggil sekali saat komponen dimuat
    handleResize();
    
    // Tambahkan event listener untuk mengubah ukuran jika layar di-resize
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

  const subheadlineFontToLoad = useMemo(() => {
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
            lineHeight: parseInt(((style.lineHeight || '100%') as string).replace('%', '')) / 100,
            direction: 'ltr',
            unicodeBidi: 'isolate'
        });
    }
  }, [headlineState.style]);

  useEffect(() => {
    if (subheadlineRef.current) {
        const style = subheadlineState.style;
        Object.assign(subheadlineRef.current.style, {
            ...style,
            lineHeight: parseInt(((style.lineHeight || '100%') as string).replace('%', '')) / 100,
            direction: 'ltr',
            unicodeBidi: 'isolate'
        });
    }
  }, [subheadlineState.style]);
  
  return (
    <main className="container mx-auto px-6 py-24">
      <style jsx global>{`
        .font-pair-preview:empty::before {
          content: 'Type something to test...';
          color: #a0a0a0;
          pointer-events: none;
          cursor: text;
        }
      `}</style>
      
      <DynamicFontLoader fontFamily={headlineFontToLoad.fontFamily} fontUrl={headlineFontToLoad.url} />
      <DynamicFontLoader fontFamily={subheadlineFontToLoad.fontFamily} fontUrl={subheadlineFontToLoad.url} />

      <SectionHeader
        align="center"
        title="Font Pairing Tester"
        subtitle="Experiment with different font combinations and see how they work together in real time. Our Font Pairing Tester helps you explore headings, subheadings, and body text styles side by side, making it easier to find the perfect match for your design projects."
      />

      <div className="mt-16 space-y-2">
        <FontControlRow
          allFonts={allFonts}
          onControlChange={setHeadlineState}
          initialState={{
            fontId: defaultHeadlineFont.id,
            style: 'Bold',
            // --- PERUBAHAN DI SINI: Gunakan state dinamis ---
            fontSize: initialHeadlineSize,
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
            // --- PERUBAHAN DI SINI: Gunakan state dinamis ---
            fontSize: initialSubheadlineSize,
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
    </main>
  );
}