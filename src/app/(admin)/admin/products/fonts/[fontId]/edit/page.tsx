// src/app/(admin)/admin/products/fonts/[fontId]/edit/page.tsx
'use client';

import { useState, useTransition, KeyboardEvent, useEffect, Fragment, useCallback, FormEvent } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, ChevronDown, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Database, type Tables } from '@/lib/database.types';
import { updateFontAction } from '@/app/actions/productActions';
import { getPartnerListAction } from '@/app/actions/partnerActions';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { Listbox, Transition } from '@headlessui/react';
import { useRouter } from 'next/navigation';
import GalleryImageUploader from '@/components/admin/GalleryImageUploader';
import { createBrowserClient } from '@supabase/ssr';

type Font = Tables<'fonts'>;
type Partner = { id: string; name: string };
const categories = ["Serif Display", "Sans Serif", "Slab Serif", "Groovy", "Script", "Blackletter", "Western", "Sport", "Sci-Fi"];

const EditFontForm = ({ font }: { font: Font }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [fontName, setFontName] = useState(font.name);
  const [slug, setSlug] = useState(font.slug);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(font.category);
  const [tags, setTags] = useState<string[]>(font.tags || []);
  const [currentTag, setCurrentTag] = useState('');
  const [purposeTags, setPurposeTags] = useState<string[]>(font.purpose_tags || []);
  const [currentPurposeTag, setCurrentPurposeTag] = useState('');
  const [mainDescription, setMainDescription] = useState(font.main_description || '');
  const [galleryImageUrls, setGalleryImageUrls] = useState<string[]>(font.preview_image_urls || []);
  const [isGalleryUploading, setIsGalleryUploading] = useState(false);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

  useEffect(() => {
    const fetchPartners = async () => {
        const result = await getPartnerListAction();
        if (result.partners) {
            setPartners(result.partners);
            if (font.partner_id) {
                const currentPartner = result.partners.find(p => p.id === font.partner_id);
                setSelectedPartner(currentPartner || null);
            }
        }
    };
    fetchPartners();
  }, [font.partner_id]);

  useEffect(() => {
    const generatedSlug = fontName.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9-]+/g, ' ').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
    setSlug(generatedSlug);
  }, [fontName]);

  const addTags = (tagString: string) => {
    const newTags = tagString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0 && !tags.includes(tag));
    if (newTags.length > 0) setTags([...tags, ...newTags]);
    setCurrentTag('');
  };
  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTags(currentTag); }
  };
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => { e.preventDefault(); addTags(e.clipboardData.getData('text')); };
  const removeTag = (tagToRemove: string) => setTags(tags.filter(tag => tag !== tagToRemove));

  const addPurposeTags = (tagString: string) => {
    const newTags = tagString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0 && !purposeTags.includes(tag));
    if (newTags.length > 0) setPurposeTags([...purposeTags, ...newTags]);
    setCurrentPurposeTag('');
  };
  const handlePurposeTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addPurposeTags(currentPurposeTag); }
  };
  const handlePurposePaste = (e: React.ClipboardEvent<HTMLInputElement>) => { e.preventDefault(); addPurposeTags(e.clipboardData.getData('text')); };
  const removePurposeTag = (tagToRemove: string) => setPurposeTags(purposeTags.filter(tag => tag !== tagToRemove));
  
  const handleGalleryUploadChange = useCallback((urls: string[], isUploading: boolean) => {
      setGalleryImageUrls(urls);
      setIsGalleryUploading(isUploading);
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isGalleryUploading) { toast.error("Please wait for images to finish uploading."); return; }
    const formData = new FormData(event.currentTarget);
    formData.set('category', selectedCategory || '');
    formData.set('partner_id', selectedPartner?.id || '');
    formData.set('tags', tags.join(','));
    formData.set('purpose_tags', purposeTags.join(','));
    formData.set('main_description', mainDescription);
    formData.set('name', fontName);
    formData.set('slug', slug);
    galleryImageUrls.forEach(url => formData.append('preview_image_urls', url));
    formData.delete('short_description');
    startTransition(async () => {
      const result = await updateFontAction(font.id, formData);
      if (result?.error) { toast.error(result.error); } 
      else {
        toast.success('Font updated successfully! Redirecting...');
        setTimeout(() => { router.push('/admin/products/fonts'); router.refresh(); }, 1000);
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2 group">
            <label htmlFor="name" className={labelStyles}>Font Name</label>
            <input type="text" id="name" name="name" required className={inputStyles} value={fontName} onChange={(e) => setFontName(e.target.value)} />
          </div>
          <div className="space-y-2 group">
            <label htmlFor="slug" className={labelStyles}>Font Slug (Auto-generated)</label>
            <input type="text" id="slug" name="slug" required className={`${inputStyles} bg-white/10 cursor-not-allowed`} value={slug} readOnly />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="space-y-2 group">
            <label htmlFor="category" className={labelStyles}>Category</label>
            <Listbox value={selectedCategory} onChange={setSelectedCategory}>{({ open }) => (<div className="relative"><Listbox.Button className={`${inputStyles} text-left flex justify-between items-center`}><span className={selectedCategory ? 'text-brand-light' : 'text-brand-light-muted'}>{selectedCategory || 'Select a category'}</span><ChevronDown size={20} className={`transition-transform duration-200 ${open ? 'rotate-180 text-brand-accent' : 'text-brand-light-muted'}`} /></Listbox.Button><Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0"><Listbox.Options className="absolute z-10 mt-1 w-full bg-[#1e1e1e] shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black/5 overflow-auto focus:outline-none sm:text-sm">{categories.map((category) => (<Listbox.Option key={category} className={({ active }) => `cursor-pointer select-none relative py-2 pl-10 pr-4 ${active ? 'bg-brand-accent text-brand-darkest' : 'text-brand-light'}`} value={category}>{({ selected }) => (<><span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{category}</span>{selected ? (<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-brand-accent"><Check size={20} aria-hidden="true" /></span>) : null}</>)}</Listbox.Option>))}</Listbox.Options></Transition></div>)}</Listbox>
          </div>
          <div className="space-y-2 group">
            <label htmlFor="partner" className={labelStyles}>Partner/Foundry</label>
            <Listbox value={selectedPartner} onChange={setSelectedPartner}>{({ open }) => (<div className="relative"><Listbox.Button className={`${inputStyles} text-left flex justify-between items-center`}><span className={selectedPartner ? 'text-brand-light' : 'text-brand-light-muted'}>{selectedPartner?.name || 'Stylish Type (Default)'}</span><ChevronDown size={20} className={`transition-transform duration-200 ${open ? 'rotate-180 text-brand-accent' : 'text-brand-light-muted'}`} /></Listbox.Button><Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0"><Listbox.Options className="absolute z-10 mt-1 w-full bg-[#1e1e1e] shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black/5 overflow-auto focus:outline-none sm:text-sm"><Listbox.Option className={({ active }) => `cursor-pointer select-none relative py-2 pl-10 pr-4 ${active ? 'bg-brand-accent text-brand-darkest' : 'text-brand-light'}`} value={null}>{({ selected }) => ( <> <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>Stylish Type (Default)</span> {selected ? (<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-brand-accent"><Check size={20} aria-hidden="true" /></span>) : null} </>)}</Listbox.Option>{partners.map((partner) => ( <Listbox.Option key={partner.id} className={({ active }) => `cursor-pointer select-none relative py-2 pl-10 pr-4 ${active ? 'bg-brand-accent text-brand-darkest' : 'text-brand-light'}`} value={partner}>{({ selected }) => ( <> <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{partner.name}</span> {selected ? (<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-brand-accent"><Check size={20} aria-hidden="true" /></span>) : null} </>)}</Listbox.Option>))}</Listbox.Options></Transition></div>)}</Listbox>
          </div>
        </div>
        <div className="space-y-2 group">
          <label htmlFor="tags-input" className={labelStyles}>Style Tags (Press Enter or Comma)</label>
          <input type="text" id="tags-input" value={currentTag} onChange={(e) => setCurrentTag(e.target.value)} onKeyDown={handleTagKeyDown} onPaste={handlePaste} placeholder="e.g., vintage, elegant, wedding" className={inputStyles}/>
          {tags.length > 0 && (<div className="pt-2 flex flex-wrap gap-2">{tags.map((tag, index) => (<div key={index} className="flex items-center gap-2 bg-transparent border border-brand-accent text-brand-accent text-sm font-medium pl-3 pr-2 py-1 rounded-full"><span>{tag}</span><button type="button" onClick={() => removeTag(tag)} className="text-brand-accent/70 hover:text-white"><X size={14} /></button></div>))}</div>)}
        </div>
        <div className="space-y-2 group">
          <label htmlFor="purpose-tags-input" className={labelStyles}>Purpose Tags (Press Enter or Comma)</label>
          <input type="text" id="purpose-tags-input" value={currentPurposeTag} onChange={(e) => setCurrentPurposeTag(e.target.value)} onKeyDown={handlePurposeTagKeyDown} onPaste={handlePurposePaste} placeholder="e.g., branding, marketing, logos" className={inputStyles}/>
          {purposeTags.length > 0 && (<div className="pt-2 flex flex-wrap gap-2">{purposeTags.map((tag, index) => (<div key={index} className="flex items-center gap-2 bg-transparent border border-brand-accent text-brand-accent text-sm font-medium pl-3 pr-2 py-1 rounded-full"><span>{tag}</span><button type="button" onClick={() => removePurposeTag(tag)} className="text-brand-accent/70 hover:text-white"><X size={14} /></button></div>))}</div>)}
        </div>
        <div className="space-y-2 group">
          <label htmlFor="price" className={labelStyles}>Price (USD)</label>
          <input type="number" id="price" name="price" required min="0" step="0.01" className={inputStyles} defaultValue={font.price ?? 0} />
        </div>
        <div className="space-y-2 group">
          <label htmlFor="main_description" className={labelStyles}>Main Description</label>
          <RichTextEditor value={mainDescription} onChange={setMainDescription} placeholder="A full description for the font detail page..."/>
        </div>
        <div className="space-y-6 border-t border-white/10 pt-6">
          <GalleryImageUploader initialUrls={font.preview_image_urls || []} onUploadChange={handleGalleryUploadChange} />
        </div>
        <div className="border-t border-white/10 pt-4"><p className="text-sm text-brand-light-muted"><strong>Note:</strong> Font file assets (.zip) cannot be changed from this page. To update the font files, please delete and re-upload the entire product.</p></div>
        <div className="border-t border-white/10 pt-6 flex justify-end">
          <button type="submit" disabled={isPending || isGalleryUploading} className="px-6 py-2 bg-brand-accent text-brand-darkest font-semibold rounded-lg transition-all duration-300 ease-in-out hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">{(isPending || isGalleryUploading) && <Loader2 className="animate-spin" size={18} />}{isPending ? 'Updating...' : isGalleryUploading ? 'Uploading...' : 'Update Font'}</button>
        </div>
      </form>
    </>
  );
};

export default function EditFontPage({ params }: { params: { fontId: string } }) {
    const [font, setFont] = useState<Font | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const supabase = createBrowserClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        const fetchFont = async () => {
            const { data, error } = await supabase.from('fonts').select('*').eq('id', params.fontId).single();
            if (error || !data) {
                toast.error("Could not fetch font data.");
            } else {
                setFont(data);
            }
            setLoading(false);
        };
        fetchFont();
    }, [params.fontId]);

    if (loading) return <div className="text-center p-12">Loading...</div>;
    if (!font) return <div className="text-center p-12">Font not found.</div>;

    return (
        <div className="space-y-6">
            <div>
                <Link href="/admin/products/fonts" className="flex items-center gap-2 text-brand-light-muted hover:text-brand-light transition-colors mb-4">
                    <ArrowLeft size={18} />
                    Back to All Fonts
                </Link>
                <h1 className="text-3xl font-bold text-brand-light">Edit Font</h1>
                <p className="text-brand-light-muted">{`Update the details for "${font.name}".`}</p>
            </div>
            <EditFontForm font={font} />
        </div>
    );
}