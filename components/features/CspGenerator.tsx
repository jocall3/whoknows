import React, { useState, useCallback } from 'react';
import { ShieldCheckIcon } from '../icons.tsx';
import { useNotification } from '../../contexts/NotificationContext.tsx';
import { generateCspFromDescription } from '../../services/index.ts';
import { LoadingSpinner } from '../shared/index.tsx';

export const CspGenerator: React.FC = () => {
    const [description, setDescription] = useState("A standard policy for a React app using Google Fonts and fetching data from its own API subdomain (api.example.com).");
    const [policy, setPolicy] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { addNotification } = useNotification();
    
    const handleGenerate = useCallback(async () => {
        if (!description.trim()) {
            addNotification('Please enter a description for the policy.', 'error');
            return;
        }
        setIsLoading(true);
        setPolicy('');
        try {
            const stream = generateCspFromDescription(description);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setPolicy(fullResponse);
            }
            addNotification('CSP generated!', 'success');
        } catch (e) {
             addNotification('Failed to generate CSP.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [description, addNotification]);

    const handleCopy = () => {
        navigator.clipboard.writeText(policy);
        addNotification('CSP copied to clipboard!', 'success');
    };

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <ShieldCheckIcon />
                    <span className="ml-3">CSP Generator</span>
                </h1>
                <p className="text-text-secondary mt-1">Generate a Content Security Policy for your web application using AI.</p>
            </header>
            <div className="flex-grow flex flex-col gap-4">
                <div className="flex flex-col">
                    <label className="text-sm font-medium mb-2">Describe your requirements</label>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="w-full p-2 bg-surface border rounded h-24"
                    />
                </div>
                <button onClick={handleGenerate} disabled={isLoading} className="btn-primary w-full max-w-sm mx-auto py-2">
                    {isLoading ? <LoadingSpinner /> : 'Generate Policy'}
                </button>
                <div className="flex flex-col flex-grow min-h-0">
                    <label className="text-sm font-medium mb-2">Generated Policy</label>
                    <pre className="relative flex-grow p-4 bg-background border rounded-lg text-primary font-mono text-sm overflow-auto">
                        {isLoading && !policy && <div className="absolute inset-0 flex items-center justify-center"><LoadingSpinner /></div>}
                        {policy}
                    </pre>
                    {policy && <button onClick={handleCopy} className="btn-primary mt-2 px-4 py-2 self-start">Copy Policy</button>}
                </div>
            </div>
        </div>
    );
};