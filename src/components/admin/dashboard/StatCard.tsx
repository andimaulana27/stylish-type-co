// src/components/admin/dashboard/StatCard.tsx
import React from 'react';

type StatCardProps = {
  title: string;
  value: string;
  icon: React.ElementType;
  percentageChange?: string;
  period?: string;
  iconColorClass?: string;
};

const StatCard = ({ title, value, icon: Icon, percentageChange, period, iconColorClass = 'text-brand-accent' }: StatCardProps) => {
    const isPositive = percentageChange?.startsWith('+');
    const changeColor = isPositive ? 'text-green-400' : 'text-red-400';

    return (
        // --- PERUBAHAN WARNA HOVER DI SINI ---
        <div className="relative bg-brand-darkest p-6 rounded-lg border border-white/10 flex flex-col justify-between overflow-hidden 
                    transition-all duration-300 hover:border-brand-accent/50 hover:shadow-lg hover:shadow-brand-accent/10">
            
            <div className="relative z-10">
                <div className="flex justify-between items-center">
                    {/* --- PERUBAHAN WARNA JUDUL DI SINI --- */}
                    <h3 className="text-sm font-medium text-brand-accent group-hover:text-brand-accent transition-colors">{title}</h3>
                    <Icon className={`w-5 h-5 ${iconColorClass}`} />
                </div>
                <p className="text-3xl font-bold text-brand-light mt-2">{value}</p>
            </div>
            {percentageChange && period && (
                <div className="relative z-10 mt-4 text-xs">
                    <span className={`${changeColor} font-semibold`}>{percentageChange}</span>
                    <span className="text-brand-light-muted"> {period}</span>
                </div>
            )}
        </div>
    );
};

export default StatCard;