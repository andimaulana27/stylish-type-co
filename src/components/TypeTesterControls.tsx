// src/components/TypeTesterControls.tsx
'use client';

import { Listbox, Transition } from '@headlessui/react';
import { ChevronDown, Check } from 'lucide-react';
import { Fragment, useState, useEffect } from 'react';

// Menggunakan Radix Slider yang sudah ada
import * as Slider from '@radix-ui/react-slider';

const RadixStyledSlider = ({ 
  label, 
  value, 
  onValueChange, 
  min, 
  max, 
  step,
  formatValue = (val) => `${val}`,
  disabled = false
}: { 
  label: string, 
  value: number, 
  onValueChange: (value: number) => void, 
  min: number, 
  max: number, 
  step: number,
  formatValue?: (val: number) => string,
  disabled?: boolean
}) => (
  <div className={`flex flex-col gap-2 w-full ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
    <label className="text-sm text-brand-light-muted">{label}</label>
    <div className="flex items-center gap-3 h-8">
      <Slider.Root
        className="relative flex items-center select-none touch-none w-full h-5"
        value={[value]}
        onValueChange={([newValue]) => onValueChange(newValue)}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
      >
        <Slider.Track className="bg-[#404040] relative grow rounded-full h-[2px]">
          <Slider.Range className="absolute bg-brand-accent rounded-full h-full" />
        </Slider.Track>
        <Slider.Thumb
          className={`block w-4 h-4 bg-[#1e1e1e] border-2 border-brand-accent rounded-full focus:outline-none ${disabled ? '' : 'cursor-grab active:cursor-grabbing'}`}
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
      <div className={`relative ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <Listbox.Button className="group w-full appearance-none bg-white/5 text-brand-light rounded-full py-2 px-4 pr-10 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-between items-center text-left hover:border-brand-accent focus:border-brand-accent text-sm">
          <span className="truncate">{options.find(o => o.value === value)?.label}</span>
          <ChevronDown className={`w-4 h-4 transition-all duration-200 text-brand-light-muted group-hover/text-brand-accent ${open ? 'rotate-180 text-brand-accent' : ''}`} />
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


type TypeTesterControlsProps = {
    isDisabled: boolean;
    fontSize: number;
    setFontSize: (size: number) => void;
    setPreviewText: (text: string) => void;
}

const pangramOptions = [
  "The quick brown fox jumps over the lazy dog.",
  "Jackdaws love my big sphinx of quartz.",
  "Grumpy wizards make toxic brew.",
];
const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

const TypeTesterControls = ({ isDisabled, fontSize, setFontSize, setPreviewText }: TypeTesterControlsProps) => {
    // --- PERUBAHAN 1: Ganti state awal menjadi 'Custom' ---
    const [textSelection, setTextSelection] = useState("Custom");
    const [customText, setCustomText] = useState('');

    useEffect(() => {
        if (!isDisabled) {
            // --- PERUBAHAN 2: Pastikan teks pratinjau kosong saat 'Custom' dipilih dan input kosong ---
            if (textSelection === 'Custom') {
                setPreviewText(customText);
            } else {
                setPreviewText(textSelection);
            }
        } else {
            setPreviewText('');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDisabled, customText, textSelection]);


    const textOptions = [
      ...pangramOptions.map(p => ({ value: p, label: truncateText(p, 25) })),
      { value: 'Custom', label: 'Type your own text' }
    ];

    const handleSelectionChange = (value: string) => {
      setTextSelection(value);
      if (value !== 'Custom') {
        setCustomText('');
        setPreviewText(value);
      } else {
        setPreviewText(customText);
      }
    }

    const handleCustomTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setCustomText(e.target.value);
      setTextSelection('Custom');
      setPreviewText(e.target.value);
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <RadixStyledSlider
                label="Font Size"
                value={fontSize}
                onValueChange={setFontSize}
                min={12} max={120} step={1}
                formatValue={(val) => `${val}px`}
                disabled={isDisabled}
            />
            <CustomDropdown
                value={textSelection}
                onChange={handleSelectionChange}
                options={textOptions}
                disabled={isDisabled}
            />
             <input
                type="text"
                placeholder="Type here..."
                value={customText}
                onChange={handleCustomTextChange}
                disabled={isDisabled}
                className="w-full bg-white/5 border border-transparent rounded-full py-2 px-4 text-sm text-brand-light placeholder:text-brand-light-muted transition-colors duration-300 focus:outline-none focus:border-brand-accent disabled:opacity-50 disabled:cursor-not-allowed"
            />
        </div>
    );
}

export default TypeTesterControls;