// src/components/admin/dashboard/AnalyticsSection.tsx
'use client';

import React from 'react';
import SalesLineChart from './SalesLineChart';
import { Award } from 'lucide-react';

type TopSellingFont = {
    name: string;
    sales_count: number;
}

type SalesChartData = {
    day: string;
    sales: number;
}

type AnalyticsSectionProps = {
    topSellingFonts: TopSellingFont[];
    salesChartData: SalesChartData[];
    periodLabel: string; // <-- Prop baru ditambahkan
}

const AnalyticsSection = ({ topSellingFonts, salesChartData, periodLabel }: AnalyticsSectionProps) => {
    const displayedFonts = [...topSellingFonts];
    while (displayedFonts.length < 10) {
        displayedFonts.push({ name: 'No sales recorded yet', sales_count: 0 });
    }

    const getMedalColor = (index: number) => {
        if (index === 0) return 'text-yellow-400';
        if (index === 1) return 'text-gray-400';
        if (index === 2) return 'text-yellow-600';
        return 'text-transparent';
    };

    return (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="relative lg:col-span-2 bg-brand-darkest p-6 rounded-lg border border-white/10 flex flex-col overflow-hidden 
                        transition-all duration-300 hover:border-brand-accent/50 hover:shadow-lg hover:shadow-brand-accent/10">
                <div className="relative z-10">
                    {/* --- PERUBAHAN DI SINI: Menggunakan 'periodLabel' --- */}
                    <h3 className="text-lg font-semibold text-brand-accent flex-shrink-0">Sales Analytics ({periodLabel})</h3>
                </div>
                <div className="relative z-10 h-[400px] w-full">
                    <SalesLineChart salesData={salesChartData} />
                </div>
            </div>

            <div className="relative bg-brand-darkest p-6 rounded-lg border border-white/10 overflow-hidden 
                        transition-all duration-300 hover:border-brand-accent/50 hover:shadow-lg hover:shadow-brand-accent/10">
                <div className="relative z-10">
                    <h3 className="text-lg font-semibold text-brand-accent mb-4">Top 10 Selling Fonts</h3>
                    <ul className="space-y-3">
                        {displayedFonts.map((font, index) => (
                            <li key={`${font.name}-${index}`} className="flex justify-between items-center text-sm transition-all duration-200 hover:bg-white/5 -m-2 p-2 rounded-md">
                                <div className="flex items-center gap-3">
                                    <Award size={18} className={getMedalColor(index)} />
                                    <span className={`font-medium ${font.sales_count > 0 ? 'text-brand-light' : 'text-brand-light-muted/50'}`}>
                                        {font.name}
                                    </span>
                                </div>
                                <span className="text-brand-light-muted">{font.sales_count} sales</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
};

export default AnalyticsSection;