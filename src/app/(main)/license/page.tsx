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

const LicenseCard = ({ license }: { license: LicenseDetail }) => {
  return (
    <div className="bg-brand-darkest border border-brand-accent/50 rounded-lg p-5 h-full flex flex-col relative overflow-hidden group transition-all duration-300 hover:border-brand-primary-blue/50 hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-t from-brand-primary-blue/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0"></div>
      <div className="absolute inset-0 shadow-lg shadow-brand-primary-blue/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0"></div>
      <div className="relative z-10 flex flex-col h-full">
        <div>
          <h2 className="text-xl font-semibold text-brand-accent mb-2">{license.title}</h2>
          <p className="text-sm text-brand-light-muted">{license.description}</p>
        </div>
        <div className="flex-grow border-t border-white/10 pt-4 mt-4">
          <h3 className="font-semibold text-brand-light mb-3 text-base">Allowed:</h3>
          <ul className="space-y-2 text-sm">
            {license.allowed.map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-secondary-green flex-shrink-0 mt-0.5" />
                <span className="text-brand-light-muted leading-tight">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="border-t border-white/10 mt-4 pt-4">
          <h3 className="font-semibold text-brand-light mb-3 text-base">Not Allowed:</h3>
          <ul className="space-y-2 text-sm">
            {license.not_allowed.map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-brand-secondary-red/80 flex-shrink-0 mt-0.5" />
                <span className="text-brand-light-muted leading-tight">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

const LicenseCardGrid = ({ licenses }: { licenses: LicenseDetail[] }) => {
  return (
    <section className="container mx-auto px-6 py-20">
      <SectionHeader
        title="Detailed Font License Usage"
        subtitle="A full checklist for each license to help you choose with confidence."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {licenses.map((license) => (
          <LicenseCard key={license.title} license={license} />
        ))}
      </div>
    </section>
  );
};

export type LicenseFeature = {
  feature: string;
  [key: string]: string;
};

const LicenseComparisonTable = ({ licenses, features }: {
  licenses: string[];
  features: LicenseFeature[];
}) => {
  const renderCellContent = (content: string) => {
    if (content.toLowerCase() === 'x') {
      return <XCircle className="w-5 h-5 text-brand-secondary-red/80" />;
    }
    if (content === '-') {
      return <span className="font-light text-brand-light-muted">{content}</span>;
    }
    return (
      <span className="flex items-center justify-start gap-2 text-brand-secondary-green font-normal">
        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
        <span>{content}</span>
      </span>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full w-full border-collapse text-xs text-left">
        <thead>
          <tr>
            <th className="p-3 font-semibold text-brand-light sticky left-0 bg-gradient-to-t from-brand-accent/20 to-transparent whitespace-nowrap">
              Usage
            </th>
            {licenses.map(licenseName => (
              <th key={licenseName} className="p-3 font-semibold text-brand-light whitespace-nowrap text-left bg-gradient-to-t from-brand-accent/20 to-transparent">
                {licenseName}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-brand-light-muted">
          {features.map((featureItem) => (
            <tr key={featureItem.feature} className="border-t border-white/10">
              <td className="p-3 font-medium text-brand-light sticky left-0 bg-brand-dark-secondary whitespace-nowrap">
                {featureItem.feature}
              </td>
              {licenses.map(licenseName => (
                <td key={`${featureItem.feature}-${licenseName}`} className="p-3 whitespace-nowrap text-left align-top">
                  {renderCellContent(featureItem[licenseName] || '-')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

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
  
  const allLicenseNames: string[] = [ 'Standard', 'Webfont', 'App/Game', 'E-Pub', 'Social Media', 'Productions', 'POD and Template', 'Server', 'Broadcast', 'Advertising', 'Trademark', 'Studio', 'Extended', 'Corporate', 'Exclusive'];
  const allFeatures: LicenseFeature[] = [
    { feature: 'License Duration', Standard: 'Lifetime', Webfont: 'Lifetime', 'App/Game': 'Lifetime', 'E-Pub': 'Lifetime', 'Social Media': 'Lifetime', Productions: 'Lifetime', 'POD and Template': 'Lifetime', Server: 'Lifetime', Broadcast: 'Lifetime', Advertising: 'Lifetime', Trademark: 'Lifetime', Studio: 'Lifetime', Extended: 'Lifetime', Corporate: 'Lifetime', Exclusive: 'Lifetime' },
    { feature: 'User/Device', Standard: '1-2', Webfont: '1-2', 'App/Game': '1-2', 'E-Pub': '1-2', 'Social Media': '1-5', Productions: '1-5', 'POD and Template': '1-5', Server: '1-5', Broadcast: '1-5', Advertising: '1-5', Trademark: '1-5', Studio: '1-20', Extended: '1-50', Corporate: 'Unlimited', Exclusive: 'Unlimited' },
    { feature: 'Design Project', Standard: '5 Projects', Webfont: '5 Projects', 'App/Game': '5 Projects', 'E-Pub': '5 Projects', 'Social Media': 'Unlimited', Productions: 'Unlimited', 'POD and Template': 'Unlimited', Server: 'Unlimited', Broadcast: 'Unlimited', Advertising: 'Unlimited', Trademark: 'Unlimited', Studio: 'Unlimited', Extended: 'Unlimited', Corporate: 'Unlimited', Exclusive: 'Unlimited' },
    { feature: 'Sales/Prints/Pcs', Standard: '1,000', Webfont: 'X', 'App/Game': 'X', 'E-Pub': 'X', 'Social Media': '1,000', Productions: 'Unlimited', 'POD and Template': 'Unlimited', Server: 'Unlimited', Broadcast: 'Unlimited', Advertising: 'Unlimited', Trademark: 'Unlimited', Studio: 'Unlimited', Extended: 'Unlimited', Corporate: 'Unlimited', Exclusive: 'Unlimited' },
    { feature: 'Website (Live Text)', Standard: 'X', Webfont: '1 Website', 'App/Game': '1 Website', 'E-Pub': '1 Website', 'Social Media': 'X', Productions: 'X', 'POD and Template': 'X', Server: '1 Website', Broadcast: '1 Website', Advertising: '1 Website', Trademark: 'X', Studio: '5 Websites', Extended: '5 Websites', Corporate: 'Unlimited', Exclusive: 'Unlimited' },
    { feature: 'Page Views Per Month', Standard: 'X', Webfont: '10,000 PV/M', 'App/Game': '100,000 PV/M', 'E-Pub': '100,000 PV/M', 'Social Media': '100,000 PV/M', Productions: '100,000 PV/M', 'POD and Template': '100,000 PV/M', Server: 'Unlimited PV/M', Broadcast: 'Unlimited PV/M', Advertising: 'Unlimited PV/M', Trademark: 'Unlimited PV/M', Studio: '1 App/Game', Extended: '5 Apps/Games', Corporate: 'Unlimited PV/M', Exclusive: 'Unlimited PV/M' },
    { feature: 'App/Game (Embed)', Standard: 'X', Webfont: 'X', 'App/Game': '1 App/Game', 'E-Pub': 'X', 'Social Media': 'X', Productions: 'X', 'POD and Template': 'X', Server: 'X', Broadcast: 'X', Advertising: 'X', Trademark: 'X', Studio: '1 App/Game', Extended: '2 Apps/Games', Corporate: '5 Apps/Games', Exclusive: 'Unlimited' },
    { feature: 'E-Book / PDF Digital', Standard: 'X', Webfont: 'X', 'App/Game': 'X', 'E-Pub': '5 Projects', 'Social Media': 'X', Productions: 'X', 'POD and Template': 'X', Server: 'X', Broadcast: 'X', Advertising: 'X', Trademark: 'X', Studio: '10 Projects', Extended: 'Unlimited', Corporate: 'Unlimited', Exclusive: 'Unlimited' },
    { feature: 'Social Media Content', Standard: '10 Contents/Posts', Webfont: 'X', 'App/Game': 'X', 'E-Pub': 'X', 'Social Media': 'Unlimited', Productions: 'Unlimited', 'POD and Template': 'Unlimited', Server: 'Unlimited', Broadcast: 'Unlimited', Advertising: 'Unlimited', Trademark: 'Unlimited', Studio: 'Unlimited', Extended: 'Unlimited', Corporate: 'Unlimited', Exclusive: 'Unlimited' },
    { feature: 'Merchandise / Physical Products', Standard: '1,000 Pcs', Webfont: 'X', 'App/Game': 'X', 'E-Pub': 'X', 'Social Media': 'X', Productions: 'Unlimited', 'POD and Template': 'Unlimited', Server: 'X', Broadcast: 'X', Advertising: 'Unlimited', Trademark: 'X', Studio: '100,000 Pcs/Product', Extended: '100,000 Pcs/Product', Corporate: 'Unlimited', Exclusive: 'Unlimited' },
    { feature: 'POD and Template Design', Standard: '1,000 Sales/Prints/Pcs', Webfont: 'X', 'App/Game': 'X', 'E-Pub': 'X', 'Social Media': 'X', Productions: 'X', 'POD and Template': 'Unlimited', Server: 'X', Broadcast: 'X', Advertising: 'Unlimited', Trademark: 'X', Studio: 'Unlimited', Extended: 'Unlimited', Corporate: 'Unlimited', Exclusive: 'Unlimited' },
    { feature: 'Platform SaaS (User Generated)', Standard: 'X', Webfont: 'X', 'App/Game': 'X', 'E-Pub': 'X', 'Social Media': 'X', Productions: 'X', 'POD and Template': 'X', Server: '1 Server/Website', Broadcast: 'X', Advertising: 'X', Trademark: 'X', Studio: '1 Server/Website', Extended: '2 Servers/Websites', Corporate: '2 Servers/Websites', Exclusive: 'Unlimited' },
    { feature: 'Video/Film/TV Commercials', Standard: 'X', Webfont: 'X', 'App/Game': 'X', 'E-Pub': 'X', 'Social Media': 'X', Productions: '20 Projects', 'POD and Template': 'X', Server: 'X', Broadcast: '100 Projects', Advertising: '50 Projects', Trademark: '100 Projects', Studio: '300 Projects', Extended: 'Unlimited', Corporate: 'Unlimited', Exclusive: 'Unlimited' },
    { feature: 'Digital Advertising (Ads, DOOH, Display)', Standard: 'X', Webfont: 'X', 'App/Game': 'X', 'E-Pub': 'X', 'Social Media': 'X', Productions: 'X', 'POD and Template': 'X', Server: 'X', Broadcast: 'Unlimited', Advertising: 'Unlimited', Trademark: 'X', Studio: 'Unlimited', Extended: 'Unlimited', Corporate: 'Unlimited', Exclusive: 'Unlimited' },
    { feature: 'Physical Advertising', Standard: 'X', Webfont: 'X', 'App/Game': 'X', 'E-Pub': 'X', 'Social Media': 'X', Productions: 'X', 'POD and Template': 'X', Server: 'X', Broadcast: 'X', Advertising: 'Unlimited', Trademark: 'X', Studio: 'Unlimited', Extended: 'Unlimited', Corporate: 'Unlimited', Exclusive: 'Unlimited' },
    { feature: 'Trademark (Logo & Brand Registration)', Standard: 'X', Webfont: 'X', 'App/Game': 'X', 'E-Pub': 'X', 'Social Media': 'X', Productions: 'X', 'POD and Template': 'X', Server: 'X', Broadcast: 'X', Advertising: '1 Trademark', Trademark: '1 Trademark', Studio: '1 Trademark', Extended: '2 Trademarks', Corporate: '3 Trademarks', Exclusive: 'Unlimited' },
    { feature: 'Large Organization (Corporate)', Standard: 'X', Webfont: 'X', 'App/Game': 'X', 'E-Pub': 'X', 'Social Media': 'X', Productions: 'X', 'POD and Template': 'X', Server: 'X', Broadcast: 'X', Advertising: 'X', Trademark: 'X', Studio: 'X', Extended: 'X', Corporate: 'Unlimited', Exclusive: 'Unlimited' },
    { feature: 'Limited Edition', Standard: 'X', Webfont: 'X', 'App/Game': 'X', 'E-Pub': 'X', 'Social Media': 'X', Productions: 'X', 'POD and Template': 'X', Server: 'X', Broadcast: 'X', Advertising: 'X', Trademark: 'X', Studio: 'X', Extended: 'X', Corporate: 'X', Exclusive: 'Unlimited' },
  ];
  
  const licenseGroup1 = allLicenseNames.slice(0, 8);
  const licenseGroup2 = allLicenseNames.slice(8);
  
  // --- PERUBAHAN: Menambahkan separatorClasses ---
  const separatorClasses = "border-b border-white/10";

  return (
    <div className="bg-brand-dark-secondary">
      <main>
          <section className="container mx-auto px-6 pt-24 pb-12 text-center">
            <SectionHeader
              title={<>Find the Right License for  <br /> Your Project</>}
              subtitle="Compare our flexible licensing options to find the perfect fit, whether you're working on a personal project or a large-scale commercial campaign."
            />
          </section>
        
        {/* --- PERUBAHAN: Membungkus Section 2 --- */}
        <div className={separatorClasses}>
          <div className="container mx-auto px-6 py-16 space-y-16">
            <LicenseComparisonTable licenses={licenseGroup1} features={allFeatures} />
            <LicenseComparisonTable licenses={licenseGroup2} features={allFeatures} />
          </div>
        </div>

        {/* --- PERUBAHAN: Membungkus Section 3 --- */}
        <div className={separatorClasses}>
          <LicenseCardGrid licenses={licenseDetailsData} />
        </div>
        
        {/* --- PERUBAHAN: Membungkus Section 4 --- */}
        <div className={separatorClasses}>
            <TestimonialSection />
        </div>

        {/* --- PERUBAHAN: Section 5 (Terakhir) TIDAK dibungkus --- */}
        <TrustedBySection brands={brands || []} />
        <BackToTopButton />
      </main>
    </div>
  );
}