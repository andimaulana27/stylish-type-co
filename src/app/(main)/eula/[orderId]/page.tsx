// src/app/(main)/eula/[orderId]/page.tsx
import { notFound } from 'next/navigation';
import { getEulaDataAction } from '@/app/actions/orderActions';
import EulaDisplay from '@/components/account/EulaDisplay'; // Komponen baru yang akan kita buat

export const revalidate = 0;

export default async function EulaPage({ params }: { params: { orderId: string } }) {
  const { orderId } = params;
  const { data: eulaData, error } = await getEulaDataAction(orderId);

  if (error || !eulaData) {
    notFound();
  }

  // Layout untuk halaman ini akan dibuat sederhana, tanpa Navbar utama
  return (
    <div className="bg-brand-dark-secondary min-h-screen">
        <EulaDisplay eulaData={eulaData} />
    </div>
  );
}