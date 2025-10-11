'use client'; 

import { useState, useTransition, useMemo, useEffect, FormEvent, Fragment, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { PlusCircle, Trash2, Tag, Search, X, ChevronDown, Check, Save, Edit, Eye, Loader2, TrendingUp } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import { useDebouncedCallback } from 'use-debounce';
import toast from 'react-hot-toast';

import { Database, type Tables } from '@/lib/database.types';
import {
  bulkApplyStaffPicksAction,
  bulkApplyDiscountAction,
  getDiscountsAction,
  createDiscountAction,
  deleteDiscountAction,
  updateFontStaffPickAction,
  updateFontDiscountAction,
  updateFontInTableAction,
  deleteFontAction,
  bulkApplyDiscountToAllFontsAction,
} from '@/app/actions/productActions';
import Pagination from '@/components/Pagination';

type Discount = Tables<'discounts'>;
type Font = Tables<'fonts'> & {
  discounts: Pick<Discount, 'name' | 'percentage'> | null;
};

const categories = ["All", "Serif Display", "Sans Serif", "Slab Serif", "Groovy", "Script", "Blackletter", "Western", "Sport", "Sci-Fi"];

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
      <div className="bg-brand-darkest border border-white/10 rounded-lg p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-semibold text-brand-light">{title}</h3><button onClick={onClose} className="text-brand-light-muted hover:text-white"><X size={24} /></button></div>
        <div>{children}</div>
      </div>
    </div>
  );
};

const FontActions = ({ font, onDelete }: { font: Font, onDelete: (id: string) => void }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this font?')) {
      setIsDeleting(true);
      const result = await deleteFontAction(font.id);
      if (result?.error) { toast.error(result.error); } 
      else { toast.success('Font deleted successfully!'); onDelete(font.id); }
      setIsDeleting(false);
    }
  };
  return (
    <div className="flex items-center justify-end gap-1">
      <Link href={`/product/${font.slug}`} target="_blank" className="p-2 text-brand-secondary-green hover:bg-white/10 rounded-md" title="View"><Eye size={16} /></Link>
      <Link href={`/admin/products/fonts/${font.id}/edit`} className="p-2 text-brand-secondary-gold hover:bg-white/10 rounded-md" title="Edit Page"><Edit size={16} /></Link>
      <button onClick={handleDelete} disabled={isDeleting} className="p-2 text-brand-secondary-red hover:bg-white/10 rounded-md disabled:opacity-50" title="Delete">
        {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
      </button>
    </div>
  );
}

interface FontsClientProps {
  initialFonts: Font[];
  initialTotalPages: number;
  initialDiscounts: Discount[];
}

export default function FontsClient({ initialFonts, initialTotalPages, initialDiscounts }: FontsClientProps) {
  const [fonts, setFonts] = useState<Font[]>(initialFonts);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [discounts, setDiscounts] = useState<Discount[]>(initialDiscounts);

  const [selectedFonts, setSelectedFonts] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [editingFontId, setEditingFontId] = useState<string | null>(null);
  const [editedPrice, setEditedPrice] = useState<number>(0);
  const [editedCategory, setEditedCategory] = useState<string | null>(null);
  const [isManageDiscountOpen, setManageDiscountOpen] = useState(false);
  const [isApplyDiscountOpen, setApplyDiscountOpen] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const currentPage = Number(searchParams.get('page')) || 1;
  const searchTerm = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || 'All';

  useEffect(() => {
    setFonts(initialFonts);
    setTotalPages(initialTotalPages);
  }, [initialFonts, initialTotalPages]);

  const refreshData = () => {
      router.refresh();
      setSelectedFonts([]);
  };

  const fetchDiscounts = useCallback(async () => {
    const res = await getDiscountsAction();
    if (res.discounts) setDiscounts(res.discounts);
    if (res.error) toast.error(res.error);
  }, []);

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    if (term) { params.set('search', term); } else { params.delete('search'); }
    router.replace(`${pathname}?${params.toString()}`);
  }, 300);
  
  const handleCategoryFilter = (category: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    if (category && category !== 'All') { params.set('category', category); } else { params.delete('category'); }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const isAllSelected = useMemo(() => fonts.length > 0 && selectedFonts.length === fonts.length, [fonts, selectedFonts]);
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => setSelectedFonts(e.target.checked ? fonts.map(f => f.id) : []);
  const handleSelectOne = (id: string) => setSelectedFonts(prev => prev.includes(id) ? prev.filter(fontId => fontId !== id) : [...prev, id]);
  
  const handleApplyStaffPicks = () => {
    startTransition(() => {
      toast.promise(
        bulkApplyStaffPicksAction(selectedFonts, true).then(res => {
          if (res.error) throw new Error(res.error);
          refreshData();
          return res.success;
        }),
        { loading: 'Applying staff picks...', success: (msg) => msg || 'Success!', error: (err) => err.message }
      );
    });
  };

   const handleApplyDiscount = (discountId: string | null) => {
     startTransition(() => {
        toast.promise(
            bulkApplyDiscountAction(selectedFonts, discountId).then(res => {
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
    const actionMessage = discountId ? "apply this discount to all fonts" : "remove discounts from all fonts";
    if (window.confirm(`Are you sure you want to ${actionMessage}? This will affect every font in the database.`)) {
        startTransition(() => {
            toast.promise(
                bulkApplyDiscountToAllFontsAction(discountId).then(res => {
                    if (res.error) throw new Error(res.error);
                    refreshData();
                    setApplyDiscountOpen(false);
                    return res.success || "Discount updated for all fonts!";
                }),
                { loading: 'Applying discount to all fonts...', success: (msg) => msg, error: (err) => err.message }
            );
        });
    }
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
                else { toast.success("Discount deleted!"); fetchDiscounts(); refreshData(); }
            });
        });
    }
  };

  const handleSetStaffPick = (fontId: string, isStaffPick: boolean) => {
    startTransition(() => {
      updateFontStaffPickAction(fontId, isStaffPick).then(res => {
        if (res.error) toast.error(res.error);
        else { toast.success('Staff pick updated!'); refreshData(); }
      });
    });
  }

  const handleSetDiscount = (fontId: string, discountId: string | null) => {
    startTransition(() => {
      updateFontDiscountAction(fontId, discountId).then(res => {
        if (res.error) toast.error(res.error);
        else { toast.success('Discount updated!'); refreshData(); }
      });
    });
  }

  const handleEditClick = (font: Font) => {
    setEditingFontId(font.id);
    setEditedPrice(font.price);
    setEditedCategory(font.category);
  };
  const handleCancelEdit = () => setEditingFontId(null);
  
  const handleSaveEdit = (fontId: string) => {
    startTransition(() => {
      const updates: { price?: number; category?: string } = {};
      const originalFont = fonts.find(f => f.id === fontId);
      if (editedPrice !== originalFont?.price) updates.price = editedPrice;
      if (editedCategory !== originalFont?.category) updates.category = editedCategory ?? undefined;
      if (Object.keys(updates).length === 0) { setEditingFontId(null); return; }
      toast.promise(updateFontInTableAction(fontId, updates).then(res => {
        if (res.error) throw new Error(res.error);
        setFonts(prev => prev.map(f => f.id === fontId ? {...f, ...updates} : f));
        setEditingFontId(null);
        return res.success;
      }), { loading: 'Saving...', success: (msg) => msg || 'Success!', error: (err) => err.message });
    });
  };
  
  const inlineInputStyles = "w-24 bg-white/10 border border-brand-accent rounded-md px-2 py-1 text-brand-light text-sm focus:outline-none focus:ring-1 focus:ring-brand-accent";
  const checkboxClasses = "h-4 w-4 rounded border-gray-500 text-brand-accent focus:ring-brand-accent bg-white/10 accent-brand-accent";

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div><h1 className="text-3xl font-bold text-brand-light">Manage Fonts</h1><p className="text-brand-light-muted">Add, edit, or delete individual font products.</p></div>
        <div className="flex items-center gap-2">
          <button onClick={() => setManageDiscountOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-brand-primary-blue text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-brand-primary-blue/40 transition-all"><Tag size={16} /><span>Manage Discount</span></button>
          <Link href="/admin/products/fonts/new" className="flex items-center gap-2 px-4 py-2 bg-brand-accent text-brand-darkest font-semibold rounded-lg transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-brand-accent/40"><PlusCircle size={20} /><span>Add New Font</span></Link>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-light-muted" /><input type="text" placeholder="Search font by name..." className="w-full bg-brand-darkest border border-white/20 rounded-lg pl-10 pr-4 py-2 text-brand-light focus:outline-none focus:border-brand-accent" defaultValue={searchTerm} onChange={(e) => handleSearch(e.target.value)} /></div>
        <Menu as="div" className="relative inline-block text-left w-full md:w-auto">{({ open }) => (<><div><Menu.Button className="inline-flex w-full justify-between items-center gap-x-2 rounded-lg bg-brand-darkest border border-white/20 px-4 py-2 text-sm font-medium text-brand-light shadow-sm hover:border-brand-accent transition-colors duration-200 group"><span className="group-hover:text-brand-accent transition-colors duration-200">Category: {selectedCategory}</span><ChevronDown className={`h-5 w-5 text-brand-light-muted group-hover:text-brand-accent transition-transform duration-200 ${open ? 'rotate-180' : ''}`} aria-hidden="true" /></Menu.Button></div><Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95"><Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-[#1e1e1e] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"><div className="py-1">{categories.map((category) => (<Menu.Item key={category}>{({ active }) => (<button onClick={() => handleCategoryFilter(category)} className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 transition-colors duration-150 ${active ? 'bg-brand-accent text-brand-darkest' : category === selectedCategory ? 'text-brand-accent' : 'text-brand-light'}`}><div className="w-5 flex-shrink-0">{category === selectedCategory && <Check size={16} className={active ? 'text-brand-darkest' : 'text-brand-accent'} />}</div><span>{category}</span></button>)}</Menu.Item>))}</div></Menu.Items></Transition></>)}</Menu>
      </div>
      {selectedFonts.length > 0 && (
        <div className="bg-brand-darkest p-4 rounded-lg border border-brand-accent/50 flex flex-col md:flex-row justify-between items-center gap-4 animate-fade-in">
          <p className="font-medium text-brand-light">{selectedFonts.length} font(s) selected</p>
          <div className="flex items-center gap-2">
            <button onClick={handleApplyStaffPicks} disabled={isPending} className="px-3 py-1.5 text-xs font-semibold bg-white/10 text-brand-light rounded-md hover:bg-white/20 transition-colors disabled:opacity-50">Apply Staff Picks</button>
            <button onClick={() => setApplyDiscountOpen(true)} disabled={isPending} className="px-3 py-1.5 text-xs font-semibold bg-white/10 text-brand-light rounded-md hover:bg-white/20 transition-colors disabled:opacity-50">Edit Discount</button>
            <button onClick={() => setSelectedFonts([])}><X size={18} className="text-brand-light-muted hover:text-white"/></button>
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
                <th className="p-4 font-medium">Sales</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Discount</th>
                <th className="p-4 font-medium">Staff Pick</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {fonts.length === 0 ? (<tr><td colSpan={9} className="text-center p-8 text-brand-light-muted">No fonts found.</td></tr>) : (fonts.map((font) => {
                  const isEditing = editingFontId === font.id;
                  return (
                    <tr key={font.id} className={`border-b border-white/10 last:border-b-0 transition-colors ${selectedFonts.includes(font.id) ? 'bg-brand-accent/10' : 'hover:bg-white/5'}`}>
                      <td className="p-4"><input type="checkbox" className={checkboxClasses} checked={selectedFonts.includes(font.id)} onChange={() => handleSelectOne(font.id)} /></td>
                      <td className="p-4"><Image src={font.preview_image_urls?.[0] || '/images/dummy/placeholder.jpg'} alt={font.name} width={60} height={40} className="rounded-md object-cover bg-white/10" /></td>
                      <td className="p-4 text-brand-light font-medium">{font.name}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-brand-light-muted">
                            <TrendingUp size={14} />
                            <span className="font-semibold">{font.sales_count}</span>
                        </div>
                      </td>
                      <td className="p-4">{isEditing ? (<Menu as="div" className="relative inline-block text-left"><Menu.Button className="inline-flex w-36 justify-center items-center gap-x-1.5 rounded-md bg-white/10 px-3 py-1.5 text-sm font-medium text-white shadow-sm ring-1 ring-inset ring-brand-accent hover:bg-white/20 group"><span className="truncate">{editedCategory || 'Select'}</span><ChevronDown className="-mr-1 h-5 w-5 text-brand-light-muted" /></Menu.Button><Transition as={Fragment}><Menu.Items className="absolute left-0 z-10 mt-2 w-56 origin-top-left rounded-md bg-[#1e1e1e] shadow-lg ring-1 ring-black/5 focus:outline-none"><div className="py-1">{categories.filter(c=>c !== 'All').map(c => (<Menu.Item key={c}>{({ active }) => (<button type="button" onClick={() => setEditedCategory(c)} className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 ${active ? 'bg-brand-accent text-brand-darkest' : 'text-brand-light'}`}><div className="w-5">{editedCategory === c && <Check size={16}/>}</div><span>{c}</span></button>)}</Menu.Item>))}</div></Menu.Items></Transition></Menu>) : (<span className="text-brand-light-muted">{font.category}</span>)}</td>
                      <td className="p-4">{isEditing ? (<input type="number" value={editedPrice} onChange={(e) => setEditedPrice(Number(e.target.value))} className={inlineInputStyles} step="0.01"/>) : (<span className="text-brand-light">${font.price?.toFixed(2)}</span>)}</td>
                      <td className="p-4"><Menu as="div" className="relative inline-block text-left"><Menu.Button disabled={isPending || isEditing} className={`inline-flex w-full items-center justify-between gap-x-1.5 rounded-full px-2.5 py-1 text-xs font-medium shadow-sm ring-1 ring-inset disabled:opacity-50 group ${font.discounts ? 'bg-brand-secondary-red/20 text-brand-secondary-red ring-brand-secondary-red/30 hover:bg-brand-secondary-red/30' : 'bg-white/5 text-white ring-white/10 hover:bg-white/10'}`}><span className="truncate pr-1">{font.discounts ? `${font.discounts.name} (${font.discounts.percentage}%)` : 'None'}</span><ChevronDown className="h-4 w-4 text-gray-400" /></Menu.Button><Transition as={Fragment}><Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-[#1e1e1e] shadow-lg ring-1 ring-black/5 focus:outline-none"><div className="py-1"><Menu.Item><button type="button" onClick={() => handleSetDiscount(font.id, null)} className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10">Remove Discount</button></Menu.Item>{discounts.map(d => (<Menu.Item key={d.id}><button type="button" onClick={() => handleSetDiscount(font.id, d.id)} className="block w-full text-left px-4 py-2 text-sm text-brand-light hover:bg-white/10">{d.name} ({d.percentage}%)</button></Menu.Item>))}</div></Menu.Items></Transition></Menu></td>
                      <td className="p-4"><Menu as="div" className="relative inline-block text-left"><Menu.Button disabled={isPending || isEditing} className={`inline-flex w-full items-center justify-between gap-x-1.5 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm ring-1 ring-inset disabled:opacity-50 ${font.staff_pick ? 'bg-brand-secondary-purple/20 text-brand-secondary-purple ring-brand-secondary-purple/30' : 'bg-gray-500/20 text-gray-400 ring-gray-500/30'}`}>{font.staff_pick ? 'Yes' : 'No'}<ChevronDown className="-mr-0.5 h-4 w-4" /></Menu.Button><Transition as={Fragment}><Menu.Items className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-[#1e1e1e] shadow-lg ring-1 ring-black/5 focus:outline-none"><div className="py-1"><Menu.Item><button type="button" onClick={() => handleSetStaffPick(font.id, true)} className="block w-full text-left px-4 py-2 text-sm text-brand-light hover:bg-white/10">Set as Staff Pick</button></Menu.Item><Menu.Item><button type="button" onClick={() => handleSetStaffPick(font.id, false)} className="block w-full text-left px-4 py-2 text-sm text-brand-light hover:bg-white/10">Remove Staff Pick</button></Menu.Item></div></Menu.Items></Transition></Menu></td>
                      <td className="p-4 text-right"><div className="flex items-center justify-end gap-2">{isEditing ? (<><button type="button" onClick={() => handleSaveEdit(font.id)} disabled={isPending} className="p-2 text-green-400 hover:bg-white/10 rounded-md"><Save size={16} /></button><button type="button" onClick={handleCancelEdit} className="p-2 text-red-400 hover:bg-white/10 rounded-md"><X size={16} /></button></>) : (<><button type="button" onClick={() => handleEditClick(font)} className="p-2 text-brand-secondary-gold hover:bg-white/10 rounded-md"><Edit size={16} /></button><FontActions font={font} onDelete={() => refreshData()} /></>)}</div></td>
                    </tr>
                  );
              }))}
            </tbody>
          </table>
        </div>
      </div>
      {totalPages > 1 && (<Pagination totalPages={totalPages} currentPage={currentPage} />)}
      <Modal isOpen={isManageDiscountOpen} onClose={() => setManageDiscountOpen(false)} title="Manage Discounts">
        <div className="space-y-4">
          <form className="space-y-2" onSubmit={handleCreateDiscount}><input name="name" placeholder="Discount Name (e.g., Summer Sale)" className="w-full bg-white/10 rounded-md p-2 text-sm focus:outline-none focus:border-brand-accent" required/><input name="percentage" type="number" min="1" max="99" placeholder="Percentage (e.g., 50)" className="w-full bg-white/10 rounded-md p-2 text-sm focus:outline-none focus:border-brand-accent" required/><button type="submit" disabled={isPending} className="w-full bg-brand-accent text-brand-darkest font-semibold p-2 rounded-md disabled:opacity-50">{isPending ? 'Adding...' : 'Add Discount'}</button></form>
          <div className="border-t border-white/10 pt-4 space-y-2 max-h-64 overflow-y-auto"><h4 className="font-semibold">Existing Discounts</h4>{discounts.length === 0 && <p className="text-sm text-brand-light-muted">No discounts created yet.</p>}{discounts.map(d => (<div key={d.id} className="flex justify-between items-center bg-white/5 p-2 rounded-md"><span>{d.name} ({d.percentage}%)</span><button type="button" onClick={() => handleDeleteDiscount(d.id)} disabled={isPending}><Trash2 size={16} className="text-red-400 hover:text-red-600"/></button></div>))}</div>
        </div>
      </Modal>
      <Modal isOpen={isApplyDiscountOpen} onClose={() => setApplyDiscountOpen(false)} title="Edit Discount">
        <div className="space-y-2">
            <p className="text-sm text-brand-light-muted mb-4">Select a discount to apply to the {selectedFonts.length > 0 ? `${selectedFonts.length} selected font(s)` : 'selected font(s)'}.</p>
            {discounts.map(d => (
                <button key={d.id} type="button" onClick={() => handleApplyDiscount(d.id)} disabled={isPending || selectedFonts.length === 0} className="w-full text-left p-2 rounded-md hover:bg-white/10 disabled:opacity-50">
                    {d.name} ({d.percentage}%)
                </button>
            ))}
            <div className="border-t border-white/10 pt-2 mt-2">
                <button type="button" onClick={() => handleApplyDiscount(null)} disabled={isPending || selectedFonts.length === 0} className="w-full text-left p-2 rounded-md text-red-400 hover:bg-red-500/20 disabled:opacity-50">
                    Remove Discount from Selected
                </button>
            </div>
            
            <div className="border-t border-white/10 pt-4 mt-4">
                <h4 className="font-semibold text-brand-accent mb-2 text-sm">Global Actions</h4>
                <p className="text-xs text-brand-light-muted mb-3">These actions will affect ALL fonts in your database, not just the selected ones.</p>
                {discounts.map(d => (
                    <button key={`all-${d.id}`} type="button" onClick={() => handleApplyDiscountToAll(d.id)} disabled={isPending} className="w-full text-left p-2 rounded-md hover:bg-white/10 disabled:opacity-50 text-yellow-400">
                        Apply &quot;{d.name}&quot; to All Fonts
                    </button>
                ))}
                <button type="button" onClick={() => handleApplyDiscountToAll(null)} disabled={isPending} className="w-full text-left p-2 rounded-md text-red-400 hover:bg-red-500/20 disabled:opacity-50">
                    Remove Discount from All Fonts
                </button>
            </div>
        </div>
      </Modal>
    </div>
  );
}