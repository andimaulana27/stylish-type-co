// src/app/terms/page.tsx
import type { Metadata } from 'next';
import BackToTopButton from "@/components/BackToTopButton";
import SectionHeader from '@/components/SectionHeader';
import TermsAccordion from '@/components/terms/TermsAccordion';
import TrustedBySection from "@/components/TrustedBySection";
// --- PERUBAHAN DI SINI: Impor yang dibutuhkan untuk mengambil data ---
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';

export const metadata: Metadata = {
  title: 'Terms of Service | Timeless Type',
  description: 'Read the Terms of Service for using the Timeless Type website and its materials.',
};

export const revalidate = 86400; // Revalidate setiap 24 jam (sebelumnya 1 jam)

// --- PERUBAHAN DI SINI: Mengubah fungsi menjadi async dan mengambil data ---
export default async function TermsPage() {
  const cookieStore = cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
      },
    }
  );

  const { data: brands } = await supabase
    .from('brands')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="bg-brand-dark-secondary">
      <main className="container mx-auto px-6 py-24">
        <SectionHeader
          align="center"
          title="Terms of Service"
          subtitle="Please read these terms of service carefully before using Our Website."
        />
        
        <div className="mt-12">
          <TermsAccordion />
        </div>
        
      </main>
      {/* --- PERUBAHAN DI SINI: Memberikan prop 'brands' --- */}
      <TrustedBySection brands={brands || []} />
      <BackToTopButton />
    </div>
  );
}