import React, { useState } from 'react';
import { PaperAirplaneIcon, SparklesIcon } from '../icons.tsx';
import { useNotification } from '../../contexts/NotificationContext.tsx';
import { generateWebhookPayload } from '../../services/index.ts';
import { LoadingSpinner } from '../shared/index.tsx';

export const WebhookEventSimulator: React.FC = () => {
    const [prompt, setPrompt] = useState('a GitHub push event to the main branch');
    const [payload, setPayload] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { addNotification } = useNotification();
    
    const handleGenerate = async () => {
        setIsLoading(true);
        setPayload('');
        try {
            const result = await generateWebhookPayload(prompt);
            const jsonMatch = result.match(/```json\n([\s\S]*?)\n```/);
            setPayload(jsonMatch ? jsonMatch[1] : result);
        } catch (e) {
            addNotification('Failed to generate payload', 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCopy = () => {
        navigator.clipboard.writeText(payload);
        addNotification('Payload copied!', 'success');
    };

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <PaperAirplaneIcon />
                    <span className="ml-3">Webhook Event Simulator</span>
                </h1>
                <p className="text-text-secondary mt-1">Generate realistic webhook payloads using AI.</p>
            </header>
            <div className="flex-grow flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 p-4 bg-surface rounded-lg border w-full max-w-2xl">
                    <input 
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        className="flex-grow p-2 bg-background border rounded"
                        placeholder="Describe the event..."
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary px-4 py-2 flex items-center gap-2">
                        {isLoading ? <LoadingSpinner /> : <><SparklesIcon /> Generate</>}
                    </button>
                </div>
                 <div className="w-full max-w-3xl flex-grow flex flex-col">
                     <pre className="flex-grow p-4 bg-background border rounded-lg font-mono text-xs overflow-auto">{payload}</pre>
                     {payload && <button onClick={handleCopy} className="btn-primary w-full mt-2 py-2">Copy Payload</button>}
                </div>
            </div>
        </div>
    );
};