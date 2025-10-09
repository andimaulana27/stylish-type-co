// src/components/font-pair/SharedSlider.tsx
'use client';

import * as Slider from '@radix-ui/react-slider';

const SharedSlider = ({
  label,
  value,
  onValueChange,
  min,
  max,
  step,
  formatValue = (val: number) => `${val}`, // Perbaikan: Menambahkan tipe 'number' pada val
  disabled = false
}: {
  label: string,
  value: number,
  onValueChange: (value: number) => void,
  min: number,
  max: number,
  step: number,
  formatValue?: (val: number) => string, // Perbaikan: Menambahkan tipe 'number' pada val
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
          className={`block w-4 h-4 bg-[#1e1e1e] border-2 border-brand-accent rounded-full focus:outline-none ${disabled ? '' : 'cursor-grab active-cursor-grabbing'}`}
          aria-label={label}
        />
      </Slider.Root>
      <span className="font-medium text-xs ml-1 text-brand-light-muted flex-shrink-0 w-8 text-right">
        {formatValue(value)}
      </span>
    </div>
  </div>
);

export default SharedSlider;