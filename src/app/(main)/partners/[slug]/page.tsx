// src/app/(main)/partners/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database, Json, Tables } from '@/lib/database.types';
import type { ProductData } from '@/lib/dummy-data';
import SectionHeader from '@/components/SectionHeader';
import BackToTopButton from "@/components/BackToTopButton";
import TrustedBySection from "@/components/TrustedBySection";
import PartnerFontsClient from '@/components/partner/PartnerFontsClient';
import { Metadata, ResolvingMetadata } from 'next'; 

export const revalidate = 3600;

const ITEMS_PER_PAGE = 32;

type FontForPartnerPage = Tables<'fonts'> & {
    partners: { name: string; slug: string };
    discounts: { name: string; percentage: number } | null;
};

export async function generateMetadata(
  { params }: { params: { slug: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = params;
  const cookieStore = cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
  );

  const { data: partner } = await supabase.from('partners').select('name, subheadline').eq('slug', slug).single();

  if (!partner) {
    return {
      title: 'Partner Not Found',
    };
  }

  return {
    title: `Fonts by ${partner.name} | Timeless Type`,
    description: partner.subheadline || `Explore the complete font collection from our creative partner, ${partner.name}, available on Timeless Type.`,
  };
}

const formatFontData = (font: FontForPartnerPage): ProductData & { font_files: Json | null; partner: { name: string; slug: string }; } => {
    const discountInfo = font.discounts;
    const originalPrice = font.price ?? 0;
    let finalPrice = originalPrice;
    let discountString: string | undefined = undefined;

    if (discountInfo && discountInfo.percentage > 0) {
        finalPrice = originalPrice - (originalPrice * discountInfo.percentage / 100);
        discountString = `${discountInfo.percentage}% OFF`;
    }
    
    return {
        id: font.id,
        name: font.name,
        slug: font.slug,
        imageUrl: font.preview_image_urls?.[0] ?? '/images/dummy/placeholder.jpg',
        price: finalPrice,
        originalPrice: discountInfo ? originalPrice : undefined,
        description: font.category ?? 'Font',
        type: 'font', 
        discount: discountString,
        staffPick: font.staff_pick ?? false,
        font_files: font.font_files,
        partner: {
          name: font.partners.name,
          slug: font.partners.slug,
        }
    };
};


export default async function PartnerDetailPage({ 
    params,
    searchParams
}: { 
    params: { slug: string };
    searchParams: { [key: string]: string | string[] | undefined };
}) {
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

    // --- PERUBAHAN DI SINI: Mengambil data partner dan brands secara paralel ---
    const [partnerRes, brandsRes] = await Promise.all([
        supabase.from('partners').select('*').eq('slug', params.slug).single(),
        supabase.from('brands').select('*').order('created_at', { ascending: false })
    ]);

    const { data: partner, error: partnerError } = partnerRes;
    const { data: brands } = brandsRes;

    if (partnerError || !partner) {
        notFound();
    }
    
    const searchTerm = typeof searchParams.search === 'string' ? searchParams.search : '';
    const sortBy = typeof searchParams.sort === 'string' ? searchParams.sort : 'Newest';
    const currentPage = typeof searchParams.page === 'string' ? Number(searchParams.page) : 1;

    let query = supabase
        .from('fonts')
        .select('*, partners!inner(name, slug), discounts(name, percentage)', { count: 'exact' })
        .eq('partner_id', partner.id);

    if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
    }
    
    if (sortBy === 'Newest') {
        query = query.order('created_at', { ascending: false });
    } else if (sortBy === 'Oldest') {
        query = query.order('created_at', { ascending: true });
    } else if (sortBy === 'A to Z') {
        query = query.order('name', { ascending: true });
    } else if (sortBy === 'Z to A') {
        query = query.order('name', { ascending: false });
    }

    const from = (currentPage - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;
    query = query.range(from, to);

    const { data: fontsData, error: fontsError, count } = await query;
    
    if (fontsError) {
        console.error('Error fetching partner fonts:', fontsError);
    }
    
    const totalItems = count ?? 0;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    const formattedFonts = (fontsData as FontForPartnerPage[] || []).map(formatFontData);

    return (
        <div className="bg-brand-dark-secondary">
            <section className="container mx-auto px-6 pt-24 pb-12 text-center">
                <SectionHeader
                    title={partner.name}
                    subtitle={partner.subheadline}
                />
            </section>

            <PartnerFontsClient 
                initialFonts={formattedFonts} 
                initialTotalPages={totalPages}
            />

            {/* --- PERUBAHAN DI SINI: Memberikan prop 'brands' --- */}
            <TrustedBySection brands={brands || []} />
            <BackToTopButton />
        </div>
    );
}