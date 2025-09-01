import React from 'react';

export const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center w-full h-full">
    <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
    <span className="ml-2 text-primary">Loading...</span>
  </div>
);

export const MarkdownRenderer: React.FC<{ markdown: string }> = ({ markdown }) => (
  <div dangerouslySetInnerHTML={{ __html: markdown }} />
);
