// src/components/admin/dashboard/DashboardHeader.tsx
'use client';

import { ReactNode } from 'react';

interface DashboardHeaderProps {
    title: ReactNode;
    subtitle: string;
}

// --- PERUBAHAN UTAMA: Konten disederhanakan ---
// Menghapus semua logika Date Picker dan komponen <Menu>
const DashboardHeader = ({ title, subtitle }: DashboardHeaderProps) => {
    return (
        <header>
            <div>
                <h1 className="text-3xl font-bold text-brand-light">
                    {title}
                </h1>
                <p className="text-base mt-1 text-brand-light-muted">
                    {subtitle}
                </p>
            </div>
        </header>
    );
};
// --- AKHIR PERUBAHAN ---

export default DashboardHeader;