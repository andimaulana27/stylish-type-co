// src/lib/dummy-data.ts
export type ProductData = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  price: number;
  originalPrice?: number; // Properti baru untuk harga asli
  description: string;
  type: 'font' | 'bundle'; // Properti baru untuk membedakan produk
  discount?: string;
  staffPick?: boolean;
};

export type ContentBlock = 
  | { type: 'heading'; level: 2 | 3; id: string; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'image'; src: string; alt: string }
  | { type: 'blockquote'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'ad-slot' };

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  imageUrl: string;
  category: 'Tutorial' | 'Inspiration' | 'Branding' | 'Business' | 'Freelancing' | 'Quotes' | 'Technology' | 'Lifestyle' | 'Finance';
  date: string; 
  author: string;
  comments: number;
  views: number;
  readTime: number; 
  leadParagraph: string;
  content: ContentBlock[];
};

export const allBlogPosts: BlogPost[] = [
  // ... (data blog tidak berubah, tetap sama)
  { 
    id: '1', 
    slug: 'how-to-use-opentype-features', 
    title: 'How to Use OpenType Features In Any Software', 
    imageUrl: '/images/gallery/in-use-7.jpg', 
    category: 'Tutorial', 
    date: '2025-09-08', 
    author: 'Jane Doe', 
    comments: 314, 
    views: 12500,
    readTime: 5,
    leadParagraph: 'OpenType is a powerful font format that offers advanced typographic features, but many designers don\'t know how to unlock its full potential. This guide will show you how.',
    content: [
      { type: 'paragraph', text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet.' },
      { type: 'heading', level: 2, id: 'understanding-glyphs', text: 'Understanding Glyphs and Alternates' },
    ]
  },
  { 
    id: '2', 
    slug: '30-websites-for-typography-ideas', 
    title: '30 Websites to Discover Inspiring Typography Ideas', 
    imageUrl: '/images/gallery/in-use-2.jpg', 
    category: 'Inspiration', 
    date: '2025-09-05', 
    author: 'John Smith', 
    comments: 250, 
    views: 18200,
    readTime: 7,
    leadParagraph: 'Finding fresh typography inspiration is key to staying creative. Here are 30 incredible websites that will spark your next design idea.',
    content: [
      { type: 'paragraph', text: 'Praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.' },
    ]
  },
  { 
    id: '3', 
    slug: 'comprehensive-guide-to-fonts', 
    title: 'A Comprehensive Guide to Font Types', 
    imageUrl: '/images/gallery/in-use-8.jpg', 
    category: 'Branding', 
    date: '2025-09-01', 
    author: 'Alex Johnson', 
    comments: 412, 
    views: 25000,
    readTime: 8,
    leadParagraph: 'Serif, Sans-Serif, Script, Blackletter. Understanding the different classifications of fonts is fundamental for any designer.',
    content: [
      { type: 'paragraph', text: 'Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus.' },
    ]
  },
  { 
    id: '4', 
    slug: 'font-pairing-tips-for-beginners', 
    title: 'Font Pairing Tips for Beginners', 
    imageUrl: '/images/gallery/in-use-6.jpg', 
    category: 'Tutorial', 
    date: '2025-08-28', 
    author: 'Jane Doe', 
    comments: 198, 
    views: 9800,
    readTime: 4,
    leadParagraph: 'Pairing fonts can be tricky. This article breaks down the basic principles to help you create beautiful and harmonious typographic combinations.',
    content: [
      { type: 'paragraph', text: 'Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.' },
    ]
  },
  { 
    id: '5', 
    slug: 'the-psychology-of-color-in-typography', 
    title: 'The Psychology of Color in Typography', 
    imageUrl: '/images/gallery/in-use-10.jpg', 
    category: 'Inspiration', 
    date: '2025-08-15', 
    author: 'Emily White', 
    comments: 503, 
    views: 22300,
    readTime: 6,
    leadParagraph: 'Color and type are two of the most powerful tools in a designer\'s arsenal. Learn how they work together to influence emotion and perception.',
    content: [
      { type: 'paragraph', text: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.' },
    ]
  },
  { 
    id: '6', 
    slug: 'freelancing-101-finding-clients', 
    title: 'Freelancing 101: How to Find Your First Clients', 
    imageUrl: '/images/gallery/in-use-9.jpg', 
    category: 'Freelancing', 
    date: '2025-08-10', 
    author: 'John Smith', 
    comments: 155, 
    views: 8500,
    readTime: 7,
    leadParagraph: 'Stepping into the world of freelancing can be daunting. This guide provides actionable steps to find and secure your first paying clients.',
    content: [
      { type: 'paragraph', text: 'Finding clients is the lifeblood of any freelance career. We will explore various methods, from online platforms to local networking, to help you get started.' },
    ]
  },
  { 
    id: '7', 
    slug: 'typography-in-ui-design', 
    title: 'The Role of Typography in Modern UI Design', 
    imageUrl: '/images/gallery/in-use-3.jpg', 
    category: 'Technology', 
    date: '2025-08-05', 
    author: 'Alex Johnson', 
    comments: 289, 
    views: 17300,
    readTime: 6,
    leadParagraph: 'Typography is more than just readable text; it is a critical component of user interface design that can significantly impact user experience.',
    content: [
      { type: 'paragraph', text: 'In this article, we delve into how font choices, hierarchy, and spacing contribute to creating intuitive and aesthetically pleasing digital products.' },
    ]
  },
  { 
    id: '8', 
    slug: 'balancing-work-and-life', 
    title: 'A Designer\'s Guide to Balancing Work and Life', 
    imageUrl: '/images/gallery/in-use-1.jpg', 
    category: 'Lifestyle', 
    date: '2025-07-29', 
    author: 'Jane Doe', 
    comments: 120, 
    views: 6400,
    readTime: 5,
    leadParagraph: 'Creative burnout is real. Discover practical tips and strategies to maintain a healthy work-life balance while staying passionate about your design work.',
    content: [
      { type: 'paragraph', text: 'From setting boundaries to finding inspiration outside of work, we cover essential habits for a sustainable and fulfilling creative life.' },
    ]
  },
  { 
    id: '9', 
    slug: 'famous-design-quotes', 
    title: '20 Inspiring Quotes from Famous Designers', 
    imageUrl: '/images/gallery/in-use-11.jpg', 
    category: 'Quotes', 
    date: '2025-07-22', 
    author: 'Emily White', 
    comments: 450, 
    views: 29800,
    readTime: 4,
    leadParagraph: 'Feeling stuck? Sometimes, a few words of wisdom from the greats are all you need. Here are 20 quotes to reignite your creative spark.',
    content: [
      { type: 'blockquote', text: '"Design is not just what it looks like and feels like. Design is how it works." - Steve Jobs' },
    ]
  },
  {
    id: '10',
    slug: 'kerning-and-tracking-mastery',
    title: 'Kerning and Tracking Mastery: A Tutorial',
    imageUrl: '/images/gallery/in-use-12.jpg',
    category: 'Tutorial',
    date: '2025-07-20',
    author: 'Jane Doe',
    comments: 180,
    views: 9200,
    readTime: 6,
    leadParagraph: 'Kerning and tracking are subtle but powerful aspects of typography. This tutorial will teach you how to master them for professional-looking text.',
    content: [{ type: 'paragraph', text: 'We will cover the differences between them and show you shortcuts in popular design software.' }],
  },
  {
    id: '11',
    slug: 'vintage-poster-inspiration',
    title: '25 Stunning Vintage Posters for Creative Inspiration',
    imageUrl: '/images/gallery/in-use-5.jpg',
    category: 'Inspiration',
    date: '2025-07-18',
    author: 'John Smith',
    comments: 310,
    views: 19500,
    readTime: 5,
    leadParagraph: 'Take a trip back in time with this collection of beautiful vintage posters. Analyze what makes their typography and layout so timeless.',
    content: [{ type: 'paragraph', text: 'From Art Nouveau to mid-century modern, these examples are packed with ideas for your next project.' }],
  },
  {
    id: '12',
    slug: 'choosing-font-for-brand',
    title: 'How to Choose the Right Font for Your Brand',
    imageUrl: '/images/gallery/in-use-4.jpg',
    category: 'Branding',
    date: '2025-07-15',
    author: 'Alex Johnson',
    comments: 290,
    views: 15000,
    readTime: 7,
    leadParagraph: 'A font is the voice of your brand. Learn the strategic process behind selecting a typeface that communicates your brand\'s personality effectively.',
    content: [{ type: 'paragraph', text: 'We discuss font psychology, target audience, and creating a cohesive typographic system.' }],
  },
  {
    id: '13',
    slug: 'advanced-css-font-techniques',
    title: 'Advanced CSS Techniques for Web Fonts',
    imageUrl: '/images/gallery/in-use-7.jpg',
    category: 'Tutorial',
    date: '2025-07-12',
    author: 'Jane Doe',
    comments: 215,
    views: 11500,
    readTime: 8,
    leadParagraph: 'Go beyond `@font-face`. This tutorial explores variable fonts, `font-feature-settings`, and performance optimization for a superior web typography experience.',
    content: [{ type: 'paragraph', text: 'Unlock the full power of modern web fonts with these advanced CSS properties and techniques.' }],
  },
  {
    id: '14',
    slug: 'creating-a-font-in-illustrator',
    title: 'Tutorial: How to Create Your First Font in Illustrator',
    imageUrl: '/images/gallery/in-use-8.jpg',
    category: 'Tutorial',
    date: '2025-07-10',
    author: 'Jane Doe',
    comments: 450,
    views: 22000,
    readTime: 10,
    leadParagraph: 'Ever wanted to create your own font? This step-by-step guide will walk you through the process of designing letterforms in Adobe Illustrator and turning them into a usable font file.',
    content: [{ type: 'paragraph', text: 'From basic vector shapes to exporting your work, we cover all the essentials.' }],
  },
  {
    id: '15',
    slug: 'typography-in-logo-design',
    title: 'The Ultimate Guide to Typography in Logo Design',
    imageUrl: '/images/gallery/in-use-6.jpg',
    category: 'Tutorial',
    date: '2025-07-08',
    author: 'Alex Johnson',
    comments: 320,
    views: 18000,
    readTime: 9,
    leadParagraph: 'A logo is often 90% typography. This guide explores how to choose, customize, and arrange type to create memorable and effective logos.',
    content: [{ type: 'paragraph', text: 'Learn from successful examples and common pitfalls in logotype design.' }],
  },
    {
    id: '16',
    slug: 'minimalist-design-inspiration',
    title: 'The Beauty of Minimalism: 20 Inspiring Designs',
    imageUrl: '/images/gallery/in-use-2.jpg',
    category: 'Inspiration',
    date: '2025-07-05',
    author: 'Emily White',
    comments: 280,
    views: 16000,
    readTime: 5,
    leadParagraph: 'Less is more. Explore this curated collection of minimalist designs that showcase the power of simplicity, whitespace, and clean typography.',
    content: [{ type: 'paragraph', text: 'Discover how minimalism can create a strong and lasting impact in branding and web design.' }],
  },
  {
    id: '17',
    slug: 'designing-accessible-typography',
    title: 'A Practical Tutorial on Designing Accessible Typography',
    imageUrl: '/images/gallery/in-use-10.jpg',
    category: 'Tutorial',
    date: '2025-07-01',
    author: 'Alex Johnson',
    comments: 150,
    views: 8900,
    readTime: 7,
    leadParagraph: 'Good design is accessible design. This tutorial provides practical tips on color contrast, font sizing, and line length to ensure your text is readable for everyone.',
    content: [{ type: 'paragraph', text: 'Learn about WCAG guidelines and tools you can use to test your designs for accessibility.' }],
  },
  {
    id: '18',
    slug: 'starting-a-design-business',
    title: '5 Steps to Starting Your Own Design Business',
    imageUrl: '/images/gallery/in-use-9.jpg',
    category: 'Business',
    date: '2025-06-28',
    author: 'John Smith',
    comments: 210,
    views: 11000,
    readTime: 8,
    leadParagraph: 'Turning your design passion into a business is a big step. This guide covers the essential business aspects, from legal setup to marketing.',
    content: [{ type: 'paragraph', text: 'We will break down the complexities of creating a business plan, setting your rates, and managing your finances as a creative entrepreneur.' }],
  },
  {
    id: '19',
    slug: 'managing-finances-for-creatives',
    title: 'A Creative\'s Guide to Managing Finances',
    imageUrl: '/images/gallery/in-use-1.jpg',
    category: 'Finance',
    date: '2025-06-25',
    author: 'Emily White',
    comments: 175,
    views: 9500,
    readTime: 6,
    leadParagraph: 'Financial literacy is crucial for a sustainable creative career. Learn about budgeting, invoicing, and saving for taxes as a freelancer or small studio owner.',
    content: [{ type: 'paragraph', text: 'This article provides practical financial tips tailored specifically for the unpredictable income streams of creative professionals.' }],
  }
];

export const allProductsData: ProductData[] = [
    // === BUNDLES (16 total) ===
    { id: 'B1', name: 'Modern Font Bundle', slug: 'modern-bundle', imageUrl: '/images/dummy/modern-bundle.jpg', price: 29.00, description: 'Styles: Elegant, Clean, Contemporary', type: 'bundle' },
    // PERBAIKAN HARGA: price adalah harga final, originalPrice adalah harga awal
    { id: 'B2', name: 'Timeless Vintage Bundle', slug: 'timeless-vintage', imageUrl: '/images/dummy/timeless-bundle.jpg', price: 24.50, originalPrice: 35.00, description: 'Styles: Retro, Display, Serif', type: 'bundle', discount: '30% OFF' }, 
    { id: 'B3', name: 'Creative Font Bundle', slug: 'creative-font-bundle', imageUrl: '/images/dummy/arguys-regret.jpg', price: 45.00, description: 'A versatile collection for artists', type: 'bundle', staffPick: true },
    { id: 'B4', name: 'The Essential Bundle', slug: 'essential-bundle', imageUrl: '/images/dummy/bright-film.jpg', price: 50.00, description: 'Must-have fonts for every designer', type: 'bundle' },
    { id: 'B5', name: 'Serif Collection Bundle', slug: 'serif-collection', imageUrl: '/images/dummy/rigflia-nirsho.jpg', price: 40.00, description: 'A complete serif font family pack', type: 'bundle' },
    { id: 'B6', name: 'Sans-Serif Starter Pack', slug: 'sans-serif-pack', imageUrl: '/images/dummy/Bright Royale Font-01.jpg', price: 30.40, originalPrice: 38.00, description: 'Clean & modern sans-serif fonts', type: 'bundle', discount: "20% OFF" },
    { id: 'B7', name: 'Script & Signature Bundle', slug: 'script-signature', imageUrl: '/images/dummy/Garden Delight Font-01.jpg', price: 42.00, description: 'Elegant and personal script fonts', type: 'bundle' },
    { id: 'B8', name: 'Groovy & Retro Bundle', slug: 'groovy-retro', imageUrl: '/images/dummy/Grilleds Font.jpg', price: 33.00, description: 'Funky and nostalgic typefaces', type: 'bundle' },
    { id: 'B9', name: 'Blackletter History Bundle', slug: 'blackletter-history', imageUrl: '/images/dummy/Hearty Beltime Font.jpg', price: 48.00, description: 'Historic and gothic font styles', type: 'bundle' },
    { id: 'B10', name: 'The Ultimate Display Bundle', slug: 'ultimate-display', imageUrl: '/images/dummy/Trendy Voyage Font-01.jpg', price: 60.00, description: 'Bold fonts for headlines', type: 'bundle', staffPick: true },
    { id: 'B11', name: 'Elegant Fonts Bundle', slug: 'elegant-fonts', imageUrl: '/images/dummy/Hearty Sacred Font-01.jpg', price: 39.00, description: 'Sophisticated fonts for luxury brands', type: 'bundle' },
    { id: 'B12', name: 'Modernist Bundle', slug: 'modernist-bundle', imageUrl: '/images/dummy/Mathreal Font-01.jpg', price: 41.00, description: 'Minimalist and clean font collection', type: 'bundle' },
    { id: 'B13', name: 'Vintage Classics Bundle', slug: 'vintage-classics', imageUrl: '/images/dummy/Nights Funky Emerald Font-01.jpg', price: 37.00, description: 'Timeless typefaces from the past', type: 'bundle' },
    { id: 'B14', name: 'Handwritten Notes Bundle', slug: 'handwritten-notes', imageUrl: '/images/dummy/modern-bundle.jpg', price: 34.00, description: 'Personal and authentic handwriting fonts', type: 'bundle' },
    { id: 'B15', name: 'Headline Makers Bundle', slug: 'headline-makers', imageUrl: '/images/dummy/timeless-bundle.jpg', price: 55.00, description: 'Fonts that demand attention', type: 'bundle' },
    { id: 'B16', name: 'The Minimalist Bundle', slug: 'minimalist-bundle', imageUrl: '/images/dummy/arguys-regret.jpg', price: 43.00, description: 'Less is more with these fonts', type: 'bundle' },

    // === FONTS (16+ total) ===
    { id: 'F1', name: 'Arguys Regret', slug: 'arguys-regret', imageUrl: '/images/dummy/arguys-regret.jpg', price: 14.25, originalPrice: 19.00, description: 'Blackletter', type: 'font', discount: '25% OFF' },
    { id: 'F2', name: 'Bright Film', slug: 'bright-film', imageUrl: '/images/dummy/bright-film.jpg', price: 19.00, description: 'Serif', type: 'font', staffPick: true },
    { id: 'F3', name: 'Rigflia Nirsho', slug: 'rigflia-nirsho', imageUrl: '/images/dummy/rigflia-nirsho.jpg', price: 8.50, originalPrice: 17.00, description: 'Serif', type: 'font', discount: '50% OFF', staffPick: true },
    { id: 'F4', name: 'Bright Royale', slug: 'bright-royale', imageUrl: '/images/dummy/Bright Royale Font-01.jpg', price: 17.00, description: 'Serif', type: 'font' },
    { id: 'F5', name: 'Garden Delight', slug: 'garden-delight', imageUrl: '/images/dummy/Garden Delight Font-01.jpg', price: 19.00, description: 'Groovy', type: 'font' },
    { id: 'F6', name: 'Grilleds Font', slug: 'grilleds-font', imageUrl: '/images/dummy/Grilleds Font.jpg', price: 15.00, description: 'Blackletter', type: 'font' },
    { id: 'F7', name: 'Hearty Beltime', slug: 'hearty-beltime', imageUrl: '/fonts/Hearty Beltime/Preview Font/Hearty Beltime Font-01.jpg', price: 15.40, originalPrice: 22.00, description: 'Script', type: 'font', discount: '30% OFF' },
    { id: 'F8', name: 'Trendy Voyage', slug: 'trendy-voyage', imageUrl: '/images/dummy/Trendy Voyage Font-01.jpg', price: 25.00, description: 'Sans Serif', type: 'font' },
    { id: 'F9', name: 'Hearty Sacred', slug: 'hearty-sacred', imageUrl: '/images/dummy/Hearty Sacred Font-01.jpg', price: 19.00, description: 'Script', type: 'font' },
    { id: 'F10', name: 'Mathreal', slug: 'mathreal', imageUrl: '/images/dummy/Mathreal Font-01.jpg', price: 17.00, description: 'Sans Serif', type: 'font' },
    { id: 'F11', name: 'Nights Funky Emerald', slug: 'nights-funky-emerald', imageUrl: '/images/dummy/Nights Funky Emerald Font-01.jpg', price: 19.00, description: 'Blackletter', type: 'font' },
    { id: 'F12', name: 'Vintage Dream', slug: 'vintage-dream', imageUrl: '/images/dummy/arguys-regret.jpg', price: 28.00, description: 'Serif', type: 'font', staffPick: true },
    { id: 'F13', name: 'Urban Display', slug: 'urban-display', imageUrl: '/images/dummy/bright-film.jpg', price: 22.00, description: 'Blackletter', type: 'font' },
    { id: 'F14', name: 'Rustic Script', slug: 'rustic-script', imageUrl: '/images/dummy/rigflia-nirsho.jpg', price: 16.20, originalPrice: 18.00, description: 'Script', type: 'font', discount: '10% OFF' },
    { id: 'F15', name: 'Bold Groovy', slug: 'bold-groovy', imageUrl: '/images/dummy/Bright Royale Font-01.jpg', price: 20.00, description: 'Groovy', type: 'font' },
    { id: 'F16', name: 'Elegant Sans', slug: 'elegant-sans', imageUrl: '/images/dummy/Garden Delight Font-01.jpg', price: 24.00, description: 'Sans Serif', type: 'font' },
    { id: 'F17', name: 'Midnight Caller', slug: 'midnight-caller', imageUrl: '/images/dummy/Grilleds Font.jpg', price: 21.00, description: 'Blackletter', type: 'font' },
    { id: 'F18', name: 'Creative Display', slug: 'creative-display', imageUrl: '/images/dummy/Hearty Beltime Font.jpg', price: 17.00, description: 'Blackletter', type: 'font', staffPick: true },
    { id: 'F19', name: 'Smooth Script', slug: 'smooth-script', imageUrl: '/images/dummy/Trendy Voyage Font-01.jpg', price: 19.00, description: 'Script', type: 'font' },
    { id: 'F20', name: 'Classic Serif', slug: 'classic-serif', imageUrl: '/images/dummy/Hearty Sacred Font-01.jpg', price: 19.00, description: 'Serif', type: 'font' },
    { id: 'F21', name: 'Modern Grotesk', slug: 'modern-grotesk', imageUrl: '/images/dummy/Mathreal Font-01.jpg', price: 25.00, description: 'Sans Serif', type: 'font' },
    { id: 'F22', name: 'Gothic Modern', slug: 'gothic-modern', imageUrl: '/images/dummy/Nights Funky Emerald Font-01.jpg', price: 22.00, description: 'Blackletter', type: 'font' },
    { id: 'F23', name: 'Funky Town', slug: 'funky-town', imageUrl: '/images/dummy/arguys-regret.jpg', price: 18.00, description: 'Groovy', type: 'font' },
    { id: 'F24', name: 'Elegant Script', slug: 'elegant-script', imageUrl: '/images/dummy/bright-film.jpg', price: 21.00, description: 'Script', type: 'font' },
    { id: 'F25', name: 'Retro Vibes', slug: 'retro-vibes', imageUrl: '/images/dummy/rigflia-nirsho.jpg', price: 16.00, description: 'Groovy', type: 'font' },
    { id: 'F26', name: 'Serif Pro', slug: 'serif-pro', imageUrl: '/images/dummy/Bright Royale Font-01.jpg', price: 29.00, description: 'Serif', type: 'font' },
    { id: 'F27', name: 'Another Font', slug: 'another-font', imageUrl: '/images/dummy/Garden Delight Font-01.jpg', price: 15.00, description: 'Sans Serif', type: 'font' },
    { id: 'F28', name: 'Silky Smooth', slug: 'silky-smooth', imageUrl: '/images/dummy/Grilleds Font.jpg', price: 23.00, description: 'Script', type: 'font' },
    { id: 'F29', name: 'Heavy Metal', slug: 'heavy-metal', imageUrl: '/images/dummy/Hearty Beltime Font.jpg', price: 17.00, originalPrice: 20.00, description: 'Blackletter', type: 'font', discount: "15% OFF" },
    { id: 'F30', name: 'Groove Machine', slug: 'groove-machine', imageUrl: '/images/dummy/Trendy Voyage Font-01.jpg', price: 18.00, description: 'Groovy', type: 'font' },
    { id: 'F31', name: 'Timeless Serif', slug: 'timeless-serif', imageUrl: '/images/dummy/Hearty Sacred Font-01.jpg', price: 26.00, description: 'Serif', type: 'font' },
    { id: 'F32', name: 'Clean Sans', slug: 'clean-sans', imageUrl: '/images/dummy/Mathreal Font-01.jpg', price: 24.00, description: 'Sans Serif', type: 'font', staffPick: true },
    { id: 'F33', name: 'Final Font', slug: 'final-font', imageUrl: '/images/dummy/Nights Funky Emerald Font-01.jpg', price: 19.00, description: 'Serif', type: 'font' },
];