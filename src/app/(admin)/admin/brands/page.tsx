// src/app/(admin)/admin/brands/page.tsx
'use client';

import { useState, useEffect, useTransition, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { createBrowserClient } from '@supabase/ssr';
import Image from 'next/image';
import { UploadCloud, Loader2, Trash2, Building2, X } from 'lucide-react';
import toast from 'react-hot-toast';

import { Database } from '@/lib/database.types';
import { getBrandsAction, addBrandAction, deleteBrandAction, bulkDeleteBrandsAction } from '@/app/actions/brandActions';

type Brand = Database['public']['Tables']['brands']['Row'];
const MAX_BRANDS = 40;

// Komponen Uploader
const BrandUploader = ({ onUploadSuccess, disabled, currentCount }: { onUploadSuccess: (newBrands: Brand[]) => void, disabled: boolean, currentCount: number }) => {
    const [isUploading, setIsUploading] = useState(false);
    const supabase = createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const onDrop = async (acceptedFiles: File[]) => {
        const slotsAvailable = MAX_BRANDS - currentCount;
        if (acceptedFiles.length > slotsAvailable) {
            toast.error(`You can only upload ${slotsAvailable} more logos (limit is ${MAX_BRANDS}).`);
            return;
        }
        if (acceptedFiles.length === 0) return;
        
        setIsUploading(true);
        toast.loading(`Uploading ${acceptedFiles.length} logo(s)...`);

        const uploadPromises = acceptedFiles.map(async (file) => {
            const brandName = file.name.replace(/\.svg$/i, '').replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            const filePath = `${Date.now()}_${file.name}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('brand_logos')
                .upload(filePath, file, {
                    // --- PERUBAIKAN CACHE DI SINI ---
                    cacheControl: '31536000', // 1 tahun
                    // --- AKHIR PERUBAIKAN ---
                });

            if (uploadError) {
                throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
            }

            const { data: { publicUrl } } = supabase.storage.from('brand_logos').getPublicUrl(uploadData.path);
            return addBrandAction(brandName, publicUrl);
        });

        try {
            await Promise.all(uploadPromises);
            toast.dismiss();
            toast.success(`${acceptedFiles.length} logo(s) uploaded successfully!`);
            
            const { brands } = await getBrandsAction();
            if (brands) {
                onUploadSuccess(brands);
            }
        } catch (error: unknown) {
            toast.dismiss();
            const message = error instanceof Error ? error.message : "An unknown error occurred during upload.";
            toast.error(message);
        } finally {
            setIsUploading(false);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/svg+xml': ['.svg'] },
        multiple: true, 
        disabled,
    });

    return (
        <div 
            {...getRootProps()} 
            className={`w-full p-6 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center transition-colors
                ${disabled ? 'border-white/10 bg-white/5 cursor-not-allowed' : isDragActive ? 'border-brand-accent bg-white/5' : 'border-white/20 hover:border-brand-accent cursor-pointer'}`}
        >
            <input {...getInputProps()} />
            {isUploading ? (
                <Loader2 className="w-12 h-12 text-brand-light-muted animate-spin" />
            ) : (
                <UploadCloud className={`w-12 h-12 ${disabled ? 'text-brand-light-muted/50' : 'text-brand-light-muted'}`} />
            )}
            <p className={`mt-4 text-sm ${disabled ? 'text-brand-light-muted/50' : 'text-brand-light-muted'}`}>
                {isUploading ? 'Uploading...' : (disabled ? `Maximum of ${MAX_BRANDS} logos reached` : 'Drag & drop SVG logos here, or click to select')}
            </p>
            <p className="text-xs text-brand-light-muted/70 mt-1">You can select multiple files</p>
        </div>
    );
};


// Komponen Utama Halaman
export default function ManageBrandsPage() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDeleting, startDeleteTransition] = useTransition();
    
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
    const isAllSelected = useMemo(() => brands.length > 0 && selectedBrands.length === brands.length, [brands, selectedBrands]);

    useEffect(() => {
        getBrandsAction().then(result => {
            if(result.success && result.brands) {
                setBrands(result.brands);
            } else if (result.error) {
                toast.error(result.error);
            }
            setLoading(false);
        });
    }, []);

    const handleUploadSuccess = (newBrands: Brand[]) => {
        setBrands(newBrands);
    };

    const handleDelete = (brand: Brand) => {
        if (!window.confirm(`Are you sure you want to delete the "${brand.name}" logo?`)) return;

        startDeleteTransition(async () => {
            toast.loading('Deleting logo...');
            const result = await deleteBrandAction(brand.id, brand.logo_url);
            toast.dismiss();
            if (result.error) {
                toast.error(result.error);
            } else {
                setBrands(current => current.filter(b => b.id !== brand.id));
                toast.success('Logo deleted!');
            }
        });
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedBrands(e.target.checked ? brands.map(b => b.id) : []);
    };

    const handleSelectOne = (id: string, isChecked: boolean) => {
        if (isChecked) {
            setSelectedBrands(prev => [...prev, id]);
        } else {
            setSelectedBrands(prev => prev.filter(brandId => brandId !== id));
        }
    };
    
    const handleBulkDelete = () => {
        if (!window.confirm(`Are you sure you want to delete ${selectedBrands.length} selected logo(s)?`)) return;

        startDeleteTransition(async () => {
            const brandsToDelete = brands.filter(b => selectedBrands.includes(b.id));
            toast.loading(`Deleting ${brandsToDelete.length} logo(s)...`);
            const result = await bulkDeleteBrandsAction(brandsToDelete);
            toast.dismiss();

            if (result.error) {
                toast.error(result.error);
            } else {
                setBrands(current => current.filter(b => !selectedBrands.includes(b.id)));
                setSelectedBrands([]);
                toast.success(result.success || 'Logos deleted!');
            }
        });
    };
    
    const isLimitReached = brands.length >= MAX_BRANDS;
    const checkboxClasses = "h-4 w-4 rounded border-gray-500 text-brand-accent focus:ring-brand-accent bg-white/10 accent-brand-accent";

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-brand-light">Manage Brands Section</h1>
                <p className="text-brand-light-muted">Upload and manage brand logos for the &quot;Trusted By&quot; section. A maximum of {MAX_BRANDS} logos can be displayed.</p>
            </div>

            <BrandUploader onUploadSuccess={handleUploadSuccess} disabled={isLimitReached} currentCount={brands.length} />

            {selectedBrands.length > 0 && (
                <div className="bg-brand-darkest p-4 rounded-lg border border-brand-accent/50 flex flex-col sm:flex-row justify-between items-center gap-4 animate-fade-in">
                    <p className="font-medium text-brand-light">{selectedBrands.length} logo(s) selected</p>
                    <div className="flex items-center gap-2">
                        <button onClick={handleBulkDelete} disabled={isDeleting} className="px-3 py-1.5 text-xs font-semibold bg-red-500/20 text-red-300 rounded-md hover:bg-red-500/40 transition-colors disabled:opacity-50 flex items-center gap-1.5">
                            {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                            Delete Selected
                        </button>
                        <button onClick={() => setSelectedBrands([])}><X size={18} className="text-brand-light-muted hover:text-white"/></button>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="text-center p-12"><Loader2 className="w-8 h-8 mx-auto animate-spin text-brand-light-muted" /></div>
            ) : (
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                    {brands.length > 0 && (
                        <div className="col-span-full border-b border-white/10 pb-2 mb-2 flex items-center gap-3">
                            <input type="checkbox" className={checkboxClasses} checked={isAllSelected} onChange={handleSelectAll} id="select-all"/>
                            <label htmlFor="select-all" className="text-sm text-brand-light-muted cursor-pointer">Select All</label>
                        </div>
                    )}
                    {brands.map(brand => (
                        <div key={brand.id} className="relative group aspect-square p-4 bg-brand-darkest border rounded-lg flex items-center justify-center transition-colors
                            ${selectedBrands.includes(brand.id) ? 'border-brand-accent' : 'border-white/10'}`"
                        >
                            <input 
                                type="checkbox"
                                className={`absolute top-2 left-2 z-10 ${checkboxClasses}`}
                                checked={selectedBrands.includes(brand.id)}
                                onChange={(e) => handleSelectOne(brand.id, e.target.checked)}
                            />
                            <Image src={brand.logo_url} alt={brand.name} title={brand.name} fill sizes="15vw" className="object-contain brightness-0 invert grayscale opacity-60" />
                            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button 
                                    onClick={() => handleDelete(brand)}
                                    disabled={isDeleting}
                                    className="p-3 bg-red-600 text-white rounded-full hover:bg-red-500 transition-colors disabled:opacity-50"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {brands.length === 0 && (
                        <div className="col-span-full text-center py-16 bg-brand-darkest border border-dashed border-white/20 rounded-lg">
                            <Building2 size={48} className="mx-auto text-brand-light-muted" />
                            <p className="mt-4 text-brand-light-muted">No brand logos uploaded yet.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}