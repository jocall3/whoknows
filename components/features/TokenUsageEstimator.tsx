import React, { useState } from 'react';
import { CpuChipIcon } from '../icons.tsx';
import { estimateTokenCount } from '../../services/index.ts';
import { useNotification } from '../../contexts/NotificationContext.tsx';
import { LoadingSpinner } from '../shared/index.tsx';

export const TokenUsageEstimator: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [estimate, setEstimate] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const { addNotification } = useNotification();

    const handleEstimate = async () => {
        if (!prompt.trim()) {
            addNotification('Please enter some text to estimate.', 'info');
            return;
        }
        setIsLoading(true);
        setEstimate(0);
        try {
            const { count } = await estimateTokenCount(prompt);
            setEstimate(count);
        } catch (e) {
            addNotification('Failed to estimate tokens via API.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
             <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center"><CpuChipIcon /><span className="ml-3">Token Usage Estimator</span></h1>
                <p className="text-text-secondary mt-1">Estimate Gemini token usage for a given prompt/task.</p>
            </header>
            <div className="flex-grow flex flex-col items-center justify-center gap-4">
                <div className="w-full max-w-2xl">
                    <label className="text-sm font-medium mb-2">Prompt</label>
                    <textarea 
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        className="w-full h-48 p-4 bg-surface border rounded-lg"
                        placeholder="Enter your prompt here..."
                    />
                </div>
                <button onClick={handleEstimate} disabled={isLoading} className="btn-primary px-6 py-3 min-w-[180px] flex items-center justify-center">
                    {isLoading ? <LoadingSpinner /> : 'Estimate Tokens via API'}
                </button>
                {estimate > 0 && (
                    <div className="mt-4 text-center">
                        <p className="text-4xl font-bold text-primary">{estimate}</p>
                        <p className="text-text-secondary">Estimated Tokens</p>
                    </div>
                )}
            </div>
        </div>
    );
};