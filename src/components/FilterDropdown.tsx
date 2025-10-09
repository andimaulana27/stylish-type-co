// src/components/FilterDropdown.tsx
'use client';

import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDown, Check } from 'lucide-react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

interface FilterDropdownProps {
  paramName: string;
  options: string[];
  label: string;
}

export default function FilterDropdown({ paramName, options, label }: FilterDropdownProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const selectedValue = searchParams.get(paramName) || options[0];

  const handleSelect = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1'); 
    if (value === options[0]) {
      params.delete(paramName);
    } else {
      params.set(paramName, value);
    }
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      {({ open }) => (
        <>
          <div>
            <Menu.Button 
              className="inline-flex w-full justify-center gap-x-1.5 rounded-full bg-white/5 px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-white/10 hover:bg-white/10 transition-colors duration-200 group"
            >
              <span className="group-hover:text-brand-accent transition-colors duration-200">
                <span className="hidden md:inline">{label}: </span>
                <span>{selectedValue}</span>
              </span>
              <ChevronDown 
                className={`-mr-1 h-5 w-5 text-brand-light-muted group-hover:text-brand-accent transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                aria-hidden="true" 
              />
            </Menu.Button>
          </div>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            {/* --- PERUBAHAN DI SINI: Mengubah posisi dropdown dari kanan ke kiri --- */}
            <Menu.Items className="absolute left-0 z-10 mt-2 w-56 origin-top-left rounded-md bg-[#1e1e1e] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1">
                {options.map((option) => (
                  <Menu.Item key={option}>
                    {({ active }) => {
                      const isSelected = option === selectedValue;
                      return (
                        <button
                          onClick={() => handleSelect(option)}
                          className={`
                            w-full text-left px-4 py-2 text-sm flex items-center gap-3 transition-colors duration-150
                            ${active ? 'bg-brand-accent text-brand-darkest' : isSelected ? 'text-brand-accent' : 'text-brand-light'}
                          `}
                        >
                          <div className="w-5 flex-shrink-0">
                            {isSelected && <Check size={16} className={active ? 'text-brand-darkest' : 'text-brand-accent'} />}
                          </div>
                          <span>{option}</span>
                        </button>
                      );
                    }}
                  </Menu.Item>
                ))}
              </div>
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  );
}