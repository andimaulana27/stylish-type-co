// src/app/(admin)/admin/analytics/page.tsx
'use client';

import { getAnalyticsDataAction } from '@/app/actions/analyticsActions';
import { useEffect, useState, Fragment } from 'react';
import { DateRange } from 'react-day-picker';
import { addDays, format, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, subYears } from 'date-fns';
import toast from 'react-hot-toast';

// --- PERUBAHAN 1: Impor komponen baru ---
import DashboardHeader from '@/components/admin/dashboard/DashboardHeader';
import DatePickerSelector from '@/components/admin/dashboard/DatePickerSelector';
// --- AKHIR PERUBAHAN ---

import { Loader2, FileText, Smartphone, Globe, Link as LinkIcon, ChevronDown, Check, BarChart as BarChartIcon } from 'lucide-react';
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Menu, Transition } from '@headlessui/react';


type AnalyticsData = Awaited<ReturnType<typeof getAnalyticsDataAction>>;
type ColorPalette = { icon: string; progress: string; text: string; };

const COLORS: { [key: string]: ColorPalette } = {
    blue: { icon: 'text-brand-primary-blue', progress: 'bg-brand-primary-blue', text: 'text-brand-primary-blue' },
    green: { icon: 'text-brand-secondary-green', progress: 'bg-brand-secondary-green', text: 'text-brand-secondary-green' },
    gold: { icon: 'text-brand-secondary-gold', progress: 'bg-brand-secondary-gold', text: 'text-brand-secondary-gold' },
    purple: { icon: 'text-brand-secondary-purple', progress: 'bg-brand-secondary-purple', text: 'text-brand-secondary-purple' },
    accent: { icon: 'text-brand-accent', progress: 'bg-brand-accent', text: 'text-brand-accent' },
};

const StatCard = ({ title, value, period }: { title: string; value: string | number; period?: string }) => (
    <div className="bg-brand-darkest p-4 rounded-lg border border-white/10">
        <p className="text-sm text-brand-light-muted">{title}</p>
        <p className="text-3xl font-bold text-brand-light mt-1">{value}</p>
        {period && <p className="text-xs text-brand-light-muted/70 mt-1">{period}</p>}
    </div>
);

const AnalyticsDataTable = ({ title, data, color, icon: Icon }: { 
    title: string; 
    data: { name: string; value: number }[];
    color: ColorPalette;
    icon: React.ElementType;
}) => {
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);
    return (
        <div className="bg-brand-darkest p-4 rounded-lg border border-white/10 h-96 flex flex-col">
            <h3 className={`font-semibold text-brand-light mb-4 flex items-center gap-2 ${color.text} flex-shrink-0`}>
                <Icon size={18} />
                {title}
            </h3>
            <div className="space-y-3 text-sm overflow-y-auto pr-2 flex-grow min-h-0">
                {data.map((item, index) => (
                    <div key={index}>
                        <div className="flex justify-between mb-1 items-center">
                            <span className="text-brand-light truncate max-w-[80%]">{item.name}</span>
                            <span className="text-brand-light-muted font-medium">{item.value.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-1.5">
                            <div 
                                className={`h-1.5 rounded-full ${color.progress}`} 
                                style={{ width: `${totalValue > 0 ? (item.value / totalValue) * 100 : 0}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

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

const limitOptions = [
    { key: 10, label: 'Top 10' },
    { key: 30, label: 'Top 30' },
    { key: 50, label: 'Top 50' },
    { key: 100, label: 'Top 100' },
];

const LimitSelector = ({ limit, setLimit, isLoading }: {
    limit: number,
    setLimit: (limit: number) => void,
    isLoading: boolean
}) => {
    return (
        <Menu as="div" className="relative inline-block text-left z-30">
            {({ open }) => (
            <>
                <div>
                <Menu.Button 
                    className="inline-flex w-40 justify-center items-center gap-x-2 rounded-lg bg-brand-darkest border border-white/10 px-5 py-2.5 text-base font-medium text-brand-light shadow-sm hover:border-brand-accent transition-colors duration-200 group"
                >
                    <BarChartIcon size={18} className="text-brand-light-muted group-hover:text-brand-accent transition-colors duration-200" />
                    <span className="group-hover:text-brand-accent transition-colors duration-200 flex-grow text-left truncate">
                        Top {limit}
                    </span>
                    {isLoading ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : (
                        <ChevronDown 
                        className={`h-5 w-5 text-brand-light-muted group-hover:text-brand-accent transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                        aria-hidden="true" 
                        />
                    )}
                </Menu.Button>
                </div>

                <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
                >
                <Menu.Items className="absolute right-0 mt-2 w-40 origin-top-right rounded-md bg-[#1e1e1e] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                    {limitOptions.map((option) => (
                        <Menu.Item key={option.key}>
                        {({ active }) => (
                            <button
                                onClick={() => setLimit(option.key)}
                                className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 transition-colors duration-150 ${active ? 'bg-brand-accent text-brand-darkest' : limit === option.key ? 'text-brand-accent' : 'text-brand-light'}`}
                            >
                                <div className="w-5 flex-shrink-0">
                                {limit === option.key && <Check size={16} className={active ? 'text-brand-darkest' : 'text-brand-accent'} />}
                                </div>
                                <span>{option.label}</span>
                            </button>
                        )}
                        </Menu.Item>
                    ))}
                    </div>
                </Menu.Items>
                </Transition>
            </>
            )}
        </Menu>
    );
};


export default function AnalyticsPage() {
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData['data'] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const [selectedPreset, setSelectedPreset] = useState('last7days');
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: addDays(new Date(), -6),
        to: new Date(),
    });
    const [limit, setLimit] = useState<number>(10);

    // Efek untuk mengubah rentang tanggal berdasarkan preset
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

    // Efek untuk mengambil data saat rentang tanggal atau limit berubah
    useEffect(() => {
        if (dateRange?.from && dateRange?.to) {
            setLoading(true);
            const fromISO = format(dateRange.from, 'yyyy-MM-dd');
            const toISO = format(dateRange.to, 'yyyy-MM-dd');

            getAnalyticsDataAction(fromISO, toISO, limit).then(result => {
                if (result.error) {
                    setError(result.error);
                    toast.error(result.error);
                } else {
                    setAnalyticsData(result.data);
                    setError(null);
                }
                setLoading(false);
            });
        }
    }, [dateRange, limit]);
    
    const displayLabel = getDynamicPeriodLabel(selectedPreset, dateRange);
    const { stats, chartData, topPages, topReferrers, topCountries, topDevices, topOS } = analyticsData || {};

    return (
        <div className="space-y-6">
            
            {/* --- PERUBAHAN UTAMA: Tata letak header diubah --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                {/* 1. Header (hanya title/subtitle) */}
                <DashboardHeader
                    title="Traffic Analytics"
                    subtitle={`Ringkasan traffic website Anda untuk ${displayLabel.toLowerCase()}.`}
                />
                
                {/* 2. Grup untuk kedua picker */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <LimitSelector 
                        limit={limit}
                        setLimit={setLimit}
                        isLoading={loading}
                    />
                    <DatePickerSelector
                        selectedPreset={selectedPreset}
                        setSelectedPreset={setSelectedPreset}
                        dateRange={dateRange}
                        setDateRange={setDateRange}
                        isLoading={loading}
                        displayLabel={displayLabel}
                    />
                </div>
            </div>
            {/* --- AKHIR PERUBAHAN --- */}
            
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-light-muted" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-white/10 pb-6">
                        <StatCard title="Visitors" value={stats?.visitors.toLocaleString() ?? 0} period={displayLabel} />
                        <StatCard title="Page Views" value={stats?.pageViews.toLocaleString() ?? 0} period={displayLabel} />
                        <StatCard title="Bounce Rate" value={`${stats?.bounceRate.toFixed(1) ?? 0}%`} period={displayLabel} />
                    </div>

                    <div className="bg-brand-darkest p-4 rounded-lg border border-white/10 h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#FFFFFF1A" vertical={false} />
                                <XAxis dataKey="name" stroke="#A0A0A0" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#A0A0A0" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                                    contentStyle={{ backgroundColor: '#121212', border: '1px solid #FFFFFF20', borderRadius: '8px' }} 
                                    labelStyle={{ color: '#A0A0A0' }} 
                                    itemStyle={{ color: '#f47253', fontWeight: 'bold' }} 
                                />
                                <Bar dataKey="visitors" name="Visitors">
                                    {(chartData || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill="#f47253" fillOpacity={0.6} />
                                    ))}
                                </Bar>
                            </BarChart> 
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <AnalyticsDataTable title="Pages" data={topPages || []} color={COLORS.blue} icon={FileText} />
                        <AnalyticsDataTable title="Referrers" data={topReferrers || []} color={COLORS.green} icon={LinkIcon} />
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <AnalyticsDataTable title="Countries" data={topCountries || []} color={COLORS.gold} icon={Globe} />
                        <AnalyticsDataTable title="Devices" data={topDevices || []} color={COLORS.purple} icon={Smartphone} />
                        <AnalyticsDataTable title="Operating Systems" data={topOS || []} color={COLORS.purple} icon={Smartphone} />
                    </div>
                </>
            )}
        </div>
    );
}