// src/app/faq/page.tsx
import type { Metadata } from 'next';
import BackToTopButton from "@/components/BackToTopButton";
import SectionHeader from '@/components/SectionHeader';
import FaqAccordion from '@/components/faq/FaqAccordion';
import TrustedBySection from "@/components/TrustedBySection";
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';

export const metadata: Metadata = {
  title: 'FAQ | Stylish Type',
  description: 'Find answers to frequently asked questions about our fonts, licensing, and policies.',
};

export const revalidate = 86400;

export default async function FaqPage() {
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
          title="Frequently Asked Questions"
          subtitle="Have questions? We've got answers. If you can't find what you're for, feel free to contact us."
        />
        
        <div className="mt-12">
          <FaqAccordion />
        </div>
        
      </main>
      <TrustedBySection brands={brands || []} />
      <BackToTopButton />
    </div>
  );
}