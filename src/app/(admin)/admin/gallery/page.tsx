// src/app/(admin)/admin/gallery/page.tsx
'use client';

import { useState, useEffect, useTransition, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { createBrowserClient } from '@supabase/ssr';
import Image from 'next/image';
import { UploadCloud, Loader2, Trash2, Image as ImageIcon, X } from 'lucide-react';
import toast from 'react-hot-toast';

import { Database } from '@/lib/database.types';
import { getGalleryImagesAction, bulkAddGalleryImagesAction, bulkDeleteGalleryImagesAction } from '@/app/actions/galleryActions';

type GalleryImage = Database['public']['Tables']['gallery_images']['Row'];

// Komponen Uploader
const ImageUploader = ({ onUploadSuccess }: { onUploadSuccess: (newImages: GalleryImage[]) => void }) => {
    const [isUploading, setIsUploading] = useState(false);
    const supabase = createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const onDrop = async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;
        
        setIsUploading(true);
        toast.loading(`Uploading ${acceptedFiles.length} image(s)...`);

        const uploadPromises = acceptedFiles.map(async (file) => {
            const filePath = `${Date.now()}_${file.name}`;
            const { data, error } = await supabase.storage
                .from('gallery_images')
                .upload(filePath, file, {
                    // --- PERUBAIKAN CACHE KONSISTEN ---
                    cacheControl: '31536000', // 1 tahun
                });

            if (error) {
                throw new Error(`Failed to upload ${file.name}: ${error.message}`);
            }
            const { data: { publicUrl } } = supabase.storage.from('gallery_images').getPublicUrl(data.path);
            return { imageUrl: publicUrl, altText: file.name };
        });

        try {
            const uploadedImages = await Promise.all(uploadPromises);
            const result = await bulkAddGalleryImagesAction(uploadedImages);
            toast.dismiss();

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(result.success || 'Images uploaded!');
                const { images } = await getGalleryImagesAction();
                if (images) {
                    onUploadSuccess(images);
                }
            }
        } catch (error) {
            toast.dismiss();
            const message = error instanceof Error ? error.message : "An error occurred during upload.";
            toast.error(message);
        } finally {
            setIsUploading(false);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.png', '.webp', '.gif'] },
        multiple: true,
    });

    return (
        <div 
            {...getRootProps()} 
            className={`w-full p-6 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-brand-accent bg-white/5' : 'border-white/20 hover:border-brand-accent'}`}
        >
            <input {...getInputProps()} />
            {isUploading ? (
                <Loader2 className="w-12 h-12 text-brand-light-muted animate-spin" />
            ) : (
                <UploadCloud className="w-12 h-12 text-brand-light-muted" />
            )}
            <p className="mt-4 text-sm text-brand-light-muted">
                {isUploading ? 'Uploading...' : (isDragActive ? 'Drop images here...' : 'Drag & drop images here, or click to select')}
            </p>
            <p className="text-xs text-brand-light-muted/70 mt-1">You can select multiple files</p>
        </div>
    );
};


// Komponen Utama Halaman
export default function ManageGalleryPage() {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDeleting, startDeleteTransition] = useTransition();
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const isAllSelected = useMemo(() => images.length > 0 && selectedImages.length === images.length, [images, selectedImages]);

    useEffect(() => {
        getGalleryImagesAction().then(result => {
            if(result.success && result.images) {
                setImages(result.images);
            } else if (result.error) {
                toast.error(result.error);
            }
            setLoading(false);
        });
    }, []);

    const handleUploadSuccess = (newImageList: GalleryImage[]) => {
        setImages(newImageList);
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedImages(e.target.checked ? images.map(img => img.id) : []);
    };

    const handleSelectOne = (id: string, isChecked: boolean) => {
        if (isChecked) {
            setSelectedImages(prev => [...prev, id]);
        } else {
            setSelectedImages(prev => prev.filter(imgId => imgId !== id));
        }
    };

    const handleBulkDelete = () => {
        if (!window.confirm(`Are you sure you want to delete ${selectedImages.length} selected image(s)?`)) return;

        startDeleteTransition(async () => {
            const imagesToDelete = images.filter(img => selectedImages.includes(img.id));
            toast.loading(`Deleting ${imagesToDelete.length} image(s)...`);
            const result = await bulkDeleteGalleryImagesAction(imagesToDelete);
            toast.dismiss();

            if (result.error) {
                toast.error(result.error);
            } else {
                setImages(current => current.filter(img => !selectedImages.includes(img.id)));
                setSelectedImages([]);
                toast.success(result.success || 'Images deleted!');
            }
        });
    };
    
    const checkboxClasses = "h-4 w-4 rounded border-gray-500 text-brand-accent focus:ring-brand-accent bg-white/10 accent-brand-accent";

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-brand-light">Manage &quot;Font in Use&quot; Gallery</h1>
                <p className="text-brand-light-muted">Upload and manage images for the homepage gallery section.</p>
            </div>

            <ImageUploader onUploadSuccess={handleUploadSuccess} />
            
            {selectedImages.length > 0 && (
                <div className="bg-brand-darkest p-4 rounded-lg border border-brand-accent/50 flex flex-col sm:flex-row justify-between items-center gap-4 animate-fade-in">
                    <p className="font-medium text-brand-light">{selectedImages.length} image(s) selected</p>
                    <div className="flex items-center gap-2">
                        <button onClick={handleBulkDelete} disabled={isDeleting} className="px-3 py-1.5 text-xs font-semibold bg-red-500/20 text-red-300 rounded-md hover:bg-red-500/40 transition-colors disabled:opacity-50 flex items-center gap-1.5">
                            {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                            Delete Selected
                        </button>
                        <button onClick={() => setSelectedImages([])}><X size={18} className="text-brand-light-muted hover:text-white"/></button>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="text-center p-12"><Loader2 className="w-8 h-8 mx-auto animate-spin text-brand-light-muted" /></div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {images.length > 0 && (
                        <div className="col-span-full border-b border-white/10 pb-2 mb-2 flex items-center gap-3">
                            <input type="checkbox" className={checkboxClasses} checked={isAllSelected} onChange={handleSelectAll} id="select-all"/>
                            <label htmlFor="select-all" className="text-sm text-brand-light-muted cursor-pointer">Select All</label>
                        </div>
                    )}
                    {images.map(image => (
                        <div key={image.id} className={`relative group aspect-square rounded-lg overflow-hidden border transition-colors ${selectedImages.includes(image.id) ? 'border-brand-accent' : 'border-white/10'}`}>
                             <input 
                                type="checkbox"
                                className={`absolute top-2 left-2 z-10 ${checkboxClasses}`}
                                checked={selectedImages.includes(image.id)}
                                onChange={(e) => handleSelectOne(image.id, e.target.checked)}
                            />
                            <Image src={image.image_url} alt={image.alt_text || 'Gallery image'} fill sizes="20vw" className="object-cover" />
                        </div>
                    ))}
                    {images.length === 0 && (
                        <div className="col-span-full text-center py-16 bg-brand-darkest border border-dashed border-white/20 rounded-lg">
                            <ImageIcon size={48} className="mx-auto text-brand-light-muted" />
                            <p className="mt-4 text-brand-light-muted">No images in the gallery yet. Upload one to get started.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}