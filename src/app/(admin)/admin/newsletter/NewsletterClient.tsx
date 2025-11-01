// src/app/(admin)/admin/newsletter/NewsletterClient.tsx
'use client';

import { useState, useTransition, useEffect, Fragment, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import Image from 'next/image';
import { Search, Trash2, Loader2, Send, X, Check, ChevronDown, Type } from 'lucide-react';
import toast from 'react-hot-toast';
import {
    getCombinedSubscribersAction,
    deleteSubscriberAction,
    sendNewsletterAction,
    type CombinedSubscriber
} from '@/app/actions/newsletterActions';
import Pagination from '@/components/Pagination';
import FilterDropdown from '@/components/FilterDropdown';
import { Dialog, Transition, Listbox, Menu } from '@headlessui/react';
// --- Tiptap Imports ---
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
// --- Akhir Tiptap Imports ---
// --- PERUBAHAN 1: Ganti action yang diimpor ---
import { getAllProductsForNewsletterAction } from '@/app/actions/productActions';
// --- AKHIR PERUBAHAN 1 ---
import { ProductData } from '@/lib/dummy-data';

const ITEMS_PER_PAGE = 20;
const subscriberCategories = ["All", "Registered User", "Anonymous Subscriber"];

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

// Komponen Modal Send Newsletter
const SendNewsletterModal = ({
    isOpen,
    onClose,
    targetType,
    targetCategory,
    selectedEmails
}: {
    isOpen: boolean;
    onClose: () => void;
    targetType: 'all' | 'category' | 'selected';
    targetCategory?: string;
    selectedEmails?: string[];
}) => {
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [isSending, startSendingTransition] = useTransition();
    // --- PERUBAHAN 2: Ubah nama state agar lebih jelas (opsional tapi bagus) ---
    const [allProducts, setAllProducts] = useState<ProductData[]>([]);
    // --- AKHIR PERUBAHAN 2 ---
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [showProductSelector, setShowProductSelector] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
            Link.configure({ openOnClick: false, autolink: true }),
            ImageExtension.configure({ inline: false }),
        ],
        content: content,
        onUpdate: ({ editor }) => {
            setContent(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none text-brand-light font-light leading-relaxed focus:outline-none p-4 w-full bg-white/5 border border-transparent rounded-b-md min-h-[250px]',
            },
        },
        immediatelyRender: false,
    });

    useEffect(() => {
        // --- PERUBAHAN 3: Panggil action baru ---
        if (isOpen && allProducts.length === 0) {
            setLoadingProducts(true);
            getAllProductsForNewsletterAction() // <-- Panggil action baru
                .then(result => {
                    if (result.products) {
                        setAllProducts(result.products); // <-- Simpan semua produk
                    } else {
                        toast.error(result.error || "Failed to load products for newsletter.");
                    }
                })
                .catch(() => toast.error("Error loading products for newsletter."))
                .finally(() => setLoadingProducts(false));
        }
        // --- AKHIR PERUBAHAN 3 ---
        if (isOpen && editor && !editor.isDestroyed && editor.getHTML() !== content) {
             editor.commands.setContent(content, false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, editor, allProducts.length]); // <-- Ubah dependensi state

    // --- PERUBAHAN 4: Update styling HTML produk ---
    const insertFontHtml = (product: ProductData) => {
        if (!editor) return;

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        // Pastikan URL benar untuk font dan bundle
        const productUrl = `${siteUrl}/${product.type === 'font' ? 'fonts' : 'bundles'}/${product.slug}`;

        // Styling harga (harga asli dicoret, harga diskon oranye tebal)
        const priceHtml = product.originalPrice
            ? `<span style="text-decoration: line-through; color: #9CA3AF; margin-right: 8px;">$${product.originalPrice.toFixed(2)}</span> <span style="font-weight: bold; color: #f47253;">$${product.price.toFixed(2)}</span>` // Oranye untuk harga diskon
            : `<span style="font-weight: bold; color: #f47253;">$${product.price.toFixed(2)}</span>`; // Oranye untuk harga normal

        // Styling badge diskon (jika ada)
        const discountBadge = product.discount
            ? `<span style="background-color: #f47253; color: #111827; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; margin-left: 8px; vertical-align: middle;">${product.discount}</span>`
            : '';

        // Template HTML dengan styling inline
        const productHtmlSnippet = `
          <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border: 1px solid #374151; border-radius: 8px; margin: 25px 0; background-color: #1F2937; font-family: Poppins, sans-serif;">
            <tr>
              <td style="padding: 20px;">
                <table width="100%" border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="120" valign="top" style="padding-right: 20px;">
                      <a href="${productUrl}" target="_blank" style="display: block; border-radius: 4px; overflow: hidden;">
                        <img src="${product.imageUrl}" alt="${product.name}" width="120" style="display: block; max-width: 100%; height: auto; aspect-ratio: 3/2; object-fit: cover; border: 0;">
                      </a>
                    </td>
                    <td valign="top">
                      {/* Judul Produk - Oranye Tebal */}
                      <a href="${productUrl}" target="_blank" style="font-size: 20px; line-height: 1.3; font-weight: 700; color: #f47253; text-decoration: none; display: block; margin-bottom: 6px;">
                        ${product.name}
                      </a>
                      {/* Deskripsi/Kategori - Abu-abu Muda */}
                      <p style="font-size: 14px; color: #D1D5DB; margin: 0 0 10px 0; line-height: 1.5;">
                        ${product.description} ${discountBadge}
                      </p>
                      {/* Harga - Oranye Tebal (atau kombinasi) */}
                      <p style="font-size: 18px; color: #F9FAFB; margin: 0 0 15px 0;">
                        ${priceHtml}
                      </p>
                      {/* Tombol - Oranye */}
                      <a href="${productUrl}" target="_blank" style="background-color: #f47253; color: #111827; padding: 10px 20px; border-radius: 9999px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block; line-height: 1;">
                        View Product
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          <p></p> {/* Paragraf kosong untuk spasi */}
        `;

        editor.chain().focus().insertContent(productHtmlSnippet).run();
        setShowProductSelector(false); // Tutup pemilih
    };
    // --- AKHIR PERUBAHAN 4 ---

    const getRecipientDescription = () => {
        if (targetType === 'all') return 'All Subscribers';
        if (targetType === 'category') return `Category: ${targetCategory}`;
        if (targetType === 'selected') return `${selectedEmails?.length || 0} Selected Subscribers`;
        return '';
    };

    const handleSubmit = () => {
        if (!subject || !content) {
            toast.error('Subject and content are required.');
            return;
        }
        if (content.length < 50) {
             toast.error('Content seems too short. Please write a bit more.');
             return;
        }

        let recipientsPayload: any;
        if (targetType === 'all') {
            recipientsPayload = { type: 'all' };
        } else if (targetType === 'category' && targetCategory) {
            recipientsPayload = { type: 'category', category: targetCategory as 'Registered User' | 'Anonymous Subscriber' };
        } else if (targetType === 'selected' && selectedEmails) {
            recipientsPayload = { type: 'list', emails: selectedEmails };
        } else {
            toast.error('Invalid recipient selection.');
            return;
        }

        startSendingTransition(async () => {
            toast.loading('Sending newsletter...');
            const result = await sendNewsletterAction(subject, content, recipientsPayload);
            toast.dismiss();
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(result.success || 'Newsletter sent!');
                setSubject('');
                setContent('');
                if(editor && !editor.isDestroyed) editor.commands.clearContent(true);
                onClose();
            }
        });
    };

    useEffect(() => {
        return () => {
            if (editor && !editor.isDestroyed) {
                editor.destroy();
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editor]);

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                {/* Overlay */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                 >
                     <div className="fixed inset-0 bg-black/60" />
                </Transition.Child>
                {/* Modal Panel */}
                 <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                             enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-lg bg-brand-darkest border border-white/10 p-6 text-left align-middle shadow-xl transition-all">
                                {/* Judul Modal */}
                                <Dialog.Title as="h3" className="text-xl font-semibold leading-6 text-brand-light flex justify-between items-center mb-4">
                                    Compose & Send Newsletter
                                    <button onClick={onClose} className="text-brand-light-muted hover:text-white"><X size={20} /></button>
                                </Dialog.Title>
                                {/* Konten Modal */}
                                <div className="space-y-4">
                                     <p className="text-sm text-brand-light-muted">
                                         Sending to: <span className="font-semibold text-brand-accent">{getRecipientDescription()}</span>
                                     </p>
                                     {/* Input Subject */}
                                    <div>
                                        <label htmlFor="subject" className="block text-sm font-medium text-brand-light-muted mb-1">Subject *</label>
                                        <input
                                            type="text"
                                            id="subject"
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            className="w-full bg-white/5 border border-transparent rounded-md px-4 py-2 text-brand-light focus:outline-none focus:border-brand-accent"
                                            placeholder="Newsletter Subject"
                                        />
                                    </div>
                                    {/* Input Content (Editor) */}
                                     <div>
                                        <label className="block text-sm font-medium text-brand-light-muted mb-1">Content *</label>
                                        {/* Tombol Insert Font & Pemilih Font */}
                                        <div className="bg-white/5 border border-white/10 rounded-t-md p-2 flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() => setShowProductSelector(!showProductSelector)}
                                                className="flex items-center gap-1.5 px-3 py-1 text-xs bg-white/10 rounded-md text-brand-light hover:bg-white/20"
                                                disabled={loadingProducts || !editor}
                                            >
                                                {loadingProducts ? <Loader2 size={14} className="animate-spin" /> : <Type size={14} />}
                                                {/* --- PERUBAHAN 5: Ubah teks tombol --- */}
                                                {showProductSelector ? 'Close Products' : 'Insert Product'}
                                                {/* --- AKHIR PERUBAHAN 5 --- */}
                                            </button>
                                        </div>
                                        {showProductSelector && (
                                            <div className="border border-t-0 border-white/10 p-3 bg-white/5 max-h-48 overflow-y-auto">
                                                {loadingProducts ? (
                                                    <p className="text-center text-sm text-brand-light-muted">Loading products...</p>
                                                ) : allProducts.length === 0 ? (
                                                    <p className="text-center text-sm text-brand-light-muted">No products found.</p>
                                                ) : (
                                                    <ul className="space-y-1">
                                                        {/* --- PERUBAHAN 6: Ganti nama variabel iterasi --- */}
                                                        {allProducts.map(product => (
                                                            <li key={product.id}>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => insertFontHtml(product)} // <-- Panggil fungsi yang sama
                                                                    className="w-full text-left p-2 text-sm text-brand-light rounded hover:bg-white/10 flex items-center gap-2"
                                                                >
                                                                    <Image src={product.imageUrl} alt={product.name} width={48} height={32} className="rounded-sm flex-shrink-0 object-cover aspect-[3/2]" />
                                                                    <span className="truncate">{product.name} ({product.type === 'font' ? 'Font' : 'Bundle'})</span>
                                                                </button>
                                                            </li>
                                                        ))}
                                                        {/* --- AKHIR PERUBAHAN 6 --- */}
                                                    </ul>
                                                )}
                                            </div>
                                        )}
                                        {/* Editor Tiptap */}
                                        {editor && <EditorContent editor={editor} />}
                                     </div>
                                </div>
                                {/* Tombol Aksi Modal */}
                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        className="px-4 py-2 text-sm rounded-md bg-white/10 text-brand-light-muted hover:bg-white/20"
                                        onClick={onClose}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="px-6 py-2 text-sm rounded-md bg-brand-accent text-brand-darkest font-semibold flex items-center gap-2 disabled:opacity-50"
                                        onClick={handleSubmit}
                                        disabled={isSending || !editor}
                                    >
                                        {isSending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                                        {isSending ? 'Sending...' : 'Send Newsletter'}
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};


// Komponen Utama Client
export default function NewsletterClient({ initialSubscribers, initialTotalPages }: {
    initialSubscribers: CombinedSubscriber[];
    initialTotalPages: number;
}) {
    // ... (Semua state dan fungsi di luar SendNewsletterModal tetap sama) ...
    const [subscribers, setSubscribers] = useState<CombinedSubscriber[]>(initialSubscribers);
    const [totalPages, setTotalPages] = useState(initialTotalPages);
    const [loading, setLoading] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([]);
    const [isSendModalOpen, setIsSendModalOpen] = useState(false);
    const [sendTargetType, setSendTargetType] = useState<'all' | 'category' | 'selected'>('all');

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentPage = Number(searchParams.get('page')) || 1;
    const searchTerm = searchParams.get('search') || '';
    const selectedCategory = (searchParams.get('category') as 'All' | 'Registered User' | 'Anonymous Subscriber') || 'All';

    const isAllSelected = useMemo(() => subscribers.length > 0 && selectedSubscribers.length === subscribers.length, [subscribers, selectedSubscribers]);

    useEffect(() => {
         const hasInitialData = initialSubscribers.length > 0;
         const isOnFirstPage = currentPage === 1;
         const noSearch = !searchTerm;
         const isAllCategory = selectedCategory === 'All';
         const isInitialState = isOnFirstPage && noSearch && isAllCategory;
         const isDataIdentical = JSON.stringify(subscribers) === JSON.stringify(initialSubscribers);

         if (hasInitialData && isInitialState && isDataIdentical) {
            return;
         }

        const fetchSubscribers = async () => {
            setLoading(true);
            setSelectedSubscribers([]);
            const { data, count, error } = await getCombinedSubscribersAction({
                page: currentPage,
                limit: ITEMS_PER_PAGE,
                searchTerm,
                category: selectedCategory,
            });
            if (error) {
                toast.error(error);
                setSubscribers([]);
            } else {
                setSubscribers(data as CombinedSubscriber[]);
                setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
            }
            setLoading(false);
        };
        fetchSubscribers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams, currentPage, searchTerm, selectedCategory]);

     useEffect(() => {
        if (JSON.stringify(initialSubscribers) !== JSON.stringify(subscribers)) {
            setSubscribers(initialSubscribers);
        }
        if (initialTotalPages !== totalPages) {
            setTotalPages(initialTotalPages);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialSubscribers, initialTotalPages]);


    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', '1');
        if (term) { params.set('search', term); }
        else { params.delete('search'); }
        router.replace(`${pathname}?${params.toString()}`);
    }, 300);

    const handleDelete = (subscriber: CombinedSubscriber) => {
        if (subscriber.category === 'Registered User') {
            toast.error('Registered users cannot be deleted from this interface.');
            return;
        }
        if (window.confirm(`Are you sure you want to remove "${subscriber.email}" from the newsletter list?`)) {
            setDeletingId(subscriber.source_id);
            startTransition(async () => {
                const result = await deleteSubscriberAction(subscriber.source_id, subscriber.source_table);
                if (result.error) {
                    toast.error(result.error);
                } else {
                    toast.success(result.success || 'Subscriber removed!');
                    router.refresh();
                }
                setDeletingId(null);
            });
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedSubscribers(e.target.checked ? subscribers.map(s => s.source_id) : []);
    };

    const handleSelectOne = (source_id: string, isChecked: boolean) => {
        if (isChecked) {
            setSelectedSubscribers(prev => [...prev, source_id]);
        } else {
            setSelectedSubscribers(prev => prev.filter(id => id !== source_id));
        }
    };

    const openSendModal = (type: 'all' | 'category' | 'selected') => {
        if (type === 'selected' && selectedSubscribers.length === 0) {
            toast.error('Please select at least one subscriber.');
            return;
        }
        setSendTargetType(type);
        setIsSendModalOpen(true);
    };

    const getSelectedEmails = () => {
        return subscribers
            .filter(s => selectedSubscribers.includes(s.source_id))
            .map(s => s.email);
    };


    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    const checkboxClasses = "h-4 w-4 rounded border-gray-500 text-brand-accent focus:ring-brand-accent bg-white/10 accent-brand-accent";


    return (
        <div className="space-y-6">
            {/* Header & Tombol Send */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-brand-light">Newsletter Subscribers</h1>
                    <p className="text-brand-light-muted">Manage your email list (Registered Users & Anonymous Subscribers).</p>
                </div>
                 <Menu as="div" className="relative inline-block text-left">
                    <Menu.Button className="flex items-center gap-2 px-4 py-2 bg-brand-primary-blue text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-brand-primary-blue/40 transition-all">
                        <Send size={16} />
                        <span>Send Newsletter</span>
                         <ChevronDown size={16} className="-mr-1 ml-1"/>
                    </Menu.Button>
                     <Transition
                        as={Fragment}
                         enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95"
                    >
                        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-[#1e1e1e] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                            <div className="py-1">
                                <Menu.Item>
                                    {({ active }: { active: boolean }) => (
                                        <button onClick={() => openSendModal('all')} className={`${ active ? 'bg-brand-accent text-brand-darkest' : 'text-brand-light'} group flex w-full items-center rounded-md px-4 py-2 text-sm`}>
                                            Send to All
                                        </button>
                                    )}
                                </Menu.Item>
                                {selectedCategory !== 'All' && (
                                    <Menu.Item>
                                        {({ active }: { active: boolean }) => (
                                            <button onClick={() => openSendModal('category')} className={`${ active ? 'bg-brand-accent text-brand-darkest' : 'text-brand-light'} group flex w-full items-center rounded-md px-4 py-2 text-sm`}>
                                                Send to Category: {selectedCategory}
                                            </button>
                                        )}
                                    </Menu.Item>
                                )}
                                 <Menu.Item>
                                    {({ active }: { active: boolean }) => (
                                        <button onClick={() => openSendModal('selected')} disabled={selectedSubscribers.length === 0} className={`${ active ? 'bg-brand-accent text-brand-darkest' : 'text-brand-light'} group flex w-full items-center rounded-md px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed`}>
                                            Send to Selected ({selectedSubscribers.length})
                                        </button>
                                    )}
                                </Menu.Item>
                            </div>
                        </Menu.Items>
                    </Transition>
                </Menu>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <Search className="w-5 h-5 text-brand-light-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search by email or name..."
                        defaultValue={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full bg-brand-darkest border border-white/20 rounded-lg pl-10 pr-4 py-2 text-brand-light focus:outline-none focus:border-brand-accent"
                    />
                </div>
                 <FilterDropdown
                    options={subscriberCategories}
                    paramName="category"
                    label="Category"
                />
            </div>

             {/* Bar Aksi Massal */}
             {selectedSubscribers.length > 0 && (
                <div className="bg-brand-darkest p-4 rounded-lg border border-brand-accent/50 flex flex-col sm:flex-row justify-between items-center gap-4 animate-fade-in">
                    <p className="font-medium text-brand-light">{selectedSubscribers.length} subscriber(s) selected</p>
                    <div className="flex items-center gap-2">
                         <button onClick={() => openSendModal('selected')} disabled={isPending} className="px-3 py-1.5 text-xs font-semibold bg-brand-primary-blue/20 text-blue-300 rounded-md hover:bg-brand-primary-blue/40 transition-colors disabled:opacity-50 flex items-center gap-1.5">
                             <Send size={14} /> Send Newsletter to Selected
                         </button>
                        <button onClick={() => setSelectedSubscribers([])}><X size={18} className="text-brand-light-muted hover:text-white"/></button>
                    </div>
                </div>
             )}

            {/* Tabel */}
            {loading ? <TableSkeleton /> : (
                <div className="bg-brand-darkest rounded-lg border border-white/10 overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="border-b border-white/10 text-brand-light-muted">
                            <tr>
                                 <th className="p-4 w-4">
                                     <input type="checkbox" className={checkboxClasses} checked={isAllSelected} onChange={handleSelectAll} />
                                 </th>
                                <th className="px-6 py-3 text-left font-medium">Email / Name</th>
                                <th className="px-6 py-3 text-left font-medium">Category</th>
                                <th className="px-6 py-3 text-left font-medium">Date Joined</th>
                                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {subscribers.length > 0 ? subscribers.map((sub) => {
                                const isDeletingCurrent = deletingId === sub.source_id;
                                return (
                                <tr key={sub.source_id} className={`transition-colors ${selectedSubscribers.includes(sub.source_id) ? 'bg-brand-accent/10' : 'hover:bg-white/5'}`}>
                                     <td className="p-4">
                                        <input type="checkbox" className={checkboxClasses} checked={selectedSubscribers.includes(sub.source_id)} onChange={(e) => handleSelectOne(sub.source_id, e.target.checked)} />
                                    </td>
                                    <td className="px-6 py-4">
                                         <div className="font-medium text-brand-light">{sub.email}</div>
                                         {sub.name && <div className="text-xs text-brand-light-muted">{sub.name}</div>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${sub.category === 'Registered User' ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'}`}>
                                            {sub.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-brand-light-muted">{formatDate(sub.created_at)}</td>
                                    <td className="px-6 py-4 text-right">
                                        {sub.category === 'Anonymous Subscriber' && (
                                            <button onClick={() => handleDelete(sub)} disabled={isDeletingCurrent || isPending} className="flex items-center gap-1.5 text-sm font-semibold text-brand-secondary-red px-2 py-1 rounded-md transition-all duration-200 hover:bg-white/5 disabled:opacity-50 ml-auto">
                                                {isDeletingCurrent ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                                <span>{isDeletingCurrent ? 'Removing...' : 'Remove'}</span>
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )}) : (
                                <tr><td colSpan={5} className="text-center py-12 text-brand-light-muted">No subscribers found matching criteria.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Paginasi */}
            {totalPages > 1 && (
                <div className="mt-6">
                    <Pagination currentPage={currentPage} totalPages={totalPages} />
                </div>
            )}

            {/* Modal Kirim Newsletter */}
             <SendNewsletterModal
                isOpen={isSendModalOpen}
                onClose={() => setIsSendModalOpen(false)}
                targetType={sendTargetType}
                targetCategory={sendTargetType === 'category' ? selectedCategory : undefined}
                selectedEmails={sendTargetType === 'selected' ? getSelectedEmails() : undefined}
            />
        </div>
    );
}