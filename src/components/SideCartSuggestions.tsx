// src/components/SideCartSuggestions.tsx
import Link from 'next/link';
import Image from 'next/image';
import { getSuggestionProductsAction } from '@/app/actions/productActions';
import { Percent } from 'lucide-react';
import StaffPickIcon from './icons/StaffPickIcon';

// --- PERBAIKAN: Tipe data diperbarui untuk menyertakan properti baru ---
type SuggestionProduct = {
    id: string;
    name: string;
    slug: string;
    imageUrl: string;
    price: number;
    originalPrice?: number;
    type: 'font' | 'bundle';
    discount?: string;
    staffPick?: boolean;
};

// --- Komponen Label Baru (versi lebih kecil untuk sidecart) ---
const StaffPickLabel = () => (
    <div className="absolute top-1 right-1 bg-brand-secondary-purple text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 z-10">
      <StaffPickIcon className="w-2.5 h-2.5" />
      <span>Picks</span>
    </div>
);

const DiscountLabel = ({ discount }: { discount: string }) => (
  <div className="absolute top-1 left-1 bg-brand-secondary-red text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 z-10">
    <Percent size={10} />
    <span>{discount}</span>
  </div>
);

const SuggestionItem = ({ product }: { product: SuggestionProduct }) => {
  const href = product.type === 'bundle' ? `/bundles/${product.slug}` : `/product/${product.slug}`;
  
  return (
    <Link 
        href={href} 
        className="flex items-center gap-4 p-2 -m-2 rounded-lg hover:bg-white/5 transition-colors group"
    >
      {/* --- PERBAIKAN: Wrapper untuk gambar dan label --- */}
      <div className="relative flex-shrink-0">
        <Image 
          src={product.imageUrl} 
          alt={product.name} 
          width={140} 
          height={100}
          className="rounded-md bg-brand-gray-light object-cover aspect-[3/2]"
        />
        {product.discount && <DiscountLabel discount={product.discount} />}
        {product.staffPick && <StaffPickLabel />}
      </div>
      {/* --- AKHIR PERBAIKAN --- */}
      <div className="flex-1 min-w-0">
        <p className="text-lg font-semibold text-brand-light group-hover:text-brand-accent">{product.name}</p>
        {/* --- PERBAIKAN: Tampilan harga diperbarui --- */}
        <div className="flex items-center gap-2">
            <p className="text-lg font-medium text-brand-light">${product.price.toFixed(2)}</p>
            {product.originalPrice && (
                <p className="text-md text-brand-light-muted line-through">${product.originalPrice.toFixed(2)}</p>
            )}
        </div>
        {/* --- AKHIR PERBAIKAN --- */}
      </div>
    </Link>
  );
};

const SideCartSuggestions = async () => {
  const { featuredFonts, latestBundles } = await getSuggestionProductsAction();

  return (
    <div className="p-6 pt-0 text-brand-light-muted">
      {latestBundles && latestBundles.length > 0 && (
        <div className="mb-6">
          <h4 className="text-xs font-bold text-brand-accent tracking-widest mb-3">LATEST BUNDLES</h4>
          <div className="space-y-3">
            {latestBundles.map(product => (
              <SuggestionItem key={`bundle-${product.id}`} product={product} />
            ))}
          </div>
        </div>
      )}

      {featuredFonts && featuredFonts.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-brand-accent tracking-widest mb-3">FEATURED PRODUCTS</h4>
          <div className="space-y-3">
            {featuredFonts.map(product => (
              <SuggestionItem key={`featured-${product.id}`} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SideCartSuggestions;