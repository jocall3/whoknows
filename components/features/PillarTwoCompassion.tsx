import React, { useState, useCallback } from 'react';
import { SparklesIcon } from '../icons.tsx';
import { useNotification } from '../../contexts/NotificationContext.tsx';
import { LoadingSpinner, MarkdownRenderer } from '../shared/index.tsx';
import { runGaiaCrucibleSimulation } from '../../services/index.ts';
import { PILLAR_FEATURES } from '../../constants.tsx';

const features = PILLAR_FEATURES['pillar-two-compassion'];

export const PillarTwoCompassion: React.FC = () => {
    const [activeTab, setActiveTab] = useState(features[0].id);
    const { addNotification } = useNotification();
    
    // State for Gaia's Crucible
    const [intervention, setIntervention] = useState('Stratospheric Aerosol Injection');
    const [intensity, setIntensity] = useState('Moderate');
    const [isLoading, setIsLoading] = useState(false);
    const [simulationResult, setSimulationResult] = useState('');

    const handleRunSimulation = useCallback(async () => {
        setIsLoading(true);
        setSimulationResult('');
        try {
            const result = await runGaiaCrucibleSimulation(intervention, intensity);
            setSimulationResult(result);
            addNotification('Climate simulation complete!', 'success');
        } catch (e) {
            addNotification(e instanceof Error ? e.message : 'Failed to run simulation', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [intervention, intensity, addNotification]);
    
    const renderTabContent = () => {
        switch (activeTab) {
            case 'gaias-crucible':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                        <div className="flex flex-col gap-4">
                            <h3 className="text-lg font-bold">Intervention Parameters</h3>
                            <div>
                                <label className="text-sm font-medium">Strategy</label>
                                <select value={intervention} onChange={e => setIntervention(e.target.value)} className="w-full mt-1 p-2 bg-background border rounded">
                                    <option>Stratospheric Aerosol Injection</option>
                                    <option>Orbital Sunshades</option>
                                    <option>Bio-engineered Carbon Capture</option>
                                </select>
                            </div>
                            <div>
                                 <label className="text-sm font-medium">Intensity</label>
                                <select value={intensity} onChange={e => setIntensity(e.target.value)} className="w-full mt-1 p-2 bg-background border rounded">
                                    <option>Low</option>
                                    <option>Moderate</option>
                                    <option>High</option>
                                </select>
                            </div>
                            <button onClick={handleRunSimulation} disabled={isLoading} className="btn-primary w-full py-2">{isLoading ? <LoadingSpinner/> : 'Run 1,000-Year Simulation'}</button>
                        </div>
                        <div className="flex flex-col">
                             <h3 className="text-lg font-bold mb-2">Simulation Impact Report</h3>
                             <div className="flex-grow p-2 bg-background border rounded overflow-auto">
                                {isLoading ? <div className="flex justify-center items-center h-full"><LoadingSpinner /></div> : <MarkdownRenderer content={simulationResult} />}
                            </div>
                        </div>
                    </div>
                );
            case 'genome-weaver':
            case 'aptitude-engine':
            case 'first-responder-ai':
                 return <div className="text-center text-text-secondary p-8">This module is being forged.</div>;
            default:
                return null;
        }
    };

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary bg-background">
            <header className="mb-4 flex-shrink-0">
                <h1 className="text-3xl font-bold flex items-center">
                    <SparklesIcon />
                    <span className="ml-3">Pillar II: Computational Compassion</span>
                </h1>
                <p className="text-text-secondary mt-1">Apply planetary-scale optimization to humanity's most intractable problems.</p>
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
