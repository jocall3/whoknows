import React, { useState, useMemo, useCallback } from 'react';
import * as Diff from 'diff';
import { generatePrSummaryStructured } from '../../services/index.ts';
import type { StructuredPrSummary } from '../../types.ts';
import { AiPullRequestAssistantIcon } from '../icons.tsx';
import { LoadingSpinner } from '../shared/index.tsx';

const exampleBefore = `function Greeter(props) {
  return <h1>Hello, {props.name}!</h1>;
}`;
const exampleAfter = `function Greeter({ name, enthusiasmLevel = 1 }) {
  const punctuation = '!'.repeat(enthusiasmLevel);
  return <h1>Hello, {name}{punctuation}</h1>;
}`;

export const AiPullRequestAssistant: React.FC = () => {
    const [beforeCode, setBeforeCode] = useState<string>(exampleBefore);
    const [afterCode, setAfterCode] = useState<string>(exampleAfter);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [fromBranch, setFromBranch] = useState('feature/new-logic');
    const [toBranch, setToBranch] = useState('main');
    const [changeType, setChangeType] = useState('feat');
    const [relatedIssue, setRelatedIssue] = useState('');
    const [testingSteps, setTestingSteps] = useState('1. \n2. \n3.');

    const handleGenerateSummary = useCallback(async () => {
        if (!beforeCode.trim() && !afterCode.trim()) {
            setError('Please provide code to generate a summary.');
            return;
        }
        setIsLoading(true);
        setError('');
        
        try {
            const diff = Diff.createPatch('component.tsx', beforeCode, afterCode);
            const result: StructuredPrSummary = await generatePrSummaryStructured(diff);
            setTitle(result.title);
            setDescription(`${result.summary}\n\n**Key Changes:**\n${result.changes.map(c => `- ${c}`).join('\n')}`);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Failed to generate summary: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    }, [beforeCode, afterCode]);

    const markdownPreview = useMemo(() => {
        return `
# ${changeType}: ${title}
${relatedIssue ? `\n**Closes:** ${relatedIssue}\n` : ''}
**Branch:** \`${fromBranch}\` -> \`${toBranch}\`

## Description
${description}

## Testing Steps
${testingSteps}
        `.trim();
    }, [title, description, fromBranch, toBranch, changeType, relatedIssue, testingSteps]);
    
    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <AiPullRequestAssistantIcon />
                    <span className="ml-3">AI Pull Request Assistant</span>
                </h1>
                <p className="text-text-secondary mt-1">Generate a PR summary from code changes and populate a full template.</p>
            </header>
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                {/* Left side: Inputs and Generator */}
                <div className="flex flex-col gap-4 min-h-0">
                    <div className="flex flex-col flex-1 min-h-0">
                        <label htmlFor="before-code" className="text-sm font-medium text-text-secondary mb-2">Before</label>
                        <textarea id="before-code" value={beforeCode} onChange={e => setBeforeCode(e.target.value)} className="flex-grow p-4 bg-surface border border-border rounded-md resize-none font-mono text-sm" />
                    </div>
                    <div className="flex flex-col flex-1 min-h-0">
                        <label htmlFor="after-code" className="text-sm font-medium text-text-secondary mb-2">After</label>
                        <textarea id="after-code" value={afterCode} onChange={e => setAfterCode(e.target.value)} className="flex-grow p-4 bg-surface border border-border rounded-md resize-none font-mono text-sm" />
                    </div>
                    <button onClick={handleGenerateSummary} disabled={isLoading} className="btn-primary w-full flex items-center justify-center px-6 py-3">
                        {isLoading ? <LoadingSpinner /> : 'Generate Title & Description'}
                    </button>
                    {error && <p className="text-red-500 text-xs text-center">{error}</p>}
                </div>

                {/* Right side: Form and Preview */}
                <div className="flex flex-col gap-4 min-h-0">
                    <form className="flex flex-col gap-2 overflow-y-auto pr-2 bg-surface border border-border p-4 rounded-lg h-1/2">
                        <div className="flex gap-2">
                            <div className="w-1/4"><label className="block text-xs">Type</label><select value={changeType} onChange={e => setChangeType(e.target.value)} className="w-full mt-1 p-1 rounded bg-background border border-border text-sm"><option>feat</option><option>fix</option><option>chore</option><option>docs</option><option>refactor</option></select></div>
                            <div className="w-3/4"><label className="block text-xs">Title</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full mt-1 p-1 rounded bg-background border border-border text-sm"/></div>
                        </div>
                        <div><label className="block text-xs">Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full mt-1 p-1 rounded bg-background border border-border resize-y h-24 text-sm"/></div>
                        <div><label className="block text-xs">Testing Steps</label><textarea value={testingSteps} onChange={e => setTestingSteps(e.target.value)} className="w-full mt-1 p-1 rounded bg-background border border-border resize-y h-16 text-sm"/></div>
                    </form>
                    <div className="flex flex-col h-1/2">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium text-text-secondary">Markdown Preview</label>
                            <button onClick={() => navigator.clipboard.writeText(markdownPreview)} className="px-3 py-1 bg-gray-100 text-xs rounded-md hover:bg-gray-200">Copy Markdown</button>
                        </div>
                        <div className="relative flex-grow"><pre className="w-full h-full bg-background border border-border p-4 rounded-md text-sm overflow-auto whitespace-pre-wrap">{markdownPreview}</pre></div>
                    </div>
                </div>
            </div>
        </div>
    );
};