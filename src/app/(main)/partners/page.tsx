// src/app/(main)/partners/page.tsx
import Image from 'next/image';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database} from '@/lib/database.types';
import SectionHeader from '@/components/SectionHeader';
import MarqueeRow from '@/components/MarqueeRow';
import BackToTopButton from '@/components/BackToTopButton';
import Button from '@/components/Button';
import { getAllFontsForMarqueeAction } from '@/app/actions/productActions';

export const revalidate = 3600;

const PartnerCard = ({ name, description, logoUrl, slug }: { name: string; description: string | null; logoUrl: string | null; slug: string; }) => (
    <div className="text-center flex flex-col items-center group">
        <div className="relative w-40 h-40 mb-6 transition-transform duration-300 group-hover:scale-110 rounded-full bg-white/5 p-4 flex items-center justify-center overflow-hidden">
            <Image
                src={logoUrl || '/images/avatar-placeholder.png'}
                alt={`${name} logo`}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-contain"
            />
        </div>
        <h2 className="text-2xl font-medium text-brand-light">{name}</h2>
        <div className="w-20 h-0.5 bg-brand-accent mx-auto my-4 rounded-full"></div>
        <p className="font-light text-brand-light-muted max-w-xs mx-auto flex-grow">{description}</p>
        <div className="mt-16">
            <Button href={`/partners/${slug}`} variant="outline" className="px-6 py-2 text-sm">
                View Fonts
            </Button>
        </div>
    </div>
);

export default async function PartnersPage() {
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

    const { data: partners } = await supabase
        .from('partners')
        .select('*')
        .order('name', { ascending: true });
        
    const { products: marqueeFonts } = await getAllFontsForMarqueeAction();

    return (
        <div className="bg-brand-dark-secondary relative overflow-hidden">
            <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-brand-accent/50 to-transparent opacity-40 z-0"></div>

            <main className="relative z-10">
                <section className="container mx-auto px-6 pt-24 pb-16 text-center">
                    <SectionHeader
                        title="Our Partners"
                        subtitle="Meet the talented designers and foundries we are proud to collaborate with."
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 mt-16">
                        {partners && partners.length > 0 ? (
                            partners.map(partner => (
                                <PartnerCard
                                    key={partner.id}
                                    name={partner.name}
                                    description={partner.subheadline}
                                    logoUrl={partner.logo_url}
                                    slug={partner.slug}
                                />
                            ))
                        ) : (
                            <p className="text-center col-span-3 text-brand-light-muted">No partners have been added yet.</p>
                        )}
                    </div>
                </section>
                
                {marqueeFonts.length > 0 && (
                     <div className="pt-8 pb-20 group relative text-center">
                        <MarqueeRow products={marqueeFonts} animationClass="animate-marquee-reverse-fast" />
                        <div className="mt-16">
                            <Button href="/fonts">
                                Explore All Font
                            </Button>
                        </div>
                    </div>
                )}
            </main>
            <BackToTopButton />
        </div>
    );
}