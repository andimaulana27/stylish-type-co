// src/components/blog/BlogCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Eye } from 'lucide-react';
import { format } from 'date-fns';

export type CardPost = {
  slug: string;
  imageUrl: string;
  category: string;
  title: string;
  author: string;
  date: string;
  comments: number;
  views: number;
  readTime: number;
};

type BlogCardProps = {
  post: CardPost;
};

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
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${colorClasses}`}>
            {category}
        </span>
    );
};

const BlogCard = ({ post }: BlogCardProps) => {
  return (
    <div className="group/card flex flex-col">
      <div className="relative w-full aspect-[3/2] overflow-hidden rounded-lg">
        <Link href={`/blog/${post.slug}`}>
          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            // --- PERBAIKAN: Mengoptimalkan 'sizes' prop ---
            sizes="(max-width: 1024px) 50vw, 25vw"
            // --- AKHIR PERBAIKAN ---
            className="object-cover transition-transform duration-500 ease-in-out group-hover/card:scale-105"
          />
        </Link>
      </div>
      <div className="pt-5 flex flex-col flex-grow">
        
        <div className="mb-3">
            <CategoryLabel category={post.category} />
        </div>

        <h3 className="font-semibold text-lg md:text-xl text-brand-light leading-snug transition-colors duration-300 group-hover/card:text-brand-accent">
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h3>

        <p className="text-sm text-brand-light-muted mt-2">
          by <span className="font-medium text-brand-light">{post.author}</span>
        </p>
        
        <div className="flex-grow"></div>
        
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10 text-xs text-brand-light-muted">
          <div className="flex items-center gap-1.5">
            <Calendar size={14} />
            <span>{format(new Date(post.date), 'dd MMM yyyy')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Eye size={14} />
            <span>{post.readTime} min read</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;