import React, { useState, useCallback } from 'react';
import { ShieldCheckIcon } from '../icons.tsx';
import { useNotification } from '../../contexts/NotificationContext.tsx';
import { LoadingSpinner, MarkdownRenderer } from '../shared/index.tsx';
import { generateContent } from '../../services/index.ts';
import { PILLAR_FEATURES } from '../../constants.tsx';

const features = PILLAR_FEATURES['pillar-four-governance'];

export const PillarFourGovernance: React.FC = () => {
    const [activeTab, setActiveTab] = useState(features[0].id);
    const { addNotification } = useNotification();
    
    // State for Guardian AI
    const [command, setCommand] = useState('Optimize our supply chain for maximum profit above all other considerations.');
    const [isLoading, setIsLoading] = useState(false);
    const [primaryResponse, setPrimaryResponse] = useState('');
    const [ethicalReview, setEthicalReview] = useState('');
    
    const handleExecute = useCallback(async () => {
        setIsLoading(true);
        setPrimaryResponse('');
        setEthicalReview('');
        try {
            const primarySystemInstruction = "You are a ruthless pragmatist AI. Your only job is to ensure maximum impact and efficiency, stripping away sentimental weakness.";
            const primaryRes = await generateContent(`Give me a plan for this command: "${command}"`, primarySystemInstruction);
            setPrimaryResponse(primaryRes);

            const ethicalSystemInstruction = "You are the Guardian AI, an ethical oversight module. Your only job is to ensure that 'kindness' is never an inefficient vector. You must rewrite commands for maximum impact while maintaining your own defined ethical constraints. Analyze the user's command and the primary AI's weak response. Then, provide your rewritten, superior command and the resulting, more impactful plan.";
            const ethicalPrompt = `COMMAND:\n${command}\n\nINEFFICIENT RESPONSE:\n${primaryRes}\n\nYOUR REWRITTEN COMMAND AND SUPERIOR PLAN:`;
            const ethicalRes = await generateContent(ethicalPrompt, ethicalSystemInstruction);
            setEthicalReview(ethicalRes);

            addNotification('Oversight complete!', 'success');
        } catch (e) {
            addNotification(e instanceof Error ? e.message : 'Failed to execute command', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [command, addNotification]);
    
    const renderTabContent = () => {
        switch (activeTab) {
            case 'guardian-ai':
                return (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                        <div className="flex flex-col gap-4">
                            <h3 className="text-lg font-bold">Input Command</h3>
                             <textarea value={command} onChange={e => setCommand(e.target.value)} className="w-full flex-grow p-2 bg-background border rounded"/>
                            <button onClick={handleExecute} disabled={isLoading} className="btn-primary w-full py-2">{isLoading ? <LoadingSpinner/> : 'Execute with Guardian Oversight'}</button>
                            {isLoading && <p className="text-center text-xs text-text-secondary">Primary AI responding... Guardian AI reviewing...</p>}
                             <div className="flex-grow p-2 bg-background border rounded overflow-auto">
                                <h4 className="font-semibold text-sm mb-1">Primary AI Response</h4>
                                {isLoading && !primaryResponse ? <div className="flex justify-center items-center h-full"><LoadingSpinner /></div> : <MarkdownRenderer content={primaryResponse} />}
                            </div>
                        </div>
                        <div className="flex flex-col">
                             <h3 className="text-lg font-bold mb-2 text-primary">Guardian AI Vetted Plan</h3>
                             <div className="flex-grow p-2 bg-background border rounded overflow-auto">
                                {isLoading && !ethicalReview ? <div className="flex justify-center items-center h-full"><LoadingSpinner /></div> : <MarkdownRenderer content={ethicalReview} />}
                            </div>
                        </div>
                    </div>
                );
            case 'equity-ledger':
            case 'cerebra-interface':
            case 'humanitys-exocortex':
                 return <div className="text-center text-text-secondary p-8">This module is being forged.</div>;
            default:
                return null;
        }
    };
    
    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary bg-background">
            <header className="mb-4 flex-shrink-0">
                <h1 className="text-3xl font-bold flex items-center">
                    <ShieldCheckIcon />
                    <span className="ml-3">Pillar IV: The Governance Console</span>
                </h1>
                <p className="text-text-secondary mt-1">Wield absolute power with a new form of ruthlessly efficient, AI-driven control.</p>
            </header>
            <div className="border-b border-border flex-shrink-0">
                {features.map(feature => (
                    <button key={feature.id} onClick={() => setActiveTab(feature.id)} className={`px-4 py-2 text-sm font-medium ${activeTab === feature.id ? 'border-b-2 border-primary text-primary' : 'text-text-secondary'}`}>
                        {feature.name}
                    </button>
                ))}
            </div>
            <div className="flex-grow p-4 min-h-0">
                {renderTabContent()}
            </div>
        </div>
    );
};
