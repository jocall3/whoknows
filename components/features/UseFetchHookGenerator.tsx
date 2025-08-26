import React, { useState, useEffect } from 'react';
import { CodeBracketSquareIcon } from '../icons.tsx';
import { MarkdownRenderer } from '../shared/index.tsx';
import { LoadingSpinner } from '../shared/index.tsx';

const hookCode = `
\`\`\`tsx
import { useState, useEffect } from 'react';

export const useFetch = (url) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(url);
                const json = await response.json();
                setData(json);
            } catch (e) {
                setError(e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [url]);

    return { data, error, loading };
};
\`\`\`
`;

const useFetch = (url: string) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch(url);
                const json = await response.json();
                setData(json);
            } catch (e: any) {
                setError(e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [url]);

    return { data, error, loading };
};

export const UseFetchHookGenerator: React.FC = () => {
    const [postId, setPostId] = useState(1);
    const { data, error, loading } = useFetch(`https://jsonplaceholder.typicode.com/posts/${postId}`);
    
    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <CodeBracketSquareIcon />
                    <span className="ml-3">useFetch Hook Generator</span>
                </h1>
                <p className="text-text-secondary mt-1">Generate a custom useFetch hook for data fetching.</p>
            </header>
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                <div className="flex flex-col">
                    <label className="text-sm font-medium mb-2">Hook Code</label>
                    <div className="flex-grow p-1 bg-background border rounded overflow-auto">
                        <MarkdownRenderer content={hookCode} />
                    </div>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium mb-2">Live Demo</label>
                    <div className="flex-grow p-4 bg-surface border rounded">
                        <div className="flex gap-2 mb-4">
                            <button onClick={() => setPostId(p => p + 1)} className="btn-primary p-2">Fetch Next Post</button>
                        </div>
                        {loading && <LoadingSpinner />}
                        {error && <p className="text-red-500">Error fetching data</p>}
                        {data && <pre className="text-xs bg-background p-2 rounded">{JSON.stringify(data, null, 2)}</pre>}
                    </div>
                </div>
            </div>
        </div>
    );
};
