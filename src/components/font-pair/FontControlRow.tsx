// src/components/font-pair/FontControlRow.tsx
'use client';

import { useState, useMemo, useEffect, useRef, Fragment } from 'react';
import { ChevronDown, Search, AlignLeft, AlignCenter, AlignRight, Check } from 'lucide-react';
import { Listbox, Transition } from '@headlessui/react';
import SharedSlider from './SharedSlider';
import { type Tables } from '@/lib/database.types';

type FontForPairing = Pick<Tables<'fonts'>, 'id' | 'name' | 'slug' | 'font_files'>;
type FontFile = { style: string; url: string; };

export type ControlState = {
  font: FontForPairing | null;
  styleName: string;
  style: React.CSSProperties;
};

interface FontControlRowProps {
  allFonts: FontForPairing[];
  onControlChange: (state: ControlState) => void;
  initialState: {
    fontId: string;
    style: string;
    fontSize: number;
    letterSpacing: number;
    lineHeight: number;
    align: 'left' | 'center' | 'right';
  };
  placeholder: string;
}

// Komponen Dropdown Pencarian Font Kustom (Tidak ada perubahan di sini)
const FontSelectorDropdown = ({ fonts, selectedFont, onSelect, placeholder }: {
  fonts: FontForPairing[];
  selectedFont: FontForPairing | null;
  onSelect: (font: FontForPairing) => void;
  placeholder: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredFonts = useMemo(() => {
    return fonts.filter(font => font.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [fonts, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (font: FontForPairing) => {
    onSelect(font);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div ref={dropdownRef} className="relative w-56">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="group w-full h-10 px-4 flex items-center justify-between text-brand-light font-medium rounded-full bg-transparent border border-white/20 hover:border-brand-accent transition-colors"
      >
        <div className="flex items-center gap-2 truncate">
          <Search size={16} className="text-brand-accent flex-shrink-0" />
          <span className="truncate text-sm text-brand-light-muted">{selectedFont?.name || placeholder}</span>
        </div>
        <ChevronDown size={18} className={`text-brand-light-muted transition-all duration-200 group-hover:text-brand-accent ${isOpen ? 'rotate-180 text-brand-accent' : ''}`} />
      </button>
      <Transition
        as={Fragment}
        show={isOpen}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <div className="absolute top-full mt-2 w-full bg-[#1e1e1e] border border-white/20 rounded-md shadow-lg z-20">
          <div className="p-2 border-b border-white/20">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-light-muted" />
              <input type="text" placeholder="Search fonts..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-brand-darkest h-9 pl-10 pr-3 rounded text-sm focus:outline-none focus:ring-1 focus:ring-brand-accent" />
            </div>
          </div>
          <ul className="max-h-60 overflow-y-auto">
            {filteredFonts.map(font => (
              <li key={font.id} onClick={() => handleSelect(font)}
                  className="px-4 py-2 hover:bg-brand-accent/20 cursor-pointer text-sm">
                  {font.name}
              </li>
            ))}
          </ul>
        </div>
      </Transition>
    </div>
  );
};

// Dropdown Style (Tidak ada perubahan di sini)
const StyleSelectorDropdown = ({ styles, selectedStyle, onSelect }: {
  styles: { value: string; label: string }[];
  selectedStyle: string;
  onSelect: (style: string) => void;
}) => (
    <Listbox value={selectedStyle} onChange={onSelect}>
      {({ open }) => (
        <div className="relative w-40">
          <Listbox.Button className="group relative w-full cursor-default rounded-full bg-transparent py-2 pl-3 pr-10 text-left text-brand-light text-sm h-10 border border-white/20 hover:border-brand-accent transition-colors">
            <span className="block truncate">{selectedStyle}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronDown className={`h-5 w-5 text-brand-light-muted transition-all duration-200 group-hover:text-brand-accent ${open ? 'rotate-180 text-brand-accent' : ''}`} aria-hidden="true" />
            </span>
          </Listbox.Button>
          <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-[#1e1e1e] py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-10">
              {styles.map((style) => (
                <Listbox.Option
                  key={style.value}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-brand-accent text-brand-darkest' : 'text-brand-light'
                    }`
                  }
                  value={style.value}
                >
                  {({ selected }) => (
                    <>
                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{style.label}</span>
                      {selected && (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-brand-accent"><Check className="h-5 w-5" aria-hidden="true" /></span>
                      )}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      )}
    </Listbox>
);

export default function FontControlRow({ allFonts, onControlChange, initialState, placeholder }: FontControlRowProps) {
  const [selectedFont, setSelectedFont] = useState<FontForPairing | null>(() => allFonts.find(f => f.id === initialState.fontId) || allFonts[0] || null);
  const [selectedStyle, setSelectedStyle] = useState(initialState.style);
  const [fontSize, setFontSize] = useState(initialState.fontSize);
  const [letterSpacing, setLetterSpacing] = useState(initialState.letterSpacing);
  const [lineHeight, setLineHeight] = useState(initialState.lineHeight);
  const [align, setAlign] = useState<'left' | 'center' | 'right'>(initialState.align);

  const fontStyles = useMemo(() => {
    if (!selectedFont?.font_files) return [{ value: 'Regular', label: 'Regular' }];
    const files = selectedFont.font_files as unknown as FontFile[];
    return files.map(f => ({ value: f.style, label: f.style }));
  }, [selectedFont]);
  
  // --- PERUBAHAN DI SINI: Sinkronisasi state internal dengan prop yang berubah ---
  useEffect(() => {
    setFontSize(initialState.fontSize);
  }, [initialState.fontSize]);
  // --- AKHIR PERUBAHAN ---

  useEffect(() => {
    const fontFamily = selectedFont ? `'${selectedFont.name}'` : 'sans-serif';
    const fontWeight = selectedStyle.toLowerCase().includes('bold') ? 'bold' : 'normal';
    const fontStyle = selectedStyle.toLowerCase().includes('italic') ? 'italic' : 'normal';

    onControlChange({
      font: selectedFont,
      styleName: selectedStyle,
      style: {
        fontFamily, fontWeight, fontStyle,
        fontSize: `${fontSize}px`,
        letterSpacing: `${letterSpacing}px`,
        lineHeight: `${lineHeight}%`,
        textAlign: align,
      }
    });
  }, [selectedFont, selectedStyle, fontSize, letterSpacing, lineHeight, align, onControlChange]);

  useEffect(() => {
    if (selectedFont) {
        const styles = (selectedFont.font_files as unknown as FontFile[]).map(f => f.style);
        const hasStyle = styles.includes(selectedStyle);
        if (!hasStyle) {
          const defaultStyle = styles.find(s => s.toLowerCase() === 'regular') || styles[0];
          if(defaultStyle) setSelectedStyle(defaultStyle);
        }
    }
  }, [selectedFont, selectedStyle]);
  
  return (
    <div className="py-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-4">
            <div className="flex items-center gap-2 flex-shrink-0">
                <FontSelectorDropdown 
                    fonts={allFonts}
                    selectedFont={selectedFont}
                    onSelect={setSelectedFont}
                    placeholder={placeholder}
                />
                <StyleSelectorDropdown 
                    styles={fontStyles}
                    selectedStyle={selectedStyle}
                    onSelect={setSelectedStyle}
                />
            </div>
            
            <div className="flex items-center h-10 gap-1 p-1">
                <button onClick={() => setAlign('left')} className={`p-2 rounded-md transition-colors ${align === 'left' ? 'text-brand-accent' : 'text-brand-light-muted hover:text-white'}`}><AlignLeft size={16} /></button>
                <button onClick={() => setAlign('center')} className={`p-2 rounded-md transition-colors ${align === 'center' ? 'text-brand-accent' : 'text-brand-light-muted hover:text-white'}`}><AlignCenter size={16} /></button>
                <button onClick={() => setAlign('right')} className={`p-2 rounded-md transition-colors ${align === 'right' ? 'text-brand-accent' : 'text-brand-light-muted hover:text-white'}`}><AlignRight size={16} /></button>
            </div>
            
            <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-2 min-w-[300px]">
              <SharedSlider label="Size" value={fontSize} onValueChange={setFontSize} min={12} max={150} step={1} formatValue={(val: number) => `${val}px`} />
              <SharedSlider label="Line height" value={lineHeight} onValueChange={setLineHeight} min={80} max={200} step={1} formatValue={(val: number) => `${val}%`} />
              <SharedSlider label="Letter spacing" value={letterSpacing} onValueChange={setLetterSpacing} min={-10} max={25} step={0.1} formatValue={(val: number) => `${val.toFixed(1)}px`} />
            </div>
        </div>
    </div>
  );
}