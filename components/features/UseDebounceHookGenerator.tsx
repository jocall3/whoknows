import React, { useState, useEffect } from 'react';
import { CodeBracketSquareIcon } from '../icons.tsx';
import { MarkdownRenderer } from '../shared/index.tsx';

const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => { clearTimeout(handler); };
    }, [value, delay]);
    return debouncedValue;
};

const hookCode = `
\`\`\`tsx
import { useState, useEffect } from 'react';

export const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};
\`\`\`
`;

export const UseDebounceHookGenerator: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <CodeBracketSquareIcon />
                    <span className="ml-3">useDebounce Hook Generator</span>
                </h1>
                <p className="text-text-secondary mt-1">Generate a custom useDebounce hook.</p>
            </header>
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                <div className="flex flex-col">
                    <label className="text-sm font-medium mb-2">Hook Code</label>
                    <div className="flex-grow p-1 bg-background border rounded overflow-auto">
                        <MarkdownRenderer content={hookCode} />
                    </div>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium mb-2">Live Demo</label>
                    <div className="flex-grow p-4 bg-surface border rounded">
                        <input 
                            type="text" 
                            placeholder="Type here..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full p-2 bg-background border rounded"
                        />
                        <div className="mt-4">
                            <p><strong>Typing:</strong> {searchTerm}</p>
                            <p><strong>Debounced:</strong> {debouncedSearchTerm}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
