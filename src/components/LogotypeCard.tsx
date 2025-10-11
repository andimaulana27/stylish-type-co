// src/components/LogotypeCard.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export type LogotypeFont = {
  name: string;
  slug: string;
  fontFamily: string;
  url: string;
  initialPreviewText?: string;
};

type LogotypeCardProps = {
  font: LogotypeFont;
  previewText?: string;
};

const LogotypeCard = ({ font, previewText }: LogotypeCardProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const [fontSize, setFontSize] = useState(48); 

  useEffect(() => {
    const adjustFontSize = () => {
      const container = containerRef.current;
      const text = textRef.current;

      if (!container || !text) return;

      let currentFontSize = 48; 
      text.style.fontSize = `${currentFontSize}px`;

      while (text.scrollWidth > container.clientWidth && currentFontSize > 12) {
        currentFontSize--;
        text.style.fontSize = `${currentFontSize}px`;
      }
      
      setFontSize(currentFontSize);
    };
    
    const timeoutId = setTimeout(adjustFontSize, 100); 
    window.addEventListener('resize', adjustFontSize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', adjustFontSize);
    };
  }, [previewText, font.fontFamily]);

  // --- PERBAIKAN UTAMA DI SINI ---
  // 1. Buat nama tampilan yang bersih (dipotong) menggunakan Regex yang andal.
  const displayName = font.name.split(/\s*[-–—]\s*/)[0].trim();
  
  // 2. Jika ada `previewText` dari input pengguna, gunakan itu. Jika tidak, gunakan `displayName`.
  const displayText = previewText || displayName;
  // --- AKHIR PERBAIKAN ---

  return (
    <Link 
      href={`/product/${font.slug}`}
      className="text-center group p-4 rounded-lg transition-all duration-300 ease-in-out hover:bg-white/5 hover:scale-105"
    >
      <div
        ref={containerRef}
        className="h-32 flex items-center justify-center overflow-hidden"
      >
        <p
          ref={textRef}
          className="text-brand-light break-words transition-colors duration-300 group-hover:text-brand-accent whitespace-nowrap"
          style={{
            fontFamily: `'${font.fontFamily}', sans-serif`,
            fontSize: `${fontSize}px`, 
            lineHeight: '1.2', 
          }}
          title={displayText}
        >
          {/* Tampilkan teks pratinjau yang sudah diproses */}
          {displayText}
        </p>
      </div>
      {/* --- PERBAIKAN: Judul kecil di bawah sekarang menampilkan NAMA LENGKAP --- */}
      <p className="text-sm text-brand-light-muted mt-2">{font.name}</p>
    </Link>
  );
};

export default LogotypeCard;