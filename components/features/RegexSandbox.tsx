import React, { useState, useMemo, useCallback, useEffect } from 'react';
// Fix: Corrected import path for ai services.
import { generateRegExStream } from '../../services/index.ts';
import { BeakerIcon } from '../icons/index.ts';
import { LoadingSpinner } from '../shared/index.tsx';

const commonPatterns = [
    { name: 'Email', pattern: '/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g' },
    { name: 'URL', pattern: '/https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&\\/\\/=]*)/g' },
    { name: 'IPv4 Address', pattern: '/((25[0-5]|(2[0-4]|1\\d|[1-9]|)\\d)\\.?\\b){4}/g' },
    { name: 'Date (YYYY-MM-DD)', pattern: '/\\d{4}-\\d{2}-\\d{2}/g' },
];

const CheatSheet = () => (
    <div className="bg-surface border border-border p-4 rounded-lg">
        <h3 className="text-lg font-bold mb-2">Regex Cheat Sheet</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs font-mono">
            <p><span className="text-primary">.</span> - Any character</p>
            <p><span className="text-primary">\d</span> - Any digit</p>
            <p><span className="text-primary">\w</span> - Word character</p>
            <p><span className="text-primary">\s</span> - Whitespace</p>
            <p><span className="text-primary">[abc]</span> - a, b, or c</p>
            <p><span className="text-primary">[^abc]</span> - Not a, b, or c</p>
            <p><span className="text-primary">*</span> - 0 or more</p>
            <p><span className="text-primary">+</span> - 1 or more</p>
            <p><span className="text-primary">?</span> - 0 or one</p>
            <p><span className="text-primary">^</span> - Start of string</p>
            <p><span className="text-primary">$</span> - End of string</p>
            <p><span className="text-primary">\b</span> - Word boundary</p>
        </div>
    </div>
);

export const RegexSandbox: React.FC<{ initialPrompt?: string }> = ({ initialPrompt }) => {
    const [pattern, setPattern] = useState<string>('/\\b([A-Z][a-z]+)\\s(\\w+)\\b/g');
    const [testString, setTestString] = useState<string>('The quick Brown Fox jumps over the Lazy Dog.');
    const [aiPrompt, setAiPrompt] = useState<string>(initialPrompt || 'find capitalized words and the word after');
    const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

    const { matches, error } = useMemo(() => {
        try {
            const patternParts = pattern.match(/^\/(.*)\/([gimyus]*)$/);
            if (!patternParts) return { matches: null, error: 'Invalid regex literal. Use /pattern/flags.' };
            const [, regexBody, regexFlags] = patternParts;
            const regex = new RegExp(regexBody, regexFlags);
            return { matches: [...testString.matchAll(regex)], error: null };
        } catch (e) { return { matches: null, error: e instanceof Error ? e.message : 'Unknown error.' }; }
    }, [pattern, testString]);
    
    const handleGenerateRegex = useCallback(async (p: string) => {
        if (!p) return;
        setIsAiLoading(true);
        try {
            const stream = generateRegExStream(p);
            let fullResponse = '';
            for await (const chunk of stream) { fullResponse += chunk; }
            setPattern(fullResponse.trim().replace(/^`+|`+$/g, ''));
        } finally { setIsAiLoading(false); }
    }, []);

    useEffect(() => { if (initialPrompt) handleGenerateRegex(initialPrompt); }, [initialPrompt, handleGenerateRegex]);

    const highlightedString = useMemo(() => {
        if (!matches || matches.length === 0 || error) return testString;
        let lastIndex = 0;
        // Fix: Explicitly type `parts` array to allow JSX elements.
        const parts: (string | JSX.Element)[] = [];
        matches.forEach((match, i) => {
            if (match.index === undefined) return;
            parts.push(testString.substring(lastIndex, match.index));
            parts.push(<mark key={i} className="bg-primary/20 text-primary rounded px-1">{match[0]}</mark>);
            lastIndex = match.index + match[0].length;
        });
        parts.push(testString.substring(lastIndex));
        return parts;
    }, [matches, testString, error]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6"><h1 className="text-3xl font-bold flex items-center"><BeakerIcon /><span className="ml-3">RegEx Sandbox</span></h1><p className="text-text-secondary mt-1">Test your regular expressions and generate them with AI.</p></header>
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <div className="flex gap-2"><input type="text" value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="Describe the pattern to find..." className="flex-grow px-3 py-1.5 rounded-md bg-surface border border-border text-sm focus:ring-2 focus:ring-primary" /><button onClick={() => handleGenerateRegex(aiPrompt)} disabled={isAiLoading} className="btn-primary px-4 py-1.5 flex items-center">{isAiLoading ? <LoadingSpinner/> : 'Generate'}</button></div>
                    <div><label htmlFor="regex-pattern" className="text-sm font-medium text-text-secondary">Regular Expression</label><input id="regex-pattern" type="text" value={pattern} onChange={(e) => setPattern(e.target.value)} className={`w-full mt-1 px-3 py-2 rounded-md bg-surface border ${error ? 'border-red-500' : 'border-border'} font-mono text-sm focus:ring-2 focus:ring-primary`} />{error && <p className="text-red-500 text-xs mt-1">{error}</p>}</div>
                    <div className="flex flex-col flex-grow min-h-0"><label htmlFor="test-string" className="text-sm font-medium text-text-secondary">Test String</label><textarea id="test-string" value={testString} onChange={(e) => setTestString(e.target.value)} className="w-full mt-1 p-3 rounded-md bg-surface border border-border font-mono text-sm resize-y h-32" /><div className="mt-2 p-3 bg-background rounded-md border border-border min-h-[50px] whitespace-pre-wrap">{highlightedString}</div></div>
                </div>
                <div className="lg:col-span-1 flex flex-col gap-4">
                    <CheatSheet />
                    <div>
                        <h3 className="text-lg font-bold mb-2">Matches ({matches?.length || 0})</h3>
                        <div className="bg-surface border border-border p-2 rounded-lg h-48 overflow-y-auto">
                            {matches && matches.map((match, i) => (
                                <div key={i} className="p-2 border-b border-border-light text-xs font-mono">
                                    <p><strong>Match {i + 1}:</strong> <span className="text-primary">{match[0]}</span></p>
                                    {match.length > 1 && <p><strong>Groups:</strong> {match.slice(1).map((g, gi) => `(${gi+1}) ${g}`).join(', ')}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};