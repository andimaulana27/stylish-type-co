// src/components/SideCart.tsx
'use client';

import { useUI } from '@/context/UIContext';
import { X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const SideCart = ({ children }: { children: React.ReactNode }) => {
  const { isCartSidebarOpen, closeCartSidebar, cart, removeFromCart, cartTotal, cartCount } = useUI();

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 z-50 transition-opacity duration-300 ${isCartSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={closeCartSidebar}
      />
      
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-[#1e1e1e] text-brand-light shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${isCartSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 border-b border-brand-gray-light flex-shrink-0">
          <h2 className="text-xl font-semibold text-brand-accent">Your Cart ({cartCount})</h2>
          <button onClick={closeCartSidebar} className="hover:text-brand-accent transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto">
          {cart.length === 0 ? (
            <>
              <p className="p-6 text-center text-brand-light-muted">You haven&apos;t added anything to your cart yet.</p>
              <div className="border-t border-brand-gray-light my-6 mx-6"></div>
              {children}
              {/* --- PERBAIKAN: Tombol dipindahkan ke sini --- */}
              <div className="px-6 mt-2 text-center">
                <Link 
                    href="/product" 
                    onClick={closeCartSidebar} 
                    className="px-6 py-2 font-medium rounded-full text-sm bg-brand-accent text-brand-darkest transition-all"
                >
                    Explore All Fonts
                </Link>
              </div>
            </>
          ) : (
            <div>
              <div className="p-6 space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex items-start gap-4">
                    <Image src={item.imageUrl} alt={item.name} width={140} height={100} className="rounded-md bg-brand-gray-light object-cover aspect-[3/2]" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-brand-light text-base leading-tight pr-2">{item.name}</h4>
                        <p className="text-base font-bold text-brand-light flex-shrink-0">${item.price.toFixed(2)}</p>
                      </div>
                      <p className="text-xs text-brand-light-muted mt-1">{item.license.name} License</p>
                      <button onClick={() => removeFromCart(item.id)} className="text-xs text-red-400 hover:underline mt-2">
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-6 border-t border-brand-gray-light">
                <div className="flex justify-between items-center text-lg font-medium mb-4">
                  <span>Subtotal</span>
                  <span className="text-xl font-bold text-brand-accent">${cartTotal.toFixed(2)}</span>
                </div>
                <Link 
                  href="/checkout"
                  onClick={closeCartSidebar}
                  className="block w-full px-8 py-3 font-medium rounded-full text-center bg-brand-accent text-brand-darkest transition-all duration-300 ease-in-out transform hover:shadow-lg hover:shadow-brand-accent/40"
                >
                    Proceed to Checkout
                </Link>
              </div>
              <div className="border-t border-brand-gray-light my-6 mx-6"></div>
              {children}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SideCart;