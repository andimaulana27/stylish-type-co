// src/app/(admin)/admin/partners/new/page.tsx
'use client';

import { useState, useTransition, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';
import { addPartnerAction } from '@/app/actions/partnerActions';
import Image from 'next/image';

export default function AddNewPartnerPage() {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setLogoPreview(null);
        }
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        
        startTransition(async () => {
            const result = await addPartnerAction(formData);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success('Partner added successfully!');
                router.push('/admin/partners');
            }
        });
    };

    const inputStyles = "w-full bg-white/5 border border-transparent rounded-full px-4 py-3 text-brand-light placeholder:text-brand-light-muted transition-colors duration-300 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent hover:border-brand-accent/50";
    const labelStyles = "block text-sm font-medium text-brand-light-muted mb-2 group-hover:text-brand-accent transition-colors";

    return (
        <div className="space-y-6">
            <div>
                <Link href="/admin/partners" className="flex items-center gap-2 text-brand-light-muted hover:text-brand-light transition-colors mb-4">
                    <ArrowLeft size={18} />
                    Back to All Partners
                </Link>
                <h1 className="text-3xl font-bold text-brand-light">Add New Partner</h1>
                <p className="text-brand-light-muted">Fill in the details for the new partner foundry.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="bg-brand-darkest p-8 rounded-lg border border-white/10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <div className="space-y-2 group">
                            <label htmlFor="name" className={labelStyles}>Partner Name *</label>
                            <input type="text" id="name" name="name" required className={inputStyles} placeholder="e.g., Foundry Co." />
                        </div>
                        <div className="space-y-2 group">
                            <label htmlFor="subheadline" className={labelStyles}>Subheadline / Tagline</label>
                            <input type="text" id="subheadline" name="subheadline" className={inputStyles} placeholder="e.g., Crafting Modern Typefaces" />
                        </div>
                    </div>
                    <div className="space-y-2 group">
                        <label className={labelStyles}>Partner Logo</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-white/20 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                {logoPreview ? (
                                    <Image src={logoPreview} alt="Logo preview" width={128} height={128} className="mx-auto h-24 w-auto object-contain" />
                                ) : (
                                    <UploadCloud className="mx-auto h-12 w-12 text-brand-light-muted" />
                                )}
                                <div className="flex text-sm text-brand-light-muted">
                                    <label htmlFor="logo" className="relative cursor-pointer bg-brand-darkest rounded-md font-medium text-brand-accent hover:text-brand-accent/80 focus-within:outline-none">
                                        <span>Upload a file</span>
                                        <input id="logo" name="logo" type="file" className="sr-only" accept="image/png, image/jpeg, image/svg+xml" onChange={handleLogoChange} />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-brand-light-muted/70">PNG, JPG, SVG up to 1MB</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-6 flex justify-end">
                    <button type="submit" disabled={isPending} className="px-8 py-3 bg-brand-accent text-brand-darkest font-semibold rounded-lg flex items-center gap-2 transition-all duration-300 ease-in-out hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed">
                        {isPending && <Loader2 className="animate-spin" size={20} />}
                        {isPending ? 'Saving...' : 'Save Partner'}
                    </button>
                </div>
            </form>
        </div>
    );
}