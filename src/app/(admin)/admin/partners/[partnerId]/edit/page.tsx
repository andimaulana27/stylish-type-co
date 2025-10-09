// src/app/(admin)/admin/partners/[partnerId]/edit/page.tsx
'use client'; // Halaman diubah menjadi Client Component

import { useState, useTransition, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';
import { updatePartnerAction, getPartnerByIdAction } from '@/app/actions/partnerActions';
import { Database } from '@/lib/database.types';
import Image from 'next/image';

type Partner = Database['public']['Tables']['partners']['Row'];

// Komponen Halaman Utama
export default function EditPartnerPage({ params }: { params: { partnerId: string } }) {
    const [partner, setPartner] = useState<Partner | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPartner = async () => {
            const { data, error } = await getPartnerByIdAction(params.partnerId);
            if (error) {
                setError('Failed to fetch partner data.');
                toast.error(error);
            } else {
                setPartner(data as Partner);
            }
            setLoading(false);
        };
        fetchPartner();
    }, [params.partnerId]);

    if (loading) return <div className="text-center p-12">Loading...</div>;
    if (error) return <div className="text-center p-12 text-red-500">{error}</div>;
    if (!partner) return <div className="text-center p-12">Partner not found.</div>;

    return (
        <div className="space-y-6">
            <div>
                <Link href="/admin/partners" className="flex items-center gap-2 text-brand-light-muted hover:text-brand-light transition-colors mb-4">
                    <ArrowLeft size={18} />
                    Back to All Partners
                </Link>
                <h1 className="text-3xl font-bold text-brand-light">Edit Partner</h1>
                <p className="text-brand-light-muted">{`Updating details for "${partner.name}".`}</p>
            </div>
            {/* Form component digabungkan di sini */}
            <EditPartnerForm partner={partner} />
        </div>
    );
}


// Komponen Form Edit (sebelumnya EditPartnerForm.tsx)
const EditPartnerForm = ({ partner }: { partner: Partner }) => {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const [logoPreview, setLogoPreview] = useState<string | null>(partner.logo_url);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        
        startTransition(async () => {
            const result = await updatePartnerAction(partner.id, formData);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success('Partner updated successfully!');
                router.push('/admin/partners');
            }
        });
    };

    const inputStyles = "w-full bg-white/5 border border-transparent rounded-full px-4 py-3 text-brand-light placeholder:text-brand-light-muted transition-colors duration-300 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent hover:border-brand-accent/50";
    const labelStyles = "block text-sm font-medium text-brand-light-muted mb-2 group-hover:text-brand-accent transition-colors";

    return (
        <form onSubmit={handleSubmit} className="bg-brand-darkest p-8 rounded-lg border border-white/10 space-y-8">
            <input type="hidden" name="existing_logo_url" value={partner.logo_url || ''} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <div className="space-y-2 group">
                        <label htmlFor="name" className={labelStyles}>Partner Name *</label>
                        <input type="text" id="name" name="name" required className={inputStyles} defaultValue={partner.name} />
                    </div>
                    <div className="space-y-2 group">
                        <label htmlFor="subheadline" className={labelStyles}>Subheadline / Tagline</label>
                        <input type="text" id="subheadline" name="subheadline" className={inputStyles} defaultValue={partner.subheadline || ''} />
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
                                    <span>Change logo</span>
                                    <input id="logo" name="logo" type="file" className="sr-only" accept="image/png, image/jpeg, image/svg+xml" onChange={handleLogoChange} />
                                </label>
                            </div>
                            <p className="text-xs text-brand-light-muted/70">PNG, JPG, SVG up to 1MB</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t border-white/10 pt-6 flex justify-end">
                <button type="submit" disabled={isPending} className="px-8 py-3 bg-brand-accent text-brand-darkest font-semibold rounded-lg flex items-center gap-2 transition-all duration-300 ease-in-out hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isPending && <Loader2 className="animate-spin" size={20} />}
                    {isPending ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
}