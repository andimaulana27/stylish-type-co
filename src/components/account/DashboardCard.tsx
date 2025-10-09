// src/components/account/DashboardCard.tsx
import Link from 'next/link';
import React from 'react';

// Tipe props untuk komponen baru kita
type DashboardCardProps = {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  href: string;
  linkText: string;
};

const DashboardCard = ({ icon: Icon, title, children, href, linkText }: DashboardCardProps) => {
  return (
    // 1. Menggunakan flex flex-col untuk layout vertikal
    <div className="bg-brand-darkest p-6 rounded-lg border border-white/10 flex flex-col h-full">
      {/* 2. Bagian Header Kartu */}
      <div className="flex items-center gap-3 mb-4">
        <Icon className="w-5 h-5 text-brand-accent flex-shrink-0" />
        <h3 className="font-semibold text-brand-light">{title}</h3>
      </div>
      
      {/* 3. Bagian Konten Utama */}
      {/* 'flex-grow' adalah kunci di sini. Ini akan mendorong footer ke bawah */}
      <div className="flex-grow text-brand-light-muted text-sm">
        {children}
      </div>
      
      {/* 4. Bagian Footer Kartu (untuk link) */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <Link href={href} className="text-sm font-semibold text-brand-accent hover:underline">
          {linkText}
        </Link>
      </div>
    </div>
  );
};

export default DashboardCard;