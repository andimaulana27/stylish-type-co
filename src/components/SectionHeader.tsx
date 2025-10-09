// src/components/SectionHeader.tsx
import React from 'react';

type SectionHeaderProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: 'center' | 'left';
};

const SectionHeader = ({ title, subtitle, align = 'center' }: SectionHeaderProps) => {
  const alignmentClass = align === 'center' ? 'text-center' : 'text-left';
  const lineMarginClass = align === 'center' ? 'mx-auto' : 'ml-0 mr-auto';

  return (
    <div className={`${alignmentClass} mb-12`}>
      <h2 className={`text-3xl md:text-4xl font-medium text-brand-light max-w-3xl ${lineMarginClass} leading-snug`}>
        {title}
      </h2>
      {subtitle && (
        <>
          {/* Garis menggunakan warna aksen utama */}
          <div className={`w-20 h-1 bg-brand-accent ${lineMarginClass} my-6 rounded-full`}></div>
          <p className={`text-lg text-brand-light-muted font-light max-w-2xl ${lineMarginClass} leading-relaxed`}>
            {subtitle}
          </p>
        </>
      )}
    </div>
  );
};

export default SectionHeader;