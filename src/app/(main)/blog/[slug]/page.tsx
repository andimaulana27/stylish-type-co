// src/app/(main)/blog/[slug]/page.tsx
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Calendar, Clock, User } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import type { Metadata, ResolvingMetadata } from 'next';

import BackToTopButton from "@/components/BackToTopButton";
import AdSlotCard from '@/components/blog/AdSlotCard';
import TableOfContents from '@/components/blog/TableOfContents';
import ShareButtons from '@/components/blog/ShareButtons';
import RelatedPostsSection from '@/components/blog/RelatedPostsSection';
import RelatedTags from '@/components/font-detail/RelatedTags';
import AdDisplay from '@/components/blog/AdDisplay';
import { getBlogAdsConfigAction, AdSlotConfig } from '@/app/actions/blogActions';
import BlogStyles from '@/components/blog/BlogStyles'; 
import { Tables } from '@/lib/database.types';

export async function generateMetadata(
  { params }: { params: { slug: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = params;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  try {
    const res = await fetch(`${baseUrl}/api/blog/${slug}`);
    if (!res.ok) return { title: 'Post Not Found' };
    const { post } = await res.json();
    
    const previousImages = (await parent).openGraph?.images || [];
    const postImage = post.image_url || '/og-image.png';

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        name: post.title,
        description: post.excerpt || 'Read this article on Stylish Type Blog.',
        image: postImage,
        datePublished: new Date(post.created_at).toISOString(),
        dateModified: new Date(post.updated_at).toISOString(),
        author: {
          '@type': 'Person',
          name: post.author_name || 'Stylish Type',
        },
        publisher: {
          '@type': 'Organization',
          name: 'Stylish Type',
          logo: {
            '@type': 'ImageObject',
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/logo-stylishtype-footer.png`,
          },
        },
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${slug}`,
    };
    
    return {
      title: post.title,
      description: post.excerpt || 'Read this article on Stylish Type Blog.',
      keywords: post.tags || [],
      alternates: { canonical: `/blog/${slug}` },
      openGraph: {
        title: `${post.title} | Stylish Type Blog`,
        description: post.excerpt || '',
        images: [postImage, ...previousImages],
        url: `/blog/${slug}`,
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${post.title} | Stylish Type Blog`,
        description: post.excerpt || '',
        images: [postImage],
      },
      other: { 'script[type="application/ld+json"]': JSON.stringify(jsonLd) },
    };
  } catch(e) {
    return { title: 'Post Not Found' };
  }
}

export const revalidate = 3600;

const categoryColors: { [key: string]: string } = {
  'Tutorial': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'Inspiration': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'Branding': 'bg-green-500/20 text-green-300 border-green-500/30',
  'Business': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  'Freelancing': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  'Quotes': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  'Technology': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  'Lifestyle': 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  'Finance': 'bg-lime-500/20 text-lime-300 border-lime-500/30',
  'Branding & Business': 'bg-green-500/20 text-green-300 border-green-500/30',
  'default': 'bg-gray-500/20 text-gray-300 border-gray-500/30',
};

const CategoryLabel = ({ category }: { category: string }) => {
    const colorClasses = categoryColors[category] || categoryColors['default'];
    return (
        <Link href={`/blog?category=${category}`} className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors hover:brightness-125 ${colorClasses}`}>
            {category}
        </Link>
    );
};

const parseAndInjectAds = (
  html: string,
  adComponents: { in_article_1: React.ReactNode; in_article_2: React.ReactNode }
) => {
  const headings: { id: string; title: string; level: number }[] = [];
  const contentParts: (string | React.ReactNode)[] = [];

  const processedHtml = html.replace(/<h([2-3])>(.*?)<\/h\1>/g, (match, levelStr, titleHtml) => {
    const level = parseInt(levelStr, 10);
    const title = titleHtml.replace(/<[^>]*>?/gm, '');
    const id = title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
    headings.push({ id, title, level });
    return `<h${level} id="${id}">${titleHtml}</h${level}>`;
  });

  const paragraphs = processedHtml.split('</p>');
  paragraphs.forEach((p, index) => {
    if (p.trim()) {
      contentParts.push(<div key={`p-${index}`} dangerouslySetInnerHTML={{ __html: p + '</p>' }} />);
    }

    if (index === 2) {
      contentParts.push(<div key="ad-1" className="my-8">{adComponents.in_article_1}</div>);
    }
    
    if (index === Math.floor(paragraphs.length / 2)) {
      contentParts.push(<div key="ad-2" className="my-8">{adComponents.in_article_2}</div>);
    }
  });

  return { headings, processedContent: contentParts };
};

async function getBlogPageData(slug: string) {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    try {
        const res = await fetch(`${baseUrl}/api/blog/${slug}`, { next: { revalidate: 3600 } });
        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        console.error("Error fetching blog page data:", error);
        return null;
    }
}


export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const [pageData, adConfigRes] = await Promise.all([
      getBlogPageData(params.slug),
      getBlogAdsConfigAction()
  ]);

  if (!pageData) {
    notFound();
  }

  const { post, relatedPosts } = pageData;

  const { config: adConfigData } = adConfigRes;
  const adConfigs = new Map((adConfigData || []).map(c => [c.position, c as AdSlotConfig]));
  const readTime = Math.ceil((post.content?.split(' ').length || 0) / 200);

  const AdComponent = ({ position, fallback }: { position: string, fallback?: React.ReactNode }) => (
    <AdDisplay config={adConfigs.get(position)} fallback={fallback} />
  );

  const { headings, processedContent } = parseAndInjectAds(post.content || '', {
    in_article_1: <AdComponent position='in_article_1' />,
    in_article_2: <AdComponent position='in_article_2' />
  });
  
  return (
    <div className="bg-brand-dark-secondary">
      <BlogStyles />
      <main>
        <div className="mx-auto max-w-screen-2xl px-4 py-24">
          <div className="grid grid-cols-12 gap-x-8">
            <aside className="hidden xl:block col-span-2">
              <div className="sticky top-28 max-h-[calc(100vh-8rem)]">
                  <AdComponent position='left' />
              </div>
            </aside>

            <article className="col-span-12 xl:col-span-8">
                <header className="mb-12">
                  <h1 className="text-4xl md:text-5xl font-extrabold text-brand-light leading-tight text-left mb-6">
                      {post.title}
                  </h1>
                  <div className="flex items-center gap-4 mb-6">
                      <CategoryLabel category={post.category || 'Uncategorized'} />
                  </div>
                  <div className="flex items-center flex-wrap gap-x-6 gap-y-2 text-sm text-brand-light-muted border-t border-b border-white/10 py-4">
                      <div className="flex items-center gap-2"><User size={16} className="text-brand-accent" /><span>{post.author_name || 'Anonymous'}</span></div>
                      <div className="flex items-center gap-2"><Calendar size={16} className="text-brand-accent" /><span>{new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
                      <div className="flex items-center gap-2"><Clock size={16} className="text-brand-accent" /><span>{readTime} min read</span></div>
                  </div>
                </header>
                
                <AdComponent position='top' fallback={<AdSlotCard />} />
                
                <div className="relative w-full aspect-[3/2] rounded-2xl overflow-hidden shadow-lg mt-12">
                    <Image src={post.image_url || '/images/dummy/placeholder.jpg'} alt={post.title} fill className="object-cover" priority />
                </div>
                
                <div className="prose prose-invert prose-lg max-w-none mx-auto text-brand-light-muted font-light leading-relaxed mt-12">
                    <p className="text-xl leading-relaxed text-white/90">{post.excerpt}</p>
                </div>
                
                {post.show_toc && headings.length > 0 && <TableOfContents headings={headings} />}
                
                <div className="prose prose-lg prose-invert max-w-none mx-auto">
                  {processedContent}
                </div>
                
                <div className="mt-12"><RelatedTags mainTitle="Tags" hideSubtitles={true} styleTags={post.tags || []} purposeTags={[]} basePath="/blog" /></div>
                <ShareButtons url={`/blog/${post.slug}`} title={post.title} />
                <div className="mt-12"><AdComponent position='bottom' fallback={<AdSlotCard />} /></div>
            </article>

            <aside className="hidden xl:block col-span-2">
                <div className="sticky top-28 max-h-[calc(100vh-8rem)]">
                    <AdComponent position='right' />
                </div>
            </aside>
          </div>
        </div>
      </main>
      
      <RelatedPostsSection currentPostId={post.id} category={post.category || ''} initialRelatedPosts={relatedPosts as Tables<'posts'>[]} />
      <BackToTopButton />
    </div>
  );
}