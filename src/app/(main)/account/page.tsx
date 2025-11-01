// src/app/(main)/account/page.tsx
'use client';

import SectionHeader from '@/components/SectionHeader';
import { useAuth } from '@/context/AuthContext';
import { Award, ShoppingCart, BookOpen, Loader2, Info, FileText, User, Settings, ArrowRight } from 'lucide-react'; // Impor ikon baru
import Button from '@/components/Button';
import DashboardCard from '@/components/account/DashboardCard';
import { useEffect, useState } from 'react';
// --- PERUBAHAN DI SINI ---
import { getRecentPurchasesAction, MostRecentPurchase } from '@/app/actions/userActions';
// --- AKHIR PERUBAHAN ---
import { getBlogDetailsBySlugsAction } from '@/app/actions/blogActions';
import PurchasedProductCard from '@/components/account/PurchasedProductCard';
import Link from 'next/link';
import Image from 'next/image';
import { Tables } from '@/lib/database.types'; // Impor Tables

// Tipe untuk informasi tutorial yang diperkaya
type TutorialInfo = {
  title: string;
  href: string;
  slug: string;
  imageUrl?: string | null;
};

// --- KOMPONEN BARU: Quick Links Card ---
const QuickLinksCard = () => (
    <DashboardCard
        icon={Settings}
        title="Quick Links"
        href="/account/profile"
        linkText="Manage Your Profile"
    >
        <div className="flex flex-col space-y-3">
            <Link href="/account/my-fonts" className="flex justify-between items-center text-brand-light-muted hover:text-brand-accent transition-colors">
                <span>View My Library</span>
                <ArrowRight size={16} />
            </Link>
            <Link href="/account/orders" className="flex justify-between items-center text-brand-light-muted hover:text-brand-accent transition-colors">
                <span>View Order History</span>
                <ArrowRight size={16} />
            </Link>
            <Link href="/account/profile" className="flex justify-between items-center text-brand-light-muted hover:text-brand-accent transition-colors">
                <span>Edit Profile & Password</span>
                <ArrowRight size={16} />
            </Link>
        </div>
    </DashboardCard>
);

// Komponen Item Tutorial Baru
const GuideLinkItem = ({ tutorial }: { tutorial: TutorialInfo }) => {
    return (
        <Link href={tutorial.href} target="_blank" rel="noopener noreferrer" className="block group bg-brand-darkest p-4 rounded-lg border border-white/10 hover:border-brand-accent transition-all duration-300 hover:shadow-lg hover:shadow-brand-accent/10">
            <div className="relative aspect-video w-full rounded-md overflow-hidden mb-3">
                <Image
                    src={tutorial.imageUrl || '/images/dummy/placeholder.jpg'} // Fallback image/edit/page.tsx]
                    alt={tutorial.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
            </div>
            <h4 className="font-medium text-brand-light group-hover:text-brand-accent transition-colors text-sm leading-snug">{tutorial.title}</h4>
        </Link>
    );
};

export default function AccountDashboardPage() {
    const { user, activeSubscription } = useAuth();
    // --- PERUBAHAN STATE ---
    const [recentPurchases, setRecentPurchases] = useState<MostRecentPurchase[]>([]);
    const [loadingPurchases, setLoadingPurchases] = useState(true);
    // --- AKHIR PERUBAHAN ---
    const [enrichedTutorials, setEnrichedTutorials] = useState<TutorialInfo[]>([]);
    const [loadingTutorials, setLoadingTutorials] = useState(true);

    const baseTutorials: TutorialInfo[] = [
        { title: "Purchasing Fonts Guide", href: "/blog/from-browse-to-download-your-guide-to-purchasing-fonts-on-timeless-type", slug: "from-browse-to-download-your-guide-to-purchasing-fonts-on-timeless-type"},
        { title: "Download with Subscription", href: "/blog/instant-access-how-to-download-fonts-with-your-subscription", slug: "instant-access-how-to-download-fonts-with-your-subscription"},
        { title: "Introduction to Dashboard", href: "/blog/introduction-to-the-dashboard-a-complete-guide", slug: "introduction-to-the-dashboard-a-complete-guide"},
        { title: "Using Alternates in Illustrator", href: "/blog/how-to-use-alternate-font-characters-in-adobe-illustrator", slug: "how-to-use-alternate-font-characters-in-adobe-illustrator"},
        { title: "Accessing Purchases & Docs", href: "/blog/how-to-access-your-purchased-fonts-invoices-and-eulas", slug: "how-to-access-your-purchased-fonts-invoices-and-eulas"}, 
        { title: "How to Use Alternate Characters", href: "/blog/how-to-use-alternate-font-characters", slug: "how-to-use-alternate-font-characters"},
        { title: "Using Alternates in Canva", href: "/blog/how-to-use-and-access-alternate-characters-and-ligatures-in-canva", slug: "how-to-use-and-access-alternate-characters-and-ligatures-in-canva"},
    ];

    useEffect(() => {
        // --- PERUBAHAN FETCHING DATA ---
        const fetchRecentPurchases = async () => {
            if (user) {
                setLoadingPurchases(true);
                const { data } = await getRecentPurchasesAction(6); // Ambil 6 produk
                setRecentPurchases(data);
                setLoadingPurchases(false);
            }
        };
        // --- AKHIR PERUBAHAN ---

        const fetchTutorialDetails = async () => {
            setLoadingTutorials(true);
            const slugsToFetch = baseTutorials.map(t => t.slug).filter(Boolean);
            if (slugsToFetch.length > 0) {
                const { data: blogDetails, error } = await getBlogDetailsBySlugsAction(slugsToFetch); //
                if (error) {
                    console.error("Failed to fetch tutorial details:", error);
                    setEnrichedTutorials(baseTutorials);
                } else {
                    const detailsMap = new Map(blogDetails.map(p => [p.slug, p.image_url]));
                    const updatedTutorials = baseTutorials.map(tut => ({
                        ...tut,
                        imageUrl: detailsMap.get(tut.slug)
                    }));
                    setEnrichedTutorials(updatedTutorials);
                }
            } else {
                setEnrichedTutorials(baseTutorials);
            }
            setLoadingTutorials(false);
        };

        fetchRecentPurchases();
        fetchTutorialDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    return (
        <div>
            <SectionHeader
                align="left"
                title="Dashboard"
                subtitle="Welcome back! Here's a quick overview of your account."
            />

            {/* --- TATA LETAK BARU BAGIAN ATAS --- */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Kartu Langganan */}
                <DashboardCard
                    icon={Award}
                    title="Subscription Status"
                    href="/account/subscription"
                    linkText={activeSubscription ? "Manage Subscription" : "View Subscription Plans"}
                >
                    {activeSubscription ? (
                        <div className='space-y-1 text-sm'>
                            <p>You are on the <strong className="text-brand-light">{activeSubscription.subscription_plans?.name}</strong> plan.</p>
                            <p>Your access is active until <strong className="text-brand-light">{new Date(activeSubscription.current_period_end).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-start space-y-4">
                            <p>Unlock our entire font library! Access over 100+ premium fonts with one simple subscription.</p>
                            <Button href="/subscription" variant="primary">Upgrade Now</Button>
                        </div>
                    )}
                </DashboardCard>
                
                {/* Kartu Quick Links Baru */}
                <QuickLinksCard />
            </div>
            {/* --- AKHIR TATA LETAK BARU --- */}


            {/* --- BAGIAN BARU: RECENT PURCHASES --- */}
            <div className="mt-12">
                <SectionHeader
                    align="left"
                    title="Recent Purchases"
                    subtitle="Your most recently acquired fonts and bundles."
                />
                
                {loadingPurchases ? (
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
                        {Array.from({ length: 3 }).map((_, i) => (
                             <div key={i} className="bg-brand-darkest p-4 rounded-lg border border-white/10">
                                 <div className="aspect-[3/2] bg-white/10 rounded-md mb-4"></div>
                                 <div className="h-4 bg-white/10 rounded w-3/4"></div>
                                 <div className="h-3 bg-white/10 rounded w-1/2 mt-2"></div>
                             </div>
                        ))}
                    </div>
                ) : recentPurchases.length > 0 ? (
                    <>
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {recentPurchases.map((product) => (
                                <PurchasedProductCard key={product.id} product={{
                                    ...product,
                                    description: product.type === 'font' ? 'Font' : 'Bundle',
                                    licenseName: product.licenseName
                                }} />
                            ))}
                        </div>
                        <div className="mt-8 text-center">
                            <Button href="/account/my-fonts" variant="outline">
                                View All My Library
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="mt-8 text-center py-16 bg-brand-darkest border border-dashed border-white/20 rounded-lg">
                        <ShoppingCart size={32} className="mx-auto text-brand-light-muted" />
                        <p className="mt-4 text-brand-light-muted">You haven&apos;t purchased any fonts or bundles yet.</p>
                        <Link href="/fonts" className="text-brand-accent hover:underline mt-2 inline-block">
                            Explore Fonts
                        </Link>
                    </div>
                )}
            </div>
            {/* --- AKHIR BAGIAN BARU --- */}


            {/* Bagian Helpful Guides (Tetap) */}
            <div className="mt-12">
                <SectionHeader
                    align="left"
                    title="Helpful Guides"
                    subtitle="Quick links to tutorials and guides to get you started."
                />
                {loadingTutorials ? (
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                        {Array.from({ length: 3 }).map((_, i) => (
                             <div key={i} className="bg-brand-darkest p-4 rounded-lg border border-white/10">
                                 <div className="aspect-video bg-white/10 rounded-md mb-3"></div>
                                 <div className="h-4 bg-white/10 rounded w-3/4"></div>
                             </div>
                        ))}
                    </div>
                ) : enrichedTutorials.length > 0 ? (
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {enrichedTutorials.map((tut, index) => (
                            <GuideLinkItem key={index} tutorial={tut} />
                        ))}
                    </div>
                ) : (
                    <div className="mt-8 text-center py-10 bg-brand-darkest border border-dashed border-white/20 rounded-lg">
                        <Info size={32} className="mx-auto text-brand-light-muted" />
                        <p className="mt-4 text-brand-light-muted">Could not load helpful guides at this time.</p>
                    </div>
                )}
            </div>

        </div>
    );
}