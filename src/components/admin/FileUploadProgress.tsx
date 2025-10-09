// src/components/admin/FileUploadProgress.tsx
'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { createBrowserClient } from '@supabase/ssr';
import { UploadCloud, CheckCircle2, AlertCircle, X, File as FileIcon, FileArchive } from 'lucide-react';
import { Database } from '@/lib/database.types';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

type FileUploadProgressProps = {
  label: string;
  bucket: string;
  fileTypes: { [key: string]: string[] };
  onUploadComplete: (filePath: string | null, isUploading: boolean) => void;
  isPublic?: boolean;
};

const getFileIcon = (fileType?: string) => {
    if (!fileType) return <FileIcon className="w-8 h-8 text-brand-light-muted" />;
    if (fileType.startsWith('image/')) return <FileIcon className="w-8 h-8 text-brand-light-muted" />;
    if (fileType.includes('zip')) return <FileArchive className="w-8 h-8 text-brand-light-muted" />;
    return <FileIcon className="w-8 h-8 text-brand-light-muted" />;
};

export default function FileUploadProgress({
  label,
  bucket,
  fileTypes,
  onUploadComplete,
  isPublic = true,
}: FileUploadProgressProps) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const uploadFile = useCallback(async (fileToUpload: File) => {
    setStatus('uploading');
    setProgress(0);
    setError(null);
    onUploadComplete(null, true);

    try {
      // Menggunakan path yang lebih terstruktur
      const filePath = `public/fonts/${Date.now()}_${fileToUpload.name}`;
      
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, fileToUpload, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      let finalUrl = data.path;
      if (isPublic) {
        const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
        finalUrl = publicUrlData.publicUrl;
      }
      
      onUploadComplete(finalUrl, false);
      setStatus('success');
      setProgress(100);

    } catch (e: unknown) {
      const err = e as Error;
      console.error('Upload failed:', err);
      setError(`Upload failed: ${err.message}`);
      setStatus('error');
      onUploadComplete(null, false);
    }
  }, [bucket, onUploadComplete, isPublic, supabase.storage]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      uploadFile(selectedFile);
    }
  }, [uploadFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: fileTypes,
    maxFiles: 1,
    multiple: false
  });

  const handleRemove = () => {
    setFile(null);
    setStatus('idle');
    setProgress(0);
    setError(null);
    onUploadComplete(null, false);
  };
  
  // --- PERUBAHAN WARNA DI SINI ---
  const borderColor = isDragActive
    ? 'border-brand-accent' // Diubah dari brand-accent-green
    : status === 'error'
    ? 'border-red-500'
    : 'border-white/20';
    
  return (
    <div>
      <label className="block text-sm font-medium text-brand-light-muted mb-2">{label}</label>
      {status === 'idle' ? (
        // --- PERUBAHAN WARNA HOVER DI SINI ---
        <div {...getRootProps()} className={`w-full p-6 border-2 border-dashed rounded-lg flex items-center justify-center text-center cursor-pointer transition-colors ${borderColor} hover:border-brand-accent`}>
          <input {...getInputProps()} />
          <div className="text-brand-light-muted flex flex-col items-center">
            <UploadCloud className="w-8 h-8 text-brand-light-muted mb-2" />
            <p className="font-semibold text-sm">
              {/* --- PERUBAHAN WARNA TEKS DI SINI --- */}
              <span className="text-brand-accent">Click to upload</span> or drag & drop
            </p>
          </div>
        </div>
      ) : (
        <div className="w-full p-3 border rounded-lg flex items-center gap-3 bg-white/5">
          <div className="flex-shrink-0">{getFileIcon(file?.type)}</div>
          <div className="flex-grow overflow-hidden">
            <p className="text-sm font-medium text-brand-light truncate">{file?.name}</p>
            <div className="w-full bg-brand-darkest rounded-full h-1.5 mt-1">
              <div
                // --- PERUBAHAN WARNA PROGRESS BAR DI SINI ---
                className={`h-1.5 rounded-full transition-all ${status === 'success' ? 'bg-green-500' : status === 'error' ? 'bg-red-500' : 'bg-brand-accent'}`}
                style={{ width: `${status === 'success' ? 100 : progress}%` }}
              ></div>
            </div>
             {status === 'error' && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>
          <div className="flex-shrink-0">
             {/* --- PERUBAHAN WARNA SPINNER DI SINI --- */}
             {status === 'uploading' && <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-brand-accent"></div>}
             {status === 'success' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
             {status === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
          </div>
          <button type="button" onClick={handleRemove} className="flex-shrink-0 text-brand-light-muted hover:text-red-500">
             <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
}