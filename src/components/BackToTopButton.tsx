// src/components/BackToTopButton.tsx
'use client';

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <button
      onClick={scrollToTop}
      className={`
        fixed bottom-6 right-6 lg:bottom-10 lg:right-10
        p-4 rounded-full shadow-lg z-50
        
       
        bg-brand-primary-orange text-brand-darkest
        transition-all duration-300 ease-in-out transform 
        hover:shadow-lg hover:shadow-brand-primary-orange/40
        
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
      `}
      aria-label="Scroll to top"
    >
      <ArrowUp size={24} />
    </button>
  );
}