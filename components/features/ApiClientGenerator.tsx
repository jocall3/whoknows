import React, { useState } from 'react';
import JSZip from 'jszip';
import { generateClientFromApiSchema } from '../../services/aiService.ts';
import { CodeBracketSquareIcon, SparklesIcon } from '../icons.tsx';
import { LoadingSpinner } from '../shared/index.tsx';
import { useNotification } from '../../contexts/NotificationContext.tsx';
import type { GeneratedFile } from '../../types.ts';
import { MarkdownRenderer } from '../shared/index.tsx';

const exampleSchema = `{
  "openapi": "3.0.0",
  "info": { "title": "Simple API", "version": "1.0.0" },
  "paths": {
    "/users": {
      "get": {
        "summary": "Get all users",
        "responses": { "200": { "description": "A list of users" } }
      }
    }
  }
}`;

export const ApiClientGenerator: React.FC = () => {
    const [schema, setSchema] = useState(exampleSchema);
    const [language, setLanguage] = useState('TypeScript/Fetch');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
    const [activeFile, setActiveFile] = useState<GeneratedFile | null>(null);
    const { addNotification } = useNotification();

    const handleGenerate = async () => {
        if (!schema.trim()) {
            setError('Please provide a schema.');
            return;
        }
        setIsLoading(true);
        setError('');
        setGeneratedFiles([]);
        setActiveFile(null);
        try {
            const files = await generateClientFromApiSchema(schema, language);
            setGeneratedFiles(files);
            if (files.length > 0) {
                setActiveFile(files[0]);
            }
            addNotification('API client generated!', 'success');
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(msg);
            addNotification(msg, 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDownloadZip = async () => {
        if (generatedFiles.length === 0) return;
        const zip = new JSZip();
        generatedFiles.forEach(file => {
            zip.file(file.filePath, file.content);
        });
        
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(zipBlob);
        link.download = 'api-client.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center"><CodeBracketSquareIcon /><span className="ml-3">API Client Generator</span></h1>
                <p className="text-text-secondary mt-1">Generate a typed client library from an OpenAPI or GraphQL schema.</p>
            </header>
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col flex-1 min-h-0">
                        <label className="text-sm font-medium mb-2">OpenAPI / GraphQL Schema</label>
                        <textarea value={schema} onChange={e => setSchema(e.target.value)} className="flex-grow p-2 bg-surface border rounded font-mono text-xs"/>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Target Language & Library</label>
                        <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full mt-1 p-2 bg-surface border rounded">
                            <option>TypeScript/Fetch</option>
                            <option>Python/requests</option>
                        </select>
                    </div>
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary w-full py-3">{isLoading ? <LoadingSpinner/> : 'Generate Client'}</button>
                    {error && <p className="text-red-500 text-xs text-center">{error}</p>}
                </div>
                <div className="flex flex-col min-h-0">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium">Generated Files</label>
                        {generatedFiles.length > 0 && <button onClick={handleDownloadZip} className="btn-primary px-3 py-1 text-sm">Download as ZIP</button>}
                    </div>
                    <div className="flex-grow grid grid-cols-3 gap-2 min-h-0 bg-background border rounded-lg p-2">
                        <div className="col-span-1 overflow-y-auto">
                            {generatedFiles.map(file => (
                                <div key={file.filePath} onClick={() => setActiveFile(file)} className={`p-2 text-sm rounded cursor-pointer ${activeFile?.filePath === file.filePath ? 'bg-primary/10 text-primary' : ''}`}>{file.filePath}</div>
                            ))}
                        </div>
                        <div className="col-span-2 bg-surface rounded overflow-y-auto">
                            {activeFile && <MarkdownRenderer content={'```\n' + activeFile.content + '\n```'} />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
