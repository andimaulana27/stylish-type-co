// src/app/(admin)/admin/blog/ads/page.tsx
'use client';

import { useState, useEffect, useTransition, Fragment } from 'react';
import toast from 'react-hot-toast';
import { Listbox, Transition } from '@headlessui/react';
import { Check, ChevronDown, ImageUp, Loader2, Save, Trash2 } from 'lucide-react';
import { getBlogAdsConfigAction, updateBlogAdsConfigAction, AdSlotConfig } from '@/app/actions/blogActions';
import { createBrowserClient } from '@supabase/ssr';
import { Database, Tables } from '@/lib/database.types';
import Image from 'next/image';

const adPositions = [
    { key: 'top', label: 'Top' },
    { key: 'bottom', label: 'Bottom' },
    { key: 'right', label: 'Right' },
    { key: 'left', label: 'Left' },
    { key: 'in_article_1', label: 'In Article' },
    { key: 'in_article_2', label: 'In Article' },
];

type BlogAdsActionResult = {
    success?: boolean;
    config?: Tables<'blog_ads'>[];
    error?: string;
}

const AdTypeSelector = ({ value, onChange }: { value: string, onChange: (value: string) => void }) => {
    const adTypes = ['Google Ads', 'Banner Image'];
    return (
        <Listbox value={value} onChange={onChange}>
            <div className="relative">
                {/* --- PERUBAHAN STYLE DROPDOWN DI SINI --- */}
                <Listbox.Button className="relative w-full cursor-pointer rounded-full bg-brand-accent py-2 px-4 text-center shadow-md focus:outline-none text-sm h-10 flex items-center justify-center font-semibold text-brand-darkest">
                    <span className="block truncate">{value}</span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <ChevronDown className="h-5 w-5 text-brand-darkest/70" />
                    </span>
                </Listbox.Button>
                {/* --- AKHIR PERUBAHAN STYLE --- */}
                <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-[#1e1e1e] py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-10">
                        {adTypes.map((type, typeIdx) => (
                            <Listbox.Option key={typeIdx} className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${ active ? 'bg-brand-accent text-brand-darkest' : 'text-gray-200'}`} value={type}>
                                {({ selected }) => ( <> <span className={`block truncate ${ selected ? 'font-medium' : 'font-normal'}`}>{type}</span> {selected && <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-brand-accent"><Check className="h-5 w-5" /></span>} </>)}
                            </Listbox.Option>
                        ))}
                    </Listbox.Options>
                </Transition>
            </div>
        </Listbox>
    );
};

const ImageUploader = ({ initialUrl, onUrlChange }: { initialUrl: string | null, onUrlChange: (url: string) => void }) => {
    const supabase = createBrowserClient<Database>( process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! );
    const [uploading, setUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(initialUrl);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setUploading(true);
        const fileName = `blog_ads/${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage.from('blog_images').upload(fileName, file);

        if (error) { toast.error(`Upload failed: ${error.message}`); setUploading(false); return; }

        const { data: { publicUrl } } = supabase.storage.from('blog_images').getPublicUrl(data.path);
        setImageUrl(publicUrl); onUrlChange(publicUrl); setUploading(false); toast.success('Image uploaded!');
    };
    
    const removeImage = () => { setImageUrl(null); onUrlChange(''); }

    return (
        <div className="h-full">
            {imageUrl ? (
                <div className="relative w-full h-full rounded-lg overflow-hidden group">
                    <Image src={imageUrl} alt="Ad banner preview" fill style={{ objectFit: 'cover' }} />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button type="button" onClick={removeImage} className="p-2 bg-red-500 text-white rounded-full"><Trash2 size={20} /></button>
                    </div>
                </div>
            ) : (
                <label className="relative flex justify-center items-center w-full h-full border-2 border-white/20 border-dashed rounded-md cursor-pointer hover:border-brand-accent transition-colors">
                    <div className="text-center">
                        {uploading ? <Loader2 className="mx-auto h-12 w-12 animate-spin text-brand-light-muted" /> : <ImageUp className="mx-auto h-12 w-12 text-brand-light-muted" />}
                        <p className="mt-2 text-sm text-brand-light-muted">{uploading ? 'Uploading...' : 'Click to upload'}</p>
                    </div>
                    <input type="file" className="sr-only" onChange={handleFileChange} disabled={uploading} accept="image/*" />
                </label>
            )}
        </div>
    );
}

const AdSlotManager = ({ config, onConfigChange }: { config: AdSlotConfig, onConfigChange: (newConfig: AdSlotConfig) => void }) => {
    return (
        <div className="bg-brand-darkest border border-white/10 rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <AdTypeSelector value={config.ad_type === 'google_ads' ? 'Google Ads' : 'Banner Image'} onChange={(val) => onConfigChange({ ...config, ad_type: val === 'Google Ads' ? 'google_ads' : 'banner'})}/>
                {/* --- PERUBAHAN STYLE LABEL POSISI DI SINI --- */}
                <div className="w-full bg-brand-primary-blue text-white font-semibold rounded-full text-sm h-10 flex items-center justify-center cursor-default">
                    {config.position.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                </div>
                {/* --- AKHIR PERUBAHAN STYLE --- */}
            </div>
            {config.ad_type === 'google_ads' ? (
                <textarea
                    placeholder="Please Insert Your Google Ads Script..."
                    value={config.google_script || ''}
                    onChange={(e) => onConfigChange({ ...config, google_script: e.target.value })}
                    className="w-full h-32 bg-white/5 rounded-lg text-sm p-3 font-mono"
                ></textarea>
            ) : (
                <div className="h-32">
                  <ImageUploader initialUrl={config.banner_image_url} onUrlChange={(url) => onConfigChange({ ...config, banner_image_url: url })} />
                </div>
            )}
        </div>
    );
};

export default function ManageBlogAdsPage() {
    const [configs, setConfigs] = useState<AdSlotConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        getBlogAdsConfigAction().then((result: BlogAdsActionResult) => {
            if (result.success && result.config) {
                const fetchedConfigs = new Map(result.config.map((c: Tables<'blog_ads'>) => [c.position, c]));
                const fullConfig: AdSlotConfig[] = adPositions.map(pos => {
                    const existing = fetchedConfigs.get(pos.key);
                    return existing ? 
                        { ...existing, google_script: existing.google_script || '', banner_image_url: existing.banner_image_url || '' } : 
                        { position: pos.key, ad_type: 'banner', google_script: '', banner_image_url: '' };
                });
                setConfigs(fullConfig);
            } else {
                toast.error(result.error || 'Failed to load ad configurations.');
            }
            setLoading(false);
        });
    }, []);

    const handleConfigChange = (index: number, newConfig: AdSlotConfig) => {
        const newConfigs = [...configs];
        newConfigs[index] = newConfig;
        setConfigs(newConfigs);
    };

    const handleSaveChanges = () => {
        startTransition(() => {
            toast.promise(
                updateBlogAdsConfigAction(configs),
                {
                    loading: 'Saving ad configurations...',
                    success: 'Settings saved successfully!',
                    error: (err) => err.message || 'Failed to save settings.'
                }
            );
        });
    };

    if (loading) return <div className="text-center p-12">Loading ad settings...</div>;

    const topBottomConfigs = configs.filter(c => c.position === 'top' || c.position === 'bottom');
    const sideConfigs = configs.filter(c => c.position === 'right' || c.position === 'left');
    const inArticleConfigs = configs.filter(c => c.position.startsWith('in_article'));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-brand-light">Manage Blog Ads</h1>
                    <p className="text-brand-light-muted">Configure ad slots displayed across your blog.</p>
                </div>
                <button onClick={handleSaveChanges} disabled={isPending} className="flex items-center gap-2 px-6 py-2 bg-brand-accent text-brand-darkest font-semibold rounded-lg transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-brand-accent/40 disabled:opacity-50">
                    {isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    <span>{isPending ? 'Saving...' : 'Save All Changes'}</span>
                </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {topBottomConfigs.map((config) => (
                    <AdSlotManager key={config.position} config={config} onConfigChange={(newConfig) => handleConfigChange(configs.findIndex(c => c.position === config.position), newConfig)} />
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {sideConfigs.map((config) => (
                    <AdSlotManager key={config.position} config={config} onConfigChange={(newConfig) => handleConfigChange(configs.findIndex(c => c.position === config.position), newConfig)} />
                ))}
            </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {inArticleConfigs.map((config) => (
                    <AdSlotManager key={config.position} config={config} onConfigChange={(newConfig) => handleConfigChange(configs.findIndex(c => c.position === config.position), newConfig)} />
                ))}
            </div>
        </div>
    );
}