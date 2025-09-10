import React, { useState } from 'react';
import { BeakerIcon } from '../icons.tsx';
import { LoadingSpinner, MarkdownRenderer } from '../shared/index.tsx';
import { analyzeForMemoryLeaksStream } from '../../services/index.ts';

const exampleCode = `import { useEffect } from 'react';

function Ticker() {
  useEffect(() => {
    const timer = setInterval(() => {
      console.log('tick');
    }, 1000);

    // Missing cleanup function for the interval
  }, []);

  return <div>Ticker running...</div>
}`;

export const MemoryLeakDetector: React.FC = () => {
    const [code, setCode] = useState(exampleCode);
    const [analysis, setAnalysis] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAnalyze = async () => {
        setIsLoading(true);
        setAnalysis('');
        try {
            const stream = analyzeForMemoryLeaksStream(code);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setAnalysis(fullResponse);
            }
        } catch (e) {
            setAnalysis(`Error: ${e instanceof Error ? e.message : 'An unknown error occurred'}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <BeakerIcon />
                    <span className="ml-3">Memory Leak Analyzer</span>
                </h1>
                <p className="text-text-secondary mt-1">Use AI to analyze code for common memory leak patterns.</p>
            </header>
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                <div className="flex flex-col">
                    <label className="text-sm font-medium mb-2">Code to Analyze</label>
                    <textarea value={code} onChange={e => setCode(e.target.value)} className="flex-grow p-2 bg-surface border rounded font-mono text-xs"/>
                    <button onClick={handleAnalyze} disabled={isLoading} className="btn-primary w-full mt-4 py-3">{isLoading ? <LoadingSpinner/> : 'Analyze for Leaks'}</button>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium mb-2">AI Analysis</label>
                    <div className="flex-grow p-4 bg-background border rounded overflow-auto">
                        {isLoading && !analysis && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                        {analysis && <MarkdownRenderer content={analysis} />}
                    </div>
                </div>
            </div>
        </div>
    );
};