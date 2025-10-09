'use client'; 

import { useState, useTransition, useMemo, useEffect, useCallback, FormEvent, Fragment } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { PlusCircle, Trash2, Tag, Search, X, Save, Edit, Eye, Loader2 } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';

import { Database, type Tables } from '@/lib/database.types';
import {
  updateBundleInTableAction,
  deleteBundleAction,
  bulkApplyDiscountBundlesAction,
  bulkApplyDiscountToAllBundlesAction,
} from '@/app/actions/bundleActions';
import { getDiscountsAction, createDiscountAction, deleteDiscountAction } from '@/app/actions/productActions';
import Pagination from '@/components/Pagination';

type Discount = Tables<'discounts'>;
type Bundle = Tables<'bundles'> & {
  discounts: Pick<Discount, 'name' | 'percentage'> | null;
};

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
      <div className="bg-brand-darkest border border-white/10 rounded-lg p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-brand-light">{title}</h3>
          <button onClick={onClose} className="text-brand-light-muted hover:text-white"><X size={24} /></button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

const BundleActions = ({ bundleId, bundleSlug, onDelete }: { bundleId: string, bundleSlug: string, onDelete: (id: string) => void }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this bundle? This cannot be undone.')) {
      setIsDeleting(true);
      const result = await deleteBundleAction(bundleId);
      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        toast.success(result.success);
        onDelete(bundleId);
      }
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <Link href={`/bundles/${bundleSlug}`} target="_blank" className="p-2 text-brand-secondary-green hover:bg-white/10 rounded-md" title="View">
        <Eye size={16} />
      </Link>
      <button onClick={handleDelete} disabled={isDeleting} className="p-2 text-brand-secondary-red hover:bg-white/10 rounded-md disabled:opacity-50" title="Delete">
        {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
      </button>
    </div>
  );
}

interface BundlesClientProps {
  initialBundles: Bundle[];
  initialTotalPages: number;
  initialDiscounts: Discount[];
}

export default function BundlesClient({ initialBundles, initialTotalPages, initialDiscounts }: BundlesClientProps) {
  const [bundles, setBundles] = useState<Bundle[]>(initialBundles);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [discounts, setDiscounts] = useState<Discount[]>(initialDiscounts);
  
  const [selectedBundles, setSelectedBundles] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [editingBundleId, setEditingBundleId] = useState<string | null>(null);
  const [editedPrice, setEditedPrice] = useState<number>(0);
  const [isManageDiscountOpen, setManageDiscountOpen] = useState(false);
  const [isApplyDiscountOpen, setApplyDiscountOpen] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const currentPage = Number(searchParams.get('page')) || 1;
  const searchTerm = searchParams.get('search') || '';

  useEffect(() => {
    setBundles(initialBundles);
    setTotalPages(initialTotalPages);
  }, [initialBundles, initialTotalPages]);

  const refreshData = () => {
    router.refresh();
    setSelectedBundles([]);
  };

  const fetchDiscounts = useCallback(async () => {
    getDiscountsAction().then(res => {
      if (res.discounts) setDiscounts(res.discounts);
      if (res.error) toast.error(res.error);
    });
  }, []);

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    if (term) { params.set('search', term); } else { params.delete('search'); }
    router.replace(`${pathname}?${params.toString()}`);
  }, 300);

  const handleEditClick = (bundle: Bundle) => {
    setEditingBundleId(bundle.id);
    setEditedPrice(bundle.price);
  };
  const handleCancelEdit = () => setEditingBundleId(null);

  const handleSaveEdit = (bundleId: string) => {
    startTransition(() => {
      toast.promise(
        updateBundleInTableAction(bundleId, { price: editedPrice }).then(res => {
          if (res.error) throw new Error(res.error);
          refreshData();
          setEditingBundleId(null);
          return res.success;
        }),
        { loading: 'Saving...', success: (msg) => msg || 'Success!', error: (err) => err.message }
      );
    });
  };

  const handleCreateDiscount = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = String(formData.get('name'));
    const percentage = Number(formData.get('percentage'));
    if (!name || !percentage) return toast.error("Both fields are required.");
    startTransition(() => {
        createDiscountAction(name, percentage).then(res => {
            if (res.error) toast.error(res.error);
            else { toast.success("Discount created!"); fetchDiscounts(); (e.target as HTMLFormElement).reset(); }
        });
    });
  };

  const handleDeleteDiscount = (discountId: string) => {
    if (window.confirm("Are you sure? This will be removed from all associated products.")) {
        startTransition(() => {
            deleteDiscountAction(discountId).then(res => {
                if(res.error) toast.error(res.error);
                else { toast.success("Discount deleted!"); fetchDiscounts(); }
            });
        });
    }
  };

  const handleApplyDiscount = (discountId: string | null) => {
     startTransition(() => {
        toast.promise(
            bulkApplyDiscountBundlesAction(selectedBundles, discountId).then(res => {
                if (res.error) throw new Error(res.error);
                refreshData();
                setApplyDiscountOpen(false);
                return "Discount applied successfully!";
            }),
            { loading: 'Applying discount...', success: (msg) => msg, error: (err) => err.message }
        )
     });
  };
  
  const handleApplyDiscountToAll = (discountId: string | null) => {
    const actionMessage = discountId ? "apply this discount to all bundles" : "remove discounts from all bundles";
    if (window.confirm(`Are you sure you want to ${actionMessage}? This will affect every bundle in the database.`)) {
        startTransition(() => {
            toast.promise(
                bulkApplyDiscountToAllBundlesAction(discountId).then(res => {
                    if (res.error) throw new Error(res.error);
                    refreshData();
                    setApplyDiscountOpen(false);
                    return "Discount updated for all bundles!";
                }),
                { loading: 'Applying discount to all bundles...', success: (msg) => msg, error: (err) => err.message }
            );
        });
    }
  };

  const isAllSelected = useMemo(() => bundles.length > 0 && selectedBundles.length === bundles.length, [bundles, selectedBundles]);
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => setSelectedBundles(e.target.checked ? bundles.map(f => f.id) : []);
  const handleSelectOne = (id: string) => setSelectedBundles(prev => prev.includes(id) ? prev.filter(fontId => fontId !== id) : [...prev, id]);

  const checkboxClasses = "h-4 w-4 rounded-sm border-white/30 bg-white/10 text-brand-accent focus:ring-brand-accent focus:ring-offset-brand-darkest accent-brand-accent";
  const inlineInputStyles = "w-24 bg-white/10 border border-brand-accent rounded-md px-2 py-1 text-brand-light text-sm focus:outline-none focus:ring-1 focus:ring-brand-accent";

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-light">Manage Bundles</h1>
          <p className="text-brand-light-muted">Add, edit, or delete bundle products.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setManageDiscountOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-brand-primary-blue text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-brand-primary-blue/40 transition-all">
            <Tag size={16} /><span>Manage Discount</span>
          </button>
          <Link href="/admin/products/bundles/new" className="flex items-center gap-2 px-4 py-2 bg-brand-accent text-brand-darkest font-semibold rounded-lg transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-brand-accent/40">
            <PlusCircle size={20} /><span>Add New Bundle</span>
          </Link>
        </div>
      </div>
      <div className="relative flex-grow">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-light-muted" />
          <input type="text" placeholder="Search bundle by name..." className="w-full bg-brand-darkest border border-white/20 rounded-lg pl-10 pr-4 py-2 text-brand-light focus:outline-none focus:border-brand-accent" defaultValue={searchTerm} onChange={(e) => handleSearch(e.target.value)} />
      </div>

      {selectedBundles.length > 0 && (
         <div className="bg-brand-darkest p-4 rounded-lg border border-brand-accent/50 flex flex-col md:flex-row justify-between items-center gap-4 animate-fade-in">
          <p className="font-medium text-brand-light">{selectedBundles.length} bundle(s) selected</p>
          <div className="flex items-center gap-2">
            <button disabled={isPending} className="px-3 py-1.5 text-xs font-semibold bg-white/10 text-brand-light rounded-md hover:bg-white/20 transition-colors disabled:opacity-50">Apply Staff Picks</button>
            <button onClick={() => setApplyDiscountOpen(true)} disabled={isPending} className="px-3 py-1.5 text-xs font-semibold bg-white/10 text-brand-light rounded-md hover:bg-white/20 transition-colors disabled:opacity-50">Edit Discount</button>
            <button onClick={() => setSelectedBundles([])}><X size={18} className="text-brand-light-muted hover:text-white"/></button>
          </div>
        </div>
      )}

      <div className="bg-brand-darkest rounded-lg border border-white/10 overflow-visible">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 text-brand-light-muted">
                <tr>
                  <th className="p-4 w-4"><input type="checkbox" className={checkboxClasses} checked={isAllSelected} onChange={handleSelectAll} /></th>
                  <th className="p-4 font-medium">Image</th>
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Price</th>
                  <th className="p-4 font-medium">Discount</th>
                  <th className="p-4 font-medium">Staff Pick</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bundles.map((bundle: Bundle) => {
                    const isEditing = editingBundleId === bundle.id;
                    return (
                    <tr key={bundle.id} className={`border-b border-white/10 last:border-b-0 transition-colors ${selectedBundles.includes(bundle.id) ? 'bg-brand-accent/10' : 'hover:bg-white/5'}`}>
                      <td className="p-4"><input type="checkbox" className={checkboxClasses} checked={selectedBundles.includes(bundle.id)} onChange={() => handleSelectOne(bundle.id)} /></td>
                      <td className="p-4"><Image src={bundle.preview_image_urls?.[0] || '/images/dummy/placeholder.jpg'} alt={bundle.name} width={60} height={40} className="rounded-md object-cover bg-white/10" /></td>
                      <td className="p-4 text-brand-light font-medium">{bundle.name}</td>
                      <td className="p-4">
                        {isEditing ? ( <input type="number" value={editedPrice} onChange={(e) => setEditedPrice(Number(e.target.value))} className={inlineInputStyles} step="0.01"/> ) : ( <span className="text-brand-light">${bundle.price?.toFixed(2)}</span> )}
                      </td>
                      <td className="p-4">{/* Menu for Discount */}</td>
                      <td className="p-4">{/* Menu for Staff Pick */}</td>
                      <td className="p-4 text-right">
                         <div className="flex items-center justify-end gap-2">
                          {isEditing ? (
                            <>
                              <button onClick={() => handleSaveEdit(bundle.id)} disabled={isPending} className="p-2 text-green-400 hover:bg-white/10 rounded-md" title="Save"><Save size={16} /></button>
                              <button onClick={handleCancelEdit} className="p-2 text-red-400 hover:bg-white/10 rounded-md" title="Cancel"><X size={16} /></button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => handleEditClick(bundle)} className="p-2 text-brand-secondary-gold hover:bg-white/10 rounded-md" title="Inline Edit"><Edit size={16} /></button>
                              <BundleActions bundleId={bundle.id} bundleSlug={bundle.slug} onDelete={() => refreshData()} />
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    );
                })}
              </tbody>
            </table>
             {bundles.length === 0 && <p className="text-center py-8 text-brand-light-muted">No bundles found.</p>}
          </div>
        </div>
      
      {totalPages > 1 && ( <Pagination totalPages={totalPages} currentPage={currentPage} /> )}
      
      <Modal isOpen={isManageDiscountOpen} onClose={() => setManageDiscountOpen(false)} title="Manage Discounts">
        <div className="space-y-4">
          <form className="space-y-2" onSubmit={handleCreateDiscount}>
            <input name="name" placeholder="Discount Name (e.g., Summer Sale)" className="w-full bg-white/10 rounded-md p-2 text-sm focus:outline-none focus:border-brand-accent" required/>
            <input name="percentage" type="number" min="1" max="99" placeholder="Percentage (e.g., 50)" className="w-full bg-white/10 rounded-md p-2 text-sm focus:outline-none focus:border-brand-accent" required/>
            <button type="submit" disabled={isPending} className="w-full bg-brand-accent text-brand-darkest font-semibold p-2 rounded-md disabled:opacity-50">
              {isPending ? 'Adding...' : 'Add Discount'}
            </button>
          </form>
          <div className="border-t border-white/10 pt-4 space-y-2 max-h-64 overflow-y-auto">
            <h4 className="font-semibold">Existing Discounts</h4>
            {discounts.length === 0 && <p className="text-sm text-brand-light-muted">No discounts created yet.</p>}
            {discounts.map(d => (
              <div key={d.id} className="flex justify-between items-center bg-white/5 p-2 rounded-md">
                <span>{d.name} ({d.percentage}%)</span>
                <button onClick={() => handleDeleteDiscount(d.id)} disabled={isPending}><Trash2 size={16} className="text-red-400 hover:text-red-600"/></button>
              </div>
            ))}
          </div>
        </div>
      </Modal>
      <Modal isOpen={isApplyDiscountOpen} onClose={() => setApplyDiscountOpen(false)} title="Edit Discount">
        <div className="space-y-2">
            <p className="text-sm text-brand-light-muted mb-4">Select a discount to apply to the {selectedBundles.length > 0 ? `${selectedBundles.length} selected bundle(s)` : 'selected bundle(s)'}.</p>
            {discounts.map(d => (
                <button key={d.id} onClick={() => handleApplyDiscount(d.id)} disabled={isPending || selectedBundles.length === 0} className="w-full text-left p-2 rounded-md hover:bg-white/10 disabled:opacity-50">
                    {d.name} ({d.percentage}%)
                </button>
            ))}
            <div className="border-t border-white/10 pt-2 mt-2">
                <button onClick={() => handleApplyDiscount(null)} disabled={isPending || selectedBundles.length === 0} className="w-full text-left p-2 rounded-md text-red-400 hover:bg-red-500/20 disabled:opacity-50">
                    Remove Discount from Selected
                </button>
            </div>
            
            <div className="border-t border-white/10 pt-4 mt-4">
                <h4 className="font-semibold text-brand-accent mb-2 text-sm">Global Actions</h4>
                <p className="text-xs text-brand-light-muted mb-3">These actions will affect ALL bundles in your database, not just the selected ones.</p>
                {discounts.map(d => (
                    <button key={`all-${d.id}`} type="button" onClick={() => handleApplyDiscountToAll(d.id)} disabled={isPending} className="w-full text-left p-2 rounded-md hover:bg-white/10 disabled:opacity-50 text-yellow-400">
                        Apply &quot;{d.name}&quot; to All Bundles
                    </button>
                ))}
                <button type="button" onClick={() => handleApplyDiscountToAll(null)} disabled={isPending} className="w-full text-left p-2 rounded-md text-red-400 hover:bg-red-500/20 disabled:opacity-50">
                    Remove Discount from All Bundles
                </button>
            </div>
        </div>
      </Modal>
    </div>
  );
}