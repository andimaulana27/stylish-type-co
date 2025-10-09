// tailwind.config.ts
import type { Config } from 'tailwindcss'
import radixPlugin from 'tailwindcss-radix';
import typography from '@tailwindcss/typography';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      colors: {
        'brand-darkest': '#121212',
        'brand-dark-secondary': '#171717',
        'brand-gray-light': '#2A2A2A',
        'brand-light': '#FFFFFF',
        'brand-light-muted': '#A0A0A0',
        'brand-primary-orange': '#CD9A51',
        'brand-primary-blue': '#3b4083',
        'brand-secondary-gold': '#d9ab5d',
        'brand-secondary-red': '#c7313c',
        'brand-secondary-purple': '#533b83',
        'brand-secondary-green': '#5c9471',
        'brand-accent': '#CD9A51',
      },
      fontFamily: {
        poppins: ['var(--font-poppins)', 'sans-serif'],
        luxurious: ['var(--font-luxurious-script)', 'cursive'],
        // --- PERBAIKAN KRUSIAL DI SINI ---
        // Menggunakan variabel CSS dari next/font/local
        hero: ['var(--font-mistur-sleuth)', 'serif'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        // --- ANIMASI BARU DITAMBAHKAN ---
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse': {
          '50%': { opacity: '.5' },
        },
        // --- AKHIR PENAMBAHAN ---
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out forwards',
        // --- KELAS ANIMASI BARU DITAMBAHKAN ---
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        // --- VARIASI KECEPATAN MARQUEE BARU ---
        'marquee-very-fast': 'marquee 80s linear infinite',
        'marquee-reverse-very-fast': 'marquee-reverse 80s linear infinite',
        'marquee-fast': 'marquee 120s linear infinite',
        'marquee-reverse-fast': 'marquee-reverse 180s linear infinite',
        'marquee-slow': 'marquee 120s linear infinite',
        'marquee-medium': 'marquee 180s linear infinite',
      },
    },
  },
  plugins: [
    radixPlugin({}),
    typography,
  ],
}
export default config;