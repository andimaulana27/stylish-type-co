// src/components/subscription/FaqSection.tsx
'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

type FaqItem = {
  question: string;
  answer: string;
};

// --- PERUBAHAN UTAMA DI SINI: Konten FAQ diperbarui ---
const faqData: FaqItem[] = [
  {
    question: 'Can I cancel my subscription at any time?',
    answer: 'Yes, you have complete control over your subscription. You can cancel at any time directly from your account dashboard. After cancellation, you will retain full access to all fonts and benefits until the end of your current billing period (monthly or yearly). There are no hidden fees or penalties for canceling.',
  },
  {
    question: 'What happens to the fonts I used after my subscription ends?',
    answer: 'All fonts that you added to your library during your active subscription will remain licensed and valid for lifetime use, even after your subscription expires. You can continue using those fonts for both personal and client projects without limitation. However, once your subscription ends, you will no longer be able to add new fonts to your library.',
  },
  {
    question: 'Can I upgrade or downgrade my plan?',
    answer: 'Absolutely. We understand that your needs can change. You can easily upgrade or downgrade your subscription plan at any time from your account settings. The change will be prorated, meaning you only pay the difference for an upgrade, and the new plan’s features will be available to you immediately.',
  },
    {
    question: 'Are new font releases included in my subscription?',
    answer: 'Yes, and this is one of the best benefits! All our subscription plans include immediate access to every new font as soon as it is released. Our library is constantly growing, and as a subscriber, you will always be the first to enjoy our latest creations without any additional cost.',
  },
  {
    question: 'How does licensing work for team or multi-user access?',
    answer: "Licensing follows the type of plan you purchase. Fonts can be used by multiple users and devices only according to the license type you hold. Please check your subscription plan and license details to ensure compliance.",
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'Currently, we only accept payments via PayPal and credit/debit cards (Visa and Mastercard).',
  },
];
// --- AKHIR PERUBAHAN ---

const FaqSection = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div>
      <div className="space-y-4">
        {faqData.map((item, index) => (
          <div key={index} className="border-b border-white/10 pb-4">
            <button
              onClick={() => toggleFaq(index)}
              className={`w-full flex justify-between items-center text-left text-lg font-medium transition-colors duration-300 ${activeIndex === index ? 'text-brand-accent' : 'text-brand-light hover:text-brand-accent'}`}
            >
              <span>{item.question}</span>
              <ChevronDown
                className={`w-5 h-5 transition-transform duration-300 ${activeIndex === index ? 'rotate-180 text-brand-accent' : ''}`}
              />
            </button>
            <div
              className={`grid transition-all duration-300 ease-in-out ${
                activeIndex === index ? 'grid-rows-[1fr] opacity-100 pt-4' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden">
                <p className={`transition-colors duration-300 font-light leading-relaxed ${activeIndex === index ? 'text-white' : 'text-brand-light-muted'}`}>
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FaqSection;