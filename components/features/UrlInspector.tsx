import React, { useState, useMemo } from 'react';
import { LinkIcon } from '../icons.tsx';

export const UrlInspector: React.FC = () => {
    const [url, setUrl] = useState('https://example.com:8080/path/to/page?param1=value1&param2=value2#section');
    
    const parsed = useMemo(() => {
        try {
            return new URL(url);
        } catch {
            return null;
        }
    }, [url]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <LinkIcon />
                    <span className="ml-3">URL Inspector/Parser</span>
                </h1>
                <p className="text-text-secondary mt-1">Parse and inspect the components of a URL.</p>
            </header>
            <div className="w-full max-w-3xl mx-auto">
                <input 
                    type="text" 
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    className="w-full p-2 bg-surface border rounded-md font-mono text-sm"
                />
                {parsed ? (
                    <div className="mt-4 bg-surface p-4 rounded-lg border grid grid-cols-2 gap-2 text-sm">
                        <strong>Protocol:</strong> <span>{parsed.protocol}</span>
                        <strong>Hostname:</strong> <span>{parsed.hostname}</span>
                        <strong>Port:</strong> <span>{parsed.port}</span>
                        <strong>Pathname:</strong> <span>{parsed.pathname}</span>
                        <strong>Search:</strong> <span>{parsed.search}</span>
                        <strong>Hash:</strong> <span>{parsed.hash}</span>
                    </div>
                ) : (
                    <p className="mt-4 text-red-500">Invalid URL</p>
                )}
            </div>
        </div>
    );
};
