// src/app/(admin)/admin/dashboard/page.tsx
'use client';

import { useState, useEffect, useTransition } from 'react';
import { DateRange } from 'react-day-picker';
import { 
    addDays, format, startOfMonth, endOfMonth, subMonths, 
    startOfYear, endOfYear, subYears 
} from 'date-fns';
import toast from 'react-hot-toast';

import { getDashboardAnalyticsAction } from '@/app/actions/adminActions';
import DashboardHeader from '@/components/admin/dashboard/DashboardHeader';
import StatCard from '@/components/admin/dashboard/StatCard';
import AnalyticsSection from '@/components/admin/dashboard/AnalyticsSection';
import SalesRevenueSummary from '@/components/admin/dashboard/SalesRevenueSummary';
import RecentOrdersTable from '@/components/admin/dashboard/RecentOrdersTable';
import { Users, Gem, FileText, Package, Type, DollarSign, ShoppingCart } from 'lucide-react';

// --- PERUBAHAN 1: Impor komponen DatePickerSelector baru ---
import DatePickerSelector from '@/components/admin/dashboard/DatePickerSelector';

type AnalyticsData = Awaited<ReturnType<typeof getDashboardAnalyticsAction>>;

const presets: { [key: string]: string } = {
    last7days: 'Last 7 Days',
    last30days: 'Last 30 Days',
    thisMonth: 'This Month',
    lastMonth: 'Last Month',
    last6months: 'Last 6 Months',
    thisYear: 'This Year',
    lastYear: 'Last Year',
    allTime: 'All Time',
};

const getDynamicPeriodLabel = (preset: string, range: DateRange | undefined): string => {
    if (preset === 'custom' && range?.from && range.to) {
        return `${format(range.from, "LLL dd, y")} - ${format(range.to, "LLL dd, y")}`;
    }
    return presets[preset] || 'Selected Period';
};

export default function AdminDashboardPage() {
    const [selectedPreset, setSelectedPreset] = useState('last7days');
    
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: addDays(new Date(), -6),
        to: new Date(),
    });

    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [isFetching, startFetching] = useTransition();

    useEffect(() => {
        if (selectedPreset === 'custom') return;

        const now = new Date();
        let fromDate: Date;
        let toDate: Date = now;

        switch (selectedPreset) {
            case 'last30days': fromDate = addDays(now, -29); break;
            case 'thisMonth': fromDate = startOfMonth(now); break;
            case 'lastMonth': const lastMonth = subMonths(now, 1); fromDate = startOfMonth(lastMonth); toDate = endOfMonth(lastMonth); break;
            case 'last6months': fromDate = subMonths(now, 6); break;
            case 'thisYear': fromDate = startOfYear(now); break;
            case 'lastYear': const lastYear = subYears(now, 1); fromDate = startOfYear(lastYear); toDate = endOfYear(lastYear); break;
            case 'allTime': fromDate = new Date(2020, 0, 1); break;
            case 'last7days': default: fromDate = addDays(now, -6); break;
        }
        setDateRange({ from: fromDate, to: toDate });
    }, [selectedPreset]);

    useEffect(() => {
        if (dateRange?.from && dateRange?.to) {
            const fromISO = format(dateRange.from, 'yyyy-MM-dd');
            const toISO = format(dateRange.to, 'yyyy-MM-dd');

            startFetching(async () => {
                const analyticsRes = await getDashboardAnalyticsAction(fromISO, toISO);
                if (analyticsRes.error) {
                    toast.error(analyticsRes.error);
                    setAnalyticsData(null);
                } else {
                    setAnalyticsData(analyticsRes);
                }
            });
        }
    }, [dateRange]);

    const stats = analyticsData?.stats;
    const salesSummary = analyticsData?.salesSummary;
    const salesChartData = analyticsData?.salesChartData || [];
    const topSellingFonts = analyticsData?.topSellingFonts || [];
    const recentOrders = analyticsData?.recentOrders || [];
    
    const dynamicLabel = getDynamicPeriodLabel(selectedPreset, dateRange);

    return (
        <div className="space-y-8">
            
            {/* --- PERUBAHAN 2: Ganti wrapper dan tambahkan DatePickerSelector --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <DashboardHeader 
                    title={<>
                        <span className="text-brand-light">Admin</span>
                        <span className="text-brand-accent"> Dashboard</span>
                    </>}
                    subtitle="Welcome back! Here's your analytics overview."
                />
                <DatePickerSelector
                    selectedPreset={selectedPreset}
                    setSelectedPreset={setSelectedPreset}
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                    isLoading={isFetching}
                    displayLabel={dynamicLabel}
                />
            </div>
            {/* --- AKHIR PERUBAHAN --- */}

            <h3 className="text-lg font-semibold text-brand-accent ">Quick Stats</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"> 
                <StatCard title="Total Revenue" value={`$${(stats?.revenue ?? 0).toFixed(2)}`} icon={DollarSign} />
                <StatCard title="Total Orders" value={`${(stats?.orders ?? 0)}`} icon={ShoppingCart} />
                <StatCard title="Active Subscribers" value={`${(stats?.subscribers ?? 0)}`} icon={Gem} iconColorClass="text-green-400" />
            </div>
            
            <section>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <StatCard title="Total Fonts" value={`${(stats?.fonts ?? 0)}`} icon={Type} />
                    <StatCard title="Total Bundles" value={`${(stats?.bundles ?? 0)}`} icon={Package} />
                    <StatCard title="Published Posts" value={`${(stats?.posts ?? 0)}`} icon={FileText} />
                    <StatCard title="Total Users" value={`${(stats?.totalUsers ?? 0)}`} icon={Users} />
                 </div>
            </section>

            <SalesRevenueSummary 
                summary={salesSummary || { monthlyIncome: 0, latestDailySales: 0 }} 
                periodLabel={dynamicLabel}
            />

            <AnalyticsSection 
                topSellingFonts={topSellingFonts} 
                salesChartData={salesChartData}
                periodLabel={dynamicLabel}
            />

            <RecentOrdersTable recentOrders={recentOrders} />
        </div>
    );
}