// src/components/subscription/SubscriptionPromoBanner.tsx
'use client';

import { useState, useEffect } from 'react';

// --- PERUBAHAN DI SINI: Komponen TimerBox diperbarui ---
const TimerBox = ({ value, label }: { value: number, label: string }) => (
  <div className="flex flex-col items-center p-2 rounded-lg w-24 md:w-28 bg-black/20">
    <span className="text-5xl md:text-6xl font-bold text-brand-light tracking-widest">
      {String(value).padStart(2, '0')}
    </span>
    <span className="text-xs text-brand-light-muted uppercase tracking-wider mt-1">{label}</span>
  </div>
);

const SubscriptionPromoBanner = () => {
  // --- LOGIKA COUNTDOWN TIMER (Tidak ada perubahan) ---
  const initialDuration = (3 * 24 * 60 * 60) + (7 * 60 * 60) + (40 * 60) + 30;
  const [timeLeft, setTimeLeft] = useState(initialDuration);

  useEffect(() => {
    const storedEndTime = localStorage.getItem('promoEndTime');
    let endTime: number;

    if (storedEndTime && parseInt(storedEndTime) > Date.now()) {
      endTime = parseInt(storedEndTime);
    } else {
      endTime = Date.now() + initialDuration * 1000;
      localStorage.setItem('promoEndTime', String(endTime));
    }

    const timer = setInterval(() => {
      const now = Date.now();
      const remaining = Math.round((endTime - now) / 1000);

      if (remaining <= 0) {
        const newEndTime = Date.now() + initialDuration * 1000;
        localStorage.setItem('promoEndTime', String(newEndTime));
        setTimeLeft(initialDuration);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [initialDuration]);

  const days = Math.floor(timeLeft / (60 * 60 * 24));
  const hours = Math.floor((timeLeft % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((timeLeft % (60 * 60)) / 60);
  const seconds = timeLeft % 60;
  // --- AKHIR LOGIKA COUNTDOWN ---

  // --- LOGIKA PENGHITUNG ANGGOTA (Tidak ada perubahan) ---
  const MAX_MEMBERS = 500;
  const RESET_THRESHOLD = 450;
  const INITIAL_MEMBERS = 371;

  const [memberCount, setMemberCount] = useState(() => {
    if (typeof window !== 'undefined') {
        const savedCount = localStorage.getItem('memberCount');
        const count = savedCount ? parseInt(savedCount) : INITIAL_MEMBERS;
        return count >= RESET_THRESHOLD ? INITIAL_MEMBERS : count;
    }
    return INITIAL_MEMBERS;
  });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const scheduleNextIncrement = () => {
      const fixedInterval = 300000; // 5 menit dalam milidetik
      timeoutId = setTimeout(() => {
        setMemberCount(prevCount => {
          let nextCount = prevCount + 1;
          if (nextCount >= RESET_THRESHOLD) {
            nextCount = INITIAL_MEMBERS;
          }
          localStorage.setItem('memberCount', String(nextCount));
          if (nextCount < MAX_MEMBERS) {
            scheduleNextIncrement();
          }
          return nextCount;
        });
      }, fixedInterval);
    };
    scheduleNextIncrement();
    return () => clearTimeout(timeoutId);
  }, []);

  const progressPercentage = (memberCount / MAX_MEMBERS) * 100;
  // --- AKHIR LOGIKA PENGHITUNG ANGGOTA ---

  return (
    <div className="relative overflow-hidden bg-gradient-to-t from-brand-accent/0 to-brand-darkest text-center p-8 md:p-12 rounded-lg my-12 border border-brand-accent/30 shadow-2xl shadow-brand-accent/10">
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-brand-accent/15 rounded-full blur-3xl -z-0"></div>
      
      <div className="relative z-10 flex flex-col items-center">
        <h2 className="text-5xl md:text-7xl font-bold text-brand-accent leading-tight tracking-tighter">
          SAVE 99%
        </h2>
        
        {/* --- PERUBAHAN UTAMA: Teks dan ukuran font diubah --- */}
        <p className="text-xl md:text-2xl font-semibold text-brand-light mt-4 max-w-3xl mx-auto">
          Get unlimited access to our entire <strong className="font-bold">$3,750+</strong> premium font library with one simple subscription price.
        </p>
        <p className="text-base md:text-lg font-medium text-brand-light-muted mt-4 max-w-2xl mx-auto">
          Join our creative community now before this limited-time offer ends!
        </p>

        {/* --- PERUBAHAN DI SINI: Ukuran pemisah disesuaikan --- */}
        <div className="flex justify-center items-center gap-2 md:gap-4 my-8">
            <TimerBox value={days} label="Days" />
            <span className="text-5xl md:text-6xl font-bold text-brand-light/30 -mt-4">:</span>
            <TimerBox value={hours} label="Hours" />
            <span className="text-5xl md:text-6xl font-bold text-brand-light/30 -mt-4">:</span>
            <TimerBox value={minutes} label="Mins" />
            <span className="text-5xl md:text-6xl font-bold text-brand-light/30 -mt-4">:</span>
            <TimerBox value={seconds} label="Secs" />
        </div>

        <div className="w-full max-w-lg text-center">
            <p className="text-sm text-brand-light-muted font-semibold">
                Join <strong className="font-bold text-brand-light">{memberCount}</strong> of <strong className="font-bold text-brand-light">{MAX_MEMBERS}</strong> designers who have already upgraded!
            </p>
            <div className="w-full bg-black/20 rounded-full h-2.5 mt-2">
                <div 
                  className="bg-brand-accent h-2.5 rounded-full transition-all duration-1000 ease-linear" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPromoBanner;