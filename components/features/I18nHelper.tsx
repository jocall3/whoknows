import React, { useState } from 'react';
import { extractStringsForI18n } from '../../services/aiService.ts';
import { ProjectExplorerIcon } from '../icons.tsx';
import { LoadingSpinner, MarkdownRenderer } from '../shared/index.tsx';
import { useNotification } from '../../contexts/NotificationContext.tsx';

const exampleCode = `import React from 'react';

function WelcomeCard() {
  return (
    <div>
      <h1>Welcome to our App!</h1>
      <p>Click the button below to get started.</p>
      <button>Get Started</button>
    </div>
  );
}`;

export const I18nHelper: React.FC = () => {
    const [code, setCode] = useState(exampleCode);
    const [i18nJson, setI18nJson] = useState<Record<string, string> | null>(null);
    const [refactoredCode, setRefactoredCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { addNotification } = useNotification();

    const handleExtract = async () => {
        setIsLoading(true);
        setI18nJson(null);
        setRefactoredCode('');
        try {
            const result = await extractStringsForI18n(code);
            setI18nJson(result.i18nJson);
            setRefactoredCode(result.refactoredCode);
            addNotification('Strings extracted successfully!', 'success');
        } catch (err) {
            addNotification(err instanceof Error ? err.message : 'Extraction failed.', 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center"><ProjectExplorerIcon /><span className="ml-3">i18n Helper</span></h1>
                <p className="text-text-secondary mt-1">Extract strings from a component and generate JSON language files.</p>
            </header>
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                <div className="flex flex-col">
                    <label className="text-sm font-medium mb-2">Component Code</label>
                    <textarea value={code} onChange={e => setCode(e.target.value)} className="flex-grow p-2 bg-surface border rounded font-mono text-xs"/>
                    <button onClick={handleExtract} disabled={isLoading} className="btn-primary w-full mt-4 py-3">{isLoading ? <LoadingSpinner/> : 'Extract Strings'}</button>
                </div>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col flex-1 min-h-0">
                        <label className="text-sm font-medium mb-2">Generated i18n JSON</label>
                        <div className="flex-grow p-1 bg-background border rounded overflow-auto">
                            {isLoading && !i18nJson && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                            {i18nJson && <MarkdownRenderer content={'```json\n' + JSON.stringify(i18nJson, null, 2) + '\n```'} />}
                        </div>
                    </div>
                     <div className="flex flex-col flex-1 min-h-0">
                        <label className="text-sm font-medium mb-2">Refactored Component</label>
                        <div className="flex-grow p-1 bg-background border rounded overflow-auto">
                            {refactoredCode && <MarkdownRenderer content={'```tsx\n' + refactoredCode + '\n```'} />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
