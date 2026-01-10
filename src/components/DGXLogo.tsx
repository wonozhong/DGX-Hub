import React from 'react';

export const DGXLogo = ({ className = "h-8" }: { className?: string }) => {
  return (
    <svg viewBox="0 0 300 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Letter D */}
      <path d="M10 10 H60 L80 30 V70 L60 90 H10 V10 Z M30 30 V70 H50 L60 60 V40 L50 30 H30 Z" fill="currentColor" />
      
      {/* Letter G */}
      <path d="M100 10 H150 L170 30 V45 H140 L130 35 V65 L140 55 H150 V60 L160 70 V70 L150 90 H100 L80 70 V30 L100 10 Z" fill="currentColor" />
      
      {/* Letter X */}
      {/* Left Chevron (White) */}
      <path d="M190 10 L220 50 L190 90 H215 L245 50 L215 10 H190 Z" fill="currentColor" />
      
      {/* Right Upper Arm (Purple #5E36A9) */}
      <path d="M250 10 L280 10 L255 45 L225 45 Z" fill="#5E36A9" />
      
      {/* Right Lower Arm (Red #D61C3A) */}
      <path d="M255 55 L280 90 H250 L225 55 Z" fill="#D61C3A" />
    </svg>
  );
};
