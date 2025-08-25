import React, { useState } from 'react';
import { anonymizeData } from '../../services/aiService.ts';
import { ShieldCheckIcon, SparklesIcon } from '../icons.tsx';
import { LoadingSpinner } from '../shared/index.tsx';
import { useNotification } from '../../contexts/NotificationContext.tsx';

const exampleJson = `[
  { "id": 1, "name": "Alice Smith", "email": "alice.smith@example.com", "ip_address": "192.168.1.10" },
  { "id": 2, "name": "Bob Johnson", "email": "bob.j@workplace.net", "ip_address": "10.0.0.54" }
]`;

export const DataAnonymizer: React.FC = () => {
    const [data, setData] = useState(exampleJson);
    const [anonymizedData, setAnonymizedData] = useState('');
    const [targets, setTargets] = useState({ name: true, email: true, ip_address: true });
    const [isLoading, setIsLoading] = useState(false);
    const { addNotification } = useNotification();

    const handleAnonymize = async () => {
        const selectedTargets = Object.entries(targets).filter(([, value]) => value).map(([key]) => key);
        if (selectedTargets.length === 0) {
            addNotification('Please select at least one field to anonymize.', 'error');
            return;
        }
        setIsLoading(true);
        setAnonymizedData('');
        try {
            const result = await anonymizeData(data, selectedTargets);
            setAnonymizedData(result.anonymizedData);
            addNotification('Data anonymized successfully!', 'success');
        } catch (err) {
            addNotification(err instanceof Error ? err.message : 'Anonymization failed.', 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleTargetChange = (key: string) => {
        setTargets(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center"><ShieldCheckIcon /><span className="ml-3">Data Anonymizer</span></h1>
                <p className="text-text-secondary mt-1">Anonymize sensitive data in JSON or CSV formats using AI.</p>
            </header>
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col flex-1 min-h-0">
                        <label className="text-sm font-medium mb-2">Original Data (JSON or CSV)</label>
                        <textarea value={data} onChange={e => setData(e.target.value)} className="flex-grow p-2 bg-surface border rounded font-mono text-xs"/>
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-2">Fields to Anonymize</label>
                        <div className="flex flex-wrap gap-2">
                            {Object.keys(targets).map(key => (
                                <label key={key} className="flex items-center gap-2 p-2 bg-surface border rounded-md text-sm">
                                    <input type="checkbox" checked={targets[key as keyof typeof targets]} onChange={() => handleTargetChange(key)} />
                                    {key}
                                </label>
                            ))}
                        </div>
                    </div>
                    <button onClick={handleAnonymize} disabled={isLoading} className="btn-primary w-full py-3">{isLoading ? <LoadingSpinner/> : 'Anonymize Data'}</button>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium mb-2">Anonymized Data</label>
                    <div className="flex-grow p-2 bg-background border rounded overflow-auto">
                        {isLoading ? <div className="flex justify-center items-center h-full"><LoadingSpinner /></div> : <pre className="font-mono text-xs">{anonymizedData}</pre>}
                    </div>
                </div>
            </div>
        </div>
    );
};
