import React, { useState } from 'react';
import * as Diff from 'diff';
import { explainDependencyChanges } from '../../services/aiService.ts';
import { GitBranchIcon } from '../icons.tsx';
import { LoadingSpinner, MarkdownRenderer } from '../shared/index.tsx';
import { useNotification } from '../../contexts/NotificationContext.tsx';

const oldLock = `{
  "name": "my-app",
  "version": "1.0.0",
  "dependencies": {
    "react": { "version": "17.0.2" }
  }
}`;
const newLock = `{
  "name": "my-app",
  "version": "1.0.0",
  "dependencies": {
    "react": { "version": "18.2.0" },
    "lodash": { "version": "4.17.21" }
  }
}`;

export const DependencyUpdateExplainer: React.FC = () => {
    const [oldFile, setOldFile] = useState(oldLock);
    const [newFile, setNewFile] = useState(newLock);
    const [explanation, setExplanation] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { addNotification } = useNotification();

    const handleExplain = async () => {
        setIsLoading(true);
        setExplanation('');
        try {
            const diff = Diff.createPatch('package-lock.json', oldFile, newFile);
            const result = await explainDependencyChanges(diff);
            setExplanation(result);
            addNotification('Explanation generated!', 'success');
        } catch (err) {
            addNotification(err instanceof Error ? err.message : 'Failed to generate explanation', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center"><GitBranchIcon /><span className="ml-3">Dependency Update Explainer</span></h1>
                <p className="text-text-secondary mt-1">Analyze a package-lock.json diff and explain the risks/benefits.</p>
            </header>
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col flex-1 min-h-0">
                        <label className="text-sm font-medium mb-2">Old package-lock.json</label>
                        <textarea value={oldFile} onChange={e => setOldFile(e.target.value)} className="flex-grow p-2 bg-surface border rounded font-mono text-xs"/>
                    </div>
                     <div className="flex flex-col flex-1 min-h-0">
                        <label className="text-sm font-medium mb-2">New package-lock.json</label>
                        <textarea value={newFile} onChange={e => setNewFile(e.target.value)} className="flex-grow p-2 bg-surface border rounded font-mono text-xs"/>
                    </div>
                </div>
                <div className="flex flex-col">
                    <button onClick={handleExplain} disabled={isLoading} className="btn-primary w-full py-3 mb-4">{isLoading ? <LoadingSpinner/> : 'Explain Changes'}</button>
                    <div className="flex-grow p-4 bg-background border rounded overflow-auto">
                        {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                        {explanation && <MarkdownRenderer content={explanation} />}
                    </div>
                </div>
            </div>
        </div>
    );
};
