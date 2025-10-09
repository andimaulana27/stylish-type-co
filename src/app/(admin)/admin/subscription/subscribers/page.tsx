// src/app/(admin)/admin/subscription/subscribers/page.tsx
'use client'; 

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import Image from 'next/image';
import { Search } from 'lucide-react';
import Pagination from '@/components/Pagination';
import { getSubscribersForAdminAction } from '@/app/actions/subscriptionActions';
import toast from 'react-hot-toast';

// Tipe data yang lebih spesifik untuk pelanggan
type Subscriber = {
    id: string;
    status: string;
    current_period_end: string;
    profiles: { full_name: string | null; email: string | null; avatar_url: string | null; } | null;
    subscription_plans: { name: string | null; } | null;
};
const ITEMS_PER_PAGE = 20;

// Komponen Badge Status
const StatusBadge = ({ status }: { status: string }) => {
    const statusClasses = 
        status === 'active' ? 'bg-green-500/20 text-green-300'
      : status === 'canceled' ? 'bg-yellow-500/20 text-yellow-500'
      : 'bg-red-500/20 text-red-400';
    return (<span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${statusClasses}`}>{status}</span>);
};

// Komponen Skeleton
const TableSkeleton = () => (
    <div className="bg-brand-darkest p-6 rounded-lg border border-white/10">
        <div className="animate-pulse">
            <div className="h-8 bg-white/5 rounded w-1/4 mb-4"></div>
            <div className="space-y-2">
                <div className="h-12 bg-white/5 rounded"></div>
                <div className="h-12 bg-white/5 rounded"></div>
                <div className="h-12 bg-white/5 rounded"></div>
            </div>
        </div>
    </div>
);

// Komponen Utama Halaman
export default function ManageSubscribersPage() {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    const currentPage = Number(searchParams.get('page')) || 1;
    const searchTerm = searchParams.get('search') || '';

    useEffect(() => {
        const fetchSubscribers = async () => {
            setLoading(true);
            const { data, count, error } = await getSubscribersForAdminAction({
                page: currentPage,
                limit: ITEMS_PER_PAGE,
                searchTerm,
            });
            if (error) {
                toast.error(error);
                setSubscribers([]);
            } else {
                setSubscribers(data as Subscriber[]);
                setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
            }
            setLoading(false);
        };
        fetchSubscribers();
    }, [searchParams, currentPage, searchTerm]);
    
    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', '1');
        if (term) { params.set('search', term); } 
        else { params.delete('search'); }
        router.replace(`${pathname}?${params.toString()}`);
    }, 300);

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-brand-light">Manage Subscribers</h1>
                <p className="text-brand-light-muted">View all active and past subscribers.</p>
            </div>
            
            <div className="mb-4 relative">
                <Search className="w-5 h-5 text-brand-light-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                    type="text"
                    placeholder="Search subscribers by name or email..."
                    defaultValue={searchParams.get('search')?.toString()}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full bg-brand-darkest border border-white/20 rounded-lg pl-10 pr-4 py-2 text-brand-light focus:outline-none focus:border-brand-accent"
                />
            </div>
            
            {loading ? <TableSkeleton /> : (
                <div className="bg-brand-darkest rounded-lg border border-white/10 overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="border-b border-white/10 text-brand-light-muted">
                            <tr>
                                <th className="px-6 py-3 text-left font-medium">Subscriber</th>
                                <th className="px-6 py-3 text-left font-medium">Plan</th>
                                <th className="px-6 py-3 text-left font-medium">Status</th>
                                <th className="px-6 py-3 text-left font-medium">Renews/Expires On</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {subscribers.length > 0 ? subscribers.map((sub) => (
                                <tr key={sub.id} className="hover:bg-white/5">
                                    <td className="px-6 py-4"><div className="flex items-center gap-4"><Image className="h-10 w-10 rounded-full object-cover bg-white/5" src={sub.profiles?.avatar_url || '/images/avatar-placeholder.png'} alt={sub.profiles?.full_name || 'User avatar'} width={40} height={40}/><div><div className="font-medium text-brand-light">{sub.profiles?.full_name || 'N/A'}</div><div className="text-brand-light-muted">{sub.profiles?.email}</div></div></div></td>
                                    <td className="px-6 py-4 text-brand-light">{sub.subscription_plans?.name || 'N/A'}</td>
                                    <td className="px-6 py-4"><StatusBadge status={sub.status} /></td>
                                    <td className="px-6 py-4 text-brand-light-muted">{formatDate(sub.current_period_end)}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan={4} className="text-center py-12 text-brand-light-muted">No subscribers found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {totalPages > 1 && (
                <div className="mt-6">
                    <Pagination currentPage={currentPage} totalPages={totalPages} />
                </div>
            )}
        </div>
    );
}