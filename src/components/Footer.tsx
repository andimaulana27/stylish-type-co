// src/components/Footer.tsx
'use client';

import Link from 'next/link';
import React, { useTransition, useRef } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';

import { Mail, X } from 'lucide-react';

import { subscribeToAction } from '@/app/actions/newsletterActions';
import FacebookIcon from './icons/footer/FacebookIcon';
import InstagramIcon from './icons/footer/InstagramIcon';
import LinkedinIcon from './icons/footer/LinkedinIcon';
import BehanceIcon from './icons/footer/BehanceIcon';
import DribbbleIcon from './icons/footer/DribbbleIcon';
import PaypalIcon from './icons/footer/PaypalIcon';
import VisaIcon from './icons/footer/VisaIcon';
import MastercardIcon from './icons/footer/MastercardIcon';
import { Tables } from '@/lib/database.types'; // <-- 1. Impor Tipe

type SocialLink = Tables<'social_links'>; // <-- 2. Tentukan Tipe

// 3. Peta (Map) untuk mencocokkan icon_key dengan komponen Ikon
const iconMap: { [key: string]: React.FC<React.SVGProps<SVGSVGElement>> } = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  linkedin: LinkedinIcon,
  behance: BehanceIcon,
  dribbble: DribbbleIcon,
  // Tambahkan ikon lain di sini jika Anda menambahkannya di admin
  // 'twitter': TwitterIcon, 
};

const SocialLink = ({ href, IconComponent, alt }: { href: string, IconComponent: React.FC<React.SVGProps<SVGSVGElement>>, alt: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="group text-brand-light-muted/60 hover:text-brand-accent"
    aria-label={alt}
  >
    <div className="transform hover:scale-125 transition-transform duration-300 ease-in">
      <IconComponent className="h-9 w-auto transition-colors" />
    </div>
  </a>
);

const PaymentIcon = ({ IconComponent }: { IconComponent: React.FC<React.SVGProps<SVGSVGElement>> }) => (
    <div className="group transform transition-transform duration-300 ease-in-out hover:scale-110">
        <IconComponent className="h-24 w-auto text-brand-light-muted/60 group-hover:text-brand-accent transition-colors" />
    </div>
);

const resourcesLinks = [
    { name: "About", href: "/about" },
    { name: "Logotype", href: "/logotype" },
    { name: "Contact", href: "/contact" },
    { name: "License", href: "/license" },
    { name: "Subscription", href: "/subscription" },
    { name: "Blog", href: "/blog" },
    { name: "FAQ", href: "/faq" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
];

const allFontCategories = [
    "Serif Display", "Sans Serif", "Slab Serif", "Groovy", "Script", 
    "Blackletter", "Western", "Sport", "Sci-Fi"
].sort();

const allBlogCategories = [
    "Tutorial", "Inspiration", "Branding", "Business", "Freelancing", 
    "Quotes", "Technology", "Lifestyle", "Finance"
].sort();


// 4. Terima `socialLinks` sebagai prop
const Footer = ({ socialLinks }: { socialLinks: SocialLink[] }) => {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubscribe = async (formData: FormData) => {
    startTransition(async () => {
      const result = await subscribeToAction(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? 'animate-fade-in' : 'animate-fade-out'
              } max-w-md w-full bg-brand-darkest shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-brand-accent/50`}
            >
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                     <div className="w-10 h-10 rounded-full bg-brand-accent flex items-center justify-center">
                        <Mail className="h-6 w-6 text-brand-darkest" />
                     </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-semibold text-brand-light">
                      Welcome to the Club!
                    </p>
                    <p className="mt-1 text-sm text-brand-light-muted">
                      You&apos;re on the list! Keep an eye on your inbox for font releases, exclusive offers, and design inspiration.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-white/10">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-brand-light-muted hover:text-white focus:outline-none"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          ),
          {
            duration: 6000,
            position: 'bottom-right',
          }
        );
        formRef.current?.reset();
      }
    });
  };

  return (
    <footer className="relative bg-brand-darkest py-16 text-brand-light-muted overflow-hidden">
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-brand-accent to-transparent opacity-30 z-0 pointer-events-none"></div>
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-y-12 gap-x-8">
          
          <div className="md:col-span-3 space-y-8 flex flex-col items-center md:items-start text-center md:text-left">
            <div>
              <Link href="/" aria-label="Back to Homepage">
                 {/* --- PERUBAHAN LOGO FOOTER --- */}
                 <Image
                    src="/LOGO STYLISH.svg"
                    alt="Stylish Type Logo"
                    width={240} // Menyamakan dengan Navbar
                    height={40}
                  />
               </Link>
              <p className="mt-4 font-light text-sm max-w-xs">
                Discover premium fonts that elevate your designs.
              </p>
              {/* --- 5. Render tautan sosial secara dinamis --- */}
              <div className="flex items-center justify-center md:justify-start gap-4 mt-6">
                {socialLinks.map((link) => {
                  const Icon = iconMap[link.icon_key]; // Dapatkan komponen Ikon dari peta
                  return Icon ? (
                    <SocialLink
                      key={link.id}
                      href={link.url}
                      IconComponent={Icon}
                      alt={link.name}
                    />
                  ) : null; // Jangan render jika ikon tidak ditemukan
                })}
              </div>
            </div>
            <div>
                <h3 className="text-lg font-medium text-brand-accent tracking-wider">Payment Methods</h3>
                <div className=" flex items-center justify-center md:justify-start gap-x-2">
                    <PaymentIcon IconComponent={PaypalIcon} />
                    <PaymentIcon IconComponent={VisaIcon} />
                    <PaymentIcon IconComponent={MastercardIcon} />
                </div>
                <p className="text-xs text-brand-light-muted/50 mt-4">
                    © {new Date().getFullYear()} <span className="text-brand-accent">Stylishtype.co</span>. All rights reserved.
                </p>
            </div>
          </div>
          
          <div className="md:col-span-2 text-center md:text-left">
            <h3 className="font-semibold text-brand-accent tracking-wide mb-5">Font Category</h3>
            <ul className="space-y-0 font-light text-sm">
              {allFontCategories.map(category => (
                 <li key={category} className="border-b border-brand-gray-light/50 last:border-b-0">
                    <Link href={`/fonts?category=${encodeURIComponent(category)}`} className="block py-2.5 hover:text-brand-accent transition-colors">{category}</Link>
                 </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2 text-center md:text-left">
            <h3 className="font-semibold text-brand-accent tracking-wide mb-5">Blog Category</h3>
            <ul className="space-y-0 font-light text-sm">
              {allBlogCategories.map(category => (
                 <li key={category} className="border-b border-brand-gray-light/50 last:border-b-0">
                    <Link href={`/blog?category=${encodeURIComponent(category)}`} className="block py-2.5 hover:text-brand-accent transition-colors">
                        {category}
                    </Link>
                 </li>
              ))}
            </ul>
          </div>
          
          <div className="md:col-span-2 text-center md:text-left">
            <h3 className="font-semibold text-brand-accent tracking-wide mb-5">Resources</h3>
            <ul className="space-y-0 font-light text-sm">
              {resourcesLinks.map(link => (
                 <li key={link.name} className="border-b border-brand-gray-light/50 last:border-b-0">
                    <Link href={link.href} className="block py-2.5 hover:text-brand-accent transition-colors">{link.name}</Link>
                 </li>
              ))}
            </ul>
          </div>
          
          <div className="md:col-span-3">
            <div className="relative overflow-hidden bg-brand-dark-secondary/40 border border-brand-accent/50 rounded-2xl p-8 text-center transform hover:scale-105 transition-transform duration-300">
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-brand-accent/40 to-transparent z-0"></div>
                <div className="relative z-10">
                    <h3 className="font-semibold text-brand-accent text-lg mb-2">Subscribe and Stay In the Loop</h3>
                    <p className="font-light text-sm mb-6">
                      Be the first to know about new font releases, exclusive bundles, and special offers.
                    </p>
                    <form ref={formRef} action={handleSubscribe} className="space-y-4">
                      <input
                        type="email"
                        name="email"
                        placeholder="Your Email"
                        className="w-full bg-white/5 border border-white/20 rounded-full px-4 py-3 text-brand-light placeholder:text-brand-light-muted focus:outline-none focus:border-brand-accent transition-colors"
                        required
                        disabled={isPending}
                      />
                      <button
                        type="submit"
                        disabled={isPending}
                        className="w-full px-8 py-3 font-medium rounded-full text-center bg-brand-accent text-brand-darkest transition-all duration-300 ease-in-out transform hover:brightness-110 hover:shadow-lg hover:shadow-brand-accent/40 disabled:opacity-60"
                      >
                        {isPending ? 'Subscribing...' : 'Subscribe'}
                      </button>
                    </form>
                </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;