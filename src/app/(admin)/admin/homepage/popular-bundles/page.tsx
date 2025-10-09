// src/app/(admin)/admin/homepage/popular-bundles/page.tsx
'use client';

import { useState, useTransition, useEffect } from "react";
import { getHomepageConfigAction, getProductsByIdsAction, getProductsForManagerAction, updateHomepageSectionAction } from "@/app/actions/homepageActions";
import { useDebouncedCallback } from "use-debounce";
import { Loader2, PlusCircle, Search, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

type Product = { id: string; name: string; type: 'font' | 'bundle' };

const PopularBundlesManager = ({ initialProductIds }: { initialProductIds: string[] }) => {
    const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
    const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [isPending, startTransition] = useTransition();
    
    const sectionTitle = "Popular Bundles Section";
    const sectionDescription = "Select up to 4 bundles to show in this section. If empty, the 4 latest bundles will be shown automatically.";
    const sectionKey = "popular_bundles";
    const productType = "bundle";
    const limit = 4;
    const staffPickOnly = false;

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            let initialSelected: Product[] = [];
            if (initialProductIds.length > 0) {
                initialSelected = await getProductsByIdsAction(initialProductIds) as Product[];
                setSelectedProducts(initialSelected);
            }

            const initialAvailableResult = await getProductsForManagerAction(productType, '', staffPickOnly);
            const available = (initialAvailableResult.products as Product[]).filter(
                (p) => !initialSelected.some(sp => sp.id === p.id)
            );
            setAvailableProducts(available);
            
            setLoading(false);
        };
        fetchInitialData();
    // --- PERBAIKAN DI SINI: 'staffPickOnly' ditambahkan ke dependency array ---
    }, [initialProductIds, productType, staffPickOnly]);

    const handleSearch = useDebouncedCallback(async (term: string) => {
        setIsSearching(true);
        const results = await getProductsForManagerAction(productType, term, staffPickOnly);
        const filteredResults = (results.products as Product[]).filter(
            (p) => !selectedProducts.some(sp => sp.id === p.id)
        );
        setAvailableProducts(filteredResults);
        setIsSearching(false);
    }, 500);

    const addProduct = (product: Product) => {
        if (selectedProducts.length >= limit) {
            toast.error(`You can only select a maximum of ${limit} products.`);
            return;
        }
        if (!selectedProducts.some(p => p.id === product.id)) {
            setSelectedProducts(prev => [...prev, product]);
            setAvailableProducts(prev => prev.filter(p => p.id !== product.id));
        }
    };

    const removeProduct = (productToRemove: Product) => {
        setSelectedProducts(prev => prev.filter(p => p.id !== productToRemove.id));
        setAvailableProducts(prev => [productToRemove, ...prev].sort((a, b) => a.name.localeCompare(b.name)));
    };

    const handleSave = () => {
        const productIds = selectedProducts.map(p => p.id);
        startTransition(() => {
            toast.promise(
                updateHomepageSectionAction(sectionKey, productIds),
                {
                    loading: 'Saving...',
                    success: (res) => res.success || 'Configuration saved!',
                    error: (res) => res.error || 'Failed to save.'
                }
            );
        });
    };

    if (loading) return <div className="p-6 bg-brand-darkest rounded-lg border border-white/10 animate-pulse h-96"></div>;

    return (
        <div className="p-6 bg-brand-darkest rounded-lg border border-white/10">
            <h2 className="text-xl font-bold text-brand-light">{sectionTitle}</h2>
            <p className="text-sm text-brand-light-muted mt-1">{sectionDescription}</p>
            <div className="border-t border-white/10 my-4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <h3 className="font-semibold text-brand-light">Available Products</h3>
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-light-muted" />
                        <input type="text" placeholder={`Search for a ${productType}...`} onChange={(e) => handleSearch(e.target.value)} className="w-full bg-white/5 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-brand-light focus:outline-none focus:border-brand-accent"/>
                         {isSearching && <Loader2 className="animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-brand-light-muted" size={18} />}
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 h-96 overflow-y-auto space-y-1">{availableProducts.length === 0 && !isSearching ? (<p className="text-center text-sm text-brand-light-muted pt-4">No products found.</p>) : (availableProducts.map(product => (<div key={product.id} className="flex justify-between items-center bg-brand-dark-secondary p-2 rounded-md group"><span className="text-brand-light text-sm">{product.name} <span className="text-xs opacity-60">({product.type})</span></span><button onClick={() => addProduct(product)} className="text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" title="Add to section"><PlusCircle size={20} /></button></div>)))}</div>
                </div>
                <div className="space-y-3">
                    <h3 className="font-semibold text-brand-light">Selected Products ({selectedProducts.length}/{limit})</h3>
                     <div className="bg-white/5 rounded-lg p-2 h-96 overflow-y-auto space-y-1">{selectedProducts.length === 0 ? (<p className="text-center text-sm text-brand-light-muted py-4">Add products from the left.</p>) : (selectedProducts.map(product => (<div key={product.id} className="flex justify-between items-center bg-brand-darkest p-2 rounded-md group"><span className="text-brand-light font-medium text-sm">{product.name}</span><button onClick={() => removeProduct(product)} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button></div>)))}</div>
                </div>
            </div>
            <div className="mt-6 flex justify-end">
                <button onClick={handleSave} disabled={isPending} className="px-8 py-2.5 bg-brand-accent text-brand-darkest font-semibold rounded-lg transition-all hover:brightness-110 disabled:opacity-50 flex items-center gap-2">{isPending && <Loader2 className="animate-spin" size={18} />}{isPending ? 'Saving...' : 'Save Section'}</button>
            </div>
        </div>
    );
}

export default function ManagePopularBundlesPage() {
    const [config, setConfig] = useState<{ product_ids: string[] } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getHomepageConfigAction().then(homepageConfig => {
            const popularBundlesConfig = homepageConfig.find(s => s.section_key === 'popular_bundles');
            setConfig({ product_ids: popularBundlesConfig?.product_ids || [] });
            setLoading(false);
        });
    }, []);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-brand-light">Manage Popular Bundles</h1>
                <p className="text-brand-light-muted">Control the &quot;Popular Bundles&quot; section on your homepage.</p>
            </div>
            {loading && <div className="p-6 bg-brand-darkest rounded-lg border border-white/10 animate-pulse h-96"></div>}
            {!loading && config && <PopularBundlesManager initialProductIds={config.product_ids} />}
        </div>
    );
}