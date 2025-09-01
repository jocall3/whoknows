import React from 'react';

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => (
  <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{content}</pre>
);

export { MarkdownRenderer };
