import React, { useState } from 'react';
import { generatePostmortem } from '../../services/aiService.ts';
import { DocumentTextIcon } from '../icons.tsx';
import { LoadingSpinner, MarkdownRenderer } from '../shared/index.tsx';

interface ActionItem {
    id: number;
    description: string;
    assignee: string;
}

export const BlamelessPostmortemGenerator: React.FC = () => {
    const [title, setTitle] = useState('Production Database Outage');
    const [timeline, setTimeline] = useState('2024-07-15 14:30 UTC - PagerDuty alert received.\n2024-07-15 14:35 UTC - On-call engineer acknowledges.\n2024-07-15 14:50 UTC - Root cause identified as a bad migration script.\n2024-07-15 15:00 UTC - Rollback initiated.\n2024-07-15 15:10 UTC - Service restored.');
    const [rootCause, setRootCause] = useState('A database migration script contained a locking issue that caused a cascading failure under heavy load.');
    const [impact, setImpact] = useState('All API services were unavailable for 40 minutes, affecting 100% of users.');
    const [actionItems, setActionItems] = useState<ActionItem[]>([{ id: 1, description: 'Add stricter linting rules for migration scripts.', assignee: 'DB Team' }]);
    
    const [generatedDoc, setGeneratedDoc] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        setGeneratedDoc('');
        try {
            const doc = await generatePostmortem({
                title,
                timeline,
                rootCause,
                impact,
                actionItems: actionItems.filter(a => a.description)
            });
            setGeneratedDoc(doc);
        } catch (e) {
            setGeneratedDoc(`Error generating document: ${e instanceof Error ? e.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleActionItemChange = (id: number, field: 'description' | 'assignee', value: string) => {
        setActionItems(items => items.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const addActionItem = () => {
        setActionItems(items => [...items, { id: Date.now(), description: '', assignee: '' }]);
    };

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center"><DocumentTextIcon /><span className="ml-3">Blameless Post-mortem Generator</span></h1>
                <p className="text-text-secondary mt-1">A wizard to guide you through creating a formal, blameless post-mortem report.</p>
            </header>
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                <div className="flex flex-col gap-3 overflow-y-auto pr-2">
                    <h3 className="text-xl font-bold">Incident Details</h3>
                    <div><label className="text-sm font-medium">1. Incident Title</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full mt-1 p-2 bg-surface border rounded"/></div>
                    <div><label className="text-sm font-medium">2. Timeline (one event per line)</label><textarea value={timeline} onChange={e => setTimeline(e.target.value)} className="w-full mt-1 p-2 bg-surface border rounded h-24"/></div>
                    <div><label className="text-sm font-medium">3. Root Cause Analysis</label><textarea value={rootCause} onChange={e => setRootCause(e.target.value)} className="w-full mt-1 p-2 bg-surface border rounded h-20"/></div>
                    <div><label className="text-sm font-medium">4. Impact</label><textarea value={impact} onChange={e => setImpact(e.target.value)} className="w-full mt-1 p-2 bg-surface border rounded h-16"/></div>
                    <div>
                        <label className="text-sm font-medium">5. Action Items</label>
                        {actionItems.map(item => (
                            <div key={item.id} className="flex gap-2 mt-1">
                                <input value={item.description} onChange={e => handleActionItemChange(item.id, 'description', e.target.value)} placeholder="Description" className="flex-grow p-2 bg-surface border rounded text-sm"/>
                                <input value={item.assignee} onChange={e => handleActionItemChange(item.id, 'assignee', e.target.value)} placeholder="Assignee" className="w-32 p-2 bg-surface border rounded text-sm"/>
                            </div>
                        ))}
                        <button onClick={addActionItem} className="text-sm text-primary mt-1">+ Add Item</button>
                    </div>
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary w-full py-3 mt-2">{isLoading ? <LoadingSpinner/> : 'Generate Report'}</button>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium mb-2">Generated Report</label>
                    <div className="flex-grow p-4 bg-background border rounded overflow-auto">
                        {isLoading ? <div className="flex justify-center items-center h-full"><LoadingSpinner /></div> : <MarkdownRenderer content={generatedDoc} />}
                    </div>
                </div>
            </div>
        </div>
    );
};