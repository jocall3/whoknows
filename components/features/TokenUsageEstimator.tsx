import React, { useState, useMemo } from 'react';
import { CpuChipIcon } from '../icons.tsx';

export const TokenUsageEstimator: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [estimate, setEstimate] = useState(0);

    const handleEstimate = () => {
        // A very rough approximation. A real tokenizer would be more accurate.
        // On average, a token is about 0.75 words.
        const wordCount = prompt.trim().split(/\s+/).filter(Boolean).length;
        const estimatedTokens = Math.ceil(wordCount * 1.33);
        setEstimate(estimatedTokens);
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
                <button onClick={handleEstimate} className="btn-primary px-6 py-3">
                    Estimate Tokens
                </button>
                {estimate > 0 && (
                    <div className="mt-4 text-center">
                        <p className="text-4xl font-bold text-primary">{estimate}</p>
                        <p className="text-text-secondary">Estimated Tokens</p>
                    </div>
                )}
                 <p className="text-xs text-center text-yellow-600 mt-4 bg-yellow-400/10 p-2 rounded-md max-w-2xl">
                    <strong>Disclaimer:</strong> This is a coarse, non-API-based estimate using a simple word count multiplier. The actual token count used by the Gemini API may vary.
                </p>
            </div>
        </div>
    );
};
