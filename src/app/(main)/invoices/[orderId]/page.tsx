// src/app/(main)/account/invoices/[orderId]/page.tsx
import { notFound } from 'next/navigation';
import { getInvoiceDataAction } from '@/app/actions/orderActions';
import InvoiceDisplay from '@/components/account/InvoiceDisplay';

export const revalidate = 0;

export default async function InvoicePage({ params }: { params: { orderId: string } }) {
  const { orderId } = params;
  const { data: invoiceData, error } = await getInvoiceDataAction(orderId);

  if (error || !invoiceData) {
    notFound();
  }

  // Layout untuk halaman ini akan dibuat sederhana, tanpa Navbar utama
  return (
    <div className="bg-brand-dark-secondary min-h-screen">
        <InvoiceDisplay invoice={invoiceData} />
    </div>
  );
}