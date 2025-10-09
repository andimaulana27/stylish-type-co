// src/components/PopularSection.tsx
import SectionHeader from './SectionHeader';
import Button from './Button';
import ProductCard from '@/components/ProductCard';
import type { ProductData } from '@/lib/dummy-data';

// --- PERUBAHAN: Komponen tidak lagi async dan menerima data via props ---
const PopularSection = ({ popularBundlesData }: { popularBundlesData: ProductData[] }) => {
    if (popularBundlesData.length === 0) {
        return null;
    }

    return (
        <section className="py-20 bg-brand-dark-secondary text-brand-light">
            <div className="container mx-auto px-6">
                <SectionHeader
                    title="Popular Font Bundle"
                    subtitle="Browse our most popular curated font bundles, premium typography collections designed to elevate your creative projects."
                />
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {popularBundlesData.map((font) => (
                        <ProductCard key={font.id} font={font} />
                    ))}
                </div>
                <div className="text-center mt-16">
                    <Button href="/bundles">
                        Explore All Bundle
                    </Button>
                </div>
            </div>
        </section>
    );
};
export default PopularSection;