// src/components/blog/ShareButtons.tsx
'use client';

import LinkedinIcon from '@/components/icons/footer/LinkedinIcon';
import FacebookIcon from '@/components/icons/footer/FacebookIcon';
import InstagramIcon from '@/components/icons/footer/InstagramIcon';
import TwitterIcon from '@/components/icons/social/TwitterIcon';
import PinterestIcon from '@/components/icons/social/PinterestIcon';
import WhatsappIcon from '@/components/icons/social/WhatsappIcon';
import RedditIcon from '@/components/icons/social/RedditIcon';
import ThreadsIcon from '@/components/icons/social/ThreadsIcon';
import TelegramIcon from '@/components/icons/social/TelegramIcon';

type ShareButtonsProps = {
  url: string;
  title: string;
};

const socialLinks = [
  { name: 'LinkedIn', Icon: LinkedinIcon, href: (url: string, title: string) => `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}` },
  { name: 'Facebook', Icon: FacebookIcon, href: (url: string) => `https://www.facebook.com/sharer/sharer.php?u=${url}` },
  { name: 'X (Twitter)', Icon: TwitterIcon, href: (url: string, title: string) => `https://twitter.com/intent/tweet?url=${url}&text=${title}` },
  { name: 'Pinterest', Icon: PinterestIcon, href: (url: string, title: string) => `https://pinterest.com/pin/create/button/?url=${url}&description=${title}` },
  { name: 'WhatsApp', Icon: WhatsappIcon, href: (url: string, title: string) => `https://api.whatsapp.com/send?text=${title} ${url}` },
  { name: 'Reddit', Icon: RedditIcon, href: (url: string, title: string) => `https://www.reddit.com/submit?url=${url}&title=${title}` },
  { name: 'Telegram', Icon: TelegramIcon, href: (url: string, title: string) => `https://t.me/share/url?url=${url}&text=${title}`},
  { name: 'Instagram', Icon: InstagramIcon, href: () => `https://www.instagram.com/` },
  { name: 'Threads', Icon: ThreadsIcon, href: (url: string, title: string) => `https://www.threads.net/intent/post?text=${title} ${url}` },
];

const ShareButtons = ({ url, title }: ShareButtonsProps) => {
  const fullUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${url}` 
    : `https://timelesstype.co${url}`;

  return (
    <div className="mt-12 pt-8 border-t border-white/10">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-brand-light">Share This Post</h3>
        {/* --- PERUBAHAN WARNA GARIS --- */}
        <div className="w-20 h-1 bg-brand-accent mx-auto my-4 rounded-full"></div>
      </div>
      <div className="flex justify-center items-center flex-wrap gap-4 mt-6">
        {socialLinks.map(({ name, Icon, href }) => (
          <a
            key={name}
            href={href(fullUrl, title)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Share on ${name}`}
            // --- PERUBAHAN GAYA TOMBOL ---
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-brand-light-muted hover:bg-brand-accent hover:text-brand-darkest hover:border-brand-accent transition-all duration-300 transform hover:scale-110"
          >
            <Icon className="h-6 w-6" />
          </a>
        ))}
      </div>
    </div>
  );
};

export default ShareButtons;