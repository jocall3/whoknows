import React, { useState } from 'react';
import { DocumentTextIcon } from '../icons.tsx';
import { useNotification } from '../../contexts/NotificationContext.tsx';

const generateLorem = (count: number, type: 'paragraphs' | 'sentences' | 'words') => {
    const lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
    if (type === 'words') return lorem.split(' ').slice(0, count).join(' ');
    if (type === 'sentences') return lorem.split('. ').slice(0, count).join('. ') + '.';
    return Array(count).fill(lorem).join('\\n\\n');
};

export const LoremIpsumGenerator: React.FC = () => {
    const [count, setCount] = useState(3);
    const [type, setType] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs');
    const [text, setText] = useState('');
    const { addNotification } = useNotification();

    const handleGenerate = () => {
        setText(generateLorem(count, type));
    };
    
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        addNotification('Text copied to clipboard!', 'success');
    };

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <DocumentTextIcon />
                    <span className="ml-3">Lorem Ipsum Generator</span>
                </h1>
                <p className="text-text-secondary mt-1">Generate placeholder text with various options.</p>
            </header>
            <div className="flex-grow flex flex-col items-center gap-4">
                <div className="flex items-end gap-2 p-4 bg-surface rounded-lg border">
                    <input type="number" value={count} onChange={e => setCount(Number(e.target.value))} className="w-24 p-2 bg-background border rounded"/>
                    <select value={type} onChange={e => setType(e.target.value as any)} className="p-2 bg-background border rounded">
                        <option value="paragraphs">Paragraphs</option>
                        <option value="sentences">Sentences</option>
                        <option value="words">Words</option>
                    </select>
                    <button onClick={handleGenerate} className="btn-primary px-6 py-2">Generate</button>
                </div>
                <div className="w-full max-w-3xl flex-grow flex flex-col">
                     <textarea value={text} readOnly className="flex-grow p-4 bg-background border rounded-lg" placeholder="Generated text will appear here..."/>
                     {text && <button onClick={handleCopy} className="btn-primary w-full mt-2 py-2">Copy to Clipboard</button>}
                </div>
            </div>
        </div>
    );
};
