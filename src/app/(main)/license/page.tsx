// src/app/(main)/license/page.tsx
import type { Metadata } from 'next';
import { CheckCircle2, XCircle } from 'lucide-react';
import dynamic from 'next/dynamic';

import SectionHeader from '@/components/SectionHeader';
import BackToTopButton from "@/components/BackToTopButton";
import TrustedBySection from "@/components/TrustedBySection";
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';

const TestimonialSection = dynamic(() => import('@/components/TestimonialSection'), { ssr: false });

export const metadata: Metadata = {
  title: 'Licensing | Stylish Type',
  description: 'Find the right font license for your project. Compare our flexible licensing options for personal, commercial, and enterprise use.',
};

export const revalidate = 3600;

export type LicenseDetail = {
  title: string;
  description: string;
  allowed: string[];
  not_allowed: string[];
};

// ... (Sisa komponen LicenseCard, LicenseCardGrid, LicenseComparisonTable tetap sama) ...

async function getLicensePageData() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    try {
        const res = await fetch(`${baseUrl}/api/license-page`, { next: { revalidate: 3600 } });
        if (!res.ok) throw new Error('Failed to fetch license page data');
        return res.json();
    } catch (error) {
        console.error("Error fetching license page data:", error);
        return { licenseDetailsData: [] };
    }
}

export default async function LicensePage() {
  const { licenseDetailsData } = await getLicensePageData();

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

  if (!licenseDetailsData || licenseDetailsData.length === 0) {
    return <div className="text-center py-20 text-red-500">Error fetching licenses.</div>;
  }
  
  // ... (Sisa logika dan JSX tetap sama) ...
  
  return (
    <div className="bg-brand-dark-secondary">
      <main>
        {/* ... */}
        <TrustedBySection brands={brands || []} />
        <BackToTopButton />
      </main>
    </div>
  );
}