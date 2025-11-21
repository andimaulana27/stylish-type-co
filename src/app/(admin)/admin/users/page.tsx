// src/app/(admin)/admin/users/page.tsx
'use client'; 

import { useState, useTransition, Fragment, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import Image from 'next/image';
import { Search, Trash2, Loader2, ChevronDown } from 'lucide-react';
import { Database } from '@/lib/database.types';
import toast from 'react-hot-toast';
import { updateUserRoleAction, deleteUserAction, getUsersForAdminAction } from '@/app/actions/userActions';
import Pagination from '@/components/Pagination';
import { Menu, Transition } from '@headlessui/react';

type Profile = Database['public']['Tables']['profiles']['Row'];
const ITEMS_PER_PAGE = 20;

const RoleBadge = ({ role }: { role: string | null }) => {
    const roleClasses = 
        role === 'admin' ? 'bg-brand-secondary-purple/20 text-brand-secondary-purple'
      : role === 'blogger' ? 'bg-blue-500/20 text-blue-300'
      : role === 'uploader' ? 'bg-green-500/20 text-green-300'
      : 'bg-gray-500/20 text-gray-300';
    return (
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${roleClasses}`}>
            {role || 'user'}
        </span>
    );
};

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

export default function ManageUsersPage() {
    const [users, setUsers] = useState<Profile[]>([]);
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
        const fetchUsers = async () => {
            setLoading(true);
            const { data, count, error } = await getUsersForAdminAction({
                page: currentPage,
                limit: ITEMS_PER_PAGE,
                searchTerm,
            });

            if (error) {
                toast.error(error);
                setUsers([]);
            } else {
                setUsers(data as Profile[]);
                setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
            }
            setLoading(false);
        };
        fetchUsers();
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
    
    const handleRoleChange = (userId: string, newRole: string) => {
        startTransition(async () => {
            const result = await updateUserRoleAction(userId, newRole);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(result.success || 'Role updated!');
                // --- PERBAIKAN DISINI: Menambahkan casting "as Profile['role']" ---
                setUsers(currentUsers => 
                    currentUsers.map(u => u.id === userId ? { ...u, role: newRole as Profile['role'] } : u)
                );
            }
        });
    };

    const handleDelete = (user: Profile) => {
        if (window.confirm(`Are you sure you want to delete "${user.full_name || user.email}"? This will permanently remove their account and cannot be undone.`)) {
            setDeletingId(user.id);
            startTransition(async () => {
                const result = await deleteUserAction(user.id);
                if (result.error) {
                    toast.error(result.error);
                } else {
                    toast.success(result.success || 'User deleted!');
                    setUsers(currentUsers => currentUsers.filter(u => u.id !== user.id));
                }
                setDeletingId(null);
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
            <div>
                <h1 className="text-3xl font-bold text-brand-light">Manage Users</h1>
                <p className="text-brand-light-muted">View, edit roles, and manage all registered users.</p>
            </div>
            
            <div className="mb-4 relative">
                <Search className="w-5 h-5 text-brand-light-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                    type="text"
                    placeholder="Search users by name or email..."
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
                                <th className="px-6 py-3 text-left font-medium">User</th>
                                <th className="px-6 py-3 text-left font-medium">Role</th>
                                <th className="px-6 py-3 text-left font-medium">Date Joined</th>
                                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {users.length > 0 ? users.map((user) => (
                                <tr key={user.id} className="hover:bg-white/5">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <Image className="h-10 w-10 rounded-full object-cover bg-white/5" src={user.avatar_url || '/images/avatar-placeholder.png'} alt={user.full_name || 'User avatar'} width={40} height={40}/>
                                            <div>
                                                <div className="font-medium text-brand-light">{user.full_name || 'N/A'}</div>
                                                <div className="text-brand-light-muted">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Menu as="div" className="relative inline-block text-left">
                                            <Menu.Button disabled={isPending} className="inline-flex items-center justify-between gap-x-1.5 rounded-full px-2.5 py-1 text-xs font-medium shadow-sm ring-1 ring-inset disabled:opacity-50 transition-colors group bg-white/5 text-white ring-white/10 hover:bg-white/10">
                                                <RoleBadge role={user.role} />
                                                <ChevronDown className="h-4 w-4 text-gray-400" />
                                            </Menu.Button>
                                            <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                                <Menu.Items className="absolute left-0 z-10 mt-2 w-40 origin-top-left rounded-md bg-[#1e1e1e] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                    <div className="py-1">
                                                        <Menu.Item><button onClick={() => handleRoleChange(user.id, 'user')} className="block w-full text-left px-4 py-2 text-sm text-brand-light hover:bg-white/10">Set as User</button></Menu.Item>
                                                        <Menu.Item><button onClick={() => handleRoleChange(user.id, 'blogger')} className="block w-full text-left px-4 py-2 text-sm text-brand-light hover:bg-white/10">Set as Blogger</button></Menu.Item>
                                                        <Menu.Item><button onClick={() => handleRoleChange(user.id, 'uploader')} className="block w-full text-left px-4 py-2 text-sm text-brand-light hover:bg-white/10">Set as Uploader</button></Menu.Item>
                                                        <Menu.Item><button onClick={() => handleRoleChange(user.id, 'admin')} className="block w-full text-left px-4 py-2 text-sm text-brand-light hover:bg-white/10">Set as Admin</button></Menu.Item>
                                                    </div>
                                                </Menu.Items>
                                            </Transition>
                                        </Menu>
                                    </td>
                                    <td className="px-6 py-4 text-brand-light-muted">{formatDate(user.created_at)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleDelete(user)} disabled={deletingId === user.id} className="flex items-center gap-1.5 text-sm font-semibold text-brand-secondary-red px-2 py-1 rounded-md transition-all duration-200 hover:bg-white/5 disabled:opacity-50">
                                                {deletingId === user.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                                <span>{deletingId === user.id ? 'Deleting...' : 'Delete'}</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={4} className="text-center py-12 text-brand-light-muted">No users found.</td></tr>
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