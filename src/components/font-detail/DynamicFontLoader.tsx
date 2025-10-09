// src/components/font-detail/DynamicFontLoader.tsx
'use client';

type DynamicFontLoaderProps = {
  fontFamily: string;
  fontUrl?: string;
};

const DynamicFontLoader = ({ fontFamily, fontUrl }: DynamicFontLoaderProps) => {
  if (!fontUrl) {
    return null;
  }

  // Komponen ini hanya merender blok <style> untuk mendefinisikan @font-face
  return (
    <style jsx global>{`
      @font-face {
        font-family: '${fontFamily}';
        src: url('${fontUrl}');
        font-display: swap;
      }
    `}</style>
  );
};

export default DynamicFontLoader;