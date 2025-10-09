// src/components/font-detail/RelatedTags.tsx
import Link from 'next/link';
import React from 'react';

type RelatedTagsProps = {
  mainTitle?: string;
  purposeTags?: string[];
  purposeTitle?: string;
  styleTags?: string[];
  styleTitle?: string;
  // --- PERUBAHAN DI SINI: Menambahkan '/product' sebagai tipe yang valid ---
  basePath?: '/product' | '/bundles' | '/blog';
  hideSubtitles?: boolean;
};

const Tag = ({ name, basePath }: { name: string, basePath: string }) => {
  const currentStyle = "block text-xs font-light text-brand-light-muted border border-white/20 rounded-full px-4 py-1.5 transition-colors duration-200 hover:border-brand-accent hover:text-brand-accent";

  return (
    <Link href={`${basePath}?tag=${name.toLowerCase().replace(/ & /g, '-and-')}`} className={currentStyle}>
      {name}
    </Link>
  );
};

const RelatedTags = ({ 
  mainTitle = "Related Tags",
  purposeTags = [], 
  purposeTitle = "Purpose",
  styleTags = [], 
  styleTitle = "Style",
  // --- PERUBAHAN DI SINI: Mengganti nilai default ---
  basePath = '/product',
  hideSubtitles = false
}: RelatedTagsProps) => {
  
  const hasPurposeTags = purposeTags.length > 0;
  const hasStyleTags = styleTags.length > 0;

  if (!hasPurposeTags && !hasStyleTags) {
    return null;
  }

  return (
    <div>
      <h2 className="text-3xl font-medium text-brand-light mb-2 text-left">{mainTitle}</h2>
      <div className="w-16 h-1 bg-brand-accent text-left my-4 rounded-full"></div>

      {hasPurposeTags && (
        <div className="mt-6">
          {!hideSubtitles && <h3 className="font-medium text-white text-sm mb-4">{purposeTitle}</h3>}
          <div className="flex flex-wrap gap-2">
            {purposeTags.map((tag) => <Tag key={tag} name={tag} basePath={basePath} />)}
          </div>
        </div>
      )}

      {hasStyleTags && (
        <div className="mt-6">
          {!hideSubtitles && <h3 className="font-medium text-white text-sm mb-4">{styleTitle}</h3>}
          <div className="flex flex-wrap gap-2">
            {styleTags.map((tag) => <Tag key={tag} name={tag} basePath={basePath} />)}
          </div>
        </div>
      )}
    </div>
  );
};

export default RelatedTags;