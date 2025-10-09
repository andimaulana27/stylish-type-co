// src/components/account/AccountSidebar.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTransition } from 'react';
import { type User } from '@supabase/supabase-js';
import { type Tables } from '@/lib/database.types';

import {
  User as UserIcon,
  Type,
  ShoppingCart,
  Award,
  LogOut,
  LayoutDashboard
} from 'lucide-react';

type Profile = Pick<Tables<'profiles'>, 'full_name' | 'avatar_url'>;

const navLinks = [
  { name: 'Dashboard', href: '/account', icon: LayoutDashboard },
  { name: 'Profile', href: '/account/profile', icon: UserIcon },
  { name: 'My Library', href: '/account/my-fonts', icon: Type },
  { name: 'Order History', href: '/account/orders', icon: ShoppingCart },
  { name: 'Subscription', href: '/account/subscription', icon: Award },
];

export default function AccountSidebar({ profile, user }: { profile: Profile | null, user: User | null }) {
  const pathname = usePathname();
  const { handleLogout } = useAuth();
  const [isPending, startTransition] = useTransition();

  const onLogoutClick = () => {
    startTransition(async () => {
      await handleLogout();
    });
  };

  return (
    <div className="bg-brand-darkest p-4 rounded-lg border border-white/10 sticky top-28 flex flex-col h-[calc(100vh-8rem)]">
      
      <div className="p-4 mb-4 border-b border-white/10 text-center">
        <Image
          // --- PERUBAHAN UTAMA: Mengganti placeholder lokal dengan API ---
          src={profile?.avatar_url || user?.user_metadata.avatar_url || 'https://avatar.iran.liara.run/public'}
          alt="User Avatar"
          width={80}
          height={80}
          className="rounded-full object-cover mx-auto"
        />
        <h3 className="font-semibold text-brand-light mt-4 truncate">{profile?.full_name || user?.email}</h3>
        <p className="text-xs text-brand-light-muted">Personal Account</p>
      </div>

      <nav className="flex flex-col space-y-2 flex-grow">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors font-medium text-sm ${
                isActive 
                  ? 'bg-brand-accent text-brand-darkest' 
                  : 'text-brand-light-muted hover:bg-white/5 hover:text-brand-light'
              }`}
            >
              <link.icon size={18} />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-white/10">
        <button 
          onClick={onLogoutClick}
          disabled={isPending}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-brand-light-muted hover:bg-red-500/10 hover:text-red-400 font-medium text-sm transition-colors disabled:opacity-50"
        >
          <LogOut size={18} />
          <span>{isPending ? 'Logging out...' : 'Logout'}</span>
        </button>
      </div>
    </div>
  );
}