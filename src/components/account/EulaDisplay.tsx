// src/components/account/EulaDisplay.tsx
'use client';

import { type getEulaDataAction } from '@/app/actions/orderActions';
import Image from 'next/image';
import { Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

type ActionResponse = Awaited<ReturnType<typeof getEulaDataAction>>;
type EulaData = ActionResponse['data'];

interface EulaDisplayProps {
  eulaData: NonNullable<EulaData>;
}

const DetailRow = ({ label, children, noBorder = false }: { label: string; children: React.ReactNode; noBorder?: boolean }) => (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 py-4 md:items-start ${noBorder ? '' : 'border-b border-white/10'}`}>
        <div className="md:col-span-1">
            <p className="font-semibold text-brand-light-muted">{label}</p>
        </div>
        <div className="md:col-span-2">
            {children}
        </div>
    </div>
);

export default function EulaDisplay({ eulaData }: EulaDisplayProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    toast.loading('Generating PDF...');
    
    const { pdf } = await import('@react-pdf/renderer');
    const { EulaPdf } = await import('@/components/eula/EulaPdf');
    
    const blob = await pdf(<EulaPdf data={eulaData} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `EULA-${eulaData.id.substring(0, 6).toUpperCase()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.dismiss();
    toast.success('PDF downloaded!');
    setIsDownloading(false);
  };

  return (
    <div className="bg-brand-darkest text-brand-light max-w-4xl mx-auto my-12 shadow-2xl rounded-lg border border-white/10">
      <div className="p-6 flex justify-between items-center border-b border-white/10">
          <h1 className="text-xl font-bold text-brand-light">EULA Preview</h1>
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="flex items-center gap-2 px-4 py-2 bg-brand-accent text-brand-darkest font-semibold rounded-lg hover:brightness-110 transition-colors disabled:opacity-50"
          >
            {isDownloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            {isDownloading ? 'Generating...' : 'Download PDF'}
          </button>
      </div>

      <div className="p-8 md:p-12 bg-[#1C1C1E]">
        <div className="text-center py-8 border-b border-white/10">
          <Image 
              src="/LOGO BARU ORANGE.png" 
              alt="Timeless Type Logo" 
              width={300}
              height={57}
              className="mx-auto" 
              priority
          />
        </div>

        <div className="text-center py-8 border-b border-white/10">
          <h1 className="text-3xl font-bold tracking-wider text-white uppercase">End User License Agreement</h1>
        </div>

        <div className="text-center py-8  ">
          <p className="text-sm text-brand-light-muted max-w-2xl mx-auto">
            This End User License Agreement, including any supplemental terms (collectively, The “EULA”) is between you (an individual, company, or any other entity) and TimelessType.co and governs the usage of TimelessType.co’s product.
          </p>
        </div>
        
        <div className="py-8 text-sm border-b border-white/10">
          <DetailRow label="License Number">
            <p className="text-white">#{eulaData.id.substring(0, 6).toUpperCase()}</p>
          </DetailRow>
          <DetailRow label="Enactment Date">
            <p className="text-white">{new Date(eulaData.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </DetailRow>
          <DetailRow label="Licensor">
            <div className="text-white space-y-1">
              <p>TimelessType.co</p>
              <p>Jl. Yos Sudarso, Cirebon</p>
              <p>Jawa Barat Indonesia 45111</p>
            </div>
          </DetailRow>
          <DetailRow label="Licensee" noBorder>
              <div className="text-white space-y-1">
                  <p>{eulaData.profiles?.full_name}</p>
                  {eulaData.profiles?.street_address && <p>{eulaData.profiles.street_address}</p>}
                  {eulaData.profiles?.city && <p>{eulaData.profiles.city}</p>}
                  {(eulaData.profiles?.country || eulaData.profiles?.postal_code) && (
                    <p>
                        {eulaData.profiles.country}{eulaData.profiles.country && eulaData.profiles.postal_code ? ', ' : ''}{eulaData.profiles.postal_code}
                    </p>
                  )}
              </div>
          </DetailRow>
        </div>

        {/* --- PERUBAHAN UTAMA DIMULAI DI SINI --- */}
        <div className="pt-4 text-sm">
          {eulaData.eula_items && eulaData.eula_items.map((item, index) => (
            <div key={index} className="py-4 border-b border-white/10 last:border-b-0">
              <div className="pb-4 border-b border-white/10">
                <DetailRow label="Product Name" noBorder>
                    <p className="text-white">{item.productName} - {item.licenseName} License</p>
                </DetailRow>
              </div>
              <div className="pt-4">
                <DetailRow label="Permitted Use" noBorder>
                    <ul className="list-disc pl-5 space-y-1 text-white">
                        {item.permittedUse.map((use, useIndex) => (
                            <li key={useIndex}>{use}</li>
                        ))}
                    </ul>
                </DetailRow>
              </div>
            </div>
          ))}
        </div>
        {/* --- AKHIR PERUBAHAN --- */}
      </div>
    </div>
  );
}