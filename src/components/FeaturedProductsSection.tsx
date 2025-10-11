// src/components/FeaturedProductsSection.tsx
import SectionHeader from './SectionHeader';
import Button from './Button';
import ProductCard from '@/components/ProductCard';
import type { ProductData } from '@/lib/dummy-data';

// --- PERUBAHAN: Komponen tidak lagi async dan menerima data via props ---
const FeaturedProductsSection = ({ featuredProductsData }: { featuredProductsData: ProductData[] }) => {
    if (featuredProductsData.length === 0) {
        return null;
    }

    return (
        <section className="py-20 bg-brand-dark-secondary text-brand-light">
            <div className="container mx-auto px-6">
                <SectionHeader
                    title="Featured Products"
                    subtitle="Browse featured fonts, a curated selection of top-selling and staff-picked typefaces for designers and creatives."
                />
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {featuredProductsData.map((font) => (
                        <ProductCard key={font.id} font={font} />
                    ))}
                </div>
                <div className="text-center mt-16">
                    <Button href="/product">
                        Explore All Font
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default FeaturedProductsSection;