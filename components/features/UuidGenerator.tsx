import React, { useState, useCallback } from 'react';
import { TerminalIcon } from '../icons.tsx';
import { useNotification } from '../../contexts/NotificationContext.tsx';

// A simple nanoid implementation for the demo
const nanoid = (size = 21) => crypto.getRandomValues(new Uint8Array(size)).reduce((id, byte) => id + ((byte &= 63) < 36 ? byte.toString(36) : (byte < 62 ? (byte - 26).toString(36).toUpperCase() : (byte > 62 ? '-' : '_'))), '');

export const UuidGenerator: React.FC = () => {
    const [id, setId] = useState('');
    const [type, setType] = useState<'uuid' | 'nanoid'>('uuid');
    const { addNotification } = useNotification();

    const generateId = useCallback(() => {
        if (type === 'uuid') {
            setId(crypto.randomUUID());
        } else {
            setId(nanoid());
        }
    }, [type]);

    const handleCopy = () => {
        if (id) {
            navigator.clipboard.writeText(id);
            addNotification('ID copied to clipboard!', 'success');
        }
    };

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <TerminalIcon />
                    <span className="ml-3">UUID/NanoID Generator</span>
                </h1>
                <p className="text-text-secondary mt-1">Generate universally unique identifiers.</p>
            </header>
            <div className="flex-grow flex flex-col items-center justify-center gap-4">
                <div className="bg-surface p-6 rounded-lg border w-full max-w-xl text-center">
                    <p className="font-mono text-lg text-primary break-all h-8">{id || 'Click generate to start'}</p>
                </div>
                <div className="flex gap-2">
                    <select value={type} onChange={e => setType(e.target.value as any)} className="p-2 bg-surface border rounded">
                        <option value="uuid">UUID v4</option>
                        <option value="nanoid">NanoID</option>
                    </select>
                    <button onClick={generateId} className="btn-primary px-6 py-2">Generate</button>
                    <button onClick={handleCopy} disabled={!id} className="btn-primary px-6 py-2">Copy</button>
                </div>
            </div>
        </div>
    );
};
