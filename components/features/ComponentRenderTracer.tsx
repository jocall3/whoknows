import React, { useState } from 'react';
import { EyeIcon } from '../icons.tsx';
import { analyzeReactComponentRendersStream } from '../../services/index.ts';
import { LoadingSpinner, MarkdownRenderer } from '../shared/index.tsx';

const exampleCode = `import React, { useState } from 'react';

const InefficientComponent = ({ complexObject }) => {
  return <div>{complexObject.name}</div>;
}

const Parent = () => {
  const [count, setCount] = useState(0);

  // This object is recreated on every render,
  // causing InefficientComponent to re-render even
  // if its data hasn't changed.
  const myData = { name: 'Constant Data' };

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>
        Increment: {count}
      </button>
      <InefficientComponent complexObject={myData} />
    </div>
  );
}`;

export const ComponentRenderTracer: React.FC = () => {
    const [code, setCode] = useState(exampleCode);
    const [analysis, setAnalysis] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleTrace = async () => {
        setIsLoading(true);
        setAnalysis('');
        try {
            const stream = analyzeReactComponentRendersStream(code);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setAnalysis(fullResponse);
            }
        } catch (e) {
            setAnalysis(`Error: ${e instanceof Error ? e.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <EyeIcon />
                    <span className="ml-3">Component Re-Render Analyzer</span>
                </h1>
                <p className="text-text-secondary mt-1">Use AI to analyze React code for causes of unnecessary re-renders.</p>
            </header>
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                <div className="flex flex-col">
                    <label className="text-sm font-medium mb-2">Component Code</label>
                    <textarea value={code} onChange={e => setCode(e.target.value)} className="flex-grow p-2 bg-surface border rounded font-mono text-xs"/>
                    <button onClick={handleTrace} disabled={isLoading} className="btn-primary w-full mt-4 py-3">{isLoading ? <LoadingSpinner /> : 'Analyze Renders'}</button>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium mb-2">AI Analysis</label>
                    <div className="flex-grow p-4 bg-background border rounded overflow-auto">
                        {isLoading && !analysis && <div className="flex justify-center items-center h-full"><LoadingSpinner/></div>}
                        {analysis && <MarkdownRenderer content={analysis} />}
                    </div>
                </div>
            </div>
        </div>
    );
};