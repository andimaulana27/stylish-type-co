// src/components/blog/BlogCarousel.tsx
'use client';

import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import BlogCard from '@/components/blog/BlogCard'; 
import type { CardPost } from '@/components/blog/BlogCard'; 
import SectionHeader from '@/components/SectionHeader';
import Button from '@/components/Button';

type BlogCarouselProps = {
  posts: CardPost[];
  title: string;
  subtitle: string;
};

const BlogCarousel = ({ posts, title, subtitle }: BlogCarouselProps) => {
  const [emblaRef] = useEmblaCarousel(
    { 
      loop: true, 
      align: 'start',
      slidesToScroll: 2, // Diubah menjadi 2 agar lebih konsisten dengan tampilan mobile
    },
    [Autoplay({ delay: 5000, stopOnInteraction: true })] 
  );

  return (
    <section className="border-t border-white/10">
      <div className="container mx-auto px-6 py-20">
        <SectionHeader
          align="center"
          title={title}
          subtitle={subtitle}
        />
        
        {posts.length <= 4 ? (
          // --- PERUBAHAN DI SINI ---
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 mt-12">
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <div className="overflow-hidden mt-12" ref={emblaRef}>
            <div className="flex -ml-4">
              {posts.map((post) => (
                // --- PERUBAHAN DI SINI ---
                <div key={post.slug} className="flex-grow-0 flex-shrink-0 basis-1/2 sm:basis-1/2 lg:basis-1/4 pl-4">
                  <BlogCard post={post} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center mt-16">
          <Button href="/blog">
            View All Blog
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BlogCarousel;