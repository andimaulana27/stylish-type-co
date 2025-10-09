// src/app/(main)/subscription/page.tsx
import SubscriptionClientPage from '@/components/subscription/SubscriptionClientPage';
import SectionHeader from '@/components/SectionHeader';
import BackToTopButton from '@/components/BackToTopButton';
import SubscriptionComparisonTable from '@/components/subscription/SubscriptionComparisonTable';
import FaqSection from '@/components/subscription/FaqSection';
import TrustedBySection from "@/components/TrustedBySection";
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Metadata } from 'next';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';
// --- Impor Komponen Banner Baru ---
import SubscriptionPromoBanner from '@/components/subscription/SubscriptionPromoBanner';

export const revalidate = 0;

const TestimonialSection = dynamic(() => import('@/components/TestimonialSection'), { ssr: false });

const SectionSkeleton = () => (
    <div className="py-20 bg-brand-dark-secondary">
        <div className="container mx-auto px-6 animate-pulse">
            <div className="h-10 bg-white/5 rounded w-1/3 mx-auto"></div>
            <div className="h-4 bg-white/5 rounded w-1/2 mx-auto mt-4"></div>
        </div>
    </div>
);

export const metadata: Metadata = {
  title: 'Font Subscription Plans | Timeless Type',
  description: 'Access our entire library of 100+ premium fonts with one simple subscription. Unlock creative freedom and unlimited downloads for one affordable price.',
};

async function getSubscriptionPageData() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
    try {
        const res = await fetch(`${baseUrl}/api/subscription-page`, { next: { revalidate: 3600 } });
        if (!res.ok) throw new Error('Failed to fetch subscription page data');
        return res.json();
    } catch (error) {
        console.error("Error fetching subscription page data:", error);
        return { plans: [], planNames: [], comparisonTableData: [] };
    }
}

export default async function SubscriptionPage() {
  const [pageData, brandsRes] = await Promise.all([
    getSubscriptionPageData(),
    (async () => {
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
      return await supabase.from('brands').select('*').order('created_at', { ascending: false });
    })()
  ]);

  const { plans, planNames, comparisonTableData } = pageData;
  const { data: brands } = brandsRes;

  if (!plans || plans.length === 0) {
    return <div className="text-center py-20 text-red-500">Error fetching subscription plans.</div>;
  }
  
  const separatorClasses = "border-b border-white/10";

  return (
    <div className="bg-brand-dark-secondary">
      <main>
        <section className="container mx-auto px-6 pt-24 pb-12">
          <SectionHeader
            align="center"
            title="Creative Freedom Starts Here"
            subtitle="Access our entire library of premium fonts for one simple price, fueling your creative freedom."
          />
          {/* --- BANNER BARU DITAMBAHKAN DI SINI --- */}
          <SubscriptionPromoBanner />
          
          <SubscriptionClientPage plans={plans} />
        </section>

        <section className="container mx-auto px-6 py-16">
            <SectionHeader
                align="center"
                title="Compare All Plans"
                subtitle="A detailed look at the features included in each subscription tier."
            />
            <SubscriptionComparisonTable plans={planNames} features={comparisonTableData} />
        </section>

        <div className={separatorClasses}>
            <Suspense fallback={<SectionSkeleton />}>
                <TestimonialSection />
            </Suspense>
        </div>

        <section className="container mx-auto px-6 py-16">
            <SectionHeader
                align="center"
                title="Frequently Asked Questions"
                subtitle="Have questions? We've got answers. If you can't find what you're looking for, feel free to contact us."
            />
            
            <FaqSection />
            <TrustedBySection brands={brands || []} />
        </section>
      </main>
      <BackToTopButton />
    </div>
  );
};