// src/app/(admin)/admin/newsletter/page.tsx
'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { Search, Trash2, Loader2, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { getNewsletterSubscribersAction, deleteNewsletterSubscriberAction } from '@/app/actions/newsletterActions';
import Pagination from '@/components/Pagination';

type Subscriber = {
    id: string;
    email: string;
    created_at: string;
};

const ITEMS_PER_PAGE = 20;

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

export default function ManageNewsletterPage() {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    const currentPage = Number(searchParams.get('page')) || 1;
    const searchTerm = searchParams.get('search') || '';

    useEffect(() => {
        const fetchSubscribers = async () => {
            setLoading(true);
            const { data, count, error } = await getNewsletterSubscribersAction({ page: currentPage, limit: ITEMS_PER_PAGE, searchTerm });
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

    const handleDelete = (subscriber: Subscriber) => {
        if (window.confirm(`Are you sure you want to remove "${subscriber.email}" from the list?`)) {
            setDeletingId(subscriber.id);
            startTransition(async () => {
                const result = await deleteNewsletterSubscriberAction(subscriber.id);
                if (result.error) {
                    toast.error(result.error);
                } else {
                    toast.success(result.success || 'Subscriber removed!');
                    setSubscribers(current => current.filter(s => s.id !== subscriber.id));
                }
                setDeletingId(null);
            });
        }
    };

    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-brand-light">Newsletter Subscribers</h1>
                    <p className="text-brand-light-muted">Manage your email list and send out newsletters.</p>
                </div>
                <button 
                    onClick={() => toast.success('This feature is coming soon!')}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-primary-blue text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-brand-primary-blue/40 transition-all"
                >
                    <Send size={16} />
                    <span>Send Newsletter</span>
                </button>
            </div>
            
            <div className="mb-4 relative">
                <Search className="w-5 h-5 text-brand-light-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                    type="text"
                    placeholder="Search subscribers by email..."
                    defaultValue={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full bg-brand-darkest border border-white/20 rounded-lg pl-10 pr-4 py-2 text-brand-light focus:outline-none focus:border-brand-accent"
                />
            </div>

            {loading ? <TableSkeleton /> : (
                <div className="bg-brand-darkest rounded-lg border border-white/10 overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="border-b border-white/10 text-brand-light-muted">
                            <tr>
                                <th className="px-6 py-3 text-left font-medium">Email Address</th>
                                <th className="px-6 py-3 text-left font-medium">Subscription Date</th>
                                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {subscribers.length > 0 ? subscribers.map((sub) => (
                                <tr key={sub.id} className="hover:bg-white/5">
                                    <td className="px-6 py-4 font-medium text-brand-light">{sub.email}</td>
                                    <td className="px-6 py-4 text-brand-light-muted">{formatDate(sub.created_at)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleDelete(sub)} disabled={deletingId === sub.id || isPending} className="flex items-center gap-1.5 text-sm font-semibold text-brand-secondary-red px-2 py-1 rounded-md transition-all duration-200 hover:bg-white/5 disabled:opacity-50 ml-auto">
                                            {deletingId === sub.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                            <span>{deletingId === sub.id ? 'Removing...' : 'Remove'}</span>
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={3} className="text-center py-12 text-brand-light-muted">No subscribers found.</td></tr>
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