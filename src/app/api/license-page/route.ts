// src/app/api/license-page/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';

export const revalidate = 3600; // Cache selama 1 jam

export async function GET() {
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
        const { data: licenses, error } = await supabase.from('licenses').select('*').order('created_at');

        if (error || !licenses) {
            throw new Error(error?.message || "Failed to fetch licenses");
        }
        
        const sortedLicenses = [...licenses].sort((a, b) => {
            if (a.name.toLowerCase() === 'standard') return -1;
            if (b.name.toLowerCase() === 'standard') return 1;
            return 0;
        });

        const licenseDetailsData = sortedLicenses.map(license => ({
            title: license.name,
            description: license.description || '',
            allowed: license.allowed || [],
            not_allowed: license.not_allowed || [],
        }));

        return NextResponse.json({ licenseDetailsData });

    } catch (error) {
        const message = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}