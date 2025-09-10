import React, { useState } from 'react';
import { MagnifyingGlassIcon } from '../icons.tsx';
import { LoadingSpinner, MarkdownRenderer } from '../shared/index.tsx';
import { auditSeoFromUrlStream } from '../../services/index.ts';

export const SeoAuditor: React.FC = () => {
    const [url, setUrl] = useState('https://react.dev');
    const [analysis, setAnalysis] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAudit = async () => {
        setIsLoading(true);
        setError('');
        setAnalysis('');
        try {
            const stream = auditSeoFromUrlStream(url);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setAnalysis(fullResponse);
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to get analysis');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <MagnifyingGlassIcon />
                    <span className="ml-3">AI SEO Auditor</span>
                </h1>
                <p className="text-text-secondary mt-1">Get an AI-powered SEO audit based on Gemini's knowledge of a URL.</p>
            </header>
            <div className="flex gap-2">
                <input type="text" value={url} onChange={e => setUrl(e.target.value)} className="flex-grow p-2 bg-surface border rounded-md"/>
                <button onClick={handleAudit} disabled={isLoading} className="btn-primary px-6 py-2">{isLoading ? <LoadingSpinner/> : 'Audit'}</button>
            </div>
             <p className="text-xs text-center text-yellow-600 my-4 bg-yellow-400/10 p-2 rounded-md">
                <strong>Note:</strong> This is a simulation. The AI uses its training data to infer information about the site and does not perform a live crawl.
            </p>
            <div className="flex-grow bg-surface p-4 border rounded-lg overflow-y-auto">
                <h3 className="font-bold mb-2">AI-Generated SEO Report</h3>
                {isLoading && !analysis && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                {error && <p className="text-red-500">{error}</p>}
                {analysis && <MarkdownRenderer content={analysis} />}
            </div>
        </div>
    );
};