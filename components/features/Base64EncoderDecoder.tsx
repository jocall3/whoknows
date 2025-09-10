import React, { useState } from 'react';
import { CodeBracketSquareIcon } from '../icons.tsx';

export const Base64EncoderDecoder: React.FC = () => {
    const [plain, setPlain] = useState('Hello World!');
    const [encoded, setEncoded] = useState('SGVsbG8gV29ybGQh');

    const handlePlainChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setPlain(val);
        try {
            setEncoded(btoa(val));
        } catch {
            setEncoded('Invalid input for Base64 encoding');
        }
    };

    const handleEncodedChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setEncoded(val);
        try {
            setPlain(atob(val));
        } catch {
            setPlain('Invalid Base64 string');
        }
    };

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <CodeBracketSquareIcon />
                    <span className="ml-3">Base64 Encoder/Decoder</span>
                </h1>
                <p className="text-text-secondary mt-1">Encode and decode strings using Base64.</p>
            </header>
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                <div className="flex flex-col">
                    <label className="text-sm font-medium mb-2">Plain Text</label>
                    <textarea value={plain} onChange={handlePlainChange} className="flex-grow p-2 bg-surface border rounded font-mono text-xs"/>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium mb-2">Base64 Encoded</label>
                    <textarea value={encoded} onChange={handleEncodedChange} className="flex-grow p-2 bg-surface border rounded font-mono text-xs"/>
                </div>
            </div>
        </div>
    );
};
