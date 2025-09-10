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
                setRefactoredCode(