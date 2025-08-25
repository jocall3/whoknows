import React, { useState } from 'react';
import { sqlToApiEndpoints } from '../../services/aiService.ts';
import type { GeneratedFile } from '../../types.ts';
import { ServerStackIcon } from '../icons.tsx';
import { LoadingSpinner, MarkdownRenderer } from '../shared/index.tsx';
import { useNotification } from '../../contexts/NotificationContext.tsx';

const exampleSchema = `CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`;

export const SqlToApiGenerator: React.FC = () => {
    const [schema, setSchema] = useState(exampleSchema);
    const [framework, setFramework] = useState<'express' | 'fastify'>('express');
    const [files, setFiles] = useState<GeneratedFile[]>([]);
    const [activeTab, setActiveTab] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { addNotification } = useNotification();

    const handleGenerate = async () => {
        if (!schema.trim()) {
            addNotification('Please provide a SQL schema.', 'error');
            return;
        }
        setIsLoading(true);
        setFiles([]);
        setActiveTab(null);
        try {
            const result = await sqlToApiEndpoints(schema, framework);
            setFiles(result);
            if (result.length > 0) {
                setActiveTab(result[0].filePath);
            }
            addNotification('API files generated!', 'success');
        } catch (err) {
            addNotification(err instanceof Error ? err.message : 'Failed to generate API', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const activeFile = files.find(f => f.filePath === activeTab);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center"><ServerStackIcon /><span className="ml-3">SQL to API Generator</span></h1>
                <p className="text-text-secondary mt-1">Generate boilerplate CRUD API endpoints from a SQL schema.</p>
            </header>
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col flex-1 min-h-0">
                        <label className="text-sm font-medium mb-2">SQL Schema</label>
                        <textarea value={schema} onChange={e => setSchema(e.target.value)} className="flex-grow p-2 bg-surface border rounded font-mono text-xs"/>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Framework</label>
                        <select value={framework} onChange={e => setFramework(e.target.value as 'express' | 'fastify')} className="w-full mt-1 p-2 bg-surface border rounded">
                            <option value="express">Express</option>
                            <option value="fastify">Fastify</option>
                        </select>
                    </div>
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary w-full py-3">{isLoading ? <LoadingSpinner/> : 'Generate API Files'}</button>
                </div>
                <div className="flex flex-col">
                    <div className="flex border-b border-border">
                        {files.map(file => (
                            <button key={file.filePath} onClick={() => setActiveTab(file.filePath)} className={`px-4 py-2 text-sm ${activeTab === file.filePath ? 'bg-background border-b-2 border-primary text-text-primary' : 'text-text-secondary'}`}>
                                {file.filePath}
                            </button>
                        ))}
                    </div>
                    <div className="flex-grow bg-background border border-t-0 rounded-b-md overflow-auto">
                        {isLoading ? <div className="flex justify-center items-center h-full"><LoadingSpinner /></div> : (
                            activeFile ? <MarkdownRenderer content={'```javascript\n' + activeFile.content + '\n```'} /> : <div className="p-4 text-text-secondary">Generated code will appear here.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
