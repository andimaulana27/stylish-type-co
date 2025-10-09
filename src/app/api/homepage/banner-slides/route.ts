// src/app/api/homepage/banner-slides/route.ts
import { getBannerSlidesAction } from '@/app/actions/bannerActions';
import { NextResponse } from 'next/server';

// Cache data ini selama 1 jam
export const revalidate = 3600;

export async function GET() {
    try {
        const { slides, error } = await getBannerSlidesAction();

        if (error || !slides) {
            throw new Error(error || "Failed to fetch banner slides");
        }

        const bannerData = slides.map(slide => ({
            src: slide.image_url,
            href: slide.link_href,
            alt: slide.alt_text || 'Banner image'
        }));

        return NextResponse.json({ bannerData });

    } catch (error) {
        const message = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}