// src/app/api/catalog/facebook/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Database } from '@/lib/database.types';

// Cache feed ini selama 1 jam agar tidak membebani database
export const revalidate = 3600;

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://stylishtype.co';
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

  try {
    // 1. Ambil data Fonts
    const { data: fonts } = await supabase
      .from('fonts')
      .select('id, name, slug, main_description, price, preview_image_urls, category')
      .order('created_at', { ascending: false });

    // 2. Ambil data Bundles
    const { data: bundles } = await supabase
      .from('bundles')
      .select('id, name, slug, main_description, price, preview_image_urls')
      .order('created_at', { ascending: false });

    // Header XML
    let xml = `<?xml version="1.0"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
<channel>
<title>Stylish Type Catalog</title>
<link>${baseUrl}</link>
<description>Premium Fonts and Bundles</description>
`;

    // 3. Loop Fonts untuk dijadikan Item XML
    fonts?.forEach((font) => {
        const imageUrl = font.preview_image_urls?.[0] || `${baseUrl}/og-image.png`;
        // Bersihkan deskripsi dari HTML tags jika ada
        const cleanDesc = font.main_description 
            ? font.main_description.replace(/<[^>]*>?/gm, '').substring(0, 5000) 
            : `Premium font ${font.name}`;

        xml += `
<item>
<g:id>font_${font.id}</g:id>
<g:title><![CDATA[${font.name}]]></g:title>
<g:description><![CDATA[${cleanDesc}]]></g:description>
<g:link>${baseUrl}/product/${font.slug}</g:link>
<g:image_link>${imageUrl}</g:image_link>
<g:brand>Stylish Type</g:brand>
<g:condition>new</g:condition>
<g:availability>in stock</g:availability>
<g:price>${font.price.toFixed(2)} USD</g:price>
<g:google_product_category>Software > Digital Goods > Fonts</g:google_product_category>
<g:custom_label_0>font</g:custom_label_0>
</item>`;
    });

    // 4. Loop Bundles untuk dijadikan Item XML
    bundles?.forEach((bundle) => {
        const imageUrl = bundle.preview_image_urls?.[0] || `${baseUrl}/og-image.png`;
        const cleanDesc = bundle.main_description 
            ? bundle.main_description.replace(/<[^>]*>?/gm, '').substring(0, 5000) 
            : `Premium font bundle ${bundle.name}`;

        xml += `
<item>
<g:id>bundle_${bundle.id}</g:id>
<g:title><![CDATA[${bundle.name}]]></g:title>
<g:description><![CDATA[${cleanDesc}]]></g:description>
<g:link>${baseUrl}/bundles/${bundle.slug}</g:link>
<g:image_link>${imageUrl}</g:image_link>
<g:brand>Stylish Type</g:brand>
<g:condition>new</g:condition>
<g:availability>in stock</g:availability>
<g:price>${bundle.price.toFixed(2)} USD</g:price>
<g:google_product_category>Software > Digital Goods > Fonts</g:google_product_category>
<g:custom_label_0>bundle</g:custom_label_0>
</item>`;
    });

    // Footer XML
    xml += `
</channel>
</rss>`;

    // Kembalikan response dengan tipe XML
    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate',
      },
    });

  } catch (error) {
    console.error('Error generating catalog feed:', error);
    return NextResponse.json({ error: 'Failed to generate feed' }, { status: 500 });
  }
}