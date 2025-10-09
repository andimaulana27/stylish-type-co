// src/app/(admin)/admin/orders/page.tsx
'use client'; 

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { Search, MoreVertical } from 'lucide-react';
import Pagination from '@/components/Pagination';
import { getOrdersForAdminAction } from '@/app/actions/orderActions';
import toast from 'react-hot-toast';

// Tipe data pesanan yang sudah ditransformasi
type TransformedOrder = {
    id: string;
    created_at: string;
    total_amount: number;
    status: string;
    customer_name: string;
    customer_email: string;
    item_count: number;
};

const ITEMS_PER_PAGE = 20;

// Komponen Badge Status
const StatusBadge = ({ status }: { status: string }) => {
    const statusClasses = 
        status.toLowerCase() === 'completed' ? 'bg-green-500/20 text-green-300'
      : status.toLowerCase() === 'pending' ? 'bg-yellow-500/20 text-yellow-500'
      : 'bg-gray-500/20 text-gray-300';
    return (
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusClasses}`}>
            {status}
        </span>
    );
};

// Komponen Skeleton untuk Loading
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

// Komponen utama halaman
export default function ManageOrdersPage() {
    const [orders, setOrders] = useState<TransformedOrder[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentPage = Number(searchParams.get('page')) || 1;
    const searchTerm = searchParams.get('search') || '';

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            const { data, count, error } = await getOrdersForAdminAction({
                page: currentPage,
                limit: ITEMS_PER_PAGE,
                searchTerm,
            });

            if (error) {
                toast.error(error);
                setOrders([]);
            } else {
                setOrders(data as TransformedOrder[]);
                setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
            }
            setLoading(false);
        };

        fetchOrders();
    }, [searchParams, currentPage, searchTerm]);
    
    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', '1');
        if (term) {
            params.set('search', term);
        } else {
            params.delete('search');
        }
        router.replace(`${pathname}?${params.toString()}`);
    }, 300);

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-brand-light">Manage Orders</h1>
                <p className="text-brand-light-muted">View and manage all customer orders.</p>
            </div>
            
            <div className="mb-4 relative">
                <Search className="w-5 h-5 text-brand-light-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                    type="text"
                    placeholder="Search by Order ID, Name, or Email..."
                    defaultValue={searchParams.get('search')?.toString()}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full bg-brand-darkest border border-white/20 rounded-lg pl-10 pr-4 py-2 text-brand-light focus:outline-none focus:border-brand-accent"
                />
            </div>

            {loading ? (
                <TableSkeleton />
            ) : (
                <div className="bg-brand-darkest rounded-lg border border-white/10 overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="border-b border-white/10 text-brand-light-muted">
                            <tr>
                                <th className="px-6 py-3 text-left font-medium">Order ID</th>
                                <th className="px-6 py-3 text-left font-medium">Customer</th>
                                <th className="px-6 py-3 text-left font-medium">Date</th>
                                <th className="px-6 py-3 text-left font-medium">Items</th>
                                <th className="px-6 py-3 text-left font-medium">Total</th>
                                <th className="px-6 py-3 text-left font-medium">Status</th>
                                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {orders.length > 0 ? orders.map((order) => (
                                <tr key={order.id} className="hover:bg-white/5">
                                    <td className="px-6 py-4 font-mono text-xs text-brand-light-muted">#{order.id.substring(0, 8).toUpperCase()}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-brand-light">{order.customer_name}</div>
                                        <div className="text-brand-light-muted">{order.customer_email}</div>
                                    </td>
                                    <td className="px-6 py-4 text-brand-light-muted">{formatDate(order.created_at)}</td>
                                    <td className="px-6 py-4 text-brand-light">{order.item_count}</td>
                                    <td className="px-6 py-4 text-brand-light font-semibold">${order.total_amount?.toFixed(2)}</td>
                                    <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-brand-light-muted hover:text-brand-accent p-1 rounded-full" title="View Details (coming soon)">
                                            <MoreVertical size={18} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={7} className="text-center py-12 text-brand-light-muted">No orders found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {totalPages > 1 && (
                <div className="mt-6">
                    <Pagination 
                        currentPage={currentPage} 
                        totalPages={totalPages} 
                    />
                </div>
            )}
        </div>
    );
}