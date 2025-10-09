// src/components/font-detail/FileInfo.tsx
import { FileText, HardDrive, Calendar } from 'lucide-react';

type FileInfoProps = {
  fileTypes: string;
  fileSize: string;
  releaseDate: string;
};

export default function FileInfo({ fileTypes, fileSize, releaseDate }: FileInfoProps) {
  return (
    <div className="py-6 border-t border-b border-white/10">
      {/* --- PERUBAHAN UTAMA DI SINI --- */}
      {/* Mobile: grid-cols-1 (1 kolom, menumpuk) dengan gap-6 */}
      {/* Desktop (md): kembali ke grid-cols-3 (3 kolom) dengan gap-4 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-4">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-brand-accent flex-shrink-0" />
          <div>
            <p className="text-sm text-brand-light-muted">File Type</p>
            <p className="font-medium text-brand-light text-lg">{fileTypes}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <HardDrive className="w-6 h-6 text-brand-accent flex-shrink-0" />
          <div>
            <p className="text-sm text-brand-light-muted">File Size</p>
            <p className="font-medium text-brand-light text-lg">{fileSize}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-brand-accent flex-shrink-0" />
          <div>
            <p className="text-sm text-brand-light-muted">Release Date</p>
            <p className="font-medium text-brand-light text-lg">{releaseDate}</p>
          </div>
        </div>
      </div>
    </div>
  );
}