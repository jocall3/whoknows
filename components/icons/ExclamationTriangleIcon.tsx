import React from 'react';
const IconWrapper: React.FC<{children: React.ReactNode; className?: string}> = ({ children, className }) => (
    <div className={className ?? 'w-6 h-6'}>{children}</div>
);
export const ExclamationTriangleIcon: React.FC = () => (
  <IconWrapper>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12,2 22,20 2,20" />
      <line x1="12" y1="8" x2="12" y2="14" />
      <circle cx="12" cy="17" r="1" />
    </svg>
  </IconWrapper>
);
