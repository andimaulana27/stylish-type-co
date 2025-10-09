// src/app/(admin)/admin/products/bundles/[bundleId]/edit/page.tsx
'use client'; 

import { useState, useTransition, useEffect, FormEvent, ChangeEvent, KeyboardEvent, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, PackageCheck, PackageX, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateBundleAction, findFontsByNamesAction } from '@/app/actions/bundleActions';
import { Database, type Tables } from '@/lib/database.types';
import JSZip from 'jszip';
import GalleryImageUploader from '@/components/admin/GalleryImageUploader';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { createBrowserClient } from '@supabase/ssr';

type BundleWithFonts = Tables<'bundles'> & {
  bundle_fonts: { font_id: string }[];
};
type FoundFont = { id: string; name: string; found: true; fileName: string; }
type NotFoundFont = { found: false; fileName: string; }
type DetectedFont = FoundFont | NotFoundFont;

const EditBundleForm = ({ bundle }: { bundle: BundleWithFonts }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [bundleName, setBundleName] = useState(bundle.name);
  const [slug, setSlug] = useState(bundle.slug);
  const [mainDescription, setMainDescription] = useState(bundle.main_description || '');
  const [detectedFonts, setDetectedFonts] = useState<DetectedFont[]>([]);
  
  const [tags, setTags] = useState<string[]>(bundle.tags || []);
  const [currentTag, setCurrentTag] = useState('');
  const [purposeTags, setPurposeTags] = useState<string[]>(bundle.purpose_tags || []);
  const [currentPurposeTag, setCurrentPurposeTag] = useState('');

  const [fontIds, setFontIds] = useState<string[]>(bundle.bundle_fonts.map(f => f.font_id));

  const [galleryImageUrls, setGalleryImageUrls] = useState<string[]>(bundle.preview_image_urls || []);
  const [isGalleryUploading, setIsGalleryUploading] = useState(false);

  useEffect(() => {
    const generatedSlug = bundleName.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9-]+/g, ' ').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
    setSlug(generatedSlug);
  }, [bundleName]);

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

  const handleZipChange = async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      toast.loading('Scanning new ZIP file...');
      const zip = new JSZip();
      const contents = await zip.loadAsync(file);
      const fontFileNames = Object.keys(contents.files).filter(name => /\.(otf|ttf|woff|woff2)$/i.test(name));
      const foundFontsInDB = await findFontsByNamesAction(fontFileNames);
      const detectionResult: DetectedFont[] = fontFileNames.map(fileName => {
          const baseName = fileName.replace(/\.[^/.]+$/, "").replace(/[-_ ](thin|extralight|light|regular|medium|semibold|bold|extrabold|black|italic|bolditalic)/i, '').trim();
          const match = foundFontsInDB.find(dbFont => dbFont.name === baseName);
          return match ? { ...match, found: true, fileName } : { found: false, fileName };
      });
      setDetectedFonts(detectionResult);
      setFontIds(detectionResult.filter((f): f is FoundFont => f.found).map(f => f.id));
      toast.dismiss();
      toast.success('New font list detected. Save to apply changes.');
  };
  
  const handleGalleryUploadChange = useCallback((urls: string[], isUploading: boolean) => {
    setGalleryImageUrls(urls);
    setIsGalleryUploading(isUploading);
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isGalleryUploading) { toast.error("Please wait for images to finish uploading."); return; }
    startTransition(async () => {
        const formData = new FormData(event.currentTarget);
        formData.set('main_description', mainDescription);
        formData.set('tags', tags.join(','));
        formData.set('purpose_tags', purposeTags.join(','));
        galleryImageUrls.forEach(url => formData.append('preview_image_urls', url));
        fontIds.forEach(id => formData.append('font_ids', id));
        const result = await updateBundleAction(bundle.id, formData);
        if (result?.error) { toast.error(result.error); } 
        else { 
            toast.success('Bundle updated successfully! Redirecting...');
            setTimeout(() => { router.push('/admin/products/bundles'); router.refresh(); }, 1000); 
        }
    });
  };

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
      `}</style>
      <form onSubmit={handleSubmit} className="bg-brand-darkest p-8 rounded-lg border border-white/10 space-y-8">
        {/* --- PERBAIKAN: SELURUH KONTEN FORM DIKEMBALIKAN --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2 group">
            <label htmlFor="name" className={labelStyles}>Bundle Name *</label>
            <input type="text" id="name" name="name" required className={inputStyles} value={bundleName} onChange={(e) => setBundleName(e.target.value)} />
          </div>
          <div className="space-y-2 group">
            <label htmlFor="slug" className={labelStyles}>Bundle Slug</label>
            <input type="text" id="slug" name="slug" required className={`${inputStyles} bg-white/10 cursor-not-allowed`} value={slug} readOnly />
          </div>
        </div>
        <div className="space-y-2 group">
          <label htmlFor="price" className={labelStyles}>Price (USD) *</label>
          <input type="number" id="price" name="price" required min="0" step="0.01" className={inputStyles} defaultValue={bundle.price ?? 0} />
        </div>
        <div className="space-y-2 group">
          <label htmlFor="tags-input" className={labelStyles}>Style Tags (Press Enter or Comma)</label>
          <input type="text" id="tags-input" value={currentTag} onChange={(e) => setCurrentTag(e.target.value)} onKeyDown={handleTagKeyDown} placeholder="e.g., vintage, elegant, wedding" className={inputStyles}/>
          {tags.length > 0 && (
              <div className="pt-2 flex flex-wrap gap-2">{tags.map((tag) => (<div key={tag} className="flex items-center gap-2 bg-transparent border border-brand-accent text-brand-accent text-sm font-medium pl-3 pr-2 py-1 rounded-full"><span>{tag}</span><button type="button" onClick={() => removeTag(tag)} className="text-brand-accent/70 hover:text-white"><X size={14} /></button></div>))}</div>
          )}
        </div>
        <div className="space-y-2 group">
          <label htmlFor="purpose-tags-input" className={labelStyles}>Purpose Tags (Press Enter or Comma)</label>
          <input type="text" id="purpose-tags-input" value={currentPurposeTag} onChange={(e) => setCurrentPurposeTag(e.target.value)} onKeyDown={handlePurposeTagKeyDown} placeholder="e.g., branding, marketing, logos" className={inputStyles}/>
          {purposeTags.length > 0 && (
              <div className="pt-2 flex flex-wrap gap-2">{purposeTags.map((tag) => (<div key={tag} className="flex items-center gap-2 bg-transparent border border-brand-accent text-brand-accent text-sm font-medium pl-3 pr-2 py-1 rounded-full"><span>{tag}</span><button type="button" onClick={() => removePurposeTag(tag)} className="text-brand-accent/70 hover:text-white"><X size={14} /></button></div>))}</div>
          )}
        </div>
        <div className="space-y-2 group">
          <label className={labelStyles}>Main Description</label>
          <RichTextEditor value={mainDescription} onChange={setMainDescription} />
        </div>
        <div className="space-y-6 border-t border-white/10 pt-6">
          <div className="space-y-2 group">
            <label htmlFor="zipFile" className={labelStyles}>Replace Font Files (.zip)</label>
            <p className="text-xs text-brand-light-muted -mt-2 mb-2">Optional: Upload a new ZIP to replace the list of fonts in this bundle.</p>
            <input type="file" id="zipFile" name="zipFile" accept=".zip" onChange={handleZipChange} className="block w-full text-sm text-brand-light-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-brand-dark-secondary file:text-brand-light hover:file:bg-brand-accent/20"/>
          </div>
          <GalleryImageUploader initialUrls={bundle.preview_image_urls || []} onUploadChange={handleGalleryUploadChange} />
        </div>
        {detectedFonts.length > 0 && (
           <div className="space-y-2 group">
              <label className={labelStyles}>New Detected Fonts (Will Replace Current on Save)</label>
              <div className="bg-white/5 rounded-lg p-4 space-y-2 max-h-60 overflow-y-auto">
                  {detectedFonts.map((font, index) => (
                      <div key={index} className={`flex items-center gap-3 text-sm p-1 rounded ${font.found ? 'text-green-300' : 'text-red-400'}`}>
                          {font.found ? <PackageCheck size={16} /> : <PackageX size={16} />}
                          <span className="font-mono text-xs flex-1">{font.fileName}</span>
                          {font.found ? <span className="font-semibold">{font.name} (Found)</span> : <span className="font-semibold">(Not in DB)</span>}
                      </div>
                  ))}
              </div>
          </div>
        )}
        {/* --- AKHIR KONTEN FORM --- */}
        <div className="border-t border-white/10 pt-6 flex justify-end">
          <button type="submit" disabled={isPending || isGalleryUploading} className="px-8 py-3 bg-brand-accent text-brand-darkest font-semibold rounded-lg flex items-center gap-2 transition-all duration-300 ease-in-out hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed">
              {(isPending || isGalleryUploading) && <Loader2 className="animate-spin" size={20} />}
              {isPending ? 'Saving...' : isGalleryUploading ? 'Uploading...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </>
  );
}

export default function EditBundlePage({ params }: { params: { bundleId: string } }) {
    const [bundle, setBundle] = useState<BundleWithFonts | null>(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const supabase = createBrowserClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        const fetchBundle = async () => {
            const { data, error } = await supabase
                .from('bundles')
                .select('*, bundle_fonts(font_id)')
                .eq('id', params.bundleId)
                .single();
            
            if (error || !data) {
                toast.error("Could not fetch bundle data.");
            } else {
                setBundle(data as BundleWithFonts);
            }
            setLoading(false);
        };
        fetchBundle();
    }, [params.bundleId]);

    if (loading) return <div className="text-center p-12">Loading...</div>;
    if (!bundle) return <div className="text-center p-12">Bundle not found.</div>;

    return (
        <div className="space-y-6">
            <div>
                <Link href="/admin/products/bundles" className="flex items-center gap-2 text-brand-light-muted hover:text-brand-light transition-colors mb-4">
                    <ArrowLeft size={18} />
                    Back to All Bundles
                </Link>
                <h1 className="text-3xl font-bold text-brand-light">Edit Bundle</h1>
                <p className="text-brand-light-muted">{`Update details for "${bundle.name}".`}</p>
            </div>
            <EditBundleForm bundle={bundle} />
        </div>
    );
}