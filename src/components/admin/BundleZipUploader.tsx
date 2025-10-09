// src/components/admin/BundleZipUploader.tsx
'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { createBrowserClient } from '@supabase/ssr';
import JSZip from 'jszip';
import { UploadCloud, CheckCircle2, AlertCircle, X, FileArchive } from 'lucide-react';
import { Database } from '@/lib/database.types';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';
type BundleFontPreview = { name: string; style: string; url: string; };

type BundleZipUploaderProps = {
  label: string;
  onUploadComplete: (
    result: {
      downloadableFileUrl: string;
      bundleFontPreviews: BundleFontPreview[];
    } | null,
    isUploading: boolean
  ) => void;
  onFileSelect: (file: File | null) => void;
};

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

export default function BundleZipUploader({ label, onUploadComplete, onFileSelect }: BundleZipUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const uploadFileAndContents = useCallback(async (zipFile: File) => {
    setStatus('uploading');
    setProgress(0);
    setError(null);
    onUploadComplete(null, true);

    const timestamp = Date.now();
    const slug = zipFile.name.replace(/\.[^/.]+$/, "").toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');

    try {
      const zip = new JSZip();
      const contents = await zip.loadAsync(zipFile);

      const fontEntries = Object.values(contents.files).filter(entry =>
        !entry.dir && /\.otf$/i.test(entry.name)
      );

      if (fontEntries.length === 0) {
        throw new Error('No .otf files found in the ZIP. Previews require .otf format.');
      }

      const totalUploads = fontEntries.length + 1;
      let completedUploads = 0;

      const mainZipPromise = (async () => {
        const filePath = `protected/bundles/${slug}-${timestamp}.zip`;
        const { data, error } = await supabase.storage
            .from('products')
            .upload(filePath, zipFile, {
                // --- PERUBAIKAN CACHE 1: Untuk file ZIP utama ---
                cacheControl: '31536000', // 1 tahun
                // --- AKHIR PERUBAIKAN ---
            });
        if (error) throw new Error(`Failed to upload main ZIP: ${error.message}`);
        completedUploads++;
        setProgress(Math.round((completedUploads / totalUploads) * 100));
        return data.path;
      })();

      const previewPromises = fontEntries.map(async (entry) => {
        const fontBuffer = await entry.async('arraybuffer');
        const fileName = entry.name.split('/').pop() || entry.name;
        const previewPath = `${slug}/previews/${fileName}`;

        const { error } = await supabase.storage
            .from('font-previews')
            .upload(previewPath, fontBuffer, { 
                upsert: true,
                // --- PERUBAIKAN CACHE 2: Untuk file preview font ---
                cacheControl: '31536000', // 1 tahun
                // --- AKHIR PERUBAIKAN ---
            });
        if (error) throw new Error(`Failed to upload preview for ${fileName}: ${error.message}`);

        const { data: { publicUrl } } = supabase.storage.from('font-previews').getPublicUrl(previewPath);
        completedUploads++;
        setProgress(Math.round((completedUploads / totalUploads) * 100));

        return { name: fileName, style: getFontStyle(fileName), url: publicUrl };
      });

      const [downloadableFilePath, bundleFontPreviews] = await Promise.all([mainZipPromise, Promise.all(previewPromises)]);

      setStatus('success');
      onUploadComplete({ downloadableFileUrl: downloadableFilePath, bundleFontPreviews }, false);

    } catch (e: unknown) {
      const err = e as Error;
      console.error('Upload failed:', err);
      setError(`Upload failed: ${err.message}`);
      setStatus('error');
      onUploadComplete(null, false);
    }
  }, [supabase, onUploadComplete]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      onFileSelect(selectedFile);
      uploadFileAndContents(selectedFile);
    }
  }, [uploadFileAndContents, onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/zip': ['.zip'] },
    maxFiles: 1,
    multiple: false
  });

  const handleRemove = () => {
    setFile(null);
    setStatus('idle');
    setProgress(0);
    setError(null);
    onUploadComplete(null, false);
    onFileSelect(null);
  };

  const borderColor = isDragActive ? 'border-brand-accent' : status === 'error' ? 'border-red-500' : 'border-white/20';

  return (
    <div>
      <label className="block text-sm font-medium text-brand-light-muted mb-2">{label}</label>
      {status === 'idle' ? (
        <div {...getRootProps()} className={`w-full p-6 border-2 border-dashed rounded-lg flex items-center justify-center text-center cursor-pointer transition-colors ${borderColor} hover:border-brand-accent`}>
          <input {...getInputProps()} />
          <div className="text-brand-light-muted flex flex-col items-center">
            <UploadCloud className="w-8 h-8 text-brand-light-muted mb-2" />
            <p className="font-semibold text-sm">
              <span className="text-brand-accent">Click to upload</span> or drag & drop a .zip file
            </p>
          </div>
        </div>
      ) : (
        <div className={`w-full p-3 border rounded-lg flex items-center gap-3 bg-white/5 ${borderColor}`}>
          <div className="flex-shrink-0"><FileArchive className="w-8 h-8 text-brand-light-muted" /></div>
          <div className="flex-grow overflow-hidden">
            <p className="text-sm font-medium text-brand-light truncate">{file?.name}</p>
            <div className="w-full bg-brand-darkest rounded-full h-1.5 mt-1">
              <div
                className={`h-1.5 rounded-full transition-all ${status === 'success' ? 'bg-green-500' : status === 'error' ? 'bg-red-500' : 'bg-brand-accent animate-pulse'}`}
                style={{ width: `${status === 'success' ? 100 : progress}%` }}
              ></div>
            </div>
             {status === 'error' && <p className="text-xs text-red-500 mt-1 truncate">{error}</p>}
          </div>
          <div className="flex-shrink-0">
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