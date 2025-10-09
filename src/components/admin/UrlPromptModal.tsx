// src/components/admin/UrlPromptModal.tsx
'use client';

import { useState, Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Link, Youtube } from 'lucide-react';

interface UrlPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string) => void;
  title: string;
  currentValue?: string;
  iconType: 'link' | 'youtube';
}

export const UrlPromptModal = ({ isOpen, onClose, onSubmit, title, currentValue = '', iconType }: UrlPromptModalProps) => {
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      setUrl(currentValue);
    }
  }, [isOpen, currentValue]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(url);
    onClose();
  };
  
  // Fungsi terpisah untuk onClick tombol
  const handleButtonClick = () => {
    onSubmit(url);
    onClose();
  };

  const Icon = iconType === 'link' ? Link : Youtube;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gradient-to-br from-brand-darkest to-brand-primary-blue/30 border border-brand-accent/30 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-brand-light flex items-center gap-2"
                >
                  <Icon className="w-5 h-5 text-brand-accent" />
                  {title}
                </Dialog.Title>
                <form onSubmit={handleFormSubmit}>
                  <div className="mt-4">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full bg-white/5 border border-transparent rounded-full px-4 py-3 text-brand-light placeholder:text-brand-light-muted transition-colors duration-300 focus:outline-none focus:border-brand-accent"
                      autoFocus
                    />
                  </div>

                  <div className="mt-6 flex justify-end gap-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-full border border-transparent bg-white/10 px-4 py-2 text-sm font-medium text-brand-light-muted hover:bg-white/20 focus:outline-none"
                      onClick={onClose}
                    >
                      Cancel
                    </button>
                    {/* --- PERUBAHAN UTAMA DI SINI --- */}
                    <button
                      type="button" // Diubah dari "submit" menjadi "button"
                      onClick={handleButtonClick} // Menggunakan onClick
                      className="inline-flex justify-center rounded-full border border-transparent bg-brand-accent px-6 py-2 text-sm font-semibold text-brand-darkest hover:brightness-110 focus:outline-none"
                    >
                      Submit
                    </button>
                    {/* --- AKHIR PERUBAHAN --- */}
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};