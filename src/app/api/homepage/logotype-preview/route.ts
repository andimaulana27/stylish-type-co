// src/app/api/homepage/logotype-preview/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Database } from '@/lib/database.types';
import { type LogotypeFont } from '@/components/LogotypeCard';

// Cache data ini selama 1 jam
export const revalidate = 3600;

const getPreviewTextFromName = (name: string): string => {
  const nameWithoutStyle = name.split('-')[0].trim();
  const words = nameWithoutStyle.split(' ');
  return words.slice(0, 3).join(' ');
};

export async function GET() {
    const cookieStore = cookies();
    const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
    );

    try {
        const { data: fonts, error } = await supabase
            .from('fonts')
            .select('name, slug, font_files')
            .order('created_at', { ascending: false })
            .limit(12);

        if (error) {
            throw error;
        }

        const previewFonts: LogotypeFont[] = (fonts || []).reduce((acc: LogotypeFont[], font) => {
            const fontFiles = (font.font_files as { style: string; url: string }[] | null) || [];
            const displayFontFile = fontFiles.find(f => f.style.toLowerCase() === 'regular') || fontFiles[0];

            if (displayFontFile && font.slug) {
                acc.push({
                    name: font.name,
                    slug: font.slug,
                    fontFamily: `logotype-preview-${font.slug}`,
                    url: displayFontFile.url,
                    initialPreviewText: getPreviewTextFromName(font.name),
                });
            }
            return acc;
        }, []);

        return NextResponse.json({ previewFonts });

    } catch (error) {
        const message = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}