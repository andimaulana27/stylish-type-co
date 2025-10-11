// src/components/RecommendedSection.tsx
'use client';

import { useState, useEffect } from 'react';
import MarqueeRow from './MarqueeRow';
import type { ProductData } from '@/lib/dummy-data';
import { getStaffPickFontsForMarqueeAction } from '@/app/actions/productActions';
import SectionHeader from './SectionHeader';
import Button from '@/components/Button';

type RecommendedSectionProps = {
  currentProductId?: string;
};

const RecommendedSection = ({ currentProductId }: RecommendedSectionProps) => {
    const [products, setProducts] = useState<ProductData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            // Menggunakan fungsi baru untuk mengambil font staff picks
            const result = await getStaffPickFontsForMarqueeAction(currentProductId);
            if (result.products) {
                setProducts(result.products);
            } else {
                console.error(result.error);
            }
            setLoading(false);
        };

        fetchProducts();
    }, [currentProductId]);

    if (loading || products.length === 0) {
        return null; 
    }
    
    return (
        <section className="border-t border-white/10">
            <div className="container mx-auto px-6 py-20 text-center">
                 <SectionHeader
                    title="Our Staff Picks"
                    subtitle="Discover other hand-picked typefaces that might catch your eye."
                />
            </div>
            <div className="group relative -mt-8 pb-20">
                <MarqueeRow products={products} animationClass="animate-marquee-reverse-fast" />
                
                <div className="text-center mt-16">
                    <Button href="/product">
                        Explore All Fonts
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default RecommendedSection;