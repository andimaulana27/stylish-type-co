// src/app/(main)/account/my-fonts/page.tsx
import SectionHeader from '@/components/SectionHeader';
import { getPurchasedProductsAction } from '@/app/actions/userActions';
import PurchasedProductCard from '@/components/account/PurchasedProductCard'; // Komponen baru
import Link from 'next/link';

export const revalidate = 0;

export default async function MyFontsPage() {
    const { products, error } = await getPurchasedProductsAction();

    return (
        <div>
            <SectionHeader
                align="left"
                title="My Fonts"
                subtitle="Here are all the fonts and bundles you've purchased. You can download them anytime."
            />

            <div className="mt-8">
                {error && <p className="text-red-400">{error}</p>}
                {!products || products.length === 0 ? (
                    <div className="text-center py-16 bg-brand-darkest border border-dashed border-white/20 rounded-lg">
                        <p className="text-brand-light-muted">You haven&apos;t purchased any fonts yet.</p>
                        <Link href="/fonts" className="text-brand-accent hover:underline mt-2 inline-block">
                            Explore Fonts
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {products.map((product) => (
                            <PurchasedProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}