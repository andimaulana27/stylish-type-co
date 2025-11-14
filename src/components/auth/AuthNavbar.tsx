// src/components/auth/AuthNavbar.tsx
import Link from 'next/link';
import Image from 'next/image';

const AuthNavbar = () => {
  return (
    // --- PERUBAHAN UTAMA DI SINI ---
    // Style header disamakan dengan halaman checkout
    <header className="py-6  bg-brand-darkest">
      <div className="container mx-auto px-6 flex items-center justify-between">
        <div className="flex-shrink-0">
          <Link href="/" aria-label="Back to Homepage">
            <Image 
              // Logo dan ukuran disamakan dengan halaman checkout
              src="/LOGO STYLISH.svg" // <-- LOGO DIPERBARUI
              alt="Stylish Type Logo"
              width={160}
              height={40}
              priority
            />
          </Link>
        </div>
        <div className="flex items-center gap-8">
          <Link href="/contact" className="text-sm font-medium text-brand-light-muted transition-colors hover:text-brand-accent">
            Contact Us
          </Link>
          <Link href="/" className="px-5 py-2.5 font-medium rounded-full text-center text-sm bg-brand-accent text-brand-darkest transition-all duration-300 ease-in-out transform hover:shadow-lg hover:shadow-brand-accent/40">
            Back to Stylish Type
          </Link>
        </div>
      </div>
    </header>
  );
};

export default AuthNavbar;