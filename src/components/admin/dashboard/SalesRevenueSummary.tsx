// src/components/admin/dashboard/SalesRevenueSummary.tsx
import React from 'react';
import { format } from 'date-fns';

const SummaryCard = ({ title, value, subtitle }: { title: string, value: string, subtitle: string }) => (
  <div className="relative bg-brand-darkest p-6 rounded-lg border border-white/10 overflow-hidden 
                transition-all duration-300 hover:border-brand-accent/50 hover:shadow-lg hover:shadow-brand-accent/10">
    <div className="relative z-10">
      <h4 className="text-sm font-medium text-brand-accent">{title}</h4>
      <p className="text-3xl font-bold text-brand-light mt-1">{value}</p>
      <p className="text-xs text-brand-light-muted mt-2">{subtitle}</p>
    </div>
  </div>
);

type SalesSummary = {
    monthlyIncome: number;
    latestDailySales: number;
}

// --- PERUBAHAN DI SINI: Menerima 'periodLabel' dan menghapus 'dateRange' & 'getPeriodLabel' ---
const SalesRevenueSummary = ({ summary, periodLabel }: { summary: SalesSummary, periodLabel: string }) => {
  const today = new Date();

  return (
    <section>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-brand-accent">Sales Revenue Summary</h3>
        <p className="text-sm text-brand-light-muted">Your income from font sales for {periodLabel}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <SummaryCard 
          title="Total Income"
          value={`$${summary.monthlyIncome.toFixed(2)}`}
          subtitle={`Total income for ${periodLabel}`}
        />
        <SummaryCard 
          title="Today's Sales"
          value={`$${summary.latestDailySales.toFixed(2)}`}
          subtitle={`Sales for ${format(today, 'LLL dd, yyyy')}`}
        />
      </div>
    </section>
  );
};

export default SalesRevenueSummary;