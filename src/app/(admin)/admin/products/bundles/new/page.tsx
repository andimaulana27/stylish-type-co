// src/app/(admin)/admin/products/bundles/new/page.tsx
'use client';

import Link from 'next/link';
import { ArrowLeft, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState, useTransition, useEffect, FormEvent, useCallback, KeyboardEvent } from 'react';
import JSZip from 'jszip';
import RichTextEditor from '@/components/admin/RichTextEditor';
import GalleryImageUploader from '@/components/admin/GalleryImageUploader';
import { addBundleAction, findFontsByNamesAction } from '@/app/actions/bundleActions';
import BundleZipUploader from '@/components/admin/BundleZipUploader';

const MIN_IMAGES = 1;

type BundleFontPreview = { name: string; style: string; url: string; };
type PreviewFont = { name: string; fontFamily: string; url: string; };

export default function AddNewBundlePage() {
    const [isPending, startTransition] = useTransition();
    const [bundleName, setBundleName] = useState('');
    const [slug, setSlug] = useState('');
    const [mainDescription, setMainDescription] = useState('');
    const [galleryImageUrls, setGalleryImageUrls] = useState<string[]>([]);
    const [isGalleryUploading, setIsGalleryUploading] = useState(false);
    
    const [tags, setTags] = useState<string[]>([]);
    const [currentTag, setCurrentTag] = useState('');
    const [purposeTags, setPurposeTags] = useState<string[]>([]);
    const [currentPurposeTag, setCurrentPurposeTag] = useState('');

    const [isZipUploading, setIsZipUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState<{
        downloadableFileUrl: string;
        bundleFontPreviews: BundleFontPreview[];
    } | null>(null);

    const [previewFonts, setPreviewFonts] = useState<PreviewFont[]>([]);
    const [dynamicStyles, setDynamicStyles] = useState<string>('');
    const [livePreviewText, setLivePreviewText] = useState('The quick brown fox jumps over the lazy dog');
    
    useEffect(() => {
        const generatedSlug = bundleName
            .toLowerCase()
            .replace(/&/g, 'and')
            .replace(/[^a-z0-9-]+/g, ' ')
            .trim()
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
        setSlug(generatedSlug);
    }, [bundleName]);

    
    useEffect(() => {
        const urlsToClean = previewFonts.map(font => font.url);
        return () => { urlsToClean.forEach(url => URL.revokeObjectURL(url)); };
    }, [previewFonts]);

    const addTags = (tagString: string) => {
        const newTags = tagString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0 && !tags.includes(tag));
        if (newTags.length > 0) setTags([...tags, ...newTags]);
        setCurrentTag('');
    };
    const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTags(currentTag); } };
    const removeTag = (tagToRemove: string) => setTags(tags.filter(tag => tag !== tagToRemove));

    const addPurposeTags = (tagString: string) => {
        const newTags = tagString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0 && !purposeTags.includes(tag));
        if (newTags.length > 0) setPurposeTags([...purposeTags, ...newTags]);
        setCurrentPurposeTag('');
    };
    const handlePurposeTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addPurposeTags(currentPurposeTag); } };
    const removePurposeTag = (tagToRemove: string) => setPurposeTags(purposeTags.filter(tag => tag !== tagToRemove));


    const handleGalleryUploadChange = useCallback((urls: string[], isUploading: boolean) => {
        setGalleryImageUrls(urls);
        setIsGalleryUploading(isUploading);
    }, []);

    const handleZipUploadComplete = useCallback((result: { downloadableFileUrl: string; bundleFontPreviews: BundleFontPreview[]; } | null, isUploading: boolean) => {
        setUploadResult(result);
        setIsZipUploading(isUploading);
    }, []);

    const handleAndScanZipFile = async (file: File | null) => {
        if (!file) {
            setPreviewFonts([]);
            setDynamicStyles('');
            return;
        }

        toast.loading('Scanning ZIP for OTF previews...');
        try {
            const zip = new JSZip();
            const contents = await zip.loadAsync(file);
            const otfPreviewPromises: Promise<PreviewFont>[] = [];

            contents.forEach((relativePath, zipEntry) => {
                if (!zipEntry.dir && relativePath.toLowerCase().endsWith('.otf')) {
                    const fileName = relativePath.split('/').pop() || relativePath;
                    const promise = zipEntry.async('blob').then(blob => {
                        const url = URL.createObjectURL(blob);
                        const fontFamily = `Preview-${Date.now()}-${Math.random()}`;
                        return { name: fileName, fontFamily, url };
                    });
                    otfPreviewPromises.push(promise);
                }
            });

            const loadedOtfPreviews = await Promise.all(otfPreviewPromises);
            const newStyles = loadedOtfPreviews.map(font => `@font-face { font-family: '${font.fontFamily}'; src: url('${font.url}'); }`).join('\n');
            
            setPreviewFonts(loadedOtfPreviews);
            setDynamicStyles(newStyles);
            toast.dismiss();
            toast.success(`${loadedOtfPreviews.length} OTF file(s) found for preview.`);
        } catch (error) {
            toast.dismiss();
            toast.error("Failed to read ZIP for preview.");
            console.error(error);
        }
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        
        if (isGalleryUploading || isZipUploading) {
            toast.error("Please wait for all file uploads to complete.");
            return;
        }
        if (!uploadResult) {
            toast.error("Bundle ZIP file is required and must be uploaded.");
            return;
        }
        if (galleryImageUrls.length < MIN_IMAGES) {
            toast.error(`At least ${MIN_IMAGES} preview image is required.`);
            return;
        }

        startTransition(async () => {
            const formData = new FormData(event.currentTarget);
            formData.set('main_description', mainDescription);
            
            formData.set('tags', tags.join(','));
            formData.set('purpose_tags', purposeTags.join(','));
            
            formData.set('downloadable_file_url', uploadResult.downloadableFileUrl);
            formData.set('bundle_font_previews_json', JSON.stringify(uploadResult.bundleFontPreviews));

            galleryImageUrls.forEach(url => formData.append('preview_image_urls', url));
            
            const fontFileNames = uploadResult.bundleFontPreviews.map(f => f.name);
            const foundFontsInDB = await findFontsByNamesAction(fontFileNames);
            const fontIds = foundFontsInDB.map(f => f.id);
            fontIds.forEach(id => formData.append('font_ids', id));

            const result = await addBundleAction(formData);
            
            if (result?.error) { 
                toast.error(result.error); 
            } else { 
                toast.success('Bundle added successfully! Redirecting...'); 
            }
        });
    };
    
    const isUploading = isGalleryUploading || isZipUploading;
    const inputStyles = "w-full bg-white/5 border border-transparent rounded-full px-4 py-3 text-brand-light placeholder:text-brand-light-muted transition-colors duration-300 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent hover:border-brand-accent/50";
    const labelStyles = "block text-sm font-medium text-brand-light-muted mb-2 group-hover:text-brand-accent transition-colors";

    return (
        <>
            {/* --- PERBAIKAN UTAMA DI SINI --- */}
            <style jsx global>{`
                input:-webkit-autofill,
                input:-webkit-autofill:hover, 
                input:-webkit-autofill:focus, 
                input:-webkit-autofill:active {
                  -webkit-box-shadow: 0 0 0 30px #171717 inset !important; /* #171717 adalah warna brand-dark-secondary */
                  -webkit-text-fill-color: #FFFFFF !important; /* #FFFFFF adalah warna brand-light */
                  caret-color: #FFFFFF !important;
                }
                ${dynamicStyles}
            `}</style>
            <div className="space-y-6">
                <div>
                    <Link href="/admin/products/bundles" className="flex items-center gap-2 text-brand-light-muted hover:text-brand-light transition-colors mb-4">
                        <ArrowLeft size={18} />
                        Back to All Bundles
                    </Link>
                    <h1 className="text-3xl font-bold text-brand-light">Add New Bundle</h1>
                    <p className="text-brand-light-muted">Fill in the details to add a new font bundle.</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-brand-darkest p-8 rounded-lg border border-white/10 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2 group">
                            <label htmlFor="name" className={labelStyles}>Bundle Name *</label>
                            <input type="text" id="name" name="name" required className={inputStyles} placeholder="e.g., Stylish Vintage Bundle" value={bundleName} onChange={(e) => setBundleName(e.target.value)} />
                        </div>
                        <div className="space-y-2 group">
                            <label htmlFor="slug" className={labelStyles}>Bundle Slug (Auto-generated)</label>
                            <input type="text" id="slug" name="slug" required className={`${inputStyles} bg-white/10 cursor-not-allowed`} value={slug} readOnly />
                        </div>
                    </div>

                    <div className="space-y-2 group">
                        <label htmlFor="price" className={labelStyles}>Price (USD) *</label>
                        <input type="number" id="price" name="price" required min="0" step="0.01" className={inputStyles} placeholder="e.g., 29.00" />
                    </div>
                    
                    <div className="space-y-2 group">
                        <label htmlFor="tags-input" className={labelStyles}>Style Tags (Press Enter or Comma)</label>
                        <input type="text" id="tags-input" value={currentTag} onChange={(e) => setCurrentTag(e.target.value)} onKeyDown={handleTagKeyDown} placeholder="e.g., vintage, elegant, wedding" className={inputStyles}/>
                        {tags.length > 0 && (
                            <div className="pt-2 flex flex-wrap gap-2">
                                {tags.map((tag, index) => (
                                    <div key={index} className="flex items-center gap-2 bg-transparent border border-brand-accent text-brand-accent text-sm font-medium pl-3 pr-2 py-1 rounded-full">
                                        <span>{tag}</span>
                                        <button type="button" onClick={() => removeTag(tag)} className="text-brand-accent/70 hover:text-white"><X size={14} /></button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2 group">
                        <label htmlFor="purpose-tags-input" className={labelStyles}>Purpose Tags (Press Enter or Comma)</label>
                        <input type="text" id="purpose-tags-input" value={currentPurposeTag} onChange={(e) => setCurrentPurposeTag(e.target.value)} onKeyDown={handlePurposeTagKeyDown} placeholder="e.g., branding, marketing, logos" className={inputStyles}/>
                        {purposeTags.length > 0 && (
                            <div className="pt-2 flex flex-wrap gap-2">
                                {purposeTags.map((tag, index) => (
                                    <div key={index} className="flex items-center gap-2 bg-transparent border border-brand-accent text-brand-accent text-sm font-medium pl-3 pr-2 py-1 rounded-full">
                                        <span>{tag}</span>
                                        <button type="button" onClick={() => removePurposeTag(tag)} className="text-brand-accent/70 hover:text-white"><X size={14} /></button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className="space-y-2 group">
                        <label className={labelStyles}>Main Description</label>
                        <RichTextEditor value={mainDescription} onChange={setMainDescription} placeholder="A full description for the bundle detail page..." />
                    </div>
                    
                    <div className="space-y-6 border-t border-white/10 pt-6">
                        <BundleZipUploader 
                            label="Bundle Assets (.zip) *"
                            onUploadComplete={handleZipUploadComplete}
                            onFileSelect={handleAndScanZipFile}
                        />
                        <GalleryImageUploader onUploadChange={handleGalleryUploadChange} />
                    </div>
                    
                    {previewFonts.length > 0 && (
                        <div className="space-y-4 group border-t border-white/10 pt-6">
                           <label className={labelStyles}>Live Font Preview (OTF files from ZIP)</label>
                            <input type="text" value={livePreviewText} onChange={(e) => setLivePreviewText(e.target.value)} className={inputStyles} placeholder="Type here to preview..."/>
                           <div className="bg-white/5 rounded-lg p-6 space-y-6 max-h-96 overflow-y-auto">
                               {previewFonts.map((font) => (
                                   <div key={font.fontFamily}>
                                       <p className="text-sm text-brand-light-muted mb-2">{font.name}</p>
                                       <p className="text-3xl text-brand-light break-all" style={{ fontFamily: `'${font.fontFamily}'` }}>
                                           {livePreviewText || "The quick brown fox jumps over the lazy dog"}
                                       </p>
                                   </div>
                               ))}
                           </div>
                       </div>
                    )}
                    
                    <div className="border-t border-white/10 pt-6 flex justify-end">
                        <button type="submit" disabled={isPending || isUploading} className="px-8 py-3 bg-brand-accent text-brand-darkest font-semibold rounded-lg flex items-center gap-2 transition-all duration-300 ease-in-out hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed">
                            {isPending || isUploading ? <Loader2 className="animate-spin" size={20} /> : null}
                            {isPending ? 'Saving...' : isUploading ? 'Uploading Files...' : 'Save Bundle'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}