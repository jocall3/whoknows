import React, { useState } from 'react';
import * as Diff from 'diff';
import { insertSmartLogging } from '../../services/aiService.ts';
import { TerminalIcon } from '../icons.tsx';
import { LoadingSpinner } from '../shared/index.tsx';

const exampleCode = `function processData(data) {
  if (!data || data.length === 0) {
    return [];
  }
  const results = data.filter(item => item.value > 10);
  return results.map(item => ({ ...item, processed: true }));
}`;

const DiffViewer: React.FC<{ oldCode: string, newCode: string }> = React.memo(({ oldCode, newCode }) => {
    const diff = Diff.diffLines(oldCode, newCode);
    return (
        <pre className="whitespace-pre-wrap font-mono text-xs">
            {diff.map((part, index) => {
                const color = part.added ? 'bg-green-500/20 text-green-800 dark:text-green-300' : part.removed ? 'bg-red-500/20' : 'text-text-secondary';
                return <div key={index} className={color}>{part.value}</div>;
            })}
        </pre>
    );
});

export const SmartLogger: React.FC = () => {
    const [code, setCode] = useState(exampleCode);
    const [loggedCode, setLoggedCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        setLoggedCode('');
        try {
            const result = await insertSmartLogging(code);
            setLoggedCode(result.replace(/^```(?:\w+\n)?/, '').replace(/```$/, ''));
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center"><TerminalIcon /><span className="ml-3">Smart Logger</span></h1>
                <p className="text-text-secondary mt-1">Insert intelligent logging statements into code for easier debugging.</p>
            </header>
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                <div className="flex flex-col">
                    <label className="text-sm font-medium mb-2">Original Code</label>
                    <textarea value={code} onChange={e => setCode(e.target.value)} className="flex-grow p-2 bg-surface border rounded font-mono text-xs"/>
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary w-full mt-4 py-3">{isLoading ? <LoadingSpinner/> : 'Add Logs'}</button>
                </div>
                 <div className="flex flex-col">
                    <label className="text-sm font-medium mb-2">Code with Logging</label>
                    <div className="flex-grow p-2 bg-background border rounded overflow-auto">
                        {isLoading ? <div className="flex justify-center items-center h-full"><LoadingSpinner /></div> : <DiffViewer oldCode={code} newCode={loggedCode} />}
                    </div>
                </div>
            </div>
        </div>
    );
};
