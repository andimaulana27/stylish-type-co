// src/components/BlogMegaMenu.tsx
import Link from 'next/link';
import Image from 'next/image';
import { getPostsForMegaMenuAction } from '@/app/actions/blogActions';
import {
  LayoutGrid, BookOpen, Lightbulb, Brush, Building2, Users, MessageSquare, Laptop, Coffee, PiggyBank, Calendar, Eye
} from 'lucide-react';
import { type Tables } from '@/lib/database.types';
import { format } from 'date-fns';

type Post = Tables<'posts'>;

const blogCategories = [
  { name: 'All Posts', IconComponent: LayoutGrid, href: "/blog" },
  { name: 'Tutorial', IconComponent: BookOpen, href: "/blog?category=Tutorial" },
  { name: 'Inspiration', IconComponent: Lightbulb, href: "/blog?category=Inspiration" },
  { name: 'Branding', IconComponent: Brush, href: "/blog?category=Branding" },
  { name: 'Business', IconComponent: Building2, href: "/blog?category=Business" },
  { name: 'Freelancing', IconComponent: Users, href: "/blog?category=Freelancing" },
  { name: 'Quotes', IconComponent: MessageSquare, href: "/blog?category=Quotes" },
  { name: 'Technology', IconComponent: Laptop, href: "/blog?category=Technology" },
  { name: 'Lifestyle', IconComponent: Coffee, href: "/blog?category=Lifestyle" },
  { name: 'Finance', IconComponent: PiggyBank, href: "/blog?category=Finance" },
];

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
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${colorClasses}`}>
            {category}
        </span>
    );
};

const BlogMegaMenu = async () => {
  const { newPosts, popularPosts, error } = await getPostsForMegaMenuAction();

  if (error) {
    console.error("Failed to fetch posts for mega menu:", error);
  }

  const MegaMenuPostCard = ({ post }: { post: Post }) => {
    const readTime = Math.ceil((post.content?.split(' ').length || 0) / 200);

    return (
        // --- PERBAIKAN DI SINI ---
        <Link href={`/blog/${post.slug}`} key={post.id} className="flex items-start gap-4 group/item p-3 -m-3 rounded-lg hover:bg-white/5 transition-all duration-200" prefetch={true}>
          <div className="flex-shrink-0">
            <Image
              src={post.image_url || '/images/dummy/placeholder.jpg'}
              alt={post.title}
              width={140}
              height={100}
              className="rounded-md bg-brand-gray-light object-cover aspect-[3/2] transition-transform duration-300 group-hover/item:scale-105"
            />
          </div>
          <div className="flex-1 min-w-0 flex flex-col h-full">
            <div className="mb-2">
                <CategoryLabel category={post.category || 'Uncategorized'} />
            </div>
            <h4 className="font-semibold text-brand-light group-hover/item:text-brand-accent transition-colors duration-200 text-base leading-tight">{post.title}</h4>
            <div className="flex-grow"></div>
            <div className="flex items-center gap-3 mt-2 text-xs text-brand-light-muted">
                <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    <span>{format(new Date(post.created_at), 'dd MMM yyyy')}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Eye size={12} />
                    <span>{readTime} min read</span>
                </div>
            </div>
          </div>
        </Link>
    );
  };
  
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 w-screen bg-[#1e1e1e] shadow-2xl opacity-0 invisible transform -translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto z-40">
      <div className="container mx-auto px-6 py-12 grid grid-cols-12 gap-x-8">
        
        <div className="col-span-3">
            <h3 className="text-xs font-medium text-brand-light-muted tracking-widest mb-6">CATEGORIES</h3>
            <ul className="grid grid-cols-2 gap-x-8 gap-y-4">
                {blogCategories.map(({ name, IconComponent, href }) => (
                    <li key={name}>
                        {/* --- PERBAIKAN DI SINI --- */}
                        <Link href={href} className="flex items-center gap-3 text-brand-light hover:text-brand-accent transition-colors duration-200 group/cat" prefetch={true}>
                            <IconComponent className="w-5 h-5 text-brand-accent/60 group-hover/cat:text-brand-accent transition-colors" />
                            <span>{name}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>

        <div className="col-span-4 border-l border-r border-brand-gray-light/50 px-8">
          <h3 className="text-xs font-medium text-brand-light-muted tracking-widest mb-6">POPULAR POSTS</h3>
          <div className="space-y-4">
            {(popularPosts || []).map(post => <MegaMenuPostCard key={`popular-${post.id}`} post={post} />)}
          </div>
        </div>
        
        <div className="col-span-5 pl-8">
          <h3 className="text-xs font-medium text-brand-light-muted tracking-widest mb-6">NEW POSTS</h3>
          <div className="space-y-4">
            {(newPosts || []).map(post => <MegaMenuPostCard key={`new-${post.id}`} post={post} />)}
          </div>
        </div>

      </div>
    </div>
  );
};

export default BlogMegaMenu;