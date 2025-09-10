import React, { useState } from 'react';
import { ChartBarIcon } from '../icons.tsx';
import { analyzeUrlDom } from '../../services/index.ts';
import { LoadingSpinner } from '../shared/index.tsx';

export const DomTreeAnalyzer: React.FC = () => {
    const [url, setUrl] = useState('https://react.dev');
    const [results, setResults] = useState<{ nodeCount: number, maxDepth: number, maxChildren: number } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAnalyze = async () => {
        if (!url.trim()) {
            setError('Please enter a URL.');
            return;
        }
        setIsLoading(true);
        setError('');
        setResults(null);
        try {
            const data = await analyzeUrlDom(url);
            setResults({
                nodeCount: data.nodeCount,
                maxDepth: data.maxDepth,
                maxChildren: data.maxChildren,
            });
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to analyze URL.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <ChartBarIcon />
                    <span className="ml-3">DOM Tree Analyzer</span>
                </h1>
                <p className="text-text-secondary mt-1">Get an AI-powered estimation of a URL's DOM complexity.</p>
            </header>
            <div className="flex-grow flex flex-col items-center justify-center gap-4">
                <div className="w-full max-w-lg">
                    <label className="text-sm font-medium mb-2">Target URL</label>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                            className="flex-grow p-2 bg-surface border rounded-md"
                            placeholder="https://example.com"
                        />
                        <button onClick={handleAnalyze} disabled={isLoading} className="btn-primary px-6 py-2">{isLoading ? <LoadingSpinner /> : 'Analyze'}</button>
                    </div>
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {results && (
                    <div className="mt-6 w-full max-w-lg bg-surface p-6 rounded-lg border border-border animate-pop-in">
                        <h3 className="text-lg font-bold mb-4">Analysis Results for <span className="text-primary">{url}</span></h3>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-3xl font-bold text-primary">{results.nodeCount}</p>
                                <p className="text-sm text-text-secondary">Total Nodes</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-primary">{results.maxDepth}</p>
                                <p className="text-sm text-text-secondary">Max Depth</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-primary">{results.maxChildren}</p>
                                <p className="text-sm text-text-secondary">Max Children</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
