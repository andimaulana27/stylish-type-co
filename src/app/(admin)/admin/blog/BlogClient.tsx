'use client'; 

import { useState, useEffect, useMemo, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Database } from '@/lib/database.types';
import { format } from 'date-fns';
import { Edit, Trash, PlusCircle, Search, X, Loader2, Eye } from 'lucide-react';
import { bulkDeletePostsAction, deletePostAction } from '@/app/actions/blogActions';
import { toast } from 'react-hot-toast';
import { useDebouncedCallback } from 'use-debounce';
import Pagination from '@/components/Pagination';
import FilterDropdown from '@/components/FilterDropdown';

type Post = Database['public']['Tables']['posts']['Row'];
const blogCategories = [ "All", "Tutorial", "Inspiration", "Branding", "Business", "Freelancing", "Quotes", "Technology", "Lifestyle", "Finance" ];

interface BlogClientProps {
  initialPosts: Post[];
  initialTotalPages: number;
}

export default function BlogClient({ initialPosts, initialTotalPages }: BlogClientProps) {
    const [posts, setPosts] = useState<Post[]>(initialPosts);
    const [totalPages, setTotalPages] = useState(initialTotalPages);
    const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
    const [isPending, startTransition] = useTransition();
    
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    const currentPage = Number(searchParams.get('page')) || 1;
    const isAllSelected = useMemo(() => posts.length > 0 && selectedPosts.length === posts.length, [posts, selectedPosts]);

    useEffect(() => {
        setPosts(initialPosts);
        setTotalPages(initialTotalPages);
    }, [initialPosts, initialTotalPages]);

    const refreshData = () => {
        router.refresh();
        setSelectedPosts([]);
    };

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

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedPosts(e.target.checked ? posts.map(p => p.id) : []);
    };

    const handleSelectOne = (id: string, isChecked: boolean) => {
        if (isChecked) {
            setSelectedPosts(prev => [...prev, id]);
        } else {
            setSelectedPosts(prev => prev.filter(postId => postId !== id));
        }
    };

    const handleBulkDelete = () => {
        if (!window.confirm(`Are you sure you want to delete ${selectedPosts.length} selected post(s)?`)) return;

        startTransition(async () => {
            const postsToDelete = posts.filter(p => selectedPosts.includes(p.id));
            toast.loading(`Deleting ${postsToDelete.length} post(s)...`);
            const result = await bulkDeletePostsAction(postsToDelete);
            toast.dismiss();

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(result.success || 'Posts deleted!');
                refreshData();
            }
        });
    };

    const handleDelete = async (post: Post) => {
        if (!confirm('Are you sure you want to delete this post?')) return;
        
        startTransition(async () => {
            const result = await deletePostAction(post.id);
            if (result.success) {
                toast.success(result.success);
                refreshData();
            } else if (result.error) {
                toast.error(result.error);
            }
        });
    };

    const checkboxClasses = "h-4 w-4 rounded border-gray-500 text-brand-accent focus:ring-brand-accent bg-white/10 accent-brand-accent";

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-brand-light">Manage Blog</h1>
                    <p className="text-brand-light-muted">Create, edit, and manage all your blog posts.</p>
                </div>
                <Link href="/admin/blog/new" className="flex items-center gap-2 px-4 py-2 bg-brand-accent text-brand-darkest font-semibold rounded-lg hover:bg-brand-accent/90 transition-colors">
                    <PlusCircle size={20} />
                    <span>Add New Post</span>
                </Link>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-light-muted" />
                    <input type="text" placeholder="Search posts by title..." defaultValue={searchParams.get('search')?.toString()} onChange={(e) => handleSearch(e.target.value)}
                        className="w-full bg-brand-darkest border border-white/20 rounded-lg pl-10 pr-4 py-2 text-brand-light focus:outline-none focus:border-brand-accent" />
                </div>
                <FilterDropdown paramName="category" options={blogCategories} label="Category" />
            </div>
            
            {selectedPosts.length > 0 && (
                <div className="bg-brand-darkest p-4 rounded-lg border border-brand-accent/50 flex flex-col sm:flex-row justify-between items-center gap-4 animate-fade-in">
                    <p className="font-medium text-brand-light">{selectedPosts.length} post(s) selected</p>
                    <div className="flex items-center gap-2">
                        <button onClick={handleBulkDelete} disabled={isPending} className="px-3 py-1.5 text-xs font-semibold bg-red-500/20 text-red-300 rounded-md hover:bg-red-500/40 transition-colors disabled:opacity-50 flex items-center gap-1.5">
                            {isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash size={14} />}
                            Delete Selected
                        </button>
                        <button onClick={() => setSelectedPosts([])}><X size={18} className="text-brand-light-muted hover:text-white"/></button>
                    </div>
                </div>
            )}
            
            <div className="bg-brand-darkest rounded-lg border border-white/10 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="border-b border-white/10 text-brand-light-muted">
                        <tr>
                            <th className="p-4 w-4"><input type="checkbox" className={checkboxClasses} checked={isAllSelected} onChange={handleSelectAll} /></th>
                            <th className="p-4 font-medium">Image</th>
                            <th className="p-4 font-medium">Title</th>
                            <th className="p-4 font-medium">Category</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium">Date</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {posts.map((post) => (
                            <tr key={post.id} className={`transition-colors ${selectedPosts.includes(post.id) ? 'bg-brand-accent/10' : 'hover:bg-white/5'}`}>
                                <td className="p-4"><input type="checkbox" className={checkboxClasses} checked={selectedPosts.includes(post.id)} onChange={(e) => handleSelectOne(post.id, e.target.checked)} /></td>
                                <td className="p-4">
                                    <Image src={post.image_url || '/images/dummy/placeholder.jpg'} alt={post.title} width={80} height={53} className="rounded-md object-cover bg-white/10 aspect-[3/2]" />
                                </td>
                                <td className="px-6 py-4 font-medium text-brand-light">{post.title}</td>
                                <td className="px-6 py-4 text-brand-light-muted">{post.category}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                        post.is_published 
                                        ? 'bg-green-500/20 text-green-400' 
                                        : 'bg-yellow-500/20 text-yellow-400'
                                    }`}>
                                        {post.is_published ? 'Published' : 'Draft'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-brand-light-muted">{format(new Date(post.created_at), 'dd MMM yyyy')}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <Link href={`/blog/${post.slug}`} target="_blank" className="p-2 text-brand-secondary-green hover:bg-white/10 rounded-md" title="View"><Eye size={16} /></Link>
                                        <Link href={`/admin/blog/${post.id}/edit`} className="p-2 text-brand-secondary-gold hover:bg-white/10 rounded-md" title="Edit"><Edit size={16} /></Link>
                                        <button onClick={() => handleDelete(post)} disabled={isPending} className="p-2 text-brand-secondary-red hover:bg-white/10 rounded-md disabled:opacity-50" title="Delete">
                                            {isPending ? <Loader2 size={16} className="animate-spin" /> : <Trash size={16} />}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {posts.length === 0 && (
                    <div className="text-center py-12 text-brand-light-muted">No posts found.</div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                    />
                </div>
            )}
        </div>
    );
}