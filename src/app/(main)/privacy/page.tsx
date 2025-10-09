// src/app/privacy/page.tsx
import type { Metadata } from 'next';
import BackToTopButton from "@/components/BackToTopButton";
import SectionHeader from '@/components/SectionHeader';
import PrivacyAccordion from '@/components/privacy/PrivacyAccordion';
import TrustedBySection from "@/components/TrustedBySection";
// --- PERUBAHAN DI SINI: Impor yang dibutuhkan untuk mengambil data ---
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';

export const metadata: Metadata = {
  title: 'Privacy Policy | Timeless Type',
  description: 'Read the Privacy Policy for using the Timeless Type website and its materials.',
};

export const revalidate = 86400; // Revalidate setiap 24 jam

// --- PERUBAHAN DI SINI: Mengubah fungsi menjadi async dan mengambil data ---
export default async function PrivacyPage() {
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
          title="Privacy Policy"
          subtitle="Your privacy is important to us. This policy explains what information we collect and how we use it."
        />
        
        <div className="mt-12">
          <PrivacyAccordion />
        </div>
        
      </main>
      {/* --- PERUBAHAN DI SINI: Memberikan prop 'brands' --- */}
      <TrustedBySection brands={brands || []} />
      <BackToTopButton />
    </div>
  );
}