// src/app/(admin)/admin/homepage/banner/page.tsx
'use client';

import { useState, useEffect, useTransition, FormEvent, Fragment } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Image from 'next/image';
import { UploadCloud, Loader2, Trash2, Link as LinkIcon, Image as ImageIcon, PlusCircle, Edit, } from 'lucide-react';
import toast from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react';
import { useRouter } from 'next/navigation'; // <-- Import useRouter

import { Database } from '@/lib/database.types';
import { getBannerSlidesAction, addBannerSlideAction, deleteBannerSlideAction, updateBannerSlideAction } from '@/app/actions/bannerActions';

type BannerSlide = Database['public']['Tables']['banner_slides']['Row'];

// Komponen Modal Edit (Tidak ada perubahan di sini, tetap sama seperti sebelumnya)
const EditSlideModal = ({ isOpen, onClose, slide, onUpdateSuccess }: {
    isOpen: boolean;
    onClose: () => void;
    slide: BannerSlide | null;
    onUpdateSuccess: (updatedSlides: BannerSlide[]) => void;
}) => {
    const [isPending, startTransition] = useTransition();
    const [newSlideFile, setNewSlideFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const router = useRouter(); // <-- Tambahkan router di modal juga
    const supabase = createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        if (slide) {
            setPreviewUrl(slide.image_url);
        } else {
             setPreviewUrl(null); // Reset preview jika slide null
             setNewSlideFile(null); // Reset file jika slide null
        }
    }, [slide]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setNewSlideFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!slide) return;

        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            toast.loading('Updating slide...');
            let newImageUrl: string | null = null;
            let uploadedFilePath: string | null = null; // Untuk menghapus jika gagal

            if (newSlideFile) {
                const filePath = `banner_images/${Date.now()}_${newSlideFile.name}`; // Pastikan path benar
                uploadedFilePath = filePath; // Simpan path untuk kemungkinan rollback
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('banner_images')
                    .upload(filePath, newSlideFile, {
                        cacheControl: '31536000', // 1 tahun
                    });

                if (uploadError) {
                    toast.dismiss();
                    toast.error(`Image upload failed: ${uploadError.message}`);
                    return;
                }
                const { data: { publicUrl } } = supabase.storage.from('banner_images').getPublicUrl(uploadData.path);
                newImageUrl = publicUrl;
                formData.append('new_image_url', newImageUrl);
            }

            const result = await updateBannerSlideAction(slide.id, formData);
            toast.dismiss();

            if (result.error) {
                toast.error(result.error);
                // Jika update DB gagal TAPI gambar baru terlanjur diupload, hapus gambar baru
                if (newImageUrl && uploadedFilePath) {
                    await supabase.storage.from('banner_images').remove([uploadedFilePath]);
                }
            } else {
                toast.success(result.success || 'Slide updated!');
                 // Panggil onUpdateSuccess dari props, bukan fetch lagi
                const { slides } = await getBannerSlidesAction();
                if (slides) {
                    onUpdateSuccess(slides);
                }
                onClose(); // Tutup modal
            }
        });
    };

    // Bersihkan state saat modal ditutup
    const handleClose = () => {
        setNewSlideFile(null);
        setPreviewUrl(null);
        onClose();
    }

    if (!isOpen || !slide) return null;

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={handleClose}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black/60" />
                </Transition.Child>
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-lg bg-brand-darkest border border-white/10 p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-brand-light">Edit Slide</Dialog.Title>
                                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                                    <input type="hidden" name="existing_image_url" value={slide.image_url} />
                                    <div>
                                        <label className="text-xs text-brand-light-muted">Image Preview</label>
                                        <label htmlFor="edit-image-upload" className="relative flex justify-center w-full h-40 border-2 border-dashed rounded-md cursor-pointer hover:border-brand-accent">
                                            {previewUrl ? (
                                                <Image src={previewUrl} alt="Preview" fill className="object-contain" />
                                            ) : (
                                                 <div className="space-y-1 text-center self-center">
                                                    <UploadCloud className="mx-auto h-10 w-10 text-brand-light-muted" />
                                                    <p className="text-xs text-brand-light-muted">Click to upload new image</p>
                                                </div>
                                            )}
                                            <input id="edit-image-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*"/>
                                        </label>
                                    </div>
                                    <div>
                                        <label htmlFor="edit-link" className="text-xs text-brand-light-muted">Link URL</label>
                                        <input id="edit-link" name="link_href" type="text" defaultValue={slide.link_href} required className="w-full bg-white/5 border border-transparent rounded-full px-4 py-2 text-sm"/>
                                    </div>
                                    <div>
                                        <label htmlFor="edit-alt" className="text-xs text-brand-light-muted">Alt Text</label>
                                        <input id="edit-alt" name="alt_text" type="text" defaultValue={slide.alt_text || ''} className="w-full bg-white/5 border border-transparent rounded-full px-4 py-2 text-sm"/>
                                    </div>
                                    <div className="mt-6 flex justify-end gap-2">
                                        <button type="button" onClick={handleClose} className="px-4 py-2 text-sm rounded-full bg-white/10 text-brand-light-muted hover:bg-white/20">Cancel</button>
                                        <button type="submit" disabled={isPending} className="px-4 py-2 text-sm rounded-full bg-brand-accent text-brand-darkest font-semibold flex items-center gap-2 disabled:opacity-50">
                                            {isPending && <Loader2 className="animate-spin" size={16}/>}
                                            {isPending ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};


export default function ManageBannerPage() {
    const [slides, setSlides] = useState<BannerSlide[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [newSlideFile, setNewSlideFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [linkHref, setLinkHref] = useState('/');
    const [altText, setAltText] = useState('');
    const [editingSlide, setEditingSlide] = useState<BannerSlide | null>(null);
    const router = useRouter(); // <-- Dapatkan instance router

    const supabase = createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        setLoading(true); // Mulai loading saat fetch
        getBannerSlidesAction().then(result => {
            if(result.success && result.slides) {
                setSlides(result.slides);
            } else if (result.error) {
                toast.error(result.error);
            }
            setLoading(false); // Selesai loading
        });
    }, []); // <-- Dependency array kosong, fetch hanya sekali saat mount

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setNewSlideFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            // Coba ambil nama file tanpa ekstensi sebagai default alt text
            setAltText(file.name.replace(/\.[^/.]+$/, ""));
        } else {
             setNewSlideFile(null);
             setPreviewUrl(null);
             setAltText('');
        }
    };

    // --- PERBAIKAN DI SINI ---
    const handleAddSlide = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!newSlideFile) {
            toast.error("Please select an image file to upload.");
            return;
        }

        startTransition(async () => {
            toast.loading('Uploading slide...');
            let uploadedFilePath: string | null = null; // Untuk rollback jika perlu

            try {
                const filePath = `banner_images/${Date.now()}_${newSlideFile.name}`; // Pastikan path benar
                uploadedFilePath = filePath; // Simpan path untuk rollback

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('banner_images')
                    .upload(filePath, newSlideFile, {
                        cacheControl: '31536000', // 1 tahun
                    });

                if (uploadError) {
                    throw new Error(`Upload failed: ${uploadError.message}`);
                }

                const { data: { publicUrl } } = supabase.storage.from('banner_images').getPublicUrl(uploadData.path);

                // Hitung sort_order berdasarkan data saat ini SEBELUM insert
                 const nextSortOrder = (slides.length > 0 ? Math.max(...slides.map(s => s.sort_order || 0)) : 0) + 1;

                const result = await addBannerSlideAction({
                    image_url: publicUrl,
                    link_href: linkHref,
                    alt_text: altText,
                    sort_order: nextSortOrder
                });

                toast.dismiss();
                if (result.error) {
                    throw new Error(result.error);
                }

                toast.success(result.success || 'Slide added!');
                setNewSlideFile(null); setPreviewUrl(null); setLinkHref('/'); setAltText('');
                router.refresh(); // <-- Panggil router.refresh() untuk memuat ulang data

            } catch (error: unknown) {
                toast.dismiss();
                const message = error instanceof Error ? error.message : "An unknown error occurred.";
                toast.error(message);
                // Jika error terjadi SETELAH upload storage berhasil, hapus file yang terlanjur diupload
                if (uploadedFilePath) {
                    await supabase.storage.from('banner_images').remove([uploadedFilePath]);
                }
            }
        });
    };
    // --- AKHIR PERBAIKAN ---

    const handleDelete = (slide: BannerSlide) => {
        if (!window.confirm(`Are you sure you want to delete this slide?`)) return;

        startTransition(async () => {
            toast.loading('Deleting slide...');
            const result = await deleteBannerSlideAction(slide);
            toast.dismiss();
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(result.success || 'Slide deleted!');
                // Update state lokal setelah berhasil hapus
                setSlides(current => current.filter(s => s.id !== slide.id));
                // Tidak perlu refresh router di sini karena state sudah diupdate
            }
        });
    };

     // Callback untuk update state setelah edit modal berhasil
    const handleUpdateSuccess = (updatedSlides: BannerSlide[]) => {
        setSlides(updatedSlides); // Update state lokal dengan data baru
        // Tidak perlu refresh router di sini karena state sudah diupdate
    };

    const inputStyles = "w-full bg-white/5 border border-transparent rounded-full px-4 py-2 text-sm text-brand-light placeholder:text-brand-light-muted transition-colors duration-300 focus:outline-none focus:border-brand-accent";

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-brand-light">Manage Banner Slider</h1>
                <p className="text-brand-light-muted">Add, edit, or remove images for the homepage banner slider.</p>
            </div>

            <form onSubmit={handleAddSlide} className="bg-brand-darkest p-6 rounded-lg border border-white/10 space-y-4">
                <h2 className="font-semibold text-lg text-brand-light">Add New Slide</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="image-upload" className="relative flex justify-center w-full h-40 border-2 border-dashed rounded-md cursor-pointer hover:border-brand-accent">
                            {previewUrl ? (
                                <Image src={previewUrl} alt="Preview" fill className="object-contain" />
                            ) : (
                                <div className="space-y-1 text-center self-center">
                                    <UploadCloud className="mx-auto h-10 w-10 text-brand-light-muted" />
                                    <p className="text-xs text-brand-light-muted">Click to upload image</p>
                                </div>
                            )}
                            <input id="image-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                        </label>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <label htmlFor="link" className="text-xs text-brand-light-muted ml-4">Link URL (e.g., /product)</label>
                            <input id="link" type="text" value={linkHref} onChange={(e) => setLinkHref(e.target.value)} required className={inputStyles} />
                        </div>
                        <div>
                            <label htmlFor="alt" className="text-xs text-brand-light-muted ml-4">Alt Text</label>
                            <input id="alt" type="text" value={altText} onChange={(e) => setAltText(e.target.value)} className={inputStyles} />
                        </div>
                        <button type="submit" disabled={isPending || !newSlideFile} className="w-full px-4 py-2 bg-brand-accent text-brand-darkest font-semibold rounded-full flex items-center justify-center gap-2 hover:brightness-110 disabled:opacity-50">
                            {isPending ? <Loader2 className="animate-spin" size={18} /> : <PlusCircle size={18} />}
                            {isPending ? 'Adding...' : 'Add Slide'}
                        </button>
                    </div>
                </div>
            </form>

            <div>
                <h2 className="font-semibold text-lg text-brand-light mb-4">Current Slides</h2>
                 {loading ? (
                    <div className="text-center p-12"><Loader2 className="w-8 h-8 mx-auto animate-spin text-brand-light-muted" /></div>
                ) : (
                    <div className="space-y-2">
                        {slides.length === 0 ? (
                            <p className="text-center text-brand-light-muted py-8">No banner slides have been added yet.</p>
                        ) : (
                           slides
                             .sort((a, b) => (a.sort_order || 999) - (b.sort_order || 999)) // Urutkan berdasarkan sort_order
                             .map(slide => (
                                <div key={slide.id} className="bg-brand-darkest p-3 rounded-lg border border-white/10 flex items-center gap-4">
                                    <div className="relative w-24 h-16 rounded-md overflow-hidden bg-white/5 flex-shrink-0">
                                        <Image src={slide.image_url} alt={slide.alt_text || 'Banner'} fill className="object-cover"/>
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <p className="text-sm text-brand-light-muted truncate flex items-center gap-1.5"><LinkIcon size={12} /> {slide.link_href}</p>
                                        <p className="text-sm text-brand-light-muted truncate flex items-center gap-1.5"><ImageIcon size={12} /> {slide.alt_text || 'No alt text'}</p>
                                        <p className="text-xs text-brand-light-muted/70">Order: {slide.sort_order || 'N/A'}</p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button onClick={() => setEditingSlide(slide)} className="p-2 text-brand-secondary-gold hover:bg-white/10 rounded-full" title="Edit Slide"><Edit size={18} /></button>
                                        <button onClick={() => handleDelete(slide)} disabled={isPending} className="p-2 text-brand-secondary-red hover:bg-red-500/10 rounded-full disabled:opacity-50" title="Delete Slide"><Trash2 size={18} /></button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            <EditSlideModal
                isOpen={!!editingSlide}
                onClose={() => setEditingSlide(null)}
                slide={editingSlide}
                onUpdateSuccess={handleUpdateSuccess} // <-- Teruskan callback
            />
        </div>
    );
}