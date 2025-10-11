// src/components/terms/TermsAccordion.tsx
'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

type TermsItem = {
  title: string;
  content: React.ReactNode;
};

const termsData: TermsItem[] = [
  {
    title: 'Terms',
    content: (
      <p>
        When ordering or registering on our site, as appropriate, you may be asked to enter your name, email address or other details to help you with your experience.
      </p>
    ),
  },
  {
    title: 'Use License',
    content: (
      <ul className="space-y-4 list-disc pl-5">
        <li>
          Permission is granted to temporarily download one copy of the materials (information or software) on Stylish Type&apos;s website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
          <ul className="list-[circle] pl-5 mt-2 space-y-2">
            <li>modify or copy the materials;</li>
            <li>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
            <li>attempt to decompile or reverse engineer any software contained on Stylish Type&apos;s website;</li>
            <li>remove any copyright or other proprietary notations from the materials; or</li>
            <li>transfer the materials to another person or &quot;mirror&quot; the materials on any other server.</li>
          </ul>
        </li>
        <li>
          This license shall automatically terminate if you violate any of these restrictions and may be terminated by Stylish Type at any time. Upon terminating your viewing of these materials or upon the termination of this license, you must destroy any downloaded materials in your possession whether in electronic or printed format.
        </li>
      </ul>
    ),
  },
  {
    title: 'Disclaimer',
    content: (
       <ul className="space-y-4 list-disc pl-5">
        <li>
          The materials on Stylish Type&apos;s website are provided on an ‘as is’ basis. Stylish Type makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
        </li>
        <li>
          Further, Stylish Type does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its website or otherwise relating to such materials or on any sites linked to this site.
        </li>
      </ul>
    ),
  },
  {
    title: 'Limitations',
    content: (
      <p>
        In no event shall Stylish Type or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Stylish Type&apos;s website, even if Stylish Type or a Stylish Type authorized representative has been notified orally or in writing of the possibility of such damage. Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you.
      </p>
    ),
  },
    {
    title: 'Accuracy of Materials',
    content: (
      <p>
        The materials appearing on Stylish Type&apos;s website could include technical, typographical, or photographic errors. Stylish Type does not warrant that any of the materials on its website are accurate, complete or current. Stylish Type may make changes to the materials contained on its website at any time without notice. However Stylish Type does not make any commitment to update the materials.
      </p>
    ),
  },
  {
    title: 'Links',
    content: (
      <p>
        Stylish Type has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Stylish Type of the site. Use of any such linked website is at the user’s own risk.
      </p>
    ),
  },
  {
    title: 'Modifications',
    content: (
      <p>
        Stylish Type may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.
      </p>
    ),
  },
    {
    title: 'Governing Law',
    content: (
      <p>
        These terms and conditions are governed by and construed in accordance with the laws of Indonesia and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
      </p>
    ),
  },
];

const TermsAccordion = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(0); 

  const toggleItem = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div>
      <div className="space-y-4">
        {termsData.map((item, index) => (
          <div key={index} className="border-b border-white/10 pb-4">
            <button
              onClick={() => toggleItem(index)}
              // --- PERUBAHAN UTAMA DI SINI ---
              className={`w-full flex justify-between items-center text-left text-lg font-medium transition-colors duration-300 ${activeIndex === index ? 'text-brand-accent' : 'text-brand-light hover:text-brand-accent'}`}
            >
              <span>{item.title}</span>
              <ChevronDown
                // --- PERUBAHAN UTAMA DI SINI ---
                className={`w-5 h-5 transition-transform duration-300 ${activeIndex === index ? 'rotate-180 text-brand-accent' : ''}`}
              />
            </button>
            <div
              className={`grid transition-all duration-300 ease-in-out ${
                activeIndex === index ? 'grid-rows-[1fr] opacity-100 pt-4' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden">
                <div className={`transition-colors duration-300 font-light leading-relaxed ${activeIndex === index ? 'text-white' : 'text-brand-light-muted'}`}>
                  {item.content}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TermsAccordion;