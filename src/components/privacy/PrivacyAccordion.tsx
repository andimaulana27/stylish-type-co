// src/components/privacy/PrivacyAccordion.tsx
'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';

type PrivacyItem = {
  title: string;
  content: React.ReactNode;
};

// Content extracted from the provided images
const privacyData: PrivacyItem[] = [
  {
    title: 'What personal information do we collect from the people that visit our blog, website or app?',
    content: (
      <p>
        When ordering or registering on our site, as appropriate, you may be asked to enter your name, email address or other details to help you with your experience.
      </p>
    ),
  },
  {
    title: 'When do we collect information?',
    content: (
      <p>
        We collect information from you when you register on our site, place an order, subscribe to a newsletter or enter information on our site.
      </p>
    ),
  },
  {
    title: 'How do we use your information?',
    content: (
      <>
        <p className="mb-4">
          We may use the information we collect from you when you register, make a purchase, sign up for our newsletter, respond to a survey or marketing communication, surf the website, or use certain other site features in the following ways:
        </p>
        <ul className="space-y-2 list-disc pl-5">
          <li>To personalize your experience and to allow us to deliver the type of content and product offerings in which you are most interested.</li>
          <li>To improve our website in order to better serve you.</li>
          <li>To allow us to better service you in responding to your customer service requests.</li>
          <li>To administer a contest, promotion, survey or other site feature.</li>
          <li>To quickly process your transactions.</li>
          <li>To ask for ratings and reviews of services or products.</li>
          <li>To follow up with them after correspondence (live chat, email or phone inquiries).</li>
        </ul>
      </>
    ),
  },
  {
    title: 'How do we protect your information?',
    content: (
      <>
        <p className="mb-4">
          Our website is scanned on a regular basis for security holes and known vulnerabilities in order to make your visit to our site as safe as possible. We use regular Malware Scanning.
        </p>
        <p>
          Your personal information is contained behind secured networks and is only accessible by a limited number of persons who have special access rights to such systems, and are required to keep the information confidential. In addition, all sensitive/credit information you supply is encrypted via Secure Socket Layer (SSL) technology. We implement a variety of security measures when a user places an order enters, submits, or accesses their information to maintain the safety of your personal information. All transactions are processed through a gateway provider and are not stored or processed on our servers.
        </p>
      </>
    ),
  },
  {
    title: 'Do we use ‘cookies’?',
    content: (
      <>
        <p>
          We do not use cookies for tracking purposes.
        </p>
        <p>
          You can choose to have your computer warn you each time a cookie is being sent, or you can choose to turn off all cookies. You do this through your browser settings. Since browser is a little different, look at your browser’s Help Menu to learn the correct way to modify your cookies. If you turn cookies off, Some of the features that make your site experience more efficient may not function properly that make your site experience more efficient and may not function properly.
        </p>
      </>
    ),
  },
  {
    title: 'Third-party disclosure',
    content: (
      <>
        <p>
          We do not sell, trade, or otherwise transfer to outside parties your Personally Identifiable Information unless we provide users with advance notice. This does not include website hosting partners and other parties who assist us in operating our website, conducting our business, or serving our users, so long as those parties agree to keep this information confidential. We may also release information when it’s release is appropriate to comply with the law, enforce our site policies, or protect ours or others’ rights, property or safety.
        </p>
        <p>
          However, non-personally identifiable visitor information may be provided to other parties for marketing, advertising, or other uses.
        </p>
      </>
    ),
  },
    {
    title: 'Third-party links',
    content: (
      <p>
        We do not include or offer third-party products or services on our website.
      </p>
    ),
  },
  {
    title: 'We have implemented the following:',
    content: (
      <p>
        We, along with third-party vendors such as Google use first-party cookies (such as the Google Analytics cookies) and third-party cookies (such as the DoubleClick cookie) or other third-party identifiers together to compile data regarding user interactions with ad impressions and other ad service functions as they relate to our website.
      </p>
    ),
  },
  {
    title: 'According to CalOPPA, we agree to the following:',
    content: (
      <ul className="space-y-2 list-disc pl-5">
        <li>Users can visit our site anonymously.</li>
        <li>Once this privacy policy is created, we will add a link to it on our home page or as a minimum, on the first significant page after entering our website.</li>
        <li>Our Privacy Policy link includes the word ‘Privacy’ and can easily be found on the page specified above.</li>
        <li>You will be notified of any Privacy Policy changes: On our Privacy Policy Page.</li>
        <li>Can change your personal information: By logging in to your account.</li>
      </ul>
    ),
  },
  {
    title: 'How does our site handle Do Not Track signals?',
    content: (
      <p>
        We honor Do Not Track signals and Do Not Track, plant cookies, or use advertising when a Do Not Track (DNT) browser mechanism is in place.
      </p>
    ),
  },
  {
    title: 'Does our site allow third-party behavioral tracking?',
    content: (
        <p>
            It’s also important to note that we allow third-party behavioral tracking.
        </p>
    ),
  },
  {
    title: 'COPPA (Children Online Privacy Protection Act)',
    content: (
        <>
            <p className="mb-4">
                When it comes to the collection of personal information from children under the age of 13 years old, the Children’s Online Privacy Protection Act (COPPA) puts parents in control. The Federal Trade Commission, United States’ consumer protection agency, enforces the COPPA Rule, which spells out what operators of websites and online services must do to protect children’s privacy and safety online.
            </p>
            <p>
                We do not specifically market to children under the age of 13 years old. Do we let third-parties, including ad networks or plug-ins collect PII from children under 13?
            </p>
        </>
    ),
  },
  {
    title: 'Fair Information Practices',
    content: (
        <p>
            The Fair Information Practices is not a section in the provided images but is listed as a topic. Content would need to be provided for this section.
        </p>
    ),
  },
  {
    title: 'CAN SPAM Act',
    content: (
      <p>
        The CAN-SPAM Act is a law that sets the rules for commercial email, establishes requirements for commercial messages, gives recipients the right to have emails stopped from being sent to them, and spells out tough penalties for violations.
      </p>
    ),
  },
  {
    title: 'We collect your email address in order to:',
    content: (
      <ul className="space-y-2 list-disc pl-5">
        <li>Send information, respond to inquiries, and/or other requests or questions.</li>
        <li>Process orders and to send information and updates pertaining to orders.</li>
        <li>Send you additional information related to your product and/or service.</li>
        <li>Market to our mailing list or continue to send emails to our clients after the original transaction has occurred.</li>
      </ul>
    ),
  },
  {
    title: 'To be in accordance with CANSPAM, we agree to the following:',
    content: (
      <ul className="space-y-2 list-disc pl-5">
        <li>Not use false or misleading subjects or email addresses.</li>
        <li>Identify the message as an advertisement in some reasonable way.</li>
        <li>Include the physical address of our business or site headquarters.</li>
        <li>Monitor third-party email marketing services for compliance, if one is used.</li>
        <li>Honor opt-out/unsubscribe requests quickly.</li>
        <li>Allow users to unsubscribe by using the link at the bottom of each email.</li>
      </ul>
    ),
  },
  {
    title: 'If at any time you would like to unsubscribe from receiving future emails, you can email us at',
    content: (
        <p>
            Follow the instructions at the bottom of each email and we will promptly remove you from ALL correspondence.
        </p>
    ),
  },
  {
    title: 'Contacting Us',
    content: 'If there are any questions regarding this privacy policy, you may contact us using the contact page.'
  },
];

const PrivacyAccordion = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(0); 

  const toggleItem = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div>
      <div className="space-y-4">
        {privacyData.map((item, index) => (
          <div key={index} className="border-b border-white/10 pb-4">
            <button
              onClick={() => toggleItem(index)}
              // --- PERUBAHAN UTAMA DI SINI ---
              className={`w-full flex justify-between items-center text-left text-lg font-medium transition-colors duration-300 ${activeIndex === index ? 'text-brand-accent' : 'text-white hover:text-brand-accent'}`}
            >
              <span className='pr-4'>{item.title}</span>
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
                  {item.title === 'Contacting Us' ? (
                     <p>
                        If there are any questions regarding this privacy policy, you may contact us using the <Link href="/contact" className="underline hover:text-white transition-colors">contact page</Link>.
                     </p>
                  ) : (
                    item.content
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrivacyAccordion;