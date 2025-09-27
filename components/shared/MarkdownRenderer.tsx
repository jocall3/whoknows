import React, { useEffect, useRef } from 'react';
import { marked } from 'marked';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderMarkdown = async () => {
      if (containerRef.current) {
        if (content) {
          const parsedContent = await marked.parse(content, { gfm: true, breaks: true });
          containerRef.current.innerHTML = parsedContent as string;

          containerRef.current.querySelectorAll('pre code').forEach(block => {
            const pre = block.parentElement;
            if (!pre || pre.querySelector('.copy-button')) return;
            
            const button = document.createElement('button');
            button.innerText = 'Copy';
            button.className = 'copy-button absolute top-2 right-2 px-2 py-1 bg-gray-200 dark:bg-slate-700 text-text-primary text-xs rounded hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors opacity-0 group-hover:opacity-100';
            
            button.onclick = () => {
              navigator.clipboard.writeText(block.textContent || '');
              button.innerText = 'Copied!';
              setTimeout(() => { button.innerText = 'Copy'; }, 2000);
            };
            
            pre.classList.add('group', 'relative');
            pre.appendChild(button);
          });
        } else {
          containerRef.current.innerHTML = '';
        }
      }
    };
    renderMarkdown();
  }, [content]);

  return (
    <div
      ref={containerRef}
      className="prose dark:prose-invert max-w-none text-text-primary prose-code:text-primary prose-code:bg-surface prose-code:p-1 prose-code:rounded-sm prose-pre:bg-surface prose-pre:text-text-primary prose-pre:p-4"
    />
  );
};
