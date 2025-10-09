// src/app/(admin)/admin/partners/page.tsx
'use client'; // Halaman diubah menjadi Client Component

import { useState, useTransition, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Edit, Trash2, Loader2, PlusCircle } from 'lucide-react';
import { Database } from '@/lib/database.types';
import toast from 'react-hot-toast';
import { deletePartnerAction, getPartnersAction } from '@/app/actions/partnerActions';
import Pagination from '@/components/Pagination';

type Partner = Database['public']['Tables']['partners']['Row'];
const ITEMS_PER_PAGE = 20;

// Skeleton component for loading state
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

// Main page component
export default function ManagePartnersPage() {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [, startTransition] = useTransition();

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentPage = Number(searchParams.get('page')) || 1;
    const searchTerm = searchParams.get('search') || '';

    useEffect(() => {
        const fetchPartners = async () => {
            setLoading(true);
            const { data, count, error } = await getPartnersAction({
                page: currentPage,
                limit: ITEMS_PER_PAGE,
                searchTerm,
            });

            if (error) {
                toast.error(error);
                setPartners([]);
            } else {
                setPartners(data as Partner[]);
                setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
            }
            setLoading(false);
        };
        fetchPartners();
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

    const handleDelete = (partner: Partner) => {
        if (window.confirm(`Are you sure you want to delete "${partner.name}"? This cannot be undone.`)) {
            setIsDeleting(partner.id);
            startTransition(async () => {
                const result = await deletePartnerAction(partner.id);
                if (result.error) {
                    toast.error(result.error);
                } else {
                    toast.success(`Partner "${partner.name}" deleted successfully!`);
                    // Refetch data after deletion
                    const { data, count } = await getPartnersAction({ page: currentPage, limit: ITEMS_PER_PAGE, searchTerm });
                    setPartners(data as Partner[]);
                    setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
                }
                setIsDeleting(null);
            });
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-brand-light">Manage Partners</h1>
                    <p className="text-brand-light-muted">Add, edit, and manage all your font partners.</p>
                </div>
                <Link 
                    href="/admin/partners/new" 
                    className="flex items-center gap-2 px-4 py-2 bg-brand-accent text-brand-darkest font-semibold rounded-lg transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-brand-accent/40"
                >
                    <PlusCircle size={20} />
                    <span>Add New Partner</span>
                </Link>
            </div>
            
            <div className="mb-4 relative">
                <Search className="w-5 h-5 text-brand-light-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                    type="text"
                    placeholder="Search partners by name..."
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
                                <th className="px-6 py-3 text-left font-medium">Partner Name</th>
                                <th className="px-6 py-3 text-left font-medium">Subheadline</th>
                                <th className="px-6 py-3 text-left font-medium">Date Added</th>
                                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {partners.length > 0 ? partners.map((partner) => (
                                <tr key={partner.id} className="hover:bg-white/5">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <Image
                                                className="h-10 w-10 rounded-full object-contain bg-white/5 p-1"
                                                src={partner.logo_url || '/images/avatar-placeholder.png'}
                                                alt={partner.name}
                                                width={40}
                                                height={40}
                                            />
                                            <div className="font-medium text-brand-light">{partner.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-brand-light-muted">{partner.subheadline}</td>
                                    <td className="px-6 py-4 text-brand-light-muted">{formatDate(partner.created_at)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/admin/partners/${partner.id}/edit`} className="flex items-center gap-1.5 text-sm font-semibold text-brand-secondary-gold px-2 py-1 rounded-md transition-all duration-200 hover:bg-white/5">
                                                <Edit size={14} />
                                                <span>Edit</span>
                                            </Link>
                                            <button onClick={() => handleDelete(partner)} disabled={isDeleting === partner.id} className="flex items-center gap-1.5 text-sm font-semibold text-brand-secondary-red px-2 py-1 rounded-md transition-all duration-200 hover:bg-white/5 disabled:opacity-50">
                                                {isDeleting === partner.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                                <span>{isDeleting === partner.id ? 'Deleting...' : 'Delete'}</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={4} className="text-center py-12 text-brand-light-muted">No partners found.</td></tr>
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