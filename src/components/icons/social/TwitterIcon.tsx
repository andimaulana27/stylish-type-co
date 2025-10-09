// src/components/icons/social/TwitterIcon.tsx
import React from 'react';

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg 
    version="1.1"
    id="Layer_1" 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 512 512"
    fill="currentColor"
    {...props}
  >
    <path 
      d="M256,17C124,17,17,124,17,256s107,239,239,239s239-107,239-239S388,17,256,17z M294.9,347.9l-49.2-64.3 l-56.2,64.3h-31.2l72.9-83.3l-76.9-100.5h64.3l44.4,58.7l51.4-58.7l0,0l0,0l0,0h31.2L277.5,242l80.1,106H294.9z"
    />
    <polygon points="190.7,181.8 303.5,329.2 320.8,329.2 209.3,181.8"/>
  </svg>
);

export default TwitterIcon;