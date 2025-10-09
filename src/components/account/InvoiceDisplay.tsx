// src/components/account/InvoiceDisplay.tsx
'use client';

import { type getInvoiceDataAction } from '@/app/actions/orderActions';
import { Download, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import toast from 'react-hot-toast';

type ActionResponse = Awaited<ReturnType<typeof getInvoiceDataAction>>;
type InvoiceData = ActionResponse['data'];

interface InvoiceDisplayProps {
  invoice: NonNullable<InvoiceData>;
}

export default function InvoiceDisplay({ invoice }: InvoiceDisplayProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    toast.loading('Generating PDF...');
    
    const { pdf } = await import('@react-pdf/renderer');
    const { InvoicePdf } = await import('@/components/invoice/InvoicePdf');
    
    const blob = await pdf(<InvoicePdf data={invoice} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${invoice.id.substring(0, 8)}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.dismiss();
    toast.success('PDF downloaded!');
    setIsDownloading(false);
  };
  
  const splitFeatures = (features: string[]) => {
      const mid = Math.ceil(features.length / 2);
      const firstCol = features.slice(0, mid);
      const secondCol = features.slice(mid);
      return { firstCol, secondCol };
  };

  return (
    <div className="bg-brand-darkest text-brand-light max-w-4xl mx-auto my-12 shadow-2xl rounded-lg border border-white/10">
      <div className="p-6 flex justify-between items-center border-b border-white/10">
          <h1 className="text-2xl font-bold text-brand-light">Invoice Preview</h1>
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="flex items-center gap-2 px-4 py-2 bg-brand-accent text-brand-darkest font-semibold rounded-lg hover:brightness-110 transition-colors disabled:opacity-50"
          >
            {isDownloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            {isDownloading ? 'Generating...' : 'Download PDF'}
          </button>
      </div>

      <div className="p-8 md:p-12 bg-[#1C1C1E] text-white relative">
        <div className="relative z-10">
            <div className="flex justify-between items-start pb-8 mb-8 border-b border-white/10">
              <div>
                {/* --- PEMBARUAN PATH LOGO DI SINI --- */}
                <Image src="/LOGO BARU ORANGE.png" alt="Company Logo" width={200} height={50} />
                <p className="text-xs text-gray-400 mt-2">TIMELESS TYPOGRAPHY FOR TIMELESS COMPANY.</p>
              </div>
              <div className="text-right text-sm text-gray-300">
                <p className="font-bold text-white">TimelessType.co</p>
                <p>Jl. Yos Sudarso, Cirebon</p>
                <p>Jawa Barat Indonesia 45111</p>
              </div>
            </div>

            <div className="flex justify-between items-start mb-10">
                <div>
                    <p className="text-xs text-gray-400 mb-1 font-bold">INVOICE TO:</p>
                    <p className="text-lg font-bold">{invoice.profiles?.full_name}</p>
                    <p className="text-gray-300">{invoice.profiles?.street_address}</p>
                    <p className="text-gray-300">{`${invoice.profiles?.city || ''}, ${invoice.profiles?.postal_code || ''}`.trim()}</p>
                    <p className="text-gray-300">{invoice.profiles?.country}</p>
                    <p className="text-gray-300">{invoice.profiles?.email}</p>
                </div>
                <div className="text-right text-gray-300">
                    <p className="font-bold">{new Date(invoice.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </div>
            
            <h2 className="text-4xl font-bold mb-8">INVOICE #{invoice.id.substring(0, 8).toUpperCase()}</h2>
            
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-white">
                  <th className="p-3 pb-2 font-bold text-sm">Item</th>
                  <th className="p-3 pb-2 font-bold text-sm text-right">Quantity</th>
                  <th className="p-3 pb-2 font-bold text-sm text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {(invoice.order_items || []).map((item, index) => {
                  const licenseFeatures = (item.licenses && 'allowed' in item.licenses && Array.isArray(item.licenses.allowed))
                    ? item.licenses.allowed
                    : [];
                  const { firstCol, secondCol } = splitFeatures(licenseFeatures);
                  return (
                    <tr key={index} className="border-b border-white/10">
                      <td className="p-3 align-top">
                        <p className="font-bold text-base">{(item.fonts?.name || item.bundles?.name)}</p>
                        <p className="text-sm text-gray-300">{item.licenses?.name} License</p>
                        <div className="flex flex-row mt-2 text-xs text-gray-400 gap-x-6">
                            <ul className="list-disc pl-5">
                                {firstCol.map((feature, i) => <li key={`f1-${i}`}>{feature}</li>)}
                            </ul>
                             <ul className="list-disc pl-5">
                                {secondCol.map((feature, i) => <li key={`f2-${i}`}>{feature}</li>)}
                            </ul>
                        </div>
                      </td>
                      <td className="p-3 text-right align-top">1</td>
                      <td className="p-3 text-right align-top">${item.price.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            <div className="flex justify-end mt-8">
              <div className="w-full max-w-xs text-right space-y-2">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span>${invoice.total_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-white border-t-2 border-white pt-2">
                  <span>TOTAL</span>
                  <span className="text-brand-accent">${invoice.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}