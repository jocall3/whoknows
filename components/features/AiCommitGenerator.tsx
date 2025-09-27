import React, { useState, useCallback, useEffect } from 'react';
import { generateCommitMessageStream } from '../../services/index.ts';
import { GitBranchIcon } from '../icons/index.ts';
import { LoadingSpinner } from '../shared/index.tsx';

const exampleDiff = `diff --git a/src/components/Button.tsx b/src/components/Button.tsx
index 1b2c3d4..5e6f7g8 100644
--- a/src/components/Button.tsx
+++ b/src/components/Button.tsx
@@ -1,7 +1,7 @@
 import React from 'react';

 interface ButtonProps {
-  text: string;
+  label: string;
   onClick: () => void;
 }
`;

export const AiCommitGenerator: React.FC<{ diff?: string }> = ({ diff: initialDiff }) => {
    const [diff, setDiff] = useState<string>(initialDiff || exampleDiff);
    const [message, setMessage] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async (diffToAnalyze: string) => {
        if (!diffToAnalyze.trim()) {
            setError('Please paste a diff to generate a message.');
            return;
        }
        setIsLoading(true);
        setError('');
        setMessage('');
        try {
            const stream = generateCommitMessageStream(diffToAnalyze);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setMessage(fullResponse);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Failed to generate message: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (initialDiff) {
            setDiff(initialDiff);
            handleGenerate(initialDiff);
        }
    }, [initialDiff, handleGenerate]);
    
    const handleCopy = () => {
        navigator.clipboard.writeText(message);
    };

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8">
            <header className="mb-6">
                <h1 className="text-3xl flex items-center">
                    <GitBranchIcon />
                    <span className="ml-3">AI Commit Message Generator</span>
                </h1>
                <p className="text-slate-400 mt-1">Paste your diff and let Gemini craft the perfect commit message.</p>
            </header>
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-hidden">
                <div className="flex flex-col h-full">
                    <label htmlFor="diff-input" className="text-sm font-medium text-slate-400 mb-2">Git