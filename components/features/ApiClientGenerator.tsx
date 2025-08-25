import React, { useState } from 'react';
import JSZip from 'jszip';
import { generateClientFromApiSchema } from '../../services/aiService.ts';
import { CodeBracketSquareIcon, SparklesIcon, ArrowDownTrayIcon } from '../icons.tsx';
import { LoadingSpinner } from '../shared/index.tsx';
import { useNotification } from '../../contexts/NotificationContext.tsx';

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
    const { addNotification } = useNotification();

    const handleGenerate = async () => {
        if (!schema.trim()) {
            setError('Please provide a schema.');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const files = await generateClientFromApiSchema(schema, language);
            
            const zip = new JSZip();
            files.forEach(file => {
                zip.file(file.filePath, file.content);
            });
            
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(zipBlob);
            link.download = 'api-client.zip';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            addNotification('API client generated and downloaded!', 'success');

        } catch (err) {
            const msg = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(msg);
            addNotification(msg, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center"><CodeBracketSquareIcon /><span className="ml-3">API Client Generator</span></h1>
                <p className="text-text-secondary mt-1">Generate a typed client library from an OpenAPI or GraphQL schema.</p>
            </header>
            <div className="flex-grow flex flex-col gap-4 min-h-0">
                <div className="flex flex-col flex-1 min-h-0">
                    <label htmlFor="schema-input" className="text-sm font-medium text-text-secondary mb-2">OpenAPI / GraphQL Schema</label>
                    <textarea
                        id="schema-input"
                        value={schema}
                        onChange={e => setSchema(e.target.value)}
                        className="flex-grow p-4 bg-surface border border-border rounded-md resize-none font-mono text-sm"
                    />
                </div>
                <div className="flex-shrink-0 flex items-end gap-4">
                    <div className="flex-grow">
                        <label htmlFor="language-select" className="text-sm font-medium text-text-secondary">Target Language &amp; Library</label>
                        <select
                            id="language-select"
                            value={language}
                            onChange={e => setLanguage(e.target.value)}
                            className="w-full mt-1 p-2 bg-surface border border-border rounded-md text-sm"
                        >
                            <option>TypeScript/Fetch</option>
                            <option>Python/requests</option>
                        </select>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="btn-primary h-[42px] px-6 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <LoadingSpinner /> : <><SparklesIcon /> Generate Client</>}
                    </button>
                </div>
                {error && <p className="text-red-500 text-xs text-center">{error}</p>}
            </div>
        </div>
    );
};
