import React, { useState } from 'react';
import { PaperAirplaneIcon } from '../icons.tsx';
import { explainCorsError } from '../../services/index.ts';
import { LoadingSpinner, MarkdownRenderer } from '../shared/index.tsx';

export const CorsProxySimulator: React.FC = () => {
    const [origin, setOrigin] = useState('https://evil.com');
    const [target, setTarget] = useState('https://api.myapp.com/data');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSimulate = async () => {
        setIsLoading(true);
        setResult('');
        try {
            const stream = explainCorsError(origin, target, { 'X-Requested-With': 'XMLHttpRequest' });
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setResult(fullResponse);
            }
        } catch (e) {
            setResult('Error getting explanation.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <PaperAirplaneIcon />
                    <span className="ml-3">CORS Simulator & Explainer</span>
                </h1>
                <p className="text-text-secondary mt-1">Simulate a cross-origin request and get an AI-powered explanation of the result.</p>
            </header>
            <div className="flex-grow flex flex-col items-center justify-center gap-4">
                <div className="w-full max-w-lg bg-surface p-6 rounded-lg border">
                    <h3 className="font-bold mb-2">Simulated Request</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm">Origin</label>
                            <input value={origin} onChange={e => setOrigin(e.target.value)} className="w-full p-2 bg-background border rounded mt-1"/>
                        </div>
                        <div>
                             <label className="text-sm">Target</label>
                            <input value={target} onChange={e => setTarget(e.target.value)} className="w-full p-2 bg-background border rounded mt-1"/>
                        </div>
                    </div>
                    <button onClick={handleSimulate} disabled={isLoading} className="btn-primary w-full mt-4 py-2">
                        {isLoading ? <LoadingSpinner /> : 'Simulate Request & Get Explanation'}
                    </button>
                </div>
                <div className="mt-4 w-full max-w-2xl flex-grow min-h-[200px] flex flex-col">
                    <label className="text-sm font-medium mb-2">AI Explanation</label>
                    <div className="flex-grow p-4 bg-background border rounded-lg overflow-y-auto">
                        {isLoading && !result && <div className="flex justify-center items-center h-full"><LoadingSpinner/></div>}
                        {result && <MarkdownRenderer content={result} />}
                    </div>
                </div>
            </div>
        </div>
    );
};