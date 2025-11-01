// src/components/admin/FontZipUploader.tsx
'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { createBrowserClient } from '@supabase/ssr';
import { Loader2, FileCheck2, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';
import { Database } from '@/lib/database.types';

interface FontZipUploaderProps {
  label: string;
  onUploadComplete: (result: { downloadableFileUrl: string } | null, isUploading: boolean) => void;
  onFileSelect: (file: File | null) => void;
}

export default function FontZipUploader({ label, onUploadComplete, onFileSelect }: FontZipUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setFileName(file.name);
    setIsUploading(true);
    setUploadProgress(0);
    onUploadComplete(null, true);
    onFileSelect(file); // Kirim file ke parent untuk di-scan (tanpa mengunggah)

    const timestamp = Date.now();
    const slug = file.name.replace(/\.zip$/i, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const filePath = `protected/fonts/${slug}-${timestamp}.zip`;

    try {
      const { error } = await supabase.storage
        .from('products')
        .upload(filePath, file, {
          cacheControl: '31536000',
          upsert: false,
        });

      if (error) throw error;
      
      onUploadComplete({ downloadableFileUrl: filePath }, false);
      toast.success('Font ZIP uploaded successfully!');

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Upload failed.';
      toast.error(message);
      onUploadComplete(null, false);
      onFileSelect(null);
      setFileName(null);
    } finally {
      setIsUploading(false);
    }
  }, [supabase.storage, onUploadComplete, onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/zip': ['.zip'] },
    multiple: false,
  });

  const labelStyles = "block text-sm font-medium text-brand-light-muted mb-2 group-hover:text-brand-accent transition-colors";

  return (
    <div className="space-y-2 group">
      <label className={labelStyles}>{label}</label>
      <div
        {...getRootProps()}
        className={`relative flex justify-center w-full px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer transition-colors
          ${isDragActive ? 'border-brand-accent bg-brand-accent/10' : 'border-white/20 hover:border-brand-accent'}`}
      >
        <input {...getInputProps()} />
        <div className="space-y-1 text-center">
          {isUploading ? (
            <Loader2 className="mx-auto h-12 w-12 text-brand-light-muted animate-spin" />
          ) : fileName ? (
            <FileCheck2 className="mx-auto h-12 w-12 text-green-400" />
          ) : (
            <UploadCloud className="mx-auto h-12 w-12 text-brand-light-muted" />
          )}
          <div className="flex text-sm text-brand-light-muted">
            <p className="pl-1">
              {isUploading
                ? 'Uploading...'
                : fileName
                ? `File "${fileName}" selected and uploaded.`
                : 'Drag & drop ZIP file here, or click to select'}
            </p>
          </div>
          <p className="text-xs text-brand-light-muted/70">
            File will be uploaded immediately upon selection.
          </p>
        </div>
      </div>
    </div>
  );
}