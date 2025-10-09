// src/components/font-detail/ProductTitle.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export default function ProductTitle({ title }: { title: string }) {
  // State untuk menyimpan ukuran font yang sudah dihitung secara dinamis
  const [fontSize, setFontSize] = useState('3rem'); // Ukuran default desktop (lg:text-5xl)
  const h1Ref = useRef<HTMLHeadingElement>(null);

  // Gunakan useCallback agar fungsi tidak dibuat ulang di setiap render
  const adjustFontSize = useCallback(() => {
    const h1Element = h1Ref.current;
    if (!h1Element) return;

    // Reset gaya agar pengukuran akurat
    h1Element.style.fontSize = '';

    // Tentukan ukuran font maksimum berdasarkan lebar layar
    const maxFontSize = window.innerWidth < 1024 ? 36 : 48; // 36px untuk mobile (text-4xl), 48px untuk desktop (text-5xl)
    const minFontSize = 18; // Ukuran font minimum yang diizinkan

    let currentSize = maxFontSize;

    // Loop untuk mengurangi ukuran font hingga teks muat dalam 2 baris
    // Kita cek apakah tinggi elemen (scrollHeight) lebih besar dari tinggi 2 baris (clientHeight)
    while (currentSize > minFontSize) {
      h1Element.style.fontSize = `${currentSize}px`;
      // Jika tinggi scroll tidak lebih besar dari tinggi elemen, berarti teks sudah muat
      if (h1Element.scrollHeight <= h1Element.clientHeight) {
        break;
      }
      currentSize--; // Kurangi ukuran dan coba lagi
    }
    
    // Set ukuran font final ke state (atau langsung ke style)
    setFontSize(`${currentSize}px`);
  }, [title]);

  // Jalankan penyesuaian saat judul berubah atau saat ukuran jendela diubah
  useEffect(() => {
    adjustFontSize();
    window.addEventListener('resize', adjustFontSize);
    return () => window.removeEventListener('resize', adjustFontSize);
  }, [title, adjustFontSize]);

  return (
    <h1
      ref={h1Ref}
      className="font-medium text-brand-light"
      // Hapus styling -webkit-line-clamp dan ganti dengan styling untuk wrapping
      style={{
        fontSize: fontSize, // Terapkan ukuran font dinamis dari state
        lineHeight: 1.2,
        maxHeight: 'calc(2 * 1.2em * 1.2)', // Batasi tinggi maksimal untuk sekitar 2 baris
        overflow: 'hidden', // Sembunyikan teks yang mungkin masih overflow saat kalkulasi
        wordBreak: 'break-word',
        minHeight: '3.5rem', // Jaga tinggi minimum agar layout tidak "loncat"
      }}
    >
      {title}
    </h1>
  );
}