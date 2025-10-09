// src/components/admin/dashboard/DashboardHeader.tsx
'use client';

import { useState, Fragment, ReactNode } from 'react';
import { Calendar as CalendarIcon, Loader2, ChevronDown, Check } from 'lucide-react';
import { DateRange, DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import 'react-day-picker/dist/style.css';
import { Menu, Transition, Dialog } from '@headlessui/react';

interface DashboardHeaderProps {
    // --- PERUBAHAN: Menambahkan title dan subtitle sebagai props ---
    title: ReactNode;
    subtitle: string;
    // --- AKHIR PERUBAHAN ---
    selectedPreset: string;
    setSelectedPreset: (preset: string) => void;
    dateRange: DateRange | undefined;
    setDateRange: (date: DateRange | undefined) => void;
    isLoading: boolean;
    displayLabel: string;
}

const datePresets = [
    { key: 'last7days', label: 'Last 7 days' },
    { key: 'last30days', label: 'Last 30 days' },
    { key: 'thisMonth', label: 'This month' },
    { key: 'lastMonth', label: 'Last month' },
    { key: 'last6months', label: 'Last 6 months' },
    { key: 'thisYear', label: 'This year' },
    { key: 'lastYear', label: 'Last year' },
    { key: 'allTime', label: 'All time' },
];

const DashboardHeader = ({ title, subtitle, selectedPreset, setSelectedPreset, dateRange, setDateRange, isLoading, displayLabel }: DashboardHeaderProps) => {
    const [isCustomModalOpen, setCustomModalOpen] = useState(false);

    const handlePresetSelect = (presetKey: string) => {
        if (presetKey === 'custom') {
            setCustomModalOpen(true);
        } else {
            setSelectedPreset(presetKey);
        }
    };
    
    const handleCustomDateSelect = (selectedRange: DateRange | undefined) => {
        if (selectedRange?.from && selectedRange?.to) {
            setDateRange(selectedRange);
            setSelectedPreset('custom');
            setCustomModalOpen(false);
        } else {
            setDateRange(selectedRange);
        }
    };

    return (
        <>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    {/* --- PERUBAHAN: Menggunakan title dan subtitle dari props --- */}
                    <h1 className="text-3xl font-bold text-brand-light">
                        {title}
                    </h1>
                    <p className="text-base mt-1 text-brand-light-muted">
                        {subtitle}
                    </p>
                    {/* --- AKHIR PERUBAHAN --- */}
                </div>
                
                <Menu as="div" className="relative inline-block text-left z-40">
                  {({ open }) => (
                    <>
                      <div>
                        <Menu.Button 
                          className="inline-flex w-72 justify-center items-center gap-x-2 rounded-lg bg-brand-darkest border border-white/10 px-5 py-2.5 text-base font-medium text-brand-light shadow-sm hover:border-brand-accent transition-colors duration-200 group"
                        >
                          <CalendarIcon size={18} className="text-brand-light-muted group-hover:text-brand-accent transition-colors duration-200" />
                          <span className="group-hover:text-brand-accent transition-colors duration-200 flex-grow text-left truncate">
                            {displayLabel}
                          </span>
                          {isLoading ? (
                              <Loader2 size={18} className="animate-spin" />
                          ) : (
                              <ChevronDown 
                                className={`h-5 w-5 text-brand-light-muted group-hover:text-brand-accent transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                                aria-hidden="true" 
                              />
                          )}
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
                        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-[#1e1e1e] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <div className="py-1">
                            {datePresets.map((option) => (
                              <Menu.Item key={option.key}>
                                {({ active }) => (
                                    <button
                                      onClick={() => handlePresetSelect(option.key)}
                                      className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 transition-colors duration-150 ${active ? 'bg-brand-accent text-brand-darkest' : selectedPreset === option.key ? 'text-brand-accent' : 'text-brand-light'}`}
                                    >
                                      <div className="w-5 flex-shrink-0">
                                        {selectedPreset === option.key && <Check size={16} className={active ? 'text-brand-darkest' : 'text-brand-accent'} />}
                                      </div>
                                      <span>{option.label}</span>
                                    </button>
                                )}
                              </Menu.Item>
                            ))}
                            <div className="border-t border-white/10 my-1"></div>
                             <Menu.Item>
                                {({ active }) => (
                                    <button
                                      onClick={() => handlePresetSelect('custom')}
                                      className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 transition-colors duration-150 ${active ? 'bg-brand-accent text-brand-darkest' : 'text-brand-light'}`}
                                    >
                                      <div className="w-5 flex-shrink-0" />
                                      <span>Custom...</span>
                                    </button>
                                )}
                              </Menu.Item>
                          </div>
                        </Menu.Items>
                      </Transition>
                    </>
                  )}
                </Menu>
            </header>

            <Transition appear show={isCustomModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setCustomModalOpen(false)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black/60" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <Dialog.Panel className="w-auto transform overflow-hidden rounded-lg bg-brand-darkest border border-white/10 p-4 text-left align-middle shadow-xl transition-all">
                                     <style>{`.rdp { --rdp-cell-size: 38px; --rdp-accent-color: #f47253; --rdp-background-color: #3b4083; --rdp-border-radius: 6px; color: #FFFFFF; } .rdp-day:focus-visible:not([aria-selected="true"]), .rdp-button:focus-visible:not([aria-disabled="true"]) { outline-color: var(--rdp-accent-color); outline-style: solid; outline-width: 2px; outline-offset: 2px; border-radius: var(--rdp-border-radius); }`}</style>
                                    <DayPicker
                                        mode="range"
                                        defaultMonth={dateRange?.from}
                                        selected={dateRange}
                                        onSelect={handleCustomDateSelect}
                                        numberOfMonths={2}
                                        disabled={{ after: new Date() }}
                                        classNames={{
                                            months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                                            month: 'space-y-4', caption: 'flex justify-center pt-1 relative items-center', caption_label: 'text-sm font-medium text-brand-accent',
                                            nav: 'space-x-1 flex items-center', nav_button: 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-brand-accent',
                                            table: 'w-full border-collapse space-y-1', head_row: 'flex', head_cell: 'text-brand-light-muted rounded-md w-9 font-normal text-[0.8rem]',
                                            row: 'flex w-full mt-2', cell: 'h-9 w-9 text-center text-sm p-0 relative',
                                            day: 'h-9 w-9 p-0 font-normal rounded-md text-brand-light hover:bg-brand-dark-secondary', day_selected: 'font-bold !text-brand-darkest',
                                            day_range_start: '!bg-brand-accent rounded-l-md rounded-r-none', day_range_end: '!bg-brand-accent rounded-r-md rounded-l-none',
                                            day_range_middle: 'bg-brand-accent/30 !text-brand-light rounded-none', day_today: 'text-brand-accent font-bold border border-brand-accent/50 rounded-md',
                                            day_outside: 'text-brand-light-muted opacity-50', day_disabled: 'text-brand-light-muted opacity-50', day_hidden: 'invisible',
                                        }}
                                    />
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
};

export default DashboardHeader;