// src/app/actions/licenseActions.ts
'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { Database, TablesInsert, TablesUpdate } from '@/lib/database.types';

const createSupabaseActionClient = () => {
    const cookieStore = cookies();
    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) { return cookieStore.get(name)?.value; },
                set(name: string, value: string, options: CookieOptions) { cookieStore.set(name, value, options); },
                remove(name: string, options: CookieOptions) { cookieStore.set(name, '', options); },
            },
        }
    );
};

export async function getStandardLicenseAction() {
    const supabase = createSupabaseActionClient();
    try {
        const { data, error } = await supabase
            .from('licenses')
            .select('id, name')
            .eq('name', 'Standard')
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return { error: 'Standard license configuration not found in the database.' };
            }
            throw error;
        }
        
        return { license: data };

    } catch (error: unknown) {
        if (error instanceof Error) return { error: `Failed to fetch standard license: ${error.message}` };
        return { error: 'An unexpected error occurred.' };
    }
}

export async function getLicensesAction() {
    const supabase = createSupabaseActionClient();
    const { data, error } = await supabase.from('licenses').select('*').order('created_at');
    if (error) return { error: error.message };
    return { licenses: data };
}

export async function addLicenseAction(formData: FormData) {
    const supabase = createSupabaseActionClient();
    try {
        const fontPrice = formData.get('font_price');
        const bundlePrice = formData.get('bundle_price');

        const licenseData: TablesInsert<'licenses'> = {
            name: String(formData.get('name')),
            description: String(formData.get('description')),
            font_price: fontPrice ? Number(fontPrice) : 0,
            bundle_price: bundlePrice ? Number(bundlePrice) : 0,
            allowed: formData.getAll('allowed').map(String).filter(Boolean),
            not_allowed: formData.getAll('not_allowed').map(String).filter(Boolean),
        };

        const { data, error } = await supabase.from('licenses').insert(licenseData).select().single();
        if (error) throw error;

        revalidatePath('/admin/licenses');
        return { success: 'License created successfully.', license: data };
    } catch (error: unknown) {
        if (error instanceof Error) return { error: `Failed to save license: ${error.message}` };
        return { error: 'An unexpected error occurred.' };
    }
}

export async function updateLicenseAction(licenseId: string, formData: FormData) {
    const supabase = createSupabaseActionClient();
    try {
        const fontPrice = formData.get('font_price');
        const bundlePrice = formData.get('bundle_price');

        const licenseData: TablesUpdate<'licenses'> = {
            name: String(formData.get('name')),
            description: String(formData.get('description')),
            allowed: formData.getAll('allowed').map(String).filter(Boolean),
            not_allowed: formData.getAll('not_allowed').map(String).filter(Boolean),
            font_price: fontPrice ? Number(fontPrice) : 0,
            bundle_price: bundlePrice ? Number(bundlePrice) : 0,
        };
        
        const { data, error } = await supabase.from('licenses').update(licenseData).eq('id', licenseId).select().single();
        if (error) throw error;

        revalidatePath('/admin/licenses');
        revalidatePath('/product', 'layout'); 
        revalidatePath('/bundles', 'layout');
        return { success: 'License updated successfully.', license: data };
    } catch (error: unknown) {
        if (error instanceof Error) return { error: `Failed to update license: ${error.message}` };
        return { error: 'An unexpected error occurred.' };
    }
}

export async function deleteLicenseAction(licenseId: string) {
    const supabase = createSupabaseActionClient();
    try {
        const { data: license } = await supabase.from('licenses').select('name').eq('id', licenseId).single();
        if (license?.name.toLowerCase() === 'standard') {
            throw new Error('The Standard License cannot be deleted.');
        }

        const { error } = await supabase.from('licenses').delete().eq('id', licenseId);
        if (error) throw error;
    } catch (error: unknown) {
        if (error instanceof Error) return { error: error.message };
        return { error: 'An unexpected error occurred.' };
    }
    revalidatePath('/admin/licenses');
    return { success: 'License deleted successfully.' };
}