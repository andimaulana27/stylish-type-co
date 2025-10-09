// src/components/LogotypeGridClient.tsx
'use client';

import React, { useState } from 'react';
import type { LogotypeFont } from './LogotypeCard';
import LogotypeCard from './LogotypeCard';
import Button from './Button';
import SectionHeader from './SectionHeader';

type LogotypeGridClientProps = {
  previewFonts: LogotypeFont[];
  config: {
    title: string | null;
    subtitle: string | null;
  } | null;
};

const LogotypeGridClient = ({ previewFonts}: LogotypeGridClientProps) => {
  const [previewText, setPreviewText] = useState('');

  return (
    <section className="py-20 text-center bg-brand-dark-secondary text-brand-light">
      <style jsx global>{`
        ${previewFonts.map(font => `
          @font-face {
            font-family: '${font.fontFamily}';
            src: url('${font.url}');
            font-display: swap;
          }
        `).join('')}
      `}</style>
      <div className="container mx-auto px-6">
        <SectionHeader
          title={<>Find the Right Typeface to Make <br /> Your Logo Stand Out</>}
          subtitle={<>Type in your logo name and see how it looks using <br /> our premium font styles.</>}
        />
        
        <div className="max-w-2xl mx-auto -mt-6 mb-12">
          <input
            type="text"
            placeholder="Write something here..."
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            className="bg-transparent border-b-2 border-brand-gray-light text-center text-4xl font-medium text-brand-light placeholder:text-brand-light-muted placeholder:text-3xl placeholder:font-light focus:outline-none focus:border-brand-accent transition-colors duration-300 pb-4 w-full"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12 mt-16">
          {previewFonts.map((font) => (
            <LogotypeCard 
              key={font.slug} 
              font={font} 
              // --- PERBAIKAN DI SINI: Hanya teruskan `previewText` dari input pengguna ---
              previewText={previewText}
            />
          ))}
        </div>
        <div className="mt-16">
          <Button href="/logotype">View All Logotype</Button>
        </div>
      </div>
    </section>
  );
};

export default LogotypeGridClient;