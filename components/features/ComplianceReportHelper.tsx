import React, { useState } from 'react';
import { generateComplianceReport } from '../../services/aiService.ts';
import { ShieldCheckIcon } from '../icons.tsx';
import { LoadingSpinner, MarkdownRenderer } from '../shared/index.tsx';
import { useNotification } from '../../contexts/NotificationContext.tsx';

const exampleCode = `function saveUserData(user) {
  // Storing user data in localStorage for session persistence
  localStorage.setItem('user_session', JSON.stringify(user));
  
  // Sending analytics data
  fetch('https://analytics.example.com/track', {
    method: 'POST',
    body: JSON.stringify({ userId: user.id, event: 'login' })
  });
}`;

export const ComplianceReportHelper: React.FC = () => {
    const [code, setCode] = useState(exampleCode);
    const [standard, setStandard] = useState('GDPR');
    const [report, setReport] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { addNotification } = useNotification();

    const handleGenerate = async () => {
        setIsLoading(true);
        setReport('');
        try {
            const result = await generateComplianceReport(code, standard);
            setReport(result);
            addNotification('Compliance report generated!', 'success');
        } catch (err) {
            addNotification(err instanceof Error ? err.message : 'Failed to generate report', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center"><ShieldCheckIcon /><span className="ml-3">Compliance Report Helper</span></h1>
                <p className="text-text-secondary mt-1">Check code for compliance with standards like GDPR.</p>
            </header>
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col flex-1 min-h-0">
                        <label className="text-sm font-medium mb-2">Code to Analyze</label>
                        <textarea value={code} onChange={e => setCode(e.target.value)} className="flex-grow p-2 bg-surface border rounded font-mono text-xs"/>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Compliance Standard</label>
                        <select value={standard} onChange={e => setStandard(e.target.value)} className="w-full mt-1 p-2 bg-surface border rounded">
                            <option>GDPR</option>
                            <option>SOX</option>
                        </select>
                    </div>
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary w-full py-3">{isLoading ? <LoadingSpinner/> : 'Generate Report'}</button>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium mb-2">Generated Report</label>
                    <div className="flex-grow p-4 bg-background border rounded overflow-auto">
                        {isLoading ? <div className="flex justify-center items-center h-full"><LoadingSpinner /></div> : (
                            report && <MarkdownRenderer content={report} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
