import React, { useState } from 'react';
import { generateABTestWrapper } from '../../services/aiService.ts';
import { BeakerIcon } from '../icons.tsx';
import { LoadingSpinner, MarkdownRenderer } from '../shared/index.tsx';

const variantA_example = `<button className="bg-blue-500 text-white p-2 rounded">Sign Up</button>`;
const variantB_example = `<button className="bg-green-500 text-white p-2 rounded">Get Started</button>`;

export const ABTestAssistant: React.FC = () => {
    const [variantA, setVariantA] = useState(variantA_example);
    const [variantB, setVariantB] = useState(variantB_example);
    const [service, setService] = useState('LaunchDarkly');
    const [generatedCode, setGeneratedCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        setIsLoading(true);
        setError('');
        setGeneratedCode('');
        try {
            const code = await generateABTestWrapper(variantA, variantB, service);
            setGeneratedCode(code);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate wrapper component');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center"><BeakerIcon /><span className="ml-3">A/B Test Assistant</span></h1>
                <p className="text-text-secondary mt-1">Generate code snippets for A/B tests using a feature flagging service.</p>
            </header>
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col flex-1 min-h-0">
                        <label className="text-sm font-medium mb-2">Variant A Code</label>
                        <textarea value={variantA} onChange={e => setVariantA(e.target.value)} className="flex-grow p-2 bg-surface border rounded font-mono text-xs"/>
                    </div>
                     <div className="flex flex-col flex-1 min-h-0">
                        <label className="text-sm font-medium mb-2">Variant B Code</label>
                        <textarea value={variantB} onChange={e => setVariantB(e.target.value)} className="flex-grow p-2 bg-surface border rounded font-mono text-xs"/>
                    </div>
                     <div>
                        <label className="text-sm font-medium">Feature Flag Service</label>
                        <select value={service} onChange={e => setService(e.target.value)} className="w-full mt-1 p-2 bg-surface border rounded">
                            <option>LaunchDarkly</option>
                            <option>PostHog</option>
                            <option>Generic</option>
                        </select>
                    </div>
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary w-full py-3">{isLoading ? <LoadingSpinner/> : 'Generate Wrapper Component'}</button>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium mb-2">Generated Wrapper Component</label>
                    <div className="flex-grow p-1 bg-background border rounded overflow-auto">
                        {isLoading ? <div className="flex justify-center items-center h-full"><LoadingSpinner /></div> : (
                            <>
                                {error && <p className="text-red-500 p-4">{error}</p>}
                                {generatedCode && <MarkdownRenderer content={generatedCode} />}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
