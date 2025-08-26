import React, { useState } from 'react';
import { DocumentTextIcon, SparklesIcon } from '../icons.tsx';
import { generateMockData } from '../../services/aiService.ts';
import { LoadingSpinner } from '../shared/index.tsx';
import { useNotification } from '../../contexts/NotificationContext.tsx';

export const MockUserDataGenerator: React.FC = () => {
    const [data, setData] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { addNotification } = useNotification();

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            const result = await generateMockData('a user with id, name, email, and avatar url', 10);
            setData(JSON.stringify(result, null, 2));
        } catch (e) {
            addNotification('Failed to generate data', 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCopy = () => {
        navigator.clipboard.writeText(data);
        addNotification('Data copied to clipboard!', 'success');
    };

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <DocumentTextIcon />
                    <span className="ml-3">Mock User Data Generator</span>
                </h1>
                <p className="text-text-secondary mt-1">Generate realistic mock user data for testing.</p>
            </header>
            <div className="flex-grow flex flex-col items-center gap-4">
                <button onClick={handleGenerate} disabled={isLoading} className="btn-primary px-6 py-3 flex items-center gap-2">
                    {isLoading ? <LoadingSpinner /> : <><SparklesIcon /> Generate 10 Users</>}
                </button>
                <div className="w-full max-w-3xl flex-grow flex flex-col">
                     <textarea value={data} readOnly className="flex-grow p-4 bg-background border rounded-lg font-mono text-xs" placeholder="Generated data will appear here..."/>
                     {data && <button onClick={handleCopy} className="btn-primary w-full mt-2 py-2">Copy JSON</button>}
                </div>
            </div>
        </div>
    );
};
