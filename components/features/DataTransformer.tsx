import React, { useState } from 'react';
import { ArrowPathIcon } from '../icons.tsx';
import { useNotification } from '../../contexts/NotificationContext.tsx';

const exampleData = `[{"id":1,"name":"Alice"},{"id":2,"name":"Bob"}]`;

export const DataTransformer: React.FC = () => {
    const [input, setInput] = useState(exampleData);
    const [output, setOutput] = useState('');
    const [from, setFrom] = useState('json');
    const [to, setTo] = useState('csv');
    const { addNotification } = useNotification();

    const handleTransform = () => {
        try {
            if (from === to) {
                setOutput(input);
                return;
            }
            if (from === 'json' && to === 'csv') {
                const data = JSON.parse(input);
                if (!Array.isArray(data) || data.length === 0) {
                    setOutput('Input must be a non-empty array of objects for JSON to CSV conversion.');
                    return;
                }
                const headers = Object.keys(data[0]);
                const csvRows = [
                    headers.join(','),
                    ...data.map(row => 
                        headers.map(header => JSON.stringify(row[header], (_, value) => value === null ? '' : value)).join(',')
                    )
                ];
                setOutput(csvRows.join('\n'));
                addNotification('Transformed JSON to CSV!', 'success');
            } else if (from === 'csv' && to === 'json') {
                const [headerLine, ...rows] = input.trim().split('\n');
                const headers = headerLine.split(',').map(h => h.trim());
                const json = rows.map(row => {
                    const values = row.split(',');
                    return headers.reduce((obj: Record<string, any>, header, i) => {
                        obj[header] = values[i] ? values[i].trim() : '';
                        return obj;
                    }, {});
                });
                setOutput(JSON.stringify(json, null, 2));
                addNotification('Transformed CSV to JSON!', 'success');
            } else {
                setOutput(`// Transformation from ${from} to ${to} is not yet implemented.`);
                 addNotification('This transformation is not yet supported.', 'info');
            }
        } catch (e) {
            const message = e instanceof Error ? e.message : 'An unknown error occurred';
            setOutput(`Error: ${message}`);
            addNotification(`Transformation Error: ${message}`, 'error');
        }
    };

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <ArrowPathIcon />
                    <span className="ml-3">Data Transformer</span>
                </h1>
                <p className="text-text-secondary mt-1">Transform data between formats like CSV and JSON.</p>
            </header>
            <div className="flex items-center justify-center gap-4 mb-4">
                <select value={from} onChange={e => setFrom(e.target.value)} className="p-2 bg-surface border rounded">
                    <option>json</option><option>csv</option><option disabled>xml</option>
                </select>
                <span>to</span>
                <select value={to} onChange={e => setTo(e.target.value)} className="p-2 bg-surface border rounded">
                    <option>csv</option><option>json</option><option disabled>xml</option>
                </select>
                <button onClick={handleTransform} className="btn-primary px-6 py-2">Transform</button>
            </div>
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                <div className="flex flex-col">
                    <label className="text-sm font-medium mb-2">Input</label>
                    <textarea value={input} onChange={e => setInput(e.target.value)} className="flex-grow p-2 bg-surface border rounded font-mono text-xs"/>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium mb-2">Output</label>
                    <textarea value={output} readOnly className="flex-grow p-2 bg-background border rounded font-mono text-xs"/>
                </div>
            </div>
        </div>
    );
};