'use client';

import { useEffect, useTransition, Fragment, useState, KeyboardEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createPostAction } from '@/app/actions/blogActions';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Listbox } from '@headlessui/react';
import { Check, ChevronDown, X, ArrowLeft, ImageUp, Loader2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/lib/database.types';
import Image from 'next/image';
import imageCompression from 'browser-image-compression'; // <-- Impor library baru

// --- PERUBAHAN UTAMA: Logika kompresi ditambahkan di sini ---
interface BlogImageUploaderProps {
  initialUrl?: string | null;
  onUrlChange: (url: string) => void;
}

const BlogImageUploader = ({ initialUrl, onUrlChange }: BlogImageUploaderProps) => {
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(initialUrl || null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    toast.loading('Compressing & uploading image...');

    try {
        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            fileType: 'image/webp' // Selalu konversi ke WebP
        };

        const compressedFile = await imageCompression(file, options);
        const fileName = `${Date.now()}-${compressedFile.name.split('.')[0]}.webp`;
        
        const { data, error } = await supabase.storage
          .from('blog_images')
          .upload(fileName, compressedFile, { // Unggah file yang sudah dikompresi
            cacheControl: '31536000',
            upsert: false,
            contentType: 'image/webp'
          });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('blog_images')
          .getPublicUrl(data.path);

        setImageUrl(publicUrl);
        onUrlChange(publicUrl);
        toast.dismiss();
        toast.success('Image uploaded successfully!');
    } catch (e) {
        toast.dismiss();
        const message = e instanceof Error ? e.message : 'An unknown error occurred.';
        toast.error(`Upload failed: ${message}`);
    } finally {
        setUploading(false);
    }
  };

  const removeImage = () => {
    setImageUrl(null);
    onUrlChange('');
  }

  return (
    <div className="space-y-4">
        {imageUrl ? (
            <div className="relative w-full max-w-md h-64 rounded-lg overflow-hidden group">
                <Image src={imageUrl} alt="Cover image preview" fill style={{ objectFit: 'cover' }} />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button type="button" onClick={removeImage} className="p-2 bg-red-500 text-white rounded-full">
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>
        ) : (
            <label htmlFor="cover-image-upload" className="relative flex justify-center w-full h-48 px-6 pt-5 pb-6 border-2 border-white/20 border-dashed rounded-md cursor-pointer hover:border-brand-accent transition-colors">
                <div className="space-y-1 text-center">
                    {uploading ? (
                        <Loader2 className="mx-auto h-12 w-12 animate-spin text-brand-light-muted" />
                    ) : (
                        <ImageUp className="mx-auto h-12 w-12 text-brand-light-muted" />
                    )}
                    <div className="flex text-sm text-brand-light-muted">
                        <p className="pl-1">{uploading ? 'Processing...' : 'Click to upload or drag and drop'}</p>
                    </div>
                    <p className="text-xs text-brand-light-muted/70">PNG, JPG, GIF will be converted to WebP</p>
                </div>
                <input id="cover-image-upload" name="cover-image-upload" type="file" className="sr-only" onChange={handleFileChange} disabled={uploading} accept="image/png, image/jpeg, image/gif, image/webp" />
            </label>
        )}
    </div>
  );
}
// --- AKHIR PERUBAHAN ---


const blogCategories = [ "Tutorial", "Inspiration", "Branding", "Business", "Freelancing", "Quotes", "Technology", "Lifestyle", "Finance" ];
const statuses = ["Published", "Draft"];
const tocOptions = ["Show", "Hide"];

const postSchema = z.object({
    title: z.string().min(3, 'Title is required'),
    content: z.string().min(10, 'Content is required'),
    excerpt: z.string().max(300, 'Excerpt must be 300 characters or less').optional(),
    category: z.string().min(1, 'Category is required'),
    tags: z.string().optional(),
    image_url: z.string().url('Cover image is required').min(1, 'Cover image is required'),
    author_name: z.string().min(3, 'Author name is required'),
    status: z.enum(['Published', 'Draft']),
    show_toc: z.enum(['Show', 'Hide']),
});

type PostFormData = z.infer<typeof postSchema>;

const PostForm = () => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [tags, setTags] = useState<string[]>([]);
    const [currentTag, setCurrentTag] = useState('');

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<PostFormData>({
        resolver: zodResolver(postSchema),
        defaultValues: {
            title: '',
            content: '',
            excerpt: '',
            category: '',
            tags: '',
            image_url: '',
            author_name: '',
            status: 'Draft',
            show_toc: 'Show',
        },
    });

    useEffect(() => {
        register('content');
        register('image_url');
        register('category');
        register('tags');
        register('status');
        register('show_toc');
    }, [register]);
    
    useEffect(() => {
        setValue('tags', tags.join(', '));
    }, [tags, setValue]);

    const addTags = (tagString: string) => {
        const newTags = tagString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0 && !tags.includes(tag));
        if (newTags.length > 0) setTags([...tags, ...newTags]);
        setCurrentTag('');
    };

    const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTags(currentTag); }
    };

    const removeTag = (tagToRemove: string) => setTags(tags.filter(tag => tag !== tagToRemove));

    const watchedValues = watch();
    
    const onSubmit = (data: PostFormData) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
             if (value !== null && value !== undefined) {
                formData.append(key, String(value));
            }
        });

        startTransition(async () => {
            const result = await createPostAction(formData);
            if (result.success) {
                toast.success(result.success);
                router.push('/admin/blog');
            } else if (result.error) {
                toast.error(result.error);
            }
        });
    };
    
    const inputStyles = "w-full bg-white/5 border border-transparent rounded-full px-4 py-3 text-brand-light placeholder:text-brand-light-muted transition-colors duration-300 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent hover:border-brand-accent/50";
    const textareaStyles = "w-full bg-white/5 border border-transparent rounded-xl p-3 text-brand-light placeholder:text-brand-light-muted transition-colors duration-300 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent hover:border-brand-accent/50";
    const labelStyles = "block text-sm font-medium text-brand-light-muted mb-2 group-hover:text-brand-accent transition-colors";

    return (
        <>
            <style jsx global>{`
                input:-webkit-autofill,
                textarea:-webkit-autofill {
                  -webkit-box-shadow: 0 0 0 30px #171717 inset !important;
                  -webkit-text-fill-color: #FFFFFF !important;
                  caret-color: #FFFFFF !important;
                }
            `}</style>
        
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-brand-darkest p-8 rounded-lg border border-white/10">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-8">
                        <div className="space-y-2 group">
                            <label htmlFor="title" className={labelStyles}>Title *</label>
                            <input id="title" {...register('title')} className={inputStyles} />
                            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                        </div>
                        <div className="space-y-2 group">
                            <label className={labelStyles}>Content *</label>
                            <RichTextEditor value={watchedValues.content} onChange={(value: string) => setValue('content', value, { shouldValidate: true })} />
                            {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>}
                        </div>
                    </div>

                    <div className="md:col-span-1 space-y-6">
                        <div className="space-y-2 group">
                            <label className={labelStyles}>Cover Image *</label>
                            <BlogImageUploader initialUrl={watchedValues.image_url} onUrlChange={(url: string) => setValue('image_url', url, { shouldValidate: true })} />
                            {errors.image_url && <p className="text-red-500 text-xs mt-1">{errors.image_url.message}</p>}
                        </div>
                        <div className="space-y-2 group">
                            <label htmlFor="author_name" className={labelStyles}>Author Name *</label>
                            <input id="author_name" {...register('author_name')} className={inputStyles} placeholder="e.g., Jane Doe" />
                            {errors.author_name && <p className="text-red-500 text-xs mt-1">{errors.author_name.message}</p>}
                        </div>
                        <div className="space-y-2 group">
                            <label className={labelStyles}>Category *</label>
                            <Listbox value={watchedValues.category} onChange={(value) => setValue('category', value, { shouldValidate: true })}><div className="relative"><Listbox.Button className={`${inputStyles} text-left flex justify-between items-center`}><span className="block truncate">{watchedValues.category || 'Select a category'}</span><ChevronDown size={20} className="text-brand-light-muted" /></Listbox.Button><Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-[#1e1e1e] py-1 shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">{blogCategories.map((cat) => (<Listbox.Option key={cat} value={cat} as={Fragment}>{({ active, selected }) => <li className={`relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? 'bg-brand-accent text-brand-darkest' : 'text-brand-light'}`}>{selected && <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-brand-accent"><Check size={20}/></span>}<span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{cat}</span></li>}</Listbox.Option>))}</Listbox.Options></div></Listbox>
                            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
                        </div>
                        <div className="space-y-2 group">
                            <label htmlFor="tags-input" className={labelStyles}>Tags</label>
                            <input id="tags-input" value={currentTag} onChange={(e) => setCurrentTag(e.target.value)} onKeyDown={handleTagKeyDown} placeholder="Enter tags and press Enter" className={inputStyles} />
                            {tags.length > 0 && (<div className="pt-2 flex flex-wrap gap-2">{tags.map((tag) => (<div key={tag} className="flex items-center gap-2 bg-transparent border border-brand-accent text-brand-accent text-sm font-medium pl-3 pr-2 py-1 rounded-full"><span>{tag}</span><button type="button" onClick={() => removeTag(tag)} className="text-brand-accent/70 hover:text-white"><X size={14} /></button></div>))}</div>)}
                        </div>
                        <div className="space-y-2 group">
                            <label htmlFor="excerpt" className={labelStyles}>Excerpt (Optional)</label>
                            <textarea id="excerpt" {...register('excerpt')} rows={3} placeholder="A short summary of the post" className={textareaStyles} />
                            {errors.excerpt && <p className="text-red-500 text-xs mt-1">{errors.excerpt.message}</p>}
                        </div>
                        <div className="space-y-6 pt-4 border-t border-white/10">
                            <div className="space-y-2 group"><label className={labelStyles}>Settings</label><Listbox value={watchedValues.status} onChange={(value) => setValue('status', value, { shouldValidate: true })}><div className="relative"><Listbox.Button className={`${inputStyles} text-left flex justify-between items-center`}><span className="block truncate">Status: {watchedValues.status}</span><ChevronDown size={20} className="text-brand-light-muted" /></Listbox.Button><Listbox.Options className="absolute z-10 mt-1 w-full overflow-auto rounded-md bg-[#1e1e1e] py-1 shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">{statuses.map((s) => (<Listbox.Option key={s} value={s} as={Fragment}>{({ active, selected }) => <li className={`relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? 'bg-brand-accent text-brand-darkest' : 'text-brand-light'}`}>{selected && <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-brand-accent"><Check size={20}/></span>}<span className="block truncate">{s}</span></li>}</Listbox.Option>))}</Listbox.Options></div></Listbox></div>
                            <div className="space-y-2 group"><Listbox value={watchedValues.show_toc} onChange={(value) => setValue('show_toc', value, { shouldValidate: true })}><div className="relative"><Listbox.Button className={`${inputStyles} text-left flex justify-between items-center`}><span className="block truncate">Table of Contents: {watchedValues.show_toc}</span><ChevronDown size={20} className="text-brand-light-muted" /></Listbox.Button><Listbox.Options className="absolute z-10 mt-1 w-full overflow-auto rounded-md bg-[#1e1e1e] py-1 shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">{tocOptions.map((opt) => (<Listbox.Option key={opt} value={opt} as={Fragment}>{({ active, selected }) => <li className={`relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? 'bg-brand-accent text-brand-darkest' : 'text-brand-light'}`}>{selected && <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-brand-accent"><Check size={20}/></span>}<span className="block truncate">{opt}</span></li>}</Listbox.Option>))}</Listbox.Options></div></Listbox></div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-white/10">
                    <button type="submit" disabled={isPending} className="px-8 py-3 bg-brand-accent text-brand-darkest font-semibold rounded-lg transition-all duration-300 ease-in-out hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed">
                        {isPending ? 'Saving...' : 'Create Post'}
                    </button>
                </div>
            </form>
        </>
    );
}

export default function NewPostPage() {
    return (
        <div className="space-y-6">
            <div>
                <Link href="/admin/blog" className="flex items-center gap-2 text-brand-light-muted hover:text-brand-light transition-colors mb-4">
                    <ArrowLeft size={18} />
                    Back to All Posts
                </Link>
                <h1 className="text-3xl font-bold text-brand-light">Create New Post</h1>
                <p className="text-brand-light-muted">Fill in the details below to create a new blog post.</p>
            </div>
            <PostForm />
        </div>
    );
}