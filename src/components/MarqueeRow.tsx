// src/components/MarqueeRow.tsx
import ProductCard from './ProductCard'; 
import type { ProductData } from '@/lib/dummy-data';

const MarqueeRow = ({ products, animationClass }: { products: ProductData[], animationClass: string }) => {
  // Gandakan produk untuk menciptakan efek loop yang mulus
  const duplicatedProducts = [...products, ...products];

  return (
    // --- PERUBAHAN UTAMA DI SINI: Menambahkan kelas `text-left` ---
    <div className="relative flex overflow-hidden text-left">
      <div className={`flex w-max items-stretch py-4 ${animationClass} group-hover:[animation-play-state:paused]`}>
        {duplicatedProducts.map((font, index) => (
          <div key={`${font.id}-${index}-marquee`} className="w-80 flex-shrink-0 px-4">
            <ProductCard font={font} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarqueeRow;