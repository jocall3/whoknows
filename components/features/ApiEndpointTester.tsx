import React, { useState } from 'react';
import { PaperAirplaneIcon } from '../icons.tsx';
import { LoadingSpinner } from '../shared/index.tsx';
import { useNotification } from '../../contexts/NotificationContext.tsx';

export const ApiEndpointTester: React.FC = () => {
    const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/posts/1');
    const [method, setMethod] = useState('GET');
    const [headers, setHeaders] = useState('{\n  "Content-Type": "application/json"\n}');
    const [body, setBody] = useState('');
    const [response, setResponse] = useState<any>(null);
    const [status, setStatus] = useState<number | null>(null);
    const [time, setTime] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { addNotification } = useNotification();

    const handleSend = async () => {
        setIsLoading(true);
        setResponse(null);
        setStatus(null);
        setTime(null);
        
        const startTime = performance.now();
        try {
            const parsedHeaders = headers ? JSON.parse(headers) : {};
            const res = await fetch(url, {
                method,
                headers: parsedHeaders,
                body: method !== 'GET' && body ? body : undefined,
            });
            
            const endTime = performance.now();
            setTime(endTime - startTime);
            setStatus(res.status);

            const resBody = await res.json();
            setResponse(JSON.stringify(resBody, null, 2));
            addNotification('Request successful!', 'success');
        } catch (err) {
            const endTime = performance.now();
            setTime(endTime - startTime);
            const msg = err instanceof Error ? err.message : 'An unknown error occurred';
            setResponse(msg);
            addNotification(msg, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center"><PaperAirplaneIcon /><span className="ml-3">API Endpoint Tester</span></h1>
                <p className="text-text-secondary mt-1">A simple UI to make requests to API endpoints (like Postman lite).</p>
            </header>
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                <div className="flex flex-col gap-4">
                    <div className="flex gap-2">
                        <select value={method} onChange={e => setMethod(e.target.value)} className="p-2 bg-surface border rounded">
                            <option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option>
                        </select>
                        <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://api.example.com/data" className="flex-grow p-2 bg-surface border rounded"/>
                    </div>
                    <div className="flex flex-col flex-1 min-h-0">
                        <label className="text-sm mb-1">Headers (JSON)</label>
                        <textarea value={headers} onChange={e => setHeaders(e.target.value)} className="flex-grow p-2 bg-surface border rounded font-mono text-xs"/>
                    </div>
                    <div className="flex flex-col flex-1 min-h-0">
                        <label className="text-sm mb-1">Body (JSON)</label>
                        <textarea value={body} onChange={e => setBody(e.target.value)} className="flex-grow p-2 bg-surface border rounded font-mono text-xs"/>
                    </div>
                    <button onClick={handleSend} disabled={isLoading} className="btn-primary w-full py-3">{isLoading ? <LoadingSpinner/> : 'Send Request'}</button>
                </div>
                <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium">Response</label>
                        {status && <div className="flex gap-4 text-sm"><span className={status >= 200 && status < 300 ? 'text-green-500' : 'text-red-500'}>Status: {status}</span><span>Time: {time?.toFixed(0)}ms</span></div>}
                    </div>
                    <div className="flex-grow p-2 bg-background border rounded overflow-auto">
                        {isLoading ? <div className="flex justify-center items-center h-full"><LoadingSpinner /></div> : <pre className="font-mono text-xs">{response}</pre>}
                    </div>
                </div>
            </div>
        </div>
    );
};
