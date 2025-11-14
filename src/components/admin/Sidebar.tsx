// src/components/admin/Sidebar.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTransition, useState } from 'react';
import { 
  LayoutDashboard, Home, Users, ShoppingBag, LogOut, ChevronDown, Box, Type,
  Package, ShieldCheck, Star, Handshake, Gem, FileText, Newspaper, Megaphone,
  ImageIcon, Building2, GalleryHorizontal, Mail, BarChart3
} from 'lucide-react';
import { Tables } from '@/lib/database.types';

type SidebarProps = {
  counts: {
    fonts: number;
    bundles: number;
    posts: number;
  } | null;
  profile: Tables<'profiles'> | null;
};

export default function Sidebar({ counts, profile }: SidebarProps) {
  const navLinks = [
    // --- PERUBAHAN DI SINI: Hapus 'blogger' dan 'uploader' ---
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, roles: ['admin'] },
    { name: 'Traffic Analytics', href: '/admin/analytics', icon: BarChart3, roles: ['admin'] },
    { 
      name: 'Manage Products', icon: Box, roles: ['admin', 'uploader'],
      subMenu: [
        { name: 'Fonts', href: '/admin/products/fonts', icon: Type, count: counts?.fonts },
        { name: 'Bundles', href: '/admin/products/bundles', icon: Package, count: counts?.bundles },
      ]
    },
    { 
      name: 'Manage Blog', icon: FileText, roles: ['admin', 'blogger'],
      subMenu: [
        { name: 'All Posts', href: '/admin/blog', icon: Newspaper, count: counts?.posts },
        { name: 'Blog Ads', href: '/admin/blog/ads', icon: Megaphone }
      ]
    },
    { name: 'Manage Partners', href: '/admin/partners', icon: Handshake, roles: ['admin', 'uploader'] },
    { name: 'Manage Licenses', href: '/admin/licenses', icon: ShieldCheck, roles: ['admin'] },
    {
      name: 'Subscription', icon: Gem, roles: ['admin'],
      subMenu: [
        { name: 'Subscription Plans', href: '/admin/subscription/plans', icon: Package },
        { name: 'Subscribers', href: '/admin/subscription/subscribers', icon: Users },
      ]
    },
    { 
      name: 'Manage Home', icon: Home, roles: ['admin'],
      subMenu: [
        { name: 'Banner Slider', href: '/admin/homepage/banner', icon: GalleryHorizontal },
        { name: 'Brands', href: '/admin/brands', icon: Building2 },
        { name: 'Gallery', href: '/admin/gallery', icon: ImageIcon },
        { name: 'Popular Bundles', href: '/admin/homepage/popular-bundles', icon: Package },
        { name: 'Featured Products', href: '/admin/homepage/featured-products', icon: Star },
      ]
    },
    { 
      name: 'Manage Users', icon: Users, roles: ['admin'],
      subMenu: [
        { name: 'All Users', href: '/admin/users', icon: Users },
        { name: 'Newsletter Subscribers', href: '/admin/newsletter', icon: Mail }
      ]
    },
    { name: 'Manage Orders', href: '/admin/orders', icon: ShoppingBag, roles: ['admin'] },
  ];

  const pathname = usePathname();
  const { user, handleLogout } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [openMenus, setOpenMenus] = useState(['Manage Products', 'Manage Blog', 'Subscription', 'Manage Home', 'Manage Users']);

  const userRole = profile?.role || 'user';
  const filteredNavLinks = navLinks.filter(link => link.roles.includes(userRole));

  const toggleMenu = (name: string) => {
    setOpenMenus(prev => 
      prev.includes(name) ? prev.filter(m => m !== name) : [...prev, name]
    );
  };

  const onLogoutClick = () => {
    startTransition(async () => {
      await handleLogout();
    });
  };

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col bg-gradient-to-b from-brand-darkest from-25% to-brand-accent/20 text-brand-light shadow-lg sticky top-0 h-screen">
      <div className="flex flex-1 flex-col overflow-y-auto">
        <div className="flex h-24 items-center justify-center pt-8 pb-8 px-6 border-b border-white/10">
          <Link href="/">
              <Image
                  src="/LOGO STYLISH.svg" // <-- LOGO DIPERBARUI
                  alt="Stylish Type Logo"
                  width={160}
                  height={32}
                  priority
              />
          </Link>
        </div>
        <nav className="flex-grow px-4 pt-4">
          <ul>
            {filteredNavLinks.map((link) => {
              if (link.subMenu) {
                const isParentActive = link.subMenu.some(item => pathname.startsWith(item.href));
                const isOpen = openMenus.includes(link.name);
                return (
                  <li key={link.name}>
                    <button
                      onClick={() => toggleMenu(link.name)}
                      className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 my-1 rounded-lg transition-colors font-medium text-sm ${
                        isParentActive ? 'text-brand-light' : 'text-brand-light-muted'
                      } hover:bg-white/5 hover:text-brand-light`}
                    >
                      <div className="flex items-center gap-3">
                        <link.icon size={18} />
                        <span>{link.name}</span>
                      </div>
                      <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                      <ul className="pl-6 mt-1 space-y-1">
                        {link.subMenu.map(subLink => {
                          
                          let isSubActive;
                          if (subLink.href === '/admin/blog') {
                            isSubActive = pathname.startsWith('/admin/blog') && !pathname.startsWith('/admin/blog/ads');
                          } else if (subLink.href === '/admin/users') {
                            isSubActive = pathname === '/admin/users';
                          }
                          else {
                            isSubActive = pathname.startsWith(subLink.href);
                          }

                          return (
                            <li key={subLink.name}>
                              <Link
                                href={subLink.href}
                                className={`group flex items-center gap-3 px-4 py-2 my-1 rounded-lg transition-colors font-medium text-sm ${
                                  isSubActive 
                                    ? 'bg-brand-accent text-brand-darkest' 
                                    : 'text-brand-light-muted hover:bg-white/5 hover:text-brand-light'
                                }`}
                              >
                                <subLink.icon size={16} />
                                <span className="flex-grow">{subLink.name}</span>
                                
                                {subLink.hasOwnProperty('count') && (
                                  <span className={`text-sm font-semibold px-2 py-0.5 rounded-md transition-colors duration-200 ${
                                    isSubActive
                                      ? ' text-brand-darkest'
                                      : 'text-brand-accent group-hover:text-brand-light'
                                  }`}>
                                    {subLink.count}
                                  </span>
                                )}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              }
              const isActive = pathname.startsWith(link.href);

              return (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-2.5 my-1 rounded-lg transition-colors font-medium text-sm ${
                      isActive 
                        ? 'bg-brand-accent text-brand-darkest' 
                        : 'text-brand-light-muted hover:bg-white/5 hover:text-brand-light'
                    }`}
                  >
                    <link.icon size={18} />
                    <span>{link.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="p-3 mb-2 rounded-lg bg-brand-dark-secondary">
            <p className="font-semibold text-brand-light text-sm truncate">{profile?.full_name || 'Admin'}</p>
            <p className="text-xs text-brand-light-muted truncate">{user?.email}</p>
          </div>
          <button 
            onClick={onLogoutClick}
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-brand-accent text-brand-darkest font-semibold transition-all duration-300 ease-in-out hover:brightness-110 disabled:opacity-50"
          >
            <LogOut size={16} />
            <span className="text-sm">{isPending ? 'Logging out...' : 'Logout'}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}