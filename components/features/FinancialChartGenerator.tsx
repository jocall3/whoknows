import React, { useState } from 'react';
import { generateChartComponent } from '../../services/aiService.ts';
import { ChartBarIcon } from '../icons.tsx';
import { LoadingSpinner, MarkdownRenderer } from '../shared/index.tsx';
import { useNotification } from '../../contexts/NotificationContext.tsx';

export const FinancialChartGenerator: React.FC = () => {
    const [csvData, setCsvData] = useState('date,price\n2024-01-01,150\n2024-02-01,155\n2024-03-01,162\n2024-04-01,158');
    const [chartType, setChartType] = useState<'line' | 'bar'>('line');
    const [generatedCode, setGeneratedCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { addNotification } = useNotification();

    const handleGenerate = async () => {
        setIsLoading(true);
        setGeneratedCode('');
        try {
            const lines = csvData.trim().split('\n');
            const headers = lines[0].split(',');
            const samples = lines.slice(1, 4).map(line => line.split(','));

            const code = await generateChartComponent({ headers, samples }, chartType);
            setGeneratedCode(code);
            addNotification('Chart component generated!', 'success');
        } catch (err) {
            addNotification(err instanceof Error ? err.message : 'Failed to generate chart', 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center"><ChartBarIcon /><span className="ml-3">Financial Chart Generator</span></h1>
                <p className="text-text-secondary mt-1">Generate chart components from financial data (e.g., CSV).</p>
            </header>
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col flex-1 min-h-0">
                        <label className="text-sm font-medium mb-2">CSV Data</label>
                        <textarea value={csvData} onChange={e => setCsvData(e.target.value)} className="flex-grow p-2 bg-surface border rounded font-mono text-xs"/>
                    </div>
                     <div>
                        <label className="text-sm font-medium">Chart Type</label>
                        <select value={chartType} onChange={e => setChartType(e.target.value as 'line' | 'bar')} className="w-full mt-1 p-2 bg-surface border rounded">
                            <option value="line">Line Chart</option>
                            <option value="bar">Bar Chart</option>
                        </select>
                    </div>
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary w-full py-3">{isLoading ? <LoadingSpinner/> : 'Generate Chart Component'}</button>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium mb-2">Generated React Component (using Recharts)</label>
                    <div className="flex-grow p-1 bg-background border rounded overflow-auto">
                        {isLoading ? <div className="flex justify-center items-center h-full"><LoadingSpinner /></div> : (
                            generatedCode && <MarkdownRenderer content={generatedCode} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
