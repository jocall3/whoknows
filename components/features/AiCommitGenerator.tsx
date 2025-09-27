import React, { useState, useCallback, useEffect } from 'react';
import { generateCommitMessageStream } from '../../services/index.ts';
import { GitBranchIcon } from '../icons/index.ts';
import { LoadingSpinner } from '../shared/index.tsx';
import { useNotification } from '../../contexts/NotificationContext.tsx';

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
    const { addNotification } = useNotification();

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
        addNotification('Commit message copied!', 'success');
    };

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <GitBranchIcon />
                    <span className="ml-3">AI Commit Message Generator</span>
                </h1>
                <p className="text-text-secondary mt-1">Paste your diff and let Gemini craft the perfect commit message.</p>
            </header>
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                <div className="flex flex-col h-full">
                    <label htmlFor="diff-input" className="text-sm font-medium text-text-secondary mb-2">Git Diff</label>
                    <textarea
                        id="diff-input"
                        value={diff}
                        onChange={(e) => setDiff(e.target.value)}
                        placeholder="Paste your git diff here..."
                        className="flex-grow p-4 bg-surface border border-border rounded-md resize-none font-mono text-sm"
                        spellCheck="false"
                    />
                    <button
                        onClick={() => handleGenerate(diff)}
                        disabled={isLoading}
                        className="btn-primary mt-4 w-full flex items-center justify-center px-6 py-3"
                    >
                        {isLoading ? <LoadingSpinner /> : 'Generate Message'}
                    </button>
                </div>
                <div className="flex flex-col h-full">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-text-secondary">Generated Message</label>
                        {message && !isLoading && (
                            <button onClick={handleCopy} className="px-3 py-1 bg-gray-100 dark:bg-slate-700 text-xs rounded-md hover:bg-gray-200 dark:hover:bg-slate-600">
                                Copy Message
                            </button>
                        )}
                    </div>
                    <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                        {isLoading && <div className="flex items-center justify-center h-full"><LoadingSpinner /></div>}
                        {error && <p className="text-red-500">{error}</p>}
                        {message && !isLoading && <pre className="whitespace-pre-wrap font-sans text-sm">{message}</pre>}
                        {!isLoading && !message && !error && (
                            <div className="text-text-secondary h-full flex items-center justify-center">
                                Commit message will appear here.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
