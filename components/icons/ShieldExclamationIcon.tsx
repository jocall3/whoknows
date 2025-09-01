import React from 'react';
const IconWrapper: React.FC<{children: React.ReactNode; className?: string}> = ({ children, className }) => (
    <div className={className ?? 'w-6 h-6'}>{children}</div>
);
export const ShieldExclamationIcon: React.FC = () => (
  <IconWrapper>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L20 6v6c0 5-3.8 9.3-8 10-4.2-.7-8-5-8-10V6l8-4z" />
      <line x1="12" y1="10" x2="12" y2="14" />
      <circle cx="12" cy="17" r="1" />
    </svg>
  </IconWrapper>
);
