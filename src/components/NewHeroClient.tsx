// src/components/NewHeroClient.tsx
'use client';

import { useState, useEffect, useRef } from 'react';

const ANIMATION_DELAY_PER_LINE = 800;
const ANIMATION_DURATION = 1000;
const SET_DISPLAY_DURATION = 4000;

const HEADLINES_SETS = [
  ['Unlimited Font', 'Subscription.', '99% Less Cost!'],
];

const NewHeroClient = () => {
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [visibleLines, setVisibleLines] = useState([false, false, false]);
  const [isExiting, setIsExiting] = useState(false);

  // --- PERBAIKAN: Ganti logika setInterval dengan requestAnimationFrame ---
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();

  const animate = (time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;

      // Logika untuk berganti set headline setiap SET_DISPLAY_DURATION
      if (deltaTime > SET_DISPLAY_DURATION) {
        previousTimeRef.current = time;
        setIsExiting(true);
        
        setTimeout(() => {
          setVisibleLines([false, false, false]);
          setCurrentSetIndex((prevIndex) => (prevIndex + 1) % HEADLINES_SETS.length);
          setIsExiting(false);
          
          setTimeout(() => setVisibleLines([true, false, false]), 50);
          setTimeout(() => setVisibleLines([true, true, false]), ANIMATION_DELAY_PER_LINE);
          setTimeout(() => setVisibleLines([true, true, true]), ANIMATION_DELAY_PER_LINE * 2);
        }, 100);
      }
    } else {
      previousTimeRef.current = time;
      // Animasi awal
      setVisibleLines([true, false, false]);
      setTimeout(() => setVisibleLines([true, true, false]), ANIMATION_DELAY_PER_LINE);
      setTimeout(() => setVisibleLines([true, true, true]), ANIMATION_DELAY_PER_LINE * 2);
    }
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);
  // --- AKHIR PERBAIKAN ---

  const currentHeadlines = HEADLINES_SETS[currentSetIndex];

  return (
    <h1 className="font-hero text-white uppercase leading-tight text-[8vw] md:text-7xl lg:text-9xl h-[280px] md:h-[320px] lg:h-[450px] overflow-hidden">
      <div
        className={`transition-all ease-out ${isExiting ? `duration-100 opacity-0` : `duration-${ANIMATION_DURATION}`} ${visibleLines[0] && !isExiting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'} text-brand-primary-orange`}
      >
        {currentHeadlines[0]}
      </div>
      <div
        className={`transition-all ease-out ${isExiting ? `duration-100 opacity-0` : `duration-${ANIMATION_DURATION}`} ${visibleLines[1] && !isExiting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'}`}
      >
        {currentHeadlines[1]}
      </div>
      <div
        className={`transition-all ease-out ${isExiting ? `duration-100 opacity-0` : `duration-${ANIMATION_DURATION}`} ${visibleLines[2] && !isExiting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'}`}
      >
        {currentHeadlines[2]}
      </div>
    </h1>
  );
};

export default NewHeroClient;