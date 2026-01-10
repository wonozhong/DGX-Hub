import React from 'react';

export const DGXLogo = ({ className = "h-8" }: { className?: string }) => {
  return (
    <svg viewBox="0 0 320 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Letter D - Compound Path */}
      <path 
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 10 H60 L85 35 V65 L60 90 H10 V10 Z M35 30 V70 H55 L65 60 V40 L55 30 H35 Z"
        fill="currentColor" 
      />
      
      {/* Letter G - Compound Path with Arrow Hole */}
      <path 
        fillRule="evenodd"
        clipRule="evenodd"
        d="M115 10 H165 L190 35 V65 L165 90 H115 L90 65 V35 L115 10 Z M130 42 H150 V32 L170 50 L150 68 V58 H130 V42 Z"
        fill="currentColor" 
      />
      
      {/* Letter X */}
      {/* Left Chevron (White) > */}
      <path d="M205 10 H235 L265 50 L235 90 H205 L235 50 L205 10 Z" fill="currentColor" />
      
      {/* Right Upper Arm (Purple) */}
      <path d="M275 10 H305 L280 50 H250 L275 10 Z" fill="#5E36A9" />
      
      {/* Right Lower Arm (Red) */}
      <path d="M250 50 H280 L305 90 H275 L250 50 Z" fill="#D61C3A" />
    </svg>
  );
};
