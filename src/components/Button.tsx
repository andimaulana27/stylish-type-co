// src/components/Button.tsx
import Link from 'next/link';
import { AnchorHTMLAttributes } from 'react';

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'outline';
} & AnchorHTMLAttributes<HTMLAnchorElement>;

const Button = ({ href, children, className = '', variant = 'primary', ...props }: ButtonProps) => {
  // --- PERUBAHAN UTAMA DI SINI ---
  // Menambahkan 'inline-flex items-center justify-center' untuk perataan teks yang sempurna
  // dan menghapus 'text-center' yang menjadi redundan.
  const baseClasses = 
    `inline-flex items-center justify-center px-8 py-3 font-medium rounded-full
     transition-all duration-300 ease-in-out transform`;

  const variantClasses = {
    primary: 'bg-brand-primary-orange text-brand-darkest hover:shadow-lg hover:shadow-brand-primary-orange/40',
    outline: 'bg-transparent border-2 border-brand-primary-orange text-brand-light hover:bg-brand-primary-orange/10 hover:shadow-lg hover:shadow-brand-primary-orange/40',
  };

  return (
    <Link href={href} className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </Link>
  );
};

export default Button;