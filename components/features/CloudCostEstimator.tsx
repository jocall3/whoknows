import React, { useState } from 'react';
import { estimateCloudCost } from '../../services/aiService.ts';
import { GcpIcon } from '../icons.tsx';
import { LoadingSpinner, MarkdownRenderer } from '../shared/index.tsx';
import { useNotification } from '../../contexts/NotificationContext.tsx';

export const CloudCostEstimator: React.FC = () => {
    const [description, setDescription] = useState('A web app with 2 vCPUs, a 50GB SQL database, and a load balancer in us-central1');
    const [estimate, setEstimate] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { addNotification } = useNotification();

    const handleEstimate = async () => {
        setIsLoading(true);
        setEstimate('');
        try {
            const result = await estimateCloudCost(description);
            setEstimate(result);
            addNotification('Estimate generated!', 'success');
        } catch (err) {
            addNotification(err instanceof Error ? err.message : 'Failed to generate estimate', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center"><GcpIcon /><span className="ml-3">Cloud Cost Estimator</span></h1>
                <p className="text-text-secondary mt-1">Estimate GCP/AWS costs based on a description of services.</p>
            </header>
            <div className="flex-grow flex flex-col gap-4 min-h-0">
                <div className="flex flex-col flex-1 min-h-0">
                    <label className="text-sm font-medium mb-2">Architecture Description</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} className="flex-grow p-2 bg-surface border rounded"/>
                </div>
                <button onClick={handleEstimate} disabled={isLoading} className="btn-primary w-full max-w-sm mx-auto py-3">{isLoading ? <LoadingSpinner/> : 'Estimate Monthly Cost'}</button>
                <div className="flex flex-col flex-grow min-h-0 mt-4">
                    <label className="text-sm font-medium mb-2">AI-Generated Estimate</label>
                    <div className="flex-grow p-4 bg-background border rounded overflow-auto">
                        {isLoading ? <div className="flex justify-center items-center h-full"><LoadingSpinner /></div> : (
                            estimate && (
                                <>
                                    <MarkdownRenderer content={estimate} />
                                    <p className="text-xs text-yellow-600 mt-4"><strong>Disclaimer:</strong> This is a rough, non-binding estimate based on public pricing data and should not be used for official budgeting.</p>
                                </>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
