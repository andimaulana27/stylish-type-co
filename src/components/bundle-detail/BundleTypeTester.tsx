// src/components/bundle-detail/BundleTypeTester.tsx
'use client';

import { useState, FC, useEffect, Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronDown, Check } from 'lucide-react';
import * as Slider from '@radix-ui/react-slider';

// --- PENAMBAHAN BARU: Tipe Props diperbarui ---
type BundleTypeTesterProps = {
  onPreviewTextChange: (text: string) => void;
  availableStyles: string[];
  activeStyle: string;
  onStyleChange: (style: string) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  lineHeight: number;
  onLineHeightChange: (height: number) => void;
  letterSpacing: number;
  onLetterSpacingChange: (spacing: number) => void;
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

// --- PENAMBAHAN BARU: Komponen RadixStyledSlider dari TypeTester font ---
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
           <span className="truncate">{options.find(o => o.value === value)?.label}</span>
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

const BundleTypeTester: FC<BundleTypeTesterProps> = ({ 
  onPreviewTextChange, 
  availableStyles,
  activeStyle,
  onStyleChange,
  // --- PENAMBAHAN BARU: Menerima props untuk slider ---
  fontSize,
  onFontSizeChange,
  lineHeight,
  onLineHeightChange,
  letterSpacing,
  onLetterSpacingChange
}) => {
  const [pangram, setPangram] = useState("Custom"); 
  const [customText, setCustomText] = useState('');

  useEffect(() => {
    onPreviewTextChange('');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePangramChange = (value: string) => {
    setPangram(value);
    if (value !== "Custom") {
      setCustomText('');
      onPreviewTextChange(value);
    } else {
      onPreviewTextChange(customText);
    }
  };

  const handleCustomTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    setCustomText(newText);
    setPangram("Custom");
    onPreviewTextChange(newText);
  };

  const styleOptions = availableStyles.map(style => ({ value: style, label: style }));
  const textOptions = [
    ...pangramOptions.map(p => ({ value: p, label: truncateText(p, 40) })),
    { value: 'Custom', label: 'Type your own text' }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-medium text-brand-light flex-shrink-0">Type Tester</h3>
      <div className="w-full h-px bg-white/10"></div>
      
      {/* --- PENAMBAHAN BARU: Kontrol Slider --- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <RadixStyledSlider label="Size" value={fontSize} onValueChange={onFontSizeChange} min={12} max={150} step={1} formatValue={(val) => `${val}px`} />
        <RadixStyledSlider label="Line height" value={lineHeight} onValueChange={onLineHeightChange} min={50} max={200} step={1} formatValue={(val) => `${val}%`} />
        <RadixStyledSlider label="Letter spacing" value={letterSpacing} onValueChange={onLetterSpacingChange} min={-5} max={25} step={0.1} formatValue={(val) => `${val.toFixed(1)}px`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CustomDropdown value={activeStyle} onChange={onStyleChange} options={styleOptions} />
        <CustomDropdown value={pangram} onChange={handlePangramChange} options={textOptions} />
        
        <input
          type="text"
          placeholder="Or type here to try it out..."
          value={customText}
          onChange={handleCustomTextChange}
          className="w-full bg-transparent border border-white/20 text-brand-light rounded-full py-3 px-4 focus:outline-none focus:border-brand-accent placeholder:text-brand-light-muted"
        />
      </div>
    </div>
  );
};

export default BundleTypeTester;