import React, { useState, useCallback } from 'react';
import { ProjectExplorerIcon } from '../icons.tsx';
import { useNotification } from '../../contexts/NotificationContext.tsx';
import { LoadingSpinner, MarkdownRenderer } from '../shared/index.tsx';
import { generateMonetaryPolicy } from '../../services/index.ts';
import { PILLAR_FEATURES } from '../../constants.tsx';

const features = PILLAR_FEATURES['pillar-one-geos'];

export const PillarOneGeos: React.FC = () => {
    const [activeTab, setActiveTab] = useState(features[1].id); // Default to Monetary Policy Simulator
    const { addNotification } = useNotification();

    // State for Monetary Policy Simulator
    const [countryData, setCountryData] = useState('GDP: $50B, National Debt: 120% of GDP, Inflation: 15%, Political Stability: Low, Key Industries: Agriculture, Tourism.');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedPlan, setGeneratedPlan] = useState('');

    const handleGeneratePolicy = useCallback(async () => {
        setIsLoading(true);
        setGeneratedPlan('');
        try {
            const plan = await generateMonetaryPolicy(countryData);
            setGeneratedPlan(plan);
            addNotification('Monetary policy generated!', 'success');
        } catch (e) {
            addNotification(e instanceof Error ? e.message : 'Failed to generate policy', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [countryData, addNotification]);

    const renderTabContent = () => {
        switch (activeTab) {
            case 'monetary-policy-simulator':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                        <div className="flex flex-col gap-4">
                            <h3 className="text-lg font-bold">Nation State Parameters</h3>
                            <textarea
                                value={countryData}
                                onChange={e => setCountryData(e.target.value)}
                                className="w-full flex-grow p-2 bg-background border rounded text-sm"
                            />
                            <button onClick={handleGeneratePolicy} disabled={isLoading} className="btn-primary w-full py-2">{isLoading ? <LoadingSpinner/> : 'Simulate 100-Year Evolution'}</button>
                        </div>
                        <div className="flex flex-col">
                             <h3 className="text-lg font-bold mb-2">Generated Economic Plan</h3>
                             <div className="flex-grow p-2 bg-background border rounded overflow-auto">
                                {isLoading ? <div className="flex justify-center items-center h-full"><LoadingSpinner /></div> : <MarkdownRenderer content={generatedPlan} />}
                            </div>
                        </div>
                    </div>
                );
            case 'logistics-manifold':
            case 'scarcity-oracle':
            case 'urbanism-synthesizer':
                 return <div className="text-center text-text-secondary p-8">This module is being forged.</div>;
            default:
                return null;
        }
    };

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary bg-background">
            <header className="mb-4 flex-shrink-0">
                <h1 className="text-3xl font-bold flex items-center">
                    <ProjectExplorerIcon />
                    <span className="ml-3">Pillar I: The GEOS Console</span>
                </h1>
                <p className="text-text-secondary mt-1">Orchestrate the planet's financial and logistical backbone.</p>
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
