import React, { useState } from 'react';
import { analyzeCompetitorUrl } from '../../services/aiService.ts';
import { MagnifyingGlassIcon } from '../icons.tsx';
import { LoadingSpinner, MarkdownRenderer } from '../shared/index.tsx';
import { useNotification } from '../../contexts/NotificationContext.tsx';

export const CompetitiveAnalysisBot: React.FC = () => {
    const [url, setUrl] = useState('https://www.stripe.com');
    const [analysis, setAnalysis] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { addNotification } = useNotification();

    const handleAnalyze = async () => {
        if (!url.trim()) {
            addNotification('Please enter a URL.', 'error');
            return;
        }
        setIsLoading(true);
        setAnalysis('');
        try {
            const result = await analyzeCompetitorUrl(url);
            setAnalysis(result);
        } catch (err) {
            addNotification(err instanceof Error ? err.message : 'Analysis failed.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center"><MagnifyingGlassIcon /><span className="ml-3">Competitive Analysis Bot</span></h1>
                <p className="text-text-secondary mt-1">Given a URL, AI will summarize the likely tech stack and features.</p>
            </header>
            <div className="flex items-center gap-2 mb-4">
                <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://competitor.com" className="flex-grow p-2 bg-surface border rounded"/>
                <button onClick={handleAnalyze} disabled={isLoading} className="btn-primary px-6 py-2">{isLoading ? <LoadingSpinner/> : 'Analyze'}</button>
            </div>
            <p className="text-xs text-center text-yellow-600 mb-4 bg-yellow-400/10 p-2 rounded-md">
                <strong>Note:</strong> This is a simulation. The AI uses its training data to infer information about the site and does not perform a live scrape.
            </p>
            <div className="flex-grow p-4 bg-background border rounded overflow-auto">
                {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                {analysis && <MarkdownRenderer content={analysis} />}
            </div>
        </div>
    );
};
