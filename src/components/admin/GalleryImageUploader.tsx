// src/components/admin/GalleryImageUploader.tsx
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone, FileWithPath } from 'react-dropzone';
import { createBrowserClient } from '@supabase/ssr';
import Image from 'next/image';
import { UploadCloud, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import imageCompression from 'browser-image-compression';
import { Database } from '@/lib/database.types';

const MAX_FILES = 20;
const MIN_FILES = 15;

type UploadStatus = 'empty' | 'uploading' | 'success' | 'error';

interface ImageSlot {
  id: number;
  file?: File;
  previewUrl?: string;
  finalUrl?: string | null;
  progress: number;
  status: UploadStatus;
  error?: string;
}

interface GalleryImageUploaderProps {
  initialUrls?: string[];
  onUploadChange: (urls: string[], isUploading: boolean) => void;
}

export default function GalleryImageUploader({ onUploadChange, initialUrls = [] }: GalleryImageUploaderProps) {
  const [imageSlots, setImageSlots] = useState<ImageSlot[]>(() => {
    const initialFilledSlots = initialUrls.map((url, index) => ({
      id: index,
      finalUrl: url,
      previewUrl: url,
      status: 'success' as UploadStatus,
      progress: 100,
    }));
    const emptySlots = Array.from({ length: MAX_FILES - initialFilledSlots.length }, (_, i) => ({
      id: initialFilledSlots.length + i,
      progress: 0,
      status: 'empty' as UploadStatus,
    }));
    return [...initialFilledSlots, ...emptySlots];
  });
  
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const finalUrls = imageSlots.map(slot => slot.finalUrl).filter((url): url is string => !!url);
    const isUploading = imageSlots.some(slot => slot.status === 'uploading');
    onUploadChange(finalUrls, isUploading);
  }, [imageSlots, onUploadChange]);

  const uploadFile = useCallback(async (file: File, slotId: number) => {
    setImageSlots(prev => prev.map(slot =>
      slot.id === slotId ? { ...slot, file, previewUrl: URL.createObjectURL(file), status: 'uploading', progress: 0 } : slot
    ));

    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/webp'
      };
      
      const compressedFile = await imageCompression(file, options);
      const filePath = `public/fonts/previews/${Date.now()}_${compressedFile.name.split('.')[0]}.webp`;
      
      const { data, error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, compressedFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'image/webp'
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('products').getPublicUrl(data.path);

      setImageSlots(prev => prev.map(slot => 
        slot.id === slotId ? { ...slot, finalUrl: publicUrlData.publicUrl, status: 'success', progress: 100 } : slot
      ));
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'An unknown error occurred.';
      toast.error(`Upload failed for ${file.name}`);
      setImageSlots(prev => prev.map(slot => 
        slot.id === slotId ? { ...slot, status: 'error', error: message } : slot
      ));
    }
  // --- PERBAIKAN DI SINI: 'onUploadChange' dihapus dari dependency array ---
  }, [supabase.storage]);

  const onDrop = useCallback((acceptedFiles: FileWithPath[]) => {
    const emptySlots = imageSlots.filter(slot => slot.status === 'empty');
    const filesToUpload = acceptedFiles.slice(0, emptySlots.length);

    if (filesToUpload.length === 0 && acceptedFiles.length > 0) {
      toast.error(`You can only upload a maximum of ${MAX_FILES} images.`);
      return;
    }

    filesToUpload.forEach((file, index) => {
      const targetSlot = emptySlots[index];
      if (targetSlot) {
        uploadFile(file, targetSlot.id);
      }
    });
  }, [imageSlots, uploadFile]);

  const removeImage = (slotId: number) => {
    const slotToRemove = imageSlots.find(s => s.id === slotId);

    if (slotToRemove?.finalUrl) {
      const filePath = new URL(slotToRemove.finalUrl).pathname.split('/products/')[1];
      if (filePath) {
        supabase.storage.from('products').remove([`public/${filePath}`]);
      }
    }
    
    if (slotToRemove?.previewUrl && slotToRemove.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(slotToRemove.previewUrl);
    }

    setImageSlots(prev => {
        const newSlots = prev.map(slot => slot.id === slotId ? { id: slotId, progress: 0, status: 'empty' as UploadStatus } : slot);
        return newSlots.sort((a, b) => (a.status === 'empty' ? 1 : -1) - (b.status === 'empty' ? 1 : -1));
    });
  }

  const hasEmptySlots = imageSlots.some(s => s.status === 'empty');
  
  const { getRootProps, getInputProps, isDragActive, open: openFileDialog } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.webp'] },
    noClick: true,
    noKeyboard: true
  });
  
  return (
    <div>
        <label className="block text-sm font-medium text-brand-light-muted mb-2">Gallery Images (Min {MIN_FILES}, Max {MAX_FILES})</label>
        <div {...getRootProps()} className={`grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-10 gap-3 p-3 border rounded-lg ${isDragActive ? 'border-brand-accent bg-white/5' : 'border-white/20'}`}>
            <input {...getInputProps()} id="gallery-dropzone-input" />
            {imageSlots.map(slot => (
                <Slot 
                    key={slot.id}
                    slot={slot}
                    onRemove={removeImage}
                    onSlotClick={slot.status === 'empty' && hasEmptySlots ? openFileDialog : undefined}
                />
            ))}
        </div>
    </div>
  );
};

const Slot = ({ slot, onRemove, onSlotClick }: { slot: ImageSlot, onRemove: (id: number) => void, onSlotClick?: () => void }) => {
    if (slot.status === 'empty') {
      return (
        <div 
          onClick={onSlotClick}
          className="aspect-square bg-brand-darkest rounded-md flex items-center justify-center border-2 border-dashed border-white/20 hover:border-brand-accent cursor-pointer transition-colors"
        >
          <UploadCloud className="w-6 h-6 text-brand-light-muted" />
        </div>
      );
    }
    
    return (
        <div className="aspect-square relative group rounded-md overflow-hidden border border-white/10">
            {slot.previewUrl && 
                <Image src={slot.previewUrl} alt={`Preview ${slot.id}`} fill sizes="20vw" className="object-cover"/>
            }
            
            {(slot.status === 'uploading' || slot.status === 'error') && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-2">
                    <div className="w-full bg-gray-500 rounded-full h-1">
                        <div className={`h-1 rounded-full ${slot.status === 'error' ? 'bg-red-500' : 'bg-brand-accent'}`} style={{width: `${slot.progress}%`}}></div>
                    </div>
                    {slot.status === 'error' && <AlertCircle className="w-6 h-6 text-red-500 mt-2"/>}
                </div>
            )}

            {slot.status !== 'uploading' && (
                <>
                    {slot.status === 'success' && <CheckCircle2 className="absolute top-1 right-1 w-5 h-5 text-brand-darkest bg-green-500 rounded-full p-0.5" />}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <button type='button' onClick={() => onRemove(slot.id)} className="p-2 bg-red-600/80 text-white rounded-full">
                            <Trash2 size={16} />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}