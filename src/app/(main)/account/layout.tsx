// src/app/(main)/account/layout.tsx
import AccountSidebar from '@/components/account/AccountSidebar'; 
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Database } from '@/lib/database.types';

export default async function AccountLayout({
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
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .single();


  return (
    <div className="bg-brand-dark-secondary min-h-screen">
      <div className="container mx-auto px-6 py-12 lg:py-16">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          
          <aside className="w-full md:w-1/4 lg:w-1/5">
            <AccountSidebar profile={profile} user={user} />
          </aside>
          
          <main className="flex-1 bg-brand-darkest border border-white/10 rounded-lg p-8">
            {children}
          </main>

        </div>
      </div>
    </div>
  );
}