import React, { useState, useCallback, useEffect } from 'react';
import type { GeneratedFile } from '../../types.ts';
import { generateFeature, generateUnitTestsStream, generateCommitMessageStream, generateDockerfile } from '../../services/geminiService.ts';
import { saveFile, getAllFiles, clearAllFiles } from '../../services/dbService.ts';
import { CpuChipIcon, DocumentTextIcon, BeakerIcon, GitBranchIcon, CloudIcon } from '../icons.tsx';
import { LoadingSpinner, MarkdownRenderer } from '../shared/index.tsx';

type ActiveTab = 'CODE' | 'TESTS' | 'COMMIT' | 'DEPLOYMENT';

export const AiFeatureBuilder: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('A simple "Hello World" React component with a button that shows an alert.');
    const [framework, setFramework] = useState('React');
    const [styling, setStyling] = useState('Tailwind CSS');
    const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
    const [unitTests, setUnitTests] = useState<string>('');
    const [commitMessage, setCommitMessage] = useState<string>('');
    const [dockerfile, setDockerfile] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<GeneratedFile | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [activeTab, setActiveTab] = useState<ActiveTab>('CODE');
    
    useEffect(() => {
        const loadFiles = async () => {
            const files = await getAllFiles();
            setGeneratedFiles(files);
            if (files.length > 0) setSelectedFile(files[0]);
        };
        loadFiles();
    }, []);

    const handleGenerate = useCallback(async () => {
        if (!prompt.trim()) { setError('Please enter a feature description.'); return; }
        setIsLoading(true);
        setError('');
        await clearAllFiles(); // Start fresh for each generation
        setGeneratedFiles([]);
        setUnitTests('');
        setCommitMessage('');
        setDockerfile('');
        setSelectedFile(null);
        setActiveTab('CODE');

        try {
            const resultFiles = await generateFeature(prompt, framework, styling);
            for (const file of resultFiles) { await saveFile(file); }
            setGeneratedFiles(resultFiles);

            if (resultFiles.length > 0) {
                const componentFile = resultFiles.find(f => f.filePath.endsWith('.tsx') || f.filePath.endsWith('.jsx'));
                setSelectedFile(componentFile || resultFiles[0]);

                // Kick off supplemental generations in parallel
                const testStream = generateUnitTestsStream(componentFile?.content || resultFiles[0].content);
                const diffContext = resultFiles.map(f => `File: ${f.filePath}\n\n${f.content}`).join('\n---\n');
                const commitStream = generateCommitMessageStream(diffContext);
                const dockerfileStream = generateDockerfile(framework);

                // Process streams
                let tests = '';
                for await (const chunk of testStream) { tests += chunk; setUnitTests(tests); }

                let commit = '';
                for await (const chunk of commitStream) { commit += chunk; setCommitMessage(commit); }

                let docker = '';
                for await (const chunk of dockerfileStream) { docker += chunk; setDockerfile(docker); }
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Failed to generate feature: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    }, [prompt, framework, styling]);
    
    const renderContent = () => {
        switch (activeTab) {
            case 'TESTS': return <MarkdownRenderer content={unitTests} />;
            case 'COMMIT': return <pre className="w-full h-full p-4 whitespace-pre-wrap font-sans text-sm text-text-primary">{commitMessage}</pre>;
            case 'DEPLOYMENT': return <MarkdownRenderer content={dockerfile} />;
            case 'CODE':
            default:
                 return selectedFile ? <MarkdownRenderer content={'```tsx\n' + selectedFile.content + '\n```'} /> : <div className="flex items-center justify-center h-full text-text-secondary">Select a file to view its content.</div>;
        }
    }

    return (
        <div className="h-full flex flex-col text-text-primary bg-surface">
            <header className="p-4 border-b border-border flex-shrink-0">
                <h1 className="text-xl font-bold flex items-center"><CpuChipIcon /><span className="ml-3">AI Feature Builder</span></h1>
            </header>

            <div className="flex-grow flex min-h-0">
                <aside className="w-64 bg-surface border-r border-border p-4 flex flex-col">
                    <h2 className="text-sm font-semibold text-text-secondary mb-2">Generated Files</h2>
                    <div className="overflow-y-auto space-y-1">
                        {generatedFiles.map(file => (
                            <div key={file.filePath} onClick={() => { setSelectedFile(file); setActiveTab('CODE'); }} className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer text-sm ${selectedFile?.filePath === file.filePath && activeTab === 'CODE' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-slate-700'}`}>
                                <DocumentTextIcon /><span>{file.filePath.split('/').pop()}</span>
                            </div>
                        ))}
                    </div>
                </aside>

                <main className="flex-1 flex flex-col min-w-0">
                    <div className="flex-grow flex flex-col bg-background">
                         <div className="border-b border-border flex items-center bg-surface">
                            <button onClick={() => setActiveTab('CODE')} className={`flex items-center gap-2 px-4 py-2 text-sm ${activeTab === 'CODE' ? 'bg-background border-b-2 border-primary text-text-primary' : 'text-text-secondary hover:bg-gray-50 dark:hover:bg-slate-700'}`}><DocumentTextIcon /> Code</button>
                            {unitTests && <button onClick={() => setActiveTab('TESTS')} className={`flex items-center gap-2 px-4 py-2 text-sm ${activeTab === 'TESTS' ? 'bg-background border-b-2 border-primary text-text-primary' : 'text-text-secondary hover:bg-gray-50 dark:hover:bg-slate-700'}`}><BeakerIcon /> Tests</button>}
                            {commitMessage && <button onClick={() => setActiveTab('COMMIT')} className={`flex items-center gap-2 px-4 py-2 text-sm ${activeTab === 'COMMIT' ? 'bg-background border-b-2 border-primary text-text-primary' : 'text-text-secondary hover:bg-gray-50 dark:hover:bg-slate-700'}`}><GitBranchIcon /> Commit</button>}
                            {dockerfile && <button onClick={() => setActiveTab('DEPLOYMENT')} className={`flex items-center gap-2 px-4 py-2 text-sm ${activeTab === 'DEPLOYMENT' ? 'bg-background border-b-2 border-primary text-text-primary' : 'text-text-secondary hover:bg-gray-50 dark:hover:bg-slate-700'}`}><CloudIcon /> Deployment</button>}
                        </div>
                        <div className="flex-grow p-2 overflow-auto">
                            {isLoading && !generatedFiles.length ? <div className="flex justify-center items-center h-full"><LoadingSpinner/></div> : renderContent()}
                        </div>
                    </div>
                    
                    <div className="flex-shrink-0 p-4 border-t border-border bg-surface">
                        <div className="grid grid-cols-2 gap-2 mb-2">
                           <select value={framework} onChange={e => setFramework(e.target.value)} className="w-full p-2 bg-background border border-border rounded-md text-sm"><option>React</option><option>Vue</option><option>Svelte</option></select>
                           <select value={styling} onChange={e => setStyling(e.target.value)} className="w-full p-2 bg-background border border-border rounded-md text-sm"><option>Tailwind CSS</option><option>CSS Modules</option><option>Styled Components</option></select>
                        </div>
                        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g., A user profile card with an avatar, name, and bio." className="w-full p-2 bg-background border border-border rounded-md resize-none text-sm h-20"/>
                         <button onClick={handleGenerate} disabled={isLoading} className="btn-primary mt-2 w-full flex items-center justify-center gap-2 px-4 py-2">
                            {isLoading ? <><LoadingSpinner /> Generating...</> : 'Generate Feature'}
                        </button>
                         {error && <p className="text-red-600 text-xs mt-2 text-center">{error}</p>}
                    </div>
                </main>
            </div>
        </div>
    );
};