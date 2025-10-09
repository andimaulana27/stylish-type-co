// src/components/font-detail/TypeTester.tsx
'use client';

import { useState, Fragment, useEffect } from 'react'; // <-- Impor useEffect
import { Listbox, Transition } from '@headlessui/react';
import { ChevronDown, Check } from 'lucide-react';
import * as Slider from '@radix-ui/react-slider';

type TypeTesterProps = {
  fontFamilyRegular: string;
  fontFamilyItalic?: string;
};

const pangramOptions = [
  "The quick brown fox jumps over the lazy dog.",
  "Jackdaws love my big sphinx of quartz.",
  "Grumpy wizards make toxic brew.",
];

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

const RadixStyledSlider = ({ 
  label, 
  value, 
  onValueChange, 
  min, 
  max, 
  step,
  formatValue = (val) => `${val}`,
}: { 
  label: string, 
  value: number, 
  onValueChange: (value: number) => void, 
  min: number, 
  max: number, 
  step: number,
  formatValue?: (val: number) => string,
}) => (
  <div className="flex flex-col gap-2 w-full">
    <label className="text-sm text-brand-light-muted">{label}</label>
    <div className="flex items-center gap-3 h-8">
      <Slider.Root
        className="relative flex items-center select-none touch-none w-full h-5"
        value={[value]}
        onValueChange={([newValue]) => onValueChange(newValue)}
        min={min}
        max={max}
        step={step}
      >
        <Slider.Track className="bg-[#404040] relative grow rounded-full h-[2px]">
          <Slider.Range className="absolute bg-brand-accent rounded-full h-full" />
        </Slider.Track>
        <Slider.Thumb
          className="block w-4 h-4 bg-[#1e1e1e] border-2 border-brand-accent rounded-full focus:outline-none cursor-grab active:cursor-grabbing"
          aria-label={label}
        />
      </Slider.Root>
      <span className="font-medium text-xs ml-1 text-brand-light-muted flex-shrink-0 w-8 text-right">
        {formatValue(value)}
      </span>
    </div>
  </div>
);

interface CustomDropdownProps<TValue extends string> {
  value: TValue;
  onChange: (value: TValue) => void;
  options: { value: TValue; label: string }[];
  disabled?: boolean;
}

const CustomDropdown = <TValue extends string>({
  value,
  onChange,
  options,
  disabled = false,
}: CustomDropdownProps<TValue>) => (
  <Listbox value={value} onChange={onChange} disabled={disabled}>
    {({ open }) => (
      <div className="relative">
        <Listbox.Button className="group w-full appearance-none bg-transparent border border-white/20 text-brand-light rounded-full py-3 px-4 pr-10 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-between items-center text-left hover:border-brand-accent focus:border-brand-accent">
          <span className="truncate">{options.find(o => o.value === value)?.label || value}</span>
          <ChevronDown className={`w-5 h-5 transition-all duration-200 text-brand-light-muted group-hover:text-brand-accent ${open ? 'rotate-180 text-brand-accent' : ''}`} />
        </Listbox.Button>
        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
          <Listbox.Options className="absolute z-10 mt-1 w-full bg-[#1e1e1e] shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            {options.map((option) => (
              <Listbox.Option key={option.value} value={option.value} className={({ active }) => `cursor-pointer select-none relative py-2 pl-10 pr-4 ${active ? 'bg-brand-accent text-brand-darkest' : 'text-brand-light'}`}>
                {({ selected }) => (
                  <>
                    <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{option.label}</span>
                    {selected && <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-brand-accent"><Check size={20} /></span>}
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


export default function TypeTester({ fontFamilyRegular, fontFamilyItalic }: TypeTesterProps) {
  const [fontSize, setFontSize] = useState(70);
  const [lineHeight, setLineHeight] = useState(100);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [selectedText, setSelectedText] = useState(pangramOptions[0]);
  const [customText, setCustomText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeStyle, setActiveStyle] = useState<'Regular' | 'Italic'>('Regular');
  
  // --- PERUBAHAN UTAMA DI SINI ---
  useEffect(() => {
    // Fungsi untuk memeriksa dan mengatur ukuran font berdasarkan lebar layar
    const handleResize = () => {
      if (window.innerWidth < 768) { // 768px adalah breakpoint 'md' di Tailwind
        setFontSize(30); // Set default mobile font size
      } else {
        setFontSize(70); // Set default desktop font size
      }
    };

    // Panggil fungsi sekali saat komponen pertama kali dimuat di client
    handleResize();

    // Tambahkan listener untuk menangani perubahan ukuran jendela (misalnya rotasi layar)
    window.addEventListener('resize', handleResize);

    // Cleanup listener saat komponen di-unmount
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Array kosong berarti efek ini hanya berjalan sekali saat mount
  // --- AKHIR PERUBAHAN ---

  const currentFontFamily = activeStyle === 'Italic' && fontFamilyItalic
    ? fontFamilyItalic
    : fontFamilyRegular;

  const displayedText = isTyping ? customText : selectedText;
  const hasMultipleStyles = !!fontFamilyItalic;

  const styleOptions: { value: 'Regular' | 'Italic'; label: string }[] = [
    { value: 'Regular', label: 'Regular' },
  ];
  if (fontFamilyItalic) {
    styleOptions.push({ value: 'Italic', label: 'Italic' });
  }

  const textOptions = pangramOptions.map(p => ({ value: p, label: truncateText(p, 25) }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-2xl font-medium text-brand-light flex-shrink-0">Type Tester</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <RadixStyledSlider label="Size" value={fontSize} onValueChange={setFontSize} min={12} max={150} step={1} formatValue={(val) => `${val}px`} />
        <RadixStyledSlider label="Line height" value={lineHeight} onValueChange={setLineHeight} min={50} max={200} step={1} formatValue={(val) => `${val}%`} />
        <RadixStyledSlider label="Letter spacing" value={letterSpacing} onValueChange={setLetterSpacing} min={-5} max={25} step={0.1} formatValue={(val) => `${val.toFixed(1)}px`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CustomDropdown<'Regular' | 'Italic'> 
            value={activeStyle} 
            onChange={setActiveStyle} 
            options={styleOptions} 
            disabled={!hasMultipleStyles} 
        />
        <CustomDropdown 
          value={selectedText} 
          onChange={(value) => {
            setSelectedText(value);
            setIsTyping(false);
          }} 
          options={textOptions} 
        />
        
        <input
          type="text"
          placeholder="Or type here to try it out..."
          value={customText}
          onChange={(e) => {
            setCustomText(e.target.value);
            setIsTyping(true);
          }}
          className="w-full bg-transparent border border-white/20 text-brand-light rounded-full py-3 px-4 focus:outline-none focus:border-brand-accent placeholder:text-brand-light-muted"
        />
      </div>

      <div
        className="w-full pt-8 border-t border-white/10 text-brand-light break-words min-h-[100px] flex items-center justify-start text-left"
        style={{
          fontFamily: `'${currentFontFamily}', sans-serif`,
          fontSize: `${fontSize}px`,
          letterSpacing: `${letterSpacing}px`,
          lineHeight: lineHeight / 100,
          fontStyle: activeStyle === 'Italic' ? 'italic' : 'normal',
        }}
      >
        {displayedText || "Type something to test"}
      </div>
    </div>
  );
};