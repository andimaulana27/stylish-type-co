// src/components/TestimonialSection.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import SectionHeader from './SectionHeader';
import StarIcon from './icons/StarIcon';

// Data tidak berubah, tetap sama seperti sebelumnya
const testimonials = [
  {
    quote: "As a freelance designer, fonts are the backbone of my projects. The ones I bought from Timelesstype.co instantly elevated my work. They’re elegant, unique, and versatile across platforms. Clients noticed the upgrade immediately, saying the designs looked premium and professional. Truly worth the investment.",
    author: "Sarah Collins",
    title: "Freelance Graphic Designer",
    avatar: "/images/avatar/1.jpg"
  },
  {
    quote: "I recently purchased one of the bundles, and it’s honestly the best deal I’ve found. For the price of a single font elsewhere, I received a full package of stylish, premium-quality typefaces. Every font works perfectly for client branding, saving me money and effort.",
    author: "James Miller",
    title: "Brand Consultant",
    avatar: "/images/avatar/2.jpg"
  },
  {
    quote: "Our studio switched to the subscription model, and it changed everything. Unlimited downloads for such an affordable fee cut our expenses dramatically. We used to spend hundreds each month on fonts, but now we save almost 99%. It’s a real game-changer for our creative team.",
    author: "Olivia Hart",
    title: "Creative Studio Manager",
    avatar: "/images/avatar/3.jpg"
  },
  {
    quote: "I didn’t realize how much fonts could influence perception until I tried Timelesstype.co. My packaging looked instantly more luxurious, and customers noticed the difference. Buying a bundle made it even better — so many high-quality fonts for a fraction of what I used to pay.",
    author: "Michael Foster",
    title: "Packaging Designer",
    avatar: "/images/avatar/4.jpg"
  },
  {
    quote: "As a social media manager, visuals are everything. Timelesstype.co fonts have become my go-to. They’re elegant, easy to use, and always aesthetic. Thanks to the subscription plan, I never worry about budgets anymore — I download whatever I need, anytime, without overspending. It’s perfect.",
    author: "Rachel Kim",
    title: "Social Media Manager",
    avatar: "/images/avatar/5.jpg"
  },
  {
    quote: "I love that bundles are available. They’re affordable, convenient, and packed with variety. Instead of buying fonts one by one, I now have a collection ready for all my projects. It makes my workflow smoother and ensures my designs always look premium and professional.",
    author: "Daniel Price",
    title: "Marketing Specialist",
    avatar: "/images/avatar/6.jpg"
  },
  {
    quote: "As a wedding planner, I constantly need classy script fonts. Buying a bundle from Timelesstype.co solved everything. I now have multiple premium options ready for invitations, menus, and décor. Clients love the elegant feel, and I saved a lot compared to individual purchases.",
    author: "Emily Turner",
    title: "Wedding Planner",
    avatar: "/images/avatar/7.jpg"
  },
  {
    quote: "The subscription plan is incredible. I’ve downloaded more than 50 fonts within the first week alone. Normally, that would have cost me hundreds of dollars, but here it’s all included. We reduced our design costs by 99%, and the fonts are consistently premium-quality.",
    author: "Robert Hayes",
    title: "Agency Owner",
    avatar: "/images/avatar/8.jpg"
  },
  {
    quote: "As a small business owner, cost matters. Timelesstype.co bundles are the perfect solution. Premium-quality fonts at a fraction of the price make branding affordable without sacrificing professionalism. Customers keep commenting on how polished my designs look. It’s one of the smartest business investments I’ve made.",
    author: "Sophia Bennett",
    title: "Small Business Owner",
    avatar: "/images/avatar/9.jpg"
  },
  {
    quote: "Timelesstype.co fonts transformed my Instagram page. They look stylish, classy, and instantly more professional. Thanks to the subscription plan, I don’t feel guilty experimenting with different typefaces. My followers noticed the upgrade too, and engagement rates actually improved after updating my visuals with better typography.",
    author: "Lucas Howard",
    title: "Content Creator",
    avatar: "/images/avatar/10.jpg"
  },
  {
    quote: "The fonts are versatile, detailed, and beautifully crafted. I use them across logos, posters, and packaging designs. Bundles help me keep costs down while giving me premium options for every client. It’s like having a complete typography toolbox at a much cheaper price.",
    author: "Amanda Scott",
    title: "Freelance Illustrator",
    avatar: "/images/avatar/11.jpg"
  },
  {
    quote: "As a creative director, I know how fast font expenses add up. The subscription at Timelesstype.co completely solved that issue. Unlimited downloads allow my team to experiment freely, and we save almost 99% compared to buying licenses individually. The quality is consistently top-notch.",
    author: "Ethan Brooks",
    title: "Creative Director",
    avatar: "/images/avatar/12.jpg"
  },
  {
    quote: "I used a script font from Timelesstype.co for my skincare brand. Customers thought I’d hired a professional designer, but the secret was just better typography. Fonts are incredibly elegant and premium. They gave my brand new life and helped me stand out in a crowded market.",
    author: "Lily Morgan",
    title: "Skincare Entrepreneur",
    avatar: "/images/avatar/13.jpg"
  },
  {
    quote: "Bundles have become my go-to purchase. Instead of buying random fonts separately, I get a whole collection at once. Clients love the variety I can provide, and I don’t have to worry about going over budget. It’s the perfect mix of affordability and quality.",
    author: "Nathan Reed",
    title: "Branding Designer",
    avatar: "/images/avatar/14.jpg"
  },
  {
    quote: "I run a YouTube channel where thumbnails matter a lot. With the subscription, I can test multiple fonts until I find the perfect one without worrying about cost. My visuals now look premium, and viewers noticed the change right away. It’s definitely worth it.",
    author: "Grace Parker",
    title: "YouTuber",
    avatar: "/images/avatar/15.jpg"
  },
  {
    quote: "I bought a bundle last month, and it already paid for itself. The fonts included are elegant, stylish, and not overused like the ones you find for free. It feels like having an entire professional toolkit at my disposal for one small price.",
    author: "William Gray",
    title: "Web Designer",
    avatar: "/images/avatar/16.jpg"
  },
  {
    quote: "The subscription is honestly the best decision for my studio. Before, we spent hundreds every year on fonts. Now, we pay once and download unlimited. We save nearly 99% in costs, and the quality hasn’t dropped at all. It’s reliable and professional.",
    author: "Emma Cooper",
    title: "Studio Founder",
    avatar: "/images/avatar/17.jpg"
  },
  {
    quote: "I needed fonts for a wedding project and decided to buy a bundle. I received multiple scripts and serifs that perfectly matched the theme. The invitations looked exclusive and romantic. My client was thrilled, and I didn’t overspend. The value here is fantastic.",
    author: "Daniel Rivera",
    title: "Invitation Designer",
    avatar: "/images/avatar/18.jpg"
  },
  {
    quote: "These fonts look polished, stylish, and premium. I use them directly in Canva for social media posts. They’re easy to install, versatile, and make even the simplest designs look professional. People now ask me which designer I hired — but it’s all typography.",
    author: "Hannah Mitchell",
    title: "Lifestyle Blogger",
    avatar: "/images/avatar/19.jpg"
  },
  {
    quote: "Bundles are underrated. I bought one and used it to brand a café project. The fonts fit perfectly, and the savings were significant. Clients loved the premium feel, and I still have plenty of typefaces left for future designs. Affordable and high quality.",
    author: "Ryan Carter",
    title: "Café Brand Consultant",
    avatar: "/images/avatar/20.jpg"
  },
  {
    quote: "The subscription feels like Netflix for fonts. I download as many as I want, try different styles, and never overspend. For agencies, it’s a no-brainer. Having unlimited premium fonts available at any time saves both money and time while boosting creativity.",
    author: "Sophia Adams",
    title: "Art Director",
    avatar: "/images/avatar/21.jpg"
  },
  {
    quote: "I redesigned food packaging using fonts from Timelesstype.co, and customers thought we had completely rebranded. The new look feels premium and trustworthy, just by changing typography. The value is incredible for the small investment. Fonts matter more than most people realize.",
    author: "Jacob Wallace",
    title: "Food Entrepreneur",
    avatar: "/images/avatar/22.jpg"
  },
  {
    quote: "As a digital creator, variety is everything. The bundle I purchased gave me elegant scripts, bold brushes, and clean serifs. My designs now have personality and depth, and I didn’t blow my budget. It’s the most affordable upgrade for design quality.",
    author: "Isabella Ross",  
    title: "Digital Creator",
    avatar: "/images/avatar/23.jpg"
  },
  {
    quote: "The fonts here are classy, unique, and professional. I used them in an investor presentation, and people commented on the typography. It set our deck apart instantly. Sometimes, small design elements like fonts make the biggest impression on serious projects.",
    author: "Matthew Powell",
    title: "Investor Relations Manager",
    avatar: "/images/avatar/24.jpg"
  },
  {
    quote: "The subscription took away all my font-hunting stress. Unlimited downloads let me explore, test, and finalize options without worrying about price. For someone managing multiple brands, it’s priceless. Typography finally feels fun again, and my projects look consistently premium.",
    author: "Olivia James",
    title: "Brand Strategist",
    avatar: "/images/avatar/25.jpg"
  },
  {
    quote: "I bought a bundle, and it felt like buying one font but getting 20 more for free. Every typeface has personality and polish, not generic at all. It gave me the flexibility to create different brand identities without breaking my budget.",
    author: "Ethan Clarke",
    title: "Freelance Designer",
    avatar: "/images/avatar/26.jpg"
  },
  {
    quote: "Our small marketing firm switched to subscription. Unlimited access gave our designers creative freedom, while saving us thousands every year. Clients appreciate the variety we deliver, and our work now looks consistently premium across different campaigns. It’s the smartest business move we’ve made.",
    author: "Samantha Hughes",
    title: "Marketing Agency Owner",
    avatar: "/images/avatar/27.jpg"
  },
  {
    quote: "I used one of the fonts for a restaurant logo project, and the results were fantastic. The owner loved it, and even customers commented on the new menu design. Elegant, stylish typography instantly made the brand feel more upscale.",
    author: "Andrew Phillips",
    title: "Logo Designer",
    avatar: "/images/avatar/28.jpg"
  },
  {
    quote: "Bundles are super convenient. Instead of buying fonts randomly, I now have a curated set I can always rely on. It’s cheaper, efficient, and helps me keep branding consistent across multiple platforms. A professional toolkit that doesn’t drain your budget.",
    author: "Victoria Lane",
    title: "Brand Manager",
    avatar: "/images/avatar/29.jpg"
  },
  {
    quote: "As a startup founder, budget is critical. The subscription plan helped us cut costs by 99% while still giving us unlimited premium fonts. Our branding looks more professional, investors are impressed, and we saved a huge amount of money at the same time.",
    author: "Benjamin Ward",
    title: "Startup Founder",
    avatar: "/images/avatar/30.jpg"
  }
];

const features = [
  {
    iconSrc: '/svg/why-us/2.svg',
    title: 'Instant Download',
    description: 'After you make a purchase, you will get an instant download.'
  },
  {
    iconSrc: '/svg/why-us/5.svg',
    title: 'Order Protection',
    description: 'We maintain the highest level of online payment security.'
  },
  {
    iconSrc: '/svg/why-us/1.svg',
    title: 'Full Support',
    description: 'Our Customer Support Team is ready and available to help.'
  },
  {
    iconSrc: '/svg/why-us/3.svg',
    title: 'License Options',
    description: 'Our font offers a wide selection of licenses that can fit your needs.'
  },
  {
    iconSrc: '/svg/why-us/4.svg',
    title: 'Subscription',
    description: 'Unlock this font and our entire library with a subscription.'
  }
];

const StarRating = () => (
  <div className="flex">
    {Array.from({ length: 5 }).map((_, index) => (
      <StarIcon key={index} className="w-4 h-4 text-brand-primary-orange" />
    ))}
  </div>
);

const TestimonialCard = ({ quote, author, title, avatar }: typeof testimonials[0]) => (
  <div className="flex-shrink-0 px-4 w-[24rem] sm:w-[26rem] md:w-[28rem] lg:w-[30rem]"> 
    <div className="group bg-brand-darkest border border-brand-accent/50 rounded-3xl p-6 h-full flex flex-col justify-between transition-all duration-300 ease-in-out
                    hover:border-brand-accent 
                    hover:bg-gradient-to-b from-transparent via-transparent to-brand-accent/30">
      
      <p className="text-brand-light-muted font-light leading-relaxed text-left text-sm min-h-[7rem]">
        &ldquo;{quote}&rdquo;
      </p>

      <div className="flex items-center gap-4 mt-6 pt-6 border-t border-white/10">
        <Image src={avatar} alt={author} width={40} height={40} className="rounded-full flex-shrink-0" />
        <div className="flex-grow text-left">
          <p className="font-semibold text-brand-accent text-base">{author}</p>
          <p className="text-sm text-brand-light-muted">{title}</p>
        </div>
        <div className="flex-shrink-0">
          <StarRating />
        </div>
      </div>
    </div>
  </div>
);


const TestimonialSection = () => {
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  return (
    <section className="bg-brand-dark-secondary py-20 relative overflow-hidden">
        
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-brand-accent to-transparent opacity-35 z-0 pointer-events-none"></div>

        <div className="container mx-auto px-6 relative z-10 text-center">
            <SectionHeader
                title="What Our Customers Say"
                subtitle="Trusted by designers, small businesses, and creative professionals worldwide, see why our fonts are a top choice across industries."
            />
        </div>
        <div className="w-full overflow-hidden mt-12 group">
            <div className="flex w-max animate-marquee-medium group-hover:[animation-play-state:paused]">
                {duplicatedTestimonials.map((testimonial, index) => (
                    <TestimonialCard
                    key={index}
                    quote={testimonial.quote}
                    author={testimonial.author}
                    title={testimonial.title}
                    avatar={testimonial.avatar}
                    />
                ))}
            </div>
        </div>

        {/* --- PERUBAHAN UTAMA DI SINI --- */}
        <div className="container mx-auto px-6 relative z-10 mt-20 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-12">
            {features.map((feature) => (
              <div key={feature.title} className="flex flex-col items-center text-center lg:items-start lg:text-left lg:flex-row lg:gap-4">
                <div className="w-16 h-16 relative flex-shrink-0 mb-4 lg:mb-0">
                  <Image
                    src={feature.iconSrc}
                    alt={`${feature.title} icon`}
                    fill
                    style={{ objectFit: 'contain' }}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-brand-light">{feature.title}</h3>
                  <p className="text-sm text-brand-light-muted leading-relaxed mt-2">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* --- AKHIR PERUBAHAN --- */}
    </section>
  );
};

export default TestimonialSection;