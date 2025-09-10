import React, { useState, useEffect, useMemo } from 'react';
import { LockClosedIcon, SparklesIcon, TrashIcon, ClipboardDocumentIcon, ArrowDownTrayIcon } from '../icons/index.ts';
import { useLocalStorage } from '../../hooks/useLocalStorage.ts';
// FIX: Corrected import path for ai services.
import { enhanceSnippetStream, generateTagsForCode } from '../../services/index.ts';
import { LoadingSpinner } from '../shared/index.tsx';
import { downloadFile } from '../../services/fileUtils.ts';
import { useNotification } from '../../contexts/NotificationContext.tsx';

interface Snippet {
    id: number; name: string; code: string; language: string; tags: string[];
}

const langToExt: Record<string, string> = {
    javascript: 'js',
    typescript: 'ts',
    python: 'py',
    css: 'css',
    html: 'html',
    json: 'json',
    markdown: 'md',
    plaintext: 'txt',
};

export const SnippetVault: React.FC = () => {
    const [snippets, setSnippets] = useLocalStorage<Snippet[]>('devcore_snippets', [{ id: 1, name: 'React Hook Boilerplate', language: 'javascript', code: `import { useState } from 'react';\n\nconst useCustomHook = () => {\n  const [value, setValue] = useState(null);\n  return { value, setValue };\n};`, tags: ['react', 'hook'] }]);
    const [activeSnippet, setActiveSnippet] = useState<Snippet | null>(null);
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditingName, setIsEditingName] = useState(false);
    const { addNotification } = useNotification();

    const filteredSnippets = useMemo(() => {
        if (!searchTerm) return snippets;
        const lowerSearch = searchTerm.toLowerCase();
        return snippets.filter((s: Snippet) => 
            s.name.toLowerCase().includes(lowerSearch) || 
            s.code.toLowerCase().includes(lowerSearch) ||
            (s.tags && s.tags.some(t => t.toLowerCase().includes(lowerSearch)))
        );
    }, [snippets, searchTerm]);

    useEffect(() => {
        if (!activeSnippet && filteredSnippets.length > 0) setActiveSnippet(filteredSnippets[0]);
        if (activeSnippet) setActiveSnippet(snippets.find((s: Snippet) => s.id === activeSnippet.id) || null);
    }, [snippets, activeSnippet, filteredSnippets]);

    const updateSnippet = (snippet: Snippet) => {
        setSnippets(snippets.map((s: Snippet) => s.id === snippet.id ? snippet : s));
        setActiveSnippet(snippet);
    };

    const handleEnhance = async () => {
        if (!activeSnippet) return;
        setIsEnhancing(true);
        try {
            const stream = enhanceSnippetStream(activeSnippet.code);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                updateSnippet({ ...activeSnippet, code: fullResponse.replace(/^```(?:\w+\n)?/, '').replace(/```$/, '') });
            }
        } finally { setIsEnhancing(false); }
    };
    
    const handleAiTagging = async (snippet: Snippet) => {
        try {
            const { tags } = await generateTagsForCode(snippet.code);
            updateSnippet({ ...snippet, tags });
            addNotification("Tags generated!", 'success');
        } catch (e) {
            addNotification("Could not generate tags.", 'error');
        }
    };

    const handleAddNew = () => {
        const newSnippet: Snippet = {
            id: Date.now(),
            name: 'New Snippet',
            code: '// Your code here',
            language: 'javascript',
            tags: [],
        };
        setSnippets([newSnippet, ...snippets]);
        setActiveSnippet(newSnippet);
    };

    const handleDelete = (id: number) => {
        setSnippets(snippets.filter(s => s.id !== id));
        if (activeSnippet?.id === id) {
            setActiveSnippet(null);
        }
    };
    
    const handleDownload = () => {
        if (!activeSnippet) return;
        const ext = langToExt[activeSnippet.language] || 'txt';
        downloadFile(activeSnippet.code, `${activeSnippet.name}.${ext}`);
    };

    return (
        <div className="h-full flex text-text-primary">
            <aside className="w-80 bg-surface border-r border-border flex flex-col">
                <div className="p-4 border-b border-border">
                    <input type="text" placeholder="Search snippets..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2 bg-background border rounded-md"/>
                </div>
                <div className="flex-grow overflow-y-auto">
                    {filteredSnippets.map(snippet => (
                        <div key={snippet.id} onClick={() => setActiveSnippet(snippet)} className={`p-3 cursor-pointer ${activeSnippet?.id === snippet.id ? 'bg-primary/10' : 'hover:bg-gray-100 dark:hover:bg-slate-700'}`}>
                            <p className={`font-semibold ${activeSnippet?.id === snippet.id ? 'text-primary' : 'text-text-primary'}`}>{snippet.name}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {snippet.tags.map(tag => <span key={tag} className="text-xs bg-gray-200 dark:bg-slate-600 px-2 py-0.5 rounded-full">{tag}</span>)}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-border">
                    <button onClick={handleAddNew} className="btn-primary w-full py-2">Add New Snippet</button>
                </div>
            </aside>
            <main className="flex-1 flex flex-col min-w-0">
                {activeSnippet ? (
                    <>
                        <header className="flex justify-between items-center p-4 border-b border-border bg-surface">
                            <input value={activeSnippet.name} onChange={e => updateSnippet({ ...activeSnippet, name: e.target.value })} className="bg-transparent text-xl font-bold focus:outline-none"/>
                            <div className="flex items-center gap-2">
                                {/* FIX: Corrected prop passing for SparklesIcon */}
                                <button onClick={handleEnhance} disabled={isEnhancing} className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-xs rounded-md hover:bg-gray-200">{isEnhancing ? <LoadingSpinner/> : <SparklesIcon className="w-4 h-4"/>} Enhance</button>
                                <button onClick={() => handleAiTagging(activeSnippet)} className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-xs rounded-md hover:bg-gray-200"><SparklesIcon className="w-4 h-4"/> AI Tags</button>
                                <button onClick={handleDownload} className="p-2 hover:bg-gray-100 rounded-md"><ArrowDownTrayIcon/></button>
                                <button onClick={() => handleDelete(activeSnippet.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-md"><TrashIcon/></button>
                            </div>
                        </header>
                        <textarea
                            value={activeSnippet.code}
                            onChange={e => updateSnippet({ ...activeSnippet, code: e.target.value })}
                            className="flex-grow p-4 font-mono text-sm bg-background focus:outline-none resize-none"
                        />
                    </>
                ) : (
                    <div className="flex-grow flex items-center justify-center text-text-secondary">Select a snippet or create a new one.</div>
                )}
            </main>
        </div>
    )
};