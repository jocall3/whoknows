import React, { useState } from 'react';
import * as Diff from 'diff';
import { addAriaAttributes } from '../../services/aiService.ts';
import { EyeIcon } from '../icons.tsx';
import { LoadingSpinner, MarkdownRenderer } from '../shared/index.tsx';

const exampleHtml = `<div class="menu">
  <div>Menu Item 1</div>
  <div class="active">Menu Item 2</div>
  <div>Menu Item 3</div>
</div>`;

const DiffViewer: React.FC<{ oldCode: string, newCode: string }> = ({ oldCode, newCode }) => {
    const diff = Diff.diffLines(oldCode, newCode);
    return (
        <pre className="whitespace-pre-wrap font-mono text-xs">
            {diff.map((part, index) => {
                const color = part.added ? 'bg-green-500/20 text-green-800 dark:text-green-300' : part.removed ? 'bg-red-500/20' : 'text-text-secondary';
                return <div key={index} className={color}>{part.value}</div>;
            })}
        </pre>
    );
};

export const AccessibilityAnnotation: React.FC = () => {
    const [html, setHtml] = useState(exampleHtml);
    const [annotatedHtml, setAnnotatedHtml] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAnnotate = async () => {
        setIsLoading(true);
        setAnnotatedHtml('');
        try {
            const result = await addAriaAttributes(html);
            setAnnotatedHtml(result.replace(/^```(?:\w+\n)?/, '').replace(/```$/, ''));
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center"><EyeIcon /><span className="ml-3">Accessibility Annotation</span></h1>
                <p className="text-text-secondary mt-1">Add ARIA attributes to HTML to improve accessibility.</p>
            </header>
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                <div className="flex flex-col">
                    <label className="text-sm font-medium mb-2">Original HTML</label>
                    <textarea value={html} onChange={e => setHtml(e.target.value)} className="flex-grow p-2 bg-surface border rounded font-mono text-xs"/>
                    <button onClick={handleAnnotate} disabled={isLoading} className="btn-primary w-full mt-4 py-3">{isLoading ? <LoadingSpinner/> : 'Annotate with ARIA'}</button>
                </div>
                 <div className="flex flex-col">
                    <label className="text-sm font-medium mb-2">Annotated HTML</label>
                    <div className="flex-grow p-2 bg-background border rounded overflow-auto">
                        {isLoading ? <div className="flex justify-center items-center h-full"><LoadingSpinner /></div> : <DiffViewer oldCode={html} newCode={annotatedHtml} />}
                    </div>
                </div>
            </div>
        </div>
    );
};
