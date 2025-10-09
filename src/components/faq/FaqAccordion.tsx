// src/components/faq/FaqAccordion.tsx
'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

type FaqItem = {
  question: string;
  answer: React.ReactNode;
};

const faqData: FaqItem[] = [
    {
        question: 'Can I share the fonts I purchase with others?',
        answer: 'No, the fonts you purchase are licensed for use by a single user or organization. Sharing the fonts with others is not allowed without our permission.',
    },
    {
        question: 'Are your fonts licensed for commercial use?',
        answer: 'Yes, all of our fonts are licensed for commercial use. However, some fonts may have additional restrictions or requirements, so be sure to read the licensing information carefully before purchasing.',
    },
    {
        question: 'Can I try a font before I buy it?',
        answer: 'Unfortunately, we do not offer free trials of our fonts. However, we do provide previews of each font on our website so you can get a sense of how it looks before purchasing.',
    },
    {
        question: 'What types of fonts are available on your website?',
        answer: 'We offer a wide variety of fonts, including sans-serif, serif, script, and display fonts. Our fonts are available in various formats, including OTF, TTF, WOFF, and WOFF2.',
    },
    {
        question: 'Can I use your fonts on my website or in an app?',
        answer: 'Yes, you can use our fonts on your website or in an app. However, some fonts may require additional licensing or have specific usage restrictions, so be sure to read the licensing information carefully before using the font.',
    },
    {
        question: 'How do I install an OpenType font on my computer?',
        answer: 'To install an OpenType font on your computer, simply double-click the font file and click the "Install" button in the preview window. Alternatively, you can right-click on the font file and select "Install" from the context menu.',
    },
    {
        question: 'Where can I find tutorials on using OpenType fonts?',
        answer: (
            <>
                There are many online resources available for learning how to use OpenType fonts. Here are a links to get you started: 
                <br />
                Adobe’s official OpenType tutorial: <a href="https://www.adobe.com/products/type/opentype.html" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">https://www.adobe.com/products/type/opentype.html</a>
            </>
        ),
    },
    {
        question: 'How do I use the advanced typographic features of an OpenType font?',
        answer: 'To use the advanced typographic features of an OpenType font, you will need to access the features panel in your design software. In Adobe Illustrator or Photoshop, for example, you can open the "Character" panel and click on the "OpenType" dropdown menu to access the various features available in the font.',
    },
    {
        question: 'I don’t have a Paypal. Do you have an alternative payment method?',
        answer: 'When you checkout you can find Debit or Credit Card button.',
    },
    {
        question: 'Can I embed this font on my website?',
        answer: 'You need to purchase Web License.',
    },
    {
        question: 'Are your fonts compatible with both Mac and Windows computers?',
        answer: 'Yes, all of our fonts are compatible with both Mac and Windows computers.',
    },
    {
        question: 'What is an OpenType font and how is it different from other font formats?',
        answer: 'An OpenType font is a type of font that was developed jointly by Adobe and Microsoft. It is a scalable font format that allows for advanced typographic features like ligatures, swashes, and alternate characters.',
    },
    {
        question: 'What is your refund policy?',
        answer: 'We do not offer refunds on digital downloads, including fonts, unless there is a technical issue with the font that prevents it from working properly. If you experience any issues with your purchase, please contact our customer support team for assistance or email us at support@timelesstype.com.',
    },
    {
        question: 'Can I modify your fonts for my own use?',
        answer: 'While you may modify the fonts for personal use, modifying the fonts for commercial use is not allowed without our permission. Please contact us if you are interested in modifying a font for commercial use.',
    },
];


const FaqAccordion = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(0); 

  const toggleItem = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div>
      <div className="space-y-4">
        {faqData.map((item, index) => (
          <div key={index} className="border-b border-white/10 pb-4">
            <button
              onClick={() => toggleItem(index)}
              // --- PERUBAHAN UTAMA DI SINI ---
              className={`w-full flex justify-between items-center text-left text-lg font-medium transition-colors duration-300 ${activeIndex === index ? 'text-brand-accent' : 'text-brand-light hover:text-brand-accent'}`}
            >
              <span className='pr-4'>{item.question}</span>
              <ChevronDown
                // --- PERUBAHAN UTAMA DI SINI ---
                className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${activeIndex === index ? 'rotate-180 text-brand-accent' : ''}`}
              />
            </button>
            <div
              className={`grid transition-all duration-300 ease-in-out ${
                activeIndex === index ? 'grid-rows-[1fr] opacity-100 pt-4' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden">
                <div className={`transition-colors duration-300 font-light leading-relaxed space-y-4 ${activeIndex === index ? 'text-white' : 'text-brand-light-muted'}`}>
                  {item.answer}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FaqAccordion;