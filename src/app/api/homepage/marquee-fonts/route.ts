// src/app/api/homepage/marquee-fonts/route.ts
import { getAllFontsForMarqueeAction } from '@/app/actions/productActions';
import { NextResponse } from 'next/server';

// Cache data ini selama 1 jam
export const revalidate = 3600;

export async function GET() {
    try {
        const { products, error } = await getAllFontsForMarqueeAction();

        if (error) {
            throw new Error(error);
        }

        return NextResponse.json({ products });

    } catch (error) {
        const message = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}