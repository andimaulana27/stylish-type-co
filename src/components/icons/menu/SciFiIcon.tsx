// src/components/icons/menu/SciFiIcon.tsx
import React from 'react';

const SciFiIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    xmlnsXlink="http://www.w3.org/1999/xlink" 
    zoomAndPan="magnify" 
    viewBox="0 0 375 374.999991" 
    preserveAspectRatio="xMidYMid meet" 
    version="1.0"
    {...props} // Menerima props seperti className
  >
    <defs>
      <g/>
      <clipPath id="scifi-869c55a159">
        <rect x="0" width="255" y="0" height="189"/>
      </clipPath>
      <clipPath id="scifi-b99506f8da">
        <path d="M 37.5 37.5 L 337.5 37.5 L 337.5 337.5 L 37.5 337.5 Z M 37.5 37.5 " clipRule="nonzero"/>
      </clipPath>
      <clipPath id="scifi-a84be045d7">
        <path d="M 60.75 37.5 L 314.25 37.5 C 327.089844 37.5 337.5 47.910156 337.5 60.75 L 337.5 314.25 C 337.5 327.089844 327.089844 337.5 314.25 337.5 L 60.75 337.5 C 47.910156 337.5 37.5 327.089844 37.5 314.25 L 37.5 60.75 C 37.5 47.910156 47.910156 37.5 60.75 37.5 Z M 60.75 37.5 " clipRule="nonzero"/>
      </clipPath>
    </defs>
    <g transform="matrix(1, 0, 0, 1, 54, 93)">
      <g clipPath="url(#scifi-869c55a159)">
        <g fill="currentColor" fillOpacity="1">
          <g transform="translate(1.475407, 150.617884)">
            <g>
              <path d="M 11.984375 0 L 11.984375 -86.890625 L 32.953125 -107.859375 L 105.984375 -107.859375 L 126.953125 -86.890625 L 126.953125 0 L 105.984375 0 L 105.984375 -43.4375 L 32.953125 -43.4375 L 32.953125 0 Z M 32.953125 -64.40625 L 105.984375 -64.40625 L 105.984375 -86.890625 L 32.953125 -86.890625 Z M 32.953125 -64.40625 "/>
            </g>
          </g>
        </g>
        <g fill="currentColor" fillOpacity="1">
          <g transform="translate(126.559267, 150.617884)">
            <g>
              <path d="M 11.984375 0 L 11.984375 -86.890625 L 32.953125 -107.859375 L 105.984375 -107.859375 L 126.953125 -86.890625 L 126.953125 0 L 105.984375 0 L 105.984375 -43.4375 L 32.953125 -43.4375 L 32.953125 0 Z M 32.953125 -64.40625 L 105.984375 -64.40625 L 105.984375 -86.890625 L 32.953125 -86.890625 Z M 32.953125 -64.40625 "/>
            </g>
          </g>
        </g>
      </g>
    </g>
    <g clipPath="url(#scifi-b99506f8da)">
      <g clipPath="url(#scifi-a84be045d7)">
        {/* --- PERUBAHAN UTAMA DI SINI --- */}
        <path 
            strokeLinecap="butt" 
            transform="matrix(0.75, 0, 0, 0.75, 37.500002, 37.499998)" 
            fill="none" 
            strokeLinejoin="miter" 
            d="M 30.999999 0.00000328333 L 369.000022 0.00000328333 C 386.119814 0.00000328333 400.000024 13.880213 400.000024 31.000005 L 400.000024 369.000028 C 400.000024 386.11982 386.119814 400.00003 369.000022 400.00003 L 30.999999 400.00003 C 13.880207 400.00003 -0.00000271667 386.11982 -0.00000271667 369.000028 L -0.00000271667 31.000005 C -0.00000271667 13.880213 13.880207 0.00000328333 30.999999 0.00000328333 Z M 30.999999 0.00000328333 " 
            stroke="currentColor" 
            strokeWidth="60" 
            strokeOpacity="1" 
            strokeMiterlimit="4"
        />
      </g>
    </g>
  </svg>
);

export default SciFiIcon;