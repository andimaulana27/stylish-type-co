// src/components/Navbar.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image'; // <-- Import Image
import { usePathname } from 'next/navigation';
import { useUI } from '@/context/UIContext';
import { useAuth } from '@/context/AuthContext';
import { Search, ShoppingCart, User, ChevronDown, Menu, X } from 'lucide-react';
import SearchDropdown from './SearchDropdown';
import { useState, ReactNode } from 'react';
import type { SuggestionProduct } from './SearchDropdownSuggestions';

// --- DATA UNTUK SUBMENU MOBILE DIMULAI DI SINI ---
const productCategories = [
  { name: "All fonts", href: "/product" },
  { name: "Serif Display", href: "/product?category=Serif+Display" },
  { name: "Sans Serif", href: "/product?category=Sans+Serif" },
  { name: "Slab Serif", href: "/product?category=Slab+Serif" },
  { name: "Groovy", href: "/product?category=Groovy" },
  { name: "Script", href: "/product?category=Script" },
  { name: "Blackletter", href: "/product?category=Blackletter" },
  { name: "Western", href: "/product?category=Western" },
  { name: "Sport", href: "/product?category=Sport" },
  { name: "Sci-Fi", href: "/product?category=Sci-Fi" },
];

const blogCategories = [
  { name: 'All Posts', href: "/blog" },
  { name: 'Tutorial', href: "/blog?category=Tutorial" },
  { name: 'Inspiration', href: "/blog?category=Inspiration" },
  { name: 'Branding', href: "/blog?category=Branding" },
  { name: 'Business', href: "/blog?category=Business" },
  { name: 'Freelancing', href: "/blog?category=Freelancing" },
];
// --- DATA UNTUK SUBMENU MOBILE BERAKHIR DI SINI ---

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Font Bundle', href: '/bundles' },
  { name: 'Product', href: '/product', hasMegaMenu: true },
  { name: 'Logotype', href: '/logotype' },
  { name: 'Font Pairing', href: '/font-pair' },
  { name: 'Subscription', href: '/subscription' },
  { name: 'License', href: '/license' },
  { name: 'Partners', href: '/partners' }, 
  { name: 'Blog', href: '/blog', hasMegaMenu: true },
];

const Navbar = ({
  initialFeaturedFonts,
  initialLatestBundles,
  megaMenuComponent,
  blogMegaMenuComponent,
}: {
  initialFeaturedFonts: SuggestionProduct[];
  initialLatestBundles: SuggestionProduct[];
  megaMenuComponent: ReactNode;
  blogMegaMenuComponent: ReactNode;
}) => {
  const pathname = usePathname();
  const { openCartSidebar, cartCount } = useUI();
  const [isSearchOpen, setSearchOpen] = useState(false);
  const { session, loading, profile } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // --- STATE BARU UNTUK MENGONTROL SUBMENU MOBILE ---
  const [openMobileSubMenus, setOpenMobileSubMenus] = useState<string[]>([]);

  const toggleMobileSubMenu = (name: string) => {
    setOpenMobileSubMenus(prev => 
      prev.includes(name) 
        ? prev.filter(m => m !== name) 
        : [...prev, name]
    );
  };
  // --- AKHIR STATE BARU ---

  const userRole = profile?.role || '';
  let accountUrl = '/account';

  if (userRole === 'admin') {
    accountUrl = '/admin/dashboard';
  } else if (userRole === 'blogger') {
    accountUrl = '/admin/blog';
  } else if (userRole === 'uploader') {
    accountUrl = '/admin/products/fonts';
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-brand-darkest/80 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <nav className="relative">
            <div className="hidden md:flex items-center justify-between h-24 text-brand-light">
              <div className="flex-shrink-0">
                <Link href="/" aria-label="Back to Homepage" prefetch={true}>
                  {/* --- PERUBAHAN LOGO 1 (DESKTOP) --- */}
                  <Image
                    src="/LOGO STYLISH.svg"
                    alt="Stylish Type Logo"
                    width={160}
                    height={40}
                    priority
                  />
                </Link>
              </div>
              <div className="flex flex-grow items-center justify-center">
                <ul className="flex items-center space-x-10 h-full">
                  {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    const linkClasses = `relative py-2 transition-all duration-300 flex items-center gap-1.5 ${isActive ? 'text-brand-accent font-semibold' : 'text-brand-light font-normal hover:text-brand-accent'}`;
                    const underlineClasses = `absolute left-0 -bottom-1 block h-0.5 bg-brand-accent transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`;

                    if (link.hasMegaMenu) {
                      return (
                        <li key={link.name} className="group flex items-center h-full py-9 -my-9">
                          <Link href={link.href} className={linkClasses} prefetch={true}>
                            {link.name}
                            <ChevronDown size={16} className="transition-transform duration-300 group-hover:rotate-180" />
                            <div className={underlineClasses}></div>
                          </Link>
                          {link.name === 'Product' && megaMenuComponent}
                          {link.name === 'Blog' && blogMegaMenuComponent}
                        </li>
                      );
                    }
                    return (
                      <li key={link.name} className="group relative flex items-center h-full">
                        <Link href={link.href} className={linkClasses} prefetch={true}>{link.name}</Link>
                        <div className={underlineClasses}></div>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="flex items-center space-x-6">
                <button onClick={() => setSearchOpen(!isSearchOpen)} aria-label="Search" className="relative top-[2px] hover:text-brand-accent transition-colors">
                  <Search size={22} />
                </button>
                <button onClick={() => openCartSidebar()} aria-label="Shopping Cart" className="relative hover:text-brand-accent transition-colors">
                  <ShoppingCart size={22} />
                  {cartCount > 0 && <div className="absolute -top-2 -right-2 bg-brand-secondary-red text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{cartCount}</div>}
                </button>
                {loading ? <div className="w-6 h-6 bg-white/10 rounded-full animate-pulse"></div> : session ? <Link href={accountUrl} aria-label="My Account" className="hover:text-brand-accent transition-colors"><User size={22} /></Link> : <Link href="/login" aria-label="Login or Account" className="hover:text-brand-accent transition-colors"><User size={22} /></Link>}
              </div>
            </div>
            
            <div className="flex md:hidden items-center justify-between h-24 text-brand-light">
              <div className="flex items-center gap-4">
                <button onClick={() => setIsMobileMenuOpen(true)} aria-label="Open menu">
                  <Menu size={24} />
                </button>
                <button onClick={() => setSearchOpen(true)} aria-label="Search">
                  <Search size={22} />
                </button>
              </div>
              <div className="absolute left-1/2 -translate-x-1/2">
                <Link href="/" aria-label="Back to Homepage">
                  {/* --- PERUBAHAN LOGO 2 (MOBILE HEADER) --- */}
                  <Image
                    src="/LOGO STYLISH.svg"
                    alt="Stylish Type Logo"
                    width={160} // Sedikit lebih kecil untuk mobile
                    height={32}
                    priority
                  />
                </Link>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => openCartSidebar()} aria-label="Shopping Cart" className="relative">
                  <ShoppingCart size={22} />
                  {cartCount > 0 && <div className="absolute -top-2 -right-2 bg-brand-secondary-red text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{cartCount}</div>}
                </button>
                {loading ? <div className="w-6 h-6 bg-white/10 rounded-full animate-pulse"></div> : session ? <Link href={accountUrl} aria-label="My Account"><User size={22} /></Link> : <Link href="/login" aria-label="Login or Account"><User size={22} /></Link>}
              </div>
            </div>

            <SearchDropdown 
              isOpen={isSearchOpen} 
              onClose={() => setSearchOpen(false)} 
              featuredFonts={initialFeaturedFonts} 
              latestBundles={initialLatestBundles} 
            />
          </nav>
        </div>
      </header>

      <div className={`fixed inset-0 z-50 transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}></div>
        <div className="relative w-4/5 max-w-sm h-full bg-brand-darkest shadow-lg flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
              {/* --- PERUBAHAN LOGO 3 (MOBILE SIDEBAR) --- */}
              <Image
                src="/LOGO STYLISH.svg"
                alt="Stylish Type Logo"
                width={160}
                height={32}
              />
            </Link>
            <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu">
              <X size={24} />
            </button>
          </div>
          <nav className="flex-grow p-6 overflow-y-auto">
            {/* --- PERUBAHAN UTAMA PADA RENDER MENU MOBILE DIMULAI DI SINI --- */}
            <ul className="space-y-1">
              {navLinks.map((link) => {
                const hasSubMenu = link.hasMegaMenu;
                const isOpen = openMobileSubMenus.includes(link.name);

                if (hasSubMenu) {
                  const subMenuItems = link.name === 'Product' ? productCategories : blogCategories;
                  return (
                    <li key={link.name}>
                      <button
                        onClick={() => toggleMobileSubMenu(link.name)}
                        className="w-full flex justify-between items-center py-3 text-lg font-medium text-brand-light"
                      >
                        <span>{link.name}</span>
                        <ChevronDown className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-accent' : ''}`} size={20} />
                      </button>
                      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
                        <ul className="pl-4 pt-1 pb-2 space-y-2 border-l-2 border-brand-accent/20">
                          {subMenuItems.map(subItem => (
                            <li key={subItem.name}>
                              <Link
                                href={subItem.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block py-1 text-base text-brand-light-muted hover:text-brand-accent transition-colors"
                              >
                                {subItem.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </li>
                  );
                } else {
                  return (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`block py-3 text-lg font-medium transition-colors ${pathname === link.href ? 'text-brand-accent' : 'text-brand-light hover:text-brand-accent'}`}
                      >
                        {link.name}
                      </Link>
                    </li>
                  );
                }
              })}
            </ul>
            {/* --- AKHIR DARI PERUBAHAN RENDER MENU MOBILE --- */}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Navbar;