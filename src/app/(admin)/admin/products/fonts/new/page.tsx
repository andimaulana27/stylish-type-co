// src/app/(admin)/admin/products/fonts/new/page.tsx
'use client';

import Link from 'next/link';
import { ArrowLeft, Loader2, Check, ChevronDown, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState, useTransition, useEffect, FormEvent, Fragment, KeyboardEvent, useCallback } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import JSZip from 'jszip';
import opentype from 'opentype.js';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { addFontAction } from '@/app/actions/productActions';
import GalleryImageUploader from '@/components/admin/GalleryImageUploader';
import { getPartnerListAction } from '@/app/actions/partnerActions';
import FontZipUploader from '@/components/admin/FontZipUploader'; // Import Komponen Uploader

const MIN_FILES = 0;

type PreviewFont = { name: string; styleName: string; fontFamily: string; url: string; };
type Partner = { id: string; name: string };
const categories = ["Serif Display", "Sans Serif", "Slab Serif", "Groovy", "Script", "Blackletter", "Western", "Sport", "Sci-Fi"];

export default function AddNewFontPage() {
    const [isPending, startTransition] = useTransition();
    const [fontName, setFontName] = useState('');
    const [slug, setSlug] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [currentTag, setCurrentTag] = useState('');
    const [purposeTags, setPurposeTags] = useState<string[]>([]);
    const [currentPurposeTag, setCurrentPurposeTag] = useState('');
    const [mainDescription, setMainDescription] = useState('');
    
    // State untuk file & upload
    const [uploadResult, setUploadResult] = useState<{ downloadableFileUrl: string } | null>(null);
    const [isZipUploading, setIsZipUploading] = useState(false);
    
    // State untuk preview & data font
    const [fileSize, setFileSize] = useState<string>('');
    const [fileTypes, setFileTypes] = useState<string>('');
    const [glyphsJson, setGlyphsJson] = useState<string[]>([]);
    const [previewFonts, setPreviewFonts] = useState<PreviewFont[]>([]);
    const [dynamicStyles, setDynamicStyles] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [livePreviewText, setLivePreviewText] = useState('The quick brown fox jumps over the lazy dog');

    const [galleryImageUrls, setGalleryImageUrls] = useState<string[]>([]);
    const [isGalleryUploading, setIsGalleryUploading] = useState(false);

    const [partners, setPartners] = useState<Partner[]>([]);
    const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

    useEffect(() => {
        const fetchPartners = async () => {
            const result = await getPartnerListAction();
            if (result.partners) {
                setPartners(result.partners);
            }
        };
        fetchPartners();
    }, []);
    
    useEffect(() => {
        const generatedSlug = fontName
            .toLowerCase()
            .replace(/&/g, 'and')
            .replace(/[^a-z0-9-]+/g, ' ')
            .trim()
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
        setSlug(generatedSlug);
    }, [fontName]);

    useEffect(() => {
        const urlsToClean = previewFonts.map(font => font.url);
        return () => { urlsToClean.forEach(url => URL.revokeObjectURL(url)); };
    }, [previewFonts]);

    const handleGalleryUploadChange = useCallback((urls: string[], isUploading: boolean) => {
        setGalleryImageUrls(urls);
        setIsGalleryUploading(isUploading);
    }, []);

    const handleZipUploadComplete = useCallback((result: { downloadableFileUrl: string } | null, isUploading: boolean) => {
        setUploadResult(result);
        setIsZipUploading(isUploading);
    }, []);

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

    const getFontStyle = (fileName: string): string => {
        const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
        const nameParts = nameWithoutExt.split(/[-_ ]+/);
        const styleKeywords: { [key: string]: string } = {
          'thin': 'Thin', 'extralight': 'ExtraLight', 'light': 'Light', 'regular': 'Regular',
          'medium': 'Medium', 'semibold': 'SemiBold', 'bold': 'Bold', 'extrabold': 'ExtraBold',
          'black': 'Black', 'italic': 'Italic', 'bolditalic': 'Bold Italic'
        };
        for (let i = nameParts.length - 1; i >= 0; i--) {
            const part = nameParts[i].toLowerCase();
            if (styleKeywords[part]) return styleKeywords[part];
        }
        return 'Regular';
    };

    // Fungsi scan file (diadaptasi agar menerima File objek langsung dari Uploader)
    const handleAndScanZipFile = async (file: File | null) => {
        setFileSize(''); setFileTypes(''); setGlyphsJson([]);
        setPreviewFonts([]); setDynamicStyles('');

        if (file) {
            setFileSize(`${(file.size / 1024).toFixed(2)} KB`);
            const zip = new JSZip();
            try {
                const contents = await zip.loadAsync(file);
                const types = new Set<string>();
                const fontPromises: Promise<PreviewFont>[] = [];
                let primaryFontScanned = false;
                
                contents.forEach((relativePath, zipEntry) => {
                    const isFontFile = !zipEntry.dir && /\.(otf|ttf|woff|woff2)$/i.test(zipEntry.name);
                    if (isFontFile) {
                        const fileExt = (zipEntry.name.split('.').pop() || '').toLowerCase();
                        types.add(fileExt.toUpperCase());
                        
                        const promise = zipEntry.async('arraybuffer').then(arrayBuffer => {
                            const blob = new Blob([arrayBuffer]);
                            const url = URL.createObjectURL(blob);
                            const fileName = zipEntry.name.split('/').pop() || zipEntry.name;
                            const styleName = getFontStyle(fileName);
                            const fontFamily = `Preview-${Date.now()}-${Math.random()}`;

                            if (!primaryFontScanned && (fileExt === 'otf' || fileExt === 'ttf')) {
                                if (styleName.toLowerCase() === 'regular' || fontPromises.length === 0) {
                                  try {
                                    const font = opentype.parse(arrayBuffer);
                                    const glyphSet = new Set<string>();
                                    for (let i = 0; i < font.numGlyphs; i++) {
                                        const glyph = font.glyphs.get(i);
                                        if (glyph.unicode) {
                                        const char = String.fromCodePoint(glyph.unicode);
                                        if (char.trim().length > 0 || char === ' ') glyphSet.add(char);
                                        }
                                    }
                                    setGlyphsJson(Array.from(glyphSet));
                                    primaryFontScanned = true;
                                  } catch (e) {
                                    console.warn("Error parsing font for glyphs:", e);
                                  }
                                }
                            }
                            
                            return { name: fileName, styleName, fontFamily, url };
                        });
                        fontPromises.push(promise);
                    }
                });
                
                setFileTypes(Array.from(types).join(', '));
                const loadedFonts = await Promise.all(fontPromises);
                const newStyles = loadedFonts.map(font => `@font-face { font-family: '${font.fontFamily}'; src: url('${font.url}'); }`).join('\n');
                
                setPreviewFonts(loadedFonts);
                setDynamicStyles(newStyles);
                toast.success(`${loadedFonts.length} font style(s) detected inside ZIP!`);
            } catch (error) {
                toast.error("Failed to read ZIP file. It might be corrupted.");
                console.error("Error reading ZIP file:", error);
            }
        }
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        
        if (isGalleryUploading || isZipUploading) {
            toast.error("Please wait for all images/files to finish uploading.");
            return;
        }
        
        // Cek apakah file sudah diupload ke storage
        if (!uploadResult?.downloadableFileUrl) {
            toast.error("Font ZIP file is required and must be uploaded!");
            return;
        }

        if (galleryImageUrls.length < MIN_FILES) {
            toast.error(`A minimum of ${MIN_FILES} preview images is required.`);
            return;
        }
        if (!selectedCategory) {
            toast.error("Please select a font category.");
            return;
        }

        startTransition(async () => {
            const formData = new FormData(event.currentTarget);
            formData.set('category', selectedCategory);
            formData.set('partner_id', selectedPartner?.id || '');
            formData.set('tags', tags.join(','));
            formData.set('purpose_tags', purposeTags.join(','));
            formData.set('main_description', mainDescription);
            
            formData.delete('previewImages');
            galleryImageUrls.forEach(url => formData.append('preview_image_urls', url));
            
            // Perubahan Utama: Kirim URL string, bukan File object
            formData.set('downloadable_file_url', uploadResult.downloadableFileUrl);
            formData.delete('zipFile'); // Hapus file mentah jika ada di form

            formData.set('file_size_kb', fileSize.replace(' KB', ''));
            formData.set('file_types', fileTypes);
            formData.set('glyphs_json', JSON.stringify(glyphsJson));

            const result = await addFontAction(formData);
            
            if (result?.error) { 
                toast.error(result.error); 
            } else { 
                toast.success('Font added successfully! Redirecting...'); 
            }
        });
    };
    
    const isUploading = isGalleryUploading || isZipUploading;
    const inputStyles = "w-full bg-white/5 border border-transparent rounded-full px-4 py-3 text-brand-light placeholder:text-brand-light-muted transition-colors duration-300 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent hover:border-brand-accent/50";
    const labelStyles = "block text-sm font-medium text-brand-light-muted mb-2 group-hover:text-brand-accent transition-colors";

    return (
        <>
            <style jsx global>{`
                input:-webkit-autofill,
                input:-webkit-autofill:hover, 
                input:-webkit-autofill:focus, 
                input:-webkit-autofill:active {
                  -webkit-box-shadow: 0 0 0 30px #171717 inset !important;
                  -webkit-text-fill-color: #FFFFFF !important;
                  caret-color: #FFFFFF !important;
                }
                ${dynamicStyles}
            `}</style>
            <div className="space-y-6">
                <div>
                    <Link href="/admin/products/fonts" className="flex items-center gap-2 text-brand-light-muted hover:text-brand-light transition-colors mb-4">
                        <ArrowLeft size={18} />
                        Back to All Fonts
                    </Link>
                    <h1 className="text-3xl font-bold text-brand-light">Add New Font</h1>
                    <p className="text-brand-light-muted">Fill in the details below to add a new font product.</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-brand-darkest p-8 rounded-lg border border-white/10 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2 group">
                            <label htmlFor="name" className={labelStyles}>Font Name *</label>
                            <input type="text" id="name" name="name" required className={inputStyles} placeholder="e.g., Hearty Beltime" value={fontName} onChange={(e) => setFontName(e.target.value)} />
                        </div>
                        {/* FontZipUploader menggantikan input file standar */}
                        <div className="space-y-2 group">
                            <FontZipUploader 
                                label="Font Assets (.zip) *" 
                                onUploadComplete={handleZipUploadComplete} 
                                onFileSelect={handleAndScanZipFile} 
                            />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-2 group">
                            <label htmlFor="slug" className={labelStyles}>Font Slug (Auto-generated)</label>
                            <input type="text" id="slug" name="slug" required className={`${inputStyles} bg-white/10 cursor-not-allowed`} placeholder="e.g., hearty-beltime" value={slug} readOnly />
                        </div>
                        <div className="space-y-2 group">
                            <label htmlFor="price" className={labelStyles}>Standard License Price (USD) *</label>
                            <input type="number" id="price" name="price" required min="0" step="0.01" className={inputStyles} placeholder="e.g., 19.00" />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                         <div className="space-y-2 group">
                             <label htmlFor="category" className={labelStyles}>Category *</label>
                             <Listbox value={selectedCategory} onChange={setSelectedCategory}>
                                {({ open }) => (
                                <div className="relative">
                                    <Listbox.Button className={`${inputStyles} text-left flex justify-between items-center`}>
                                        <span className={selectedCategory ? 'text-brand-light' : 'text-brand-light-muted'}>{selectedCategory || 'Select a category'}</span>
                                        <ChevronDown size={20} className={`transition-transform duration-200 ${open ? 'rotate-180 text-brand-accent' : 'text-brand-light-muted'}`} />
                                    </Listbox.Button>
                                    <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                        <Listbox.Options className="absolute z-10 mt-1 w-full bg-[#1e1e1e] shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black/5 overflow-auto focus:outline-none sm:text-sm">
                                            {categories.map((category) => ( <Listbox.Option key={category} className={({ active }) => `cursor-pointer select-none relative py-2 pl-10 pr-4 ${active ? 'bg-brand-accent text-brand-darkest' : 'text-brand-light'}`} value={category}>
                                                {({ selected }) => ( <> <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{category}</span> {selected ? (<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-brand-accent"><Check size={20} aria-hidden="true" /></span>) : null} </>)}
                                            </Listbox.Option>))}
                                        </Listbox.Options>
                                    </Transition>
                                </div>
                                )}
                            </Listbox>
                        </div>
                        <div className="space-y-2 group">
                            <label htmlFor="partner" className={labelStyles}>Partner/Foundry (Optional)</label>
                            <Listbox value={selectedPartner} onChange={setSelectedPartner}>
                                {({ open }) => (
                                <div className="relative">
                                    <Listbox.Button className={`${inputStyles} text-left flex justify-between items-center`}>
                                        <span className={selectedPartner ? 'text-brand-light' : 'text-brand-light-muted'}>{selectedPartner?.name || 'Stylish Type (Default)'}</span>
                                        <ChevronDown size={20} className={`transition-transform duration-200 ${open ? 'rotate-180 text-brand-accent' : 'text-brand-light-muted'}`} />
                                    </Listbox.Button>
                                    <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                        <Listbox.Options className="absolute z-10 mt-1 w-full bg-[#1e1e1e] shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black/5 overflow-auto focus:outline-none sm:text-sm">
                                            <Listbox.Option
                                                className={({ active }) => `cursor-pointer select-none relative py-2 pl-10 pr-4 ${active ? 'bg-brand-accent text-brand-darkest' : 'text-brand-light'}`}
                                                value={null}
                                            >
                                                {({ selected }) => ( <> <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>Stylish Type (Default)</span> {selected ? (<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-brand-accent"><Check size={20} aria-hidden="true" /></span>) : null} </>)}
                                            </Listbox.Option>
                                            {partners.map((partner) => ( <Listbox.Option key={partner.id} className={({ active }) => `cursor-pointer select-none relative py-2 pl-10 pr-4 ${active ? 'bg-brand-accent text-brand-darkest' : 'text-brand-light'}`} value={partner}>
                                                {({ selected }) => ( <> <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{partner.name}</span> {selected ? (<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-brand-accent"><Check size={20} aria-hidden="true" /></span>) : null} </>)}
                                            </Listbox.Option>))}
                                        </Listbox.Options>
                                    </Transition>
                                </div>
                                )}
                            </Listbox>
                        </div>
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
                        <label htmlFor="main_description" className={labelStyles}>Main Description</label>
                        <RichTextEditor value={mainDescription} onChange={setMainDescription} placeholder="A full description for the font detail page..."/>
                    </div>
                    
                     {previewFonts.length > 0 && (
                         <div className="space-y-4 group">
                            <label className={labelStyles}>Live Font Preview (OTF files from ZIP)</label>
                             <input type="text" value={livePreviewText} onChange={(e) => setLivePreviewText(e.target.value)} className={inputStyles} placeholder="Type here to preview..."/>
                            <div className="bg-white/5 rounded-lg p-6 space-y-6 max-h-96 overflow-y-auto">
                                {previewFonts.filter(font => font.name.toLowerCase().endsWith('.otf')).map((font) => (
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

                    <div className="space-y-2 group">
                        <label className={labelStyles}>Preview Images *</label>
                        <GalleryImageUploader onUploadChange={handleGalleryUploadChange} />
                    </div>
                    
                    <div className="border-t border-white/10 pt-6 flex justify-end">
                        <button type="submit" disabled={isPending || isUploading} className="px-8 py-3 bg-brand-accent text-brand-darkest font-semibold rounded-lg transition-all duration-300 ease-in-out hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                            {isPending ? <Loader2 className="animate-spin" size={20} /> : null}
                            {isPending ? 'Saving...' : isUploading ? 'Uploading Files...' : 'Save Font'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}