// src/components/icons/footer/FacebookIcon.tsx
import React from 'react';

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg 
    viewBox="0 0 1000 1000" 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M500,41.67C246.87,41.67,41.67,246.87,41.67,500S246.87,958.33,500,958.33S958.33,753.13,958.33,500S753.13,41.67,500,41.67 z M663.55,303.8h-48.22c-47.5,0-62.31,29.48-62.31,59.71v71.73h106.05l-16.95,110.53h-89.1l0.17,268.79 c-19.47,3.05-39.59,3.05-59.92,3.05c-20.32,0-40.28-1.59-59.75-4.65v-267.2h-97.09V435.24h97.09V351 c0-95.83,57.09-148.77,144.43-148.77c41.83,0,85.59,7.47,85.59,7.47V303.8z"/>
  </svg>
);

export default FacebookIcon;
