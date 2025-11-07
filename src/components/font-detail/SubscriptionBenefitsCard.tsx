// src/components/font-detail/SubscriptionBenefitsCard.tsx
'use client';

import { useState, useEffect } from 'react';
import { Crown } from 'lucide-react';
import Button from '../Button';

const TimerBox = ({ value, label }: { value: number, label: string }) => (
  <div className="flex flex-col items-center p-2 rounded-md w-20">
    <span className="text-4xl font-bold text-brand-light tracking-widest">
      {String(value).padStart(2, '0')}
    </span>
    <span className="text-[10px] text-brand-light-muted uppercase tracking-wider">{label}</span>
  </div>
);

export default function SubscriptionBenefitsCard() {
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

  // --- LOGIKA PENGHITUNG ANGGOTA ---
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
      // --- PERUBAHAN UTAMA DI SINI: Interval diubah menjadi 5 menit ---
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
    <div className="relative overflow-hidden bg-gradient-to-t from-brand-accent/20 to-brand-darkest text-center p-6 rounded-lg mt-6 border border-brand-accent/30 shadow-2xl shadow-brand-accent/10">
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-brand-accent/10 rounded-full blur-3xl -z-0"></div>

      <div className="relative z-10 flex flex-col items-center space-y-4">
        <div className="flex flex-col items-center gap-2">
          <Crown className="w-8 h-8 text-brand-accent" />
          <h4 className="font-semibold text-brand-light text-lg">Limited Subscription Offer</h4>
        </div>

        <div className="w-full text-center">
            <p className="text-sm text-brand-light-muted">
                Join <strong className="text-brand-light font-bold">{memberCount}</strong> of <strong className="text-brand-light font-bold">{MAX_MEMBERS}</strong> members to get
            </p>
            <p className="text-2xl font-bold text-brand-accent my-1">99% OFF</p>
            <div className="w-full bg-white/10 rounded-full h-2.5 mt-2">
                <div 
                  className="bg-brand-accent h-2.5 rounded-full transition-all duration-1000 ease-linear" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
            </div>
        </div>

        <div className="w-full flex justify-center items-center gap-1 p-2 bg-black/20 rounded-lg">
            <TimerBox value={days} label="Days" />
            <span className="text-4xl font-bold text-brand-light-muted -mt-3">:</span>
            <TimerBox value={hours} label="Hours" />
            <span className="text-4xl font-bold text-brand-light-muted -mt-3">:</span>
            <TimerBox value={minutes} label="Mins" />
            <span className="text-4xl font-bold text-brand-light-muted -mt-3">:</span>
            <TimerBox value={seconds} label="Secs" />
        </div>
        
        <div className="pt-2 w-full"> 
            <Button href="/subscription" className="w-full">
                Claim Offer Now
            </Button>
        </div>
      </div>
    </div>
  );
}