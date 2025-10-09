// src/app/(main)/account/profile/page.tsx
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';
import SectionHeader from '@/components/SectionHeader';
import ProfileForm from '@/components/account/ProfileForm';
import { redirect } from 'next/navigation';

export const revalidate = 0;

export default async function ProfilePage() {
    const cookieStore = cookies();
    const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: { get(name: string) { return cookieStore.get(name)?.value; } },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/login');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (!profile) {
        return <div>Profile not found. Please contact support.</div>;
    }

    return (
        <div>
            <SectionHeader
                align="left"
                title="My Profile"
                subtitle="Manage your personal information and account security settings."
            />
            <div className="mt-8">
                <ProfileForm user={user} profile={profile} />
            </div>
        </div>
    );
}