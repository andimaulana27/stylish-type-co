// src/app/(main)/about/page.tsx
import type { Metadata } from 'next';
import Image from 'next/image';
import Button from '@/components/Button';
import BackToTopButton from "@/components/BackToTopButton";
import TrustedBySection from "@/components/TrustedBySection";
// --- PERUBAHAN DI SINI: Impor yang dibutuhkan untuk mengambil data ---
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';

export const metadata: Metadata = {
  title: 'About Us | Stylish Type',
  description: 'Learn about Stylish Type, your premier destination for fonts that seamlessly blend retro charm, classy sophistication, and modern innovation.',
};

export const revalidate = 3600; // Revalidate setiap 1 jam

const AboutHeroSection = () => (
  <section className="bg-brand-dark-secondary pt-24 pb-16">
    <div className="container mx-auto px-6">
      <div className="flex flex-col items-center text-center gap-12">
        <div className="w-full">
          <h1 className="text-4xl md:text-5xl font-bold text-brand-light leading-snug">
            <span className="text-brand-accent">Stylish</span> Typography <br />
            for <span className="text-brand-accent">Stylish</span> Company.
          </h1>
          <div className="w-40 h-1 bg-brand-accent mt-6 rounded-full mx-auto"></div>
        </div>
      </div>
    </div>
  </section>
);

const AboutContentSection = () => (
  <section className="container mx-auto px-6 pb-24">
    <h2 className="sr-only">About Stylish Type</h2>
    <div className="text-justify space-y-7 text-brand-light-muted font-medium text-lg leading-relaxed">
      <p>
        Welcome to <strong className="text-brand-accent font-semibold">Stylishtype.co</strong>, your premier destination for fonts that seamlessly blend retro charm, classy sophistication, modern innovation, luxurious details, and timeless elegance. Our studio is dedicated to crafting typefaces that not only capture the essence of classic design but also push the boundaries of contemporary aesthetics.
      </p>
      <p>
        At <strong className="text-brand-accent font-semibold">Stylishtype.co</strong>, we believe that typography is an art form that transcends time. Each of our fonts is meticulously designed to evoke a sense of nostalgia while remaining relevant in today’s fast-paced, design-driven world. Our Retro Revival Collection breathes new life into vintage styles, offering a fresh take on the beloved aesthetics of the past. Whether you’re looking to create a nostalgic brand identity or design a retro-inspired poster, our typefaces provide the perfect balance of old and new.
      </p>
      <p>
        Our Classy Classics Suite is designed for those who seek sophistication in every detail. These typefaces are perfect for upscale branding, elegant publications, and refined packaging, delivering an air of grace and distinction to any project. Each font in this collection is a testament to timeless beauty, offering refined curves and elegant lines that never go out of style.
      </p>
      <p>
        Experience the epitome of luxury with our Luxury Legacy Collection. These opulent typefaces are crafted to exude grandeur and prestige, making them perfect for high-end product packaging, exclusive event invitations, and luxurious brand identities. Each font in this collection is a symbol of refined elegance, ensuring your designs stand out with a touch of class.
      </p>
      <p>
        At <strong className="text-brand-accent font-semibold">Stylishtype.co</strong>, we also offer the Elegant Essentials Series, a versatile collection designed to add refinement to your everyday projects. From professional presentations to corporate branding, these fonts provide the perfect blend of functionality and elegance.
      </p>
      <p>
        Discover the world of timeless typography with <strong className="text-brand-accent font-semibold">Stylishtype.co</strong>. Our commitment to quality and design excellence ensures that every font we create not only meets but exceeds your expectations. Let our fonts elevate your projects with a unique blend of retro charm, classy sophistication, modern innovation, luxurious details, and timeless elegance.
      </p>
    </div>
    <div className="mt-20 text-center">
      <div className="flex justify-center mb-8">
        <Image
          src="/logo-stylishtype-footer.png"
          alt="Stylish Type Logo"
          width={400}
          height={100}
        />
      </div>
      <Button href="/product">
        Explore The Collection
      </Button>
    </div>
  </section>
);

// --- PERUBAHAN DI SINI: Mengubah fungsi menjadi async dan mengambil data ---
export default async function AboutPage() {
  const cookieStore = cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
      },
    }
  );

  const { data: brands } = await supabase
    .from('brands')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="bg-brand-dark-secondary">
      <main>
        <AboutHeroSection />
        <AboutContentSection />
        {/* --- PERUBAHAN DI SINI: Memberikan prop 'brands' --- */}
        <TrustedBySection brands={brands || []} />
      </main>
      <BackToTopButton />
    </div>
  );
}