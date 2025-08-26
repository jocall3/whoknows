import React, { useState, useMemo } from 'react';
import { ServerStackIcon } from '../icons.tsx';
import { useNotification } from '../../contexts/NotificationContext.tsx';

export const ErrorResponseSimulator: React.FC = () => {
    const [status, setStatus] = useState(404);
    const { addNotification } = useNotification();
    
    const response = useMemo(() => {
        const messages: Record<number, object> = {
            400: { error: "Bad Request", message: "Invalid input provided" },
            401: { error: "Unauthorized", message: "Authentication token is missing or invalid" },
            403: { error: "Forbidden", message: "You do not have permission to access this resource" },
            404: { error: "Not Found", message: "The requested resource could not be found" },
            500: { error: "Internal Server Error", message: "An unexpected error occurred on the server" },
        };
        return JSON.stringify(messages[status], null, 2);
    }, [status]);

    const handleTrigger = () => {
        addNotification(`Simulated API request failed with status ${status}`, 'error');
    };

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <ServerStackIcon />
                    <span className="ml-3">Error Response Simulator</span>
                </h1>
                <p className="text-text-secondary mt-1">Simulate API error responses (404, 500, etc.).</p>
            </header>
            <div className="flex-grow flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 p-4 bg-surface rounded-lg border">
                    <label>HTTP Status:</label>
                    <select value={status} onChange={e => setStatus(Number(e.target.value))} className="p-2 bg-background border rounded">
                        <option>400</option><option>401</option><option>403</option><option>404</option><option>500</option>
                    </select>
                    <button onClick={handleTrigger} className="btn-primary px-6 py-2">Trigger</button>
                </div>
                <div className="w-full max-w-2xl flex-grow flex flex-col">
                    <label className="text-sm font-medium mb-2">Response Body</label>
                    <pre className="flex-grow p-4 bg-background border rounded-lg text-red-500 font-mono text-xs">{response}</pre>
                </div>
            </div>
        </div>
    );
};
