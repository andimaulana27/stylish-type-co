// src/app/api/subscription-page/route.ts
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
        const { data: plans, error } = await supabase.from('subscription_plans').select('*').order('price_monthly');

        if (error || !plans) {
            throw new Error(error?.message || "Failed to fetch subscription plans");
        }
        
        const allUniqueFeatures = Array.from(new Set(plans.flatMap(plan => 
            (plan.features as { allowed?: string[] } | null)?.allowed || []
        )));
        
        const planNames = plans.map(p => p.name);

        const comparisonTableData = allUniqueFeatures.map(featureText => {
            const featureRow: { feature: string; [key: string]: any } = { feature: featureText };
            plans.forEach(plan => {
                const planFeatures = plan.features as { allowed?: string[] } | null;
                const isAllowed = planFeatures?.allowed?.includes(featureText);
                featureRow[plan.name] = isAllowed ? [featureText] : null; 
            });
            return featureRow;
        });

        return NextResponse.json({ plans, planNames, comparisonTableData });

    } catch (error) {
        const message = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}