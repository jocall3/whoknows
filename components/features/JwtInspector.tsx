import React, { useState, useMemo } from 'react';
import { LockClosedIcon } from '../icons.tsx';

const exampleJwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

export const JwtInspector: React.FC = () => {
    const [jwt, setJwt] = useState(exampleJwt);
    
    const { header, payload, error } = useMemo(() => {
        try {
            const parts = jwt.split('.');
            if (parts.length !== 3) return { error: 'Invalid JWT structure' };
            const header = JSON.parse(atob(parts[0]));
            const payload = JSON.parse(atob(parts[1]));
            return { header, payload, error: null };
        } catch (e) {
            return { error: 'Invalid JWT format' };
        }
    }, [jwt]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <LockClosedIcon />
                    <span className="ml-3">JWT Inspector</span>
                </h1>
                <p className="text-text-secondary mt-1">Decode and inspect JSON Web Tokens.</p>
            </header>
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                <div className="flex flex-col">
                    <label className="text-sm font-medium mb-2">JWT</label>
                    <textarea value={jwt} onChange={e => setJwt(e.target.value)} className="flex-grow p-2 bg-surface border rounded font-mono text-xs"/>
                </div>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col flex-1">
                        <label className="text-sm font-medium mb-2">Header</label>
                        <pre className="flex-grow p-2 bg-background border rounded text-xs">{error ? error : JSON.stringify(header, null, 2)}</pre>
                    </div>
                    <div className="flex flex-col flex-1">
                        <label className="text-sm font-medium mb-2">Payload</label>
                        <pre className="flex-grow p-2 bg-background border rounded text-xs">{error ? '' : JSON.stringify(payload, null, 2)}</pre>
                    </div>
                </div>
            </div>
        </div>
    );
};
