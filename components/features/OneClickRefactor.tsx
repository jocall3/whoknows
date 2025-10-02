// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import * as Diff from 'diff';
// FIX: Corrected import path for ai services.
import { refactorForPerformance, refactorForReadability, generateJsDoc, convertToFunctionalComponent } from '../../services/index.ts';
// FIX: Corrected import path for icons.
import { SparklesIcon } from '../icons/index.ts';
import { LoadingSpinner } from '../shared/index.tsx';

type RefactorAction = 'readability' | 'performance' | 'jsdoc' | 'functional' | 'custom';

const exampleCode = `const MyComponent = ({ data }) => {
  // A less readable component
  let transformedData = [];
  for (let i = 0; i < data.length; i++) {
    if (data[i].value > 50) {
      let item = { ...data[i], status: 'high' };
      transformedData.push(item);
    }
  }
  return (
    <div>
      {transformedData.map(d => <p key={d.id}>{d.name}</p>)}
    </div>
  );
}`;

const DiffViewer: React.FC<{ oldCode: string, newCode: string }> = ({ oldCode, newCode }) => {
    const diff = Diff.diffLines(oldCode, newCode);

    return (
        <pre className="whitespace-pre-wrap font-mono text-xs">
            {diff.map((part, index) => {
                const color = part.added ? 'bg-green-500/20' : part.removed ? 'bg-red-500/20' : 'bg-transparent';
                return <div key={index} className={color}>{part.value}</div>;
            })}
        </pre>
    );
};


export const OneClickRefactor: React.FC = () => {
    const [code, setCode] = useState(exampleCode);
    const [refactoredCode, setRefactoredCode] = useState('');
    const [loadingAction, setLoadingAction] = useState<RefactorAction | null>(null);

    const handleRefactor = useCallback(async (action: RefactorAction) => {
        if (!code.trim()) return;
        setLoadingAction(action);
        setRefactoredCode('');

        let stream;
        switch(action) {
            case 'readability':
                stream = refactorForReadability(code);
                break;
            case 'performance':
                stream = refactorForPerformance(code);
                break;
            case 'jsdoc':
                stream = generateJsDoc(code);
                break;
            case 'functional':
                stream = convertToFunctionalComponent(code);
                break;
            default:
                setLoadingAction(null);
                return;
        }

        try {
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setRefactoredCode(fullResponse.replace(/^```(?:\w+\n)?/, '').replace(/```$/, ''));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingAction(null);
        }
    }, [code]);

    const ActionButton: React.FC<{ action: RefactorAction, label: string }> = ({ action, label }) => (
        <button
            onClick={() => handleRefactor(action)}
            disabled={!!loadingAction}
            className="btn-primary w-full flex items-center justify-center gap-2 py-2"
        >
            {loadingAction === action ? <LoadingSpinner/> : <SparklesIcon />}
            {loadingAction === action ? 'Refactoring...' : label}
        </button>
    );

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
             <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center"><SparklesIcon /><span className="ml-3">One-Click Refactor</span></h1>
                <p className="text-text-secondary mt-1">Apply common refactoring patterns to your code with a single click.</p>
            </header>
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                <div className="flex flex-col gap-4">
                     <div className="flex flex-col flex-1 min-h-0">
                        <label className="text-sm font-medium mb-2">Original Code</label>
                        <textarea value={code} onChange={e => setCode(e.target.value)} className="flex-grow p-2 bg-surface border rounded font-mono text-xs"/>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <ActionButton action="readability" label="Improve Readability" />
                        <ActionButton action="performance" label="Improve Performance" />
                        <ActionButton action="jsdoc" label="Add JSDoc" />
                        <ActionButton action="functional" label="To Functional Component" />
                    </div>
                </div>
                 <div className="flex flex-col">
                    <label className="text-sm font-medium mb-2">Refactored Code (Diff)</label>
                    <div className="flex-grow p-2 bg-background border rounded overflow-auto">
                        {refactoredCode ? <DiffViewer oldCode={code} newCode={refactoredCode} /> : <p className="text-text-secondary">Refactoring results will appear here.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};