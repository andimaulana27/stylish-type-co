// src/components/MegaMenu.tsx
import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import { getMegaMenuProductsAction } from '@/app/actions/productActions';
import { Percent } from 'lucide-react';
import StaffPickIcon from './icons/StaffPickIcon';
import AllFontsIcon from './icons/menu/AllFontsIcon';
import SerifDisplayIcon from './icons/menu/SerifDisplayIcon';
import SansSerifIcon from './icons/menu/SansSerifIcon';
import SlabSerifIcon from './icons/menu/SlabSerifIcon';
import GroovyIcon from './icons/menu/GroovyIcon';
import ScriptIcon from './icons/menu/ScriptIcon';
import BlackletterIcon from './icons/menu/BlackletterIcon';
import WesternIcon from './icons/menu/WesternIcon';
import SportIcon from './icons/menu/SportIcon';
import SciFiIcon from './icons/menu/SciFiIcon';

const categories = [
  { name: "All fonts", href: "/fonts", IconComponent: AllFontsIcon },
  { name: "Serif Display", href: "/fonts?category=Serif+Display", IconComponent: SerifDisplayIcon },
  { name: "Sans Serif", href: "/fonts?category=Sans+Serif", IconComponent: SansSerifIcon },
  { name: "Slab Serif", href: "/fonts?category=Slab+Serif", IconComponent: SlabSerifIcon },
  { name: "Groovy", href: "/fonts?category=Groovy", IconComponent: GroovyIcon },
  { name: "Script", href: "/fonts?category=Script", IconComponent: ScriptIcon },
  { name: "Blackletter", href: "/fonts?category=Blackletter", IconComponent: BlackletterIcon },
  { name: "Western", href: "/fonts?category=Western", IconComponent: WesternIcon },
  { name: "Sport", href: "/fonts?category=Sport", IconComponent: SportIcon },
  { name: "Sci-Fi", href: "/fonts?category=Sci-Fi", IconComponent: SciFiIcon },
];

const MegaMenu = async () => {
  const { latestFonts, latestBundles } = await getMegaMenuProductsAction();

  const StaffPickLabel = () => ( <div className="absolute top-2 right-2 bg-brand-secondary-purple text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 z-10"> <StaffPickIcon className="w-3 h-3" /> <span>Picks</span> </div> );
  const DiscountLabel = ({ discount }: { discount: string }) => ( <div className="absolute top-2 left-2 bg-brand-secondary-red text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-0.5 z-10"> <Percent size={12} /> <span>{discount}</span> </div> );

  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 w-screen bg-[#1e1e1e] shadow-2xl opacity-0 invisible transform -translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto z-40">
      <div className="container mx-auto px-6 py-12 grid grid-cols-12 gap-x-8">
        <div className="col-span-3">
          <h3 className="text-xs font-medium text-brand-light-muted tracking-widest mb-6">CATEGORIES</h3>
          <ul className="grid grid-cols-2 gap-x-8 gap-y-4">
            {categories.map(({ name, IconComponent, href }) => (
              <li key={name}>
                {/* --- PERBAIKAN DI SINI --- */}
                <Link href={href} className="flex items-center gap-3 text-brand-light hover:text-brand-accent transition-colors duration-200 group/cat" prefetch={true}>
                  <IconComponent className="w-6 h-6 text-brand-accent/60 group-hover/cat:text-brand-accent transition-colors" />
                  <span>{name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="col-span-4 border-l border-r border-brand-gray-light/50 px-8">
          <h3 className="text-xs font-medium text-brand-light-muted tracking-widest mb-6">Latest Products</h3>
          <div className="space-y-6">
            {latestFonts.map(font => (
              // --- PERBAIKAN DI SINI ---
              <Link href={`/fonts/${font.slug}`} key={font.id} className="flex items-start gap-4 group/item p-3 -m-3 rounded-lg hover:bg-white/5 transition-all duration-200" prefetch={true}>
                <div className="flex-shrink-0 relative">
                  <Image src={font.imageUrl} alt={font.name} width={160} height={100} className="rounded-md bg-brand-gray-light object-cover aspect-[3/2]" />
                  {font.discount && <DiscountLabel discount={font.discount} />}
                  {font.staffPick && <StaffPickLabel />}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-brand-light group-hover/item:text-brand-accent transition-colors duration-200 text-base leading-tight pr-2">{font.name}</h4>
                    <div className="text-right">
                      <p className="text-base font-bold text-brand-light group-hover/item:text-brand-accent transition-colors duration-200">${font.price.toFixed(2)}</p>
                      {font.originalPrice && ( <p className="text-sm font-light text-brand-light-muted line-through">${font.originalPrice.toFixed(2)}</p> )}
                    </div>
                  </div>
                  <p className="text-sm text-brand-light-muted mt-1">{font.category}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className="col-span-5 pl-8">
          <h3 className="text-xs font-medium text-brand-light-muted tracking-widest mb-6">Latest Bundles</h3>
          <div className="space-y-6">
            {latestBundles.map(bundle => (
              // --- PERBAIKAN DI SINI ---
              <Link href={`/bundles/${bundle.slug}`} key={bundle.id} className="flex items-start gap-4 group/item p-3 -m-3 rounded-lg hover:bg-white/5 transition-all duration-200" prefetch={true}>
                <div className="flex-shrink-0 relative">
                  <Image src={bundle.imageUrl} alt={bundle.name} width={160} height={100} className="rounded-md bg-brand-gray-light object-cover aspect-[3/2]" />
                  {bundle.discount && <DiscountLabel discount={bundle.discount} />}
                  {bundle.staffPick && <StaffPickLabel />}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-brand-light group-hover/item:text-brand-accent transition-colors duration-200 text-base leading-tight pr-2">{bundle.name}</h4>
                    <div className="text-right">
                      <p className="text-base font-bold text-brand-light group-hover/item:text-brand-accent transition-colors duration-200">${bundle.price.toFixed(2)}</p>
                       {bundle.originalPrice && ( <p className="text-sm font-light text-brand-light-muted line-through">${bundle.originalPrice.toFixed(2)}</p> )}
                    </div>
                  </div>
                  <p className="text-sm text-brand-light-muted mt-1">{bundle.category}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MegaMenu;