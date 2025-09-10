import React, { useState } from 'react';
import { CodeBracketSquareIcon } from '../icons.tsx';
import { MarkdownRenderer } from '../shared/index.tsx';
import { useLocalStorage } from '../../hooks/useLocalStorage.ts';

const hookCode = `
\`\`\`tsx
import { useState } from 'react';

export const useLocalStorage = (key, initialValue) => {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.log(error);
            return initialValue;
        }
    });

    const setValue = (value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.log(error);
        }
    };
    return [storedValue, setValue];
};
\`\`\`
`;

export const UseLocalStorageHookGenerator: React.FC = () => {
    const [name, setName] = useLocalStorage('demo-name', 'Alice');

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <CodeBracketSquareIcon />
                    <span className="ml-3">useLocalStorage Hook Generator</span>
                </h1>
                <p className="text-text-secondary mt-1">Generate a custom useLocalStorage hook.</p>
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
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full p-2 bg-background border rounded"
                        />
                        <p className="mt-4">This input is saved to local storage. Try refreshing the page.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
