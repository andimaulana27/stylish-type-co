// src/app/(admin)/admin/layout.tsx
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import { Database } from '@/lib/database.types';
import { getSidebarCountsAction } from '@/app/actions/adminActions'; 

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    // --- PERUBAHAN: Ambil semua data profil ---
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // --- PERUBAHAN: Periksa apakah peran ada di daftar yang diizinkan ---
  const allowedRoles = ['admin', 'blogger', 'uploader'];
  if (!profile?.role || !allowedRoles.includes(profile.role)) {
    redirect('/');
  }

  const { counts } = await getSidebarCountsAction();

  return (
    <div className="flex min-h-screen bg-brand-dark-secondary">
      {/* --- PERUBAHAN: Teruskan profil ke Sidebar --- */}
      <Sidebar counts={counts} profile={profile} />
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}