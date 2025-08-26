import React, { useState, useCallback } from 'react';
import { HammerIcon } from '../icons.tsx';
import { useNotification } from '../../contexts/NotificationContext.tsx';
import { LoadingSpinner, MarkdownRenderer } from '../shared/index.tsx';
import { refactorLegalCode } from '../../services/index.ts';
import { PILLAR_FEATURES } from '../../constants.tsx';

const features = PILLAR_FEATURES['pillar-three-meta-creation'];

const exampleLegalCode = `
Article 1: All citizens shall have the right to free speech.
Article 2: No citizen shall incite violence.
Article 3: In times of national emergency, the right to free speech may be temporarily suspended to prevent panic.
`;

export const PillarThreeMetaCreation: React.FC = () => {
    const [activeTab, setActiveTab] = useState(features[1].id); // Default to Themis Engine
    const { addNotification } = useNotification();

    // State for Themis Engine
    const [legalCode, setLegalCode] = useState(exampleLegalCode);
    const [isLoading, setIsLoading] = useState(false);
    const [refactoredCode, setRefactoredCode] = useState('');

    const handleRefactor = useCallback(async () => {
        setIsLoading(true);
        setRefactoredCode('');
        try {
            const result = await refactorLegalCode(legalCode);
            setRefactoredCode(result);
            addNotification('Legal framework refactored!', 'success');
        } catch (e) {
            addNotification(e instanceof Error ? e.message : 'Failed to refactor code', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [legalCode, addNotification]);

    const renderTabContent = () => {
        switch (activeTab) {
            case 'themis-engine':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                        <div className="flex flex-col gap-4">
                            <h3 className="text-lg font-bold">Existing Legal Framework</h3>
                            <textarea
                                value={legalCode}
                                onChange={e => setLegalCode(e.target.value)}
                                className="w-full flex-grow p-2 bg-background border rounded text-sm"
                            />
                            <button onClick={handleRefactor} disabled={isLoading} className="btn-primary w-full py-2">{isLoading ? <LoadingSpinner/> : 'Refactor Legal Code'}</button>
                        </div>
                        <div className="flex flex-col">
                             <h3 className="text-lg font-bold mb-2">Generated Framework</h3>
                             <div className="flex-grow p-2 bg-background border rounded overflow-auto">
                                {isLoading ? <div className="flex justify-center items-center h-full"><LoadingSpinner /></div> : <MarkdownRenderer content={refactoredCode} />}
                            </div>
                        </div>
                    </div>
                );
            case 'hypothesis-forge':
            case 'memetic-catalyst':
            case 'the-exchange':
                 return <div className="text-center text-text-secondary p-8">This module is being forged.</div>;
            default:
                return null;
        }
    };

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary bg-background">
            <header className="mb-4 flex-shrink-0">
                <h1 className="text-3xl font-bold flex items-center">
                    <HammerIcon />
                    <span className="ml-3">Pillar III: The Meta-Creation Console</span>
                </h1>
                <p className="text-text-secondary mt-1">Accelerate the very pace of discovery, creation, and cultural evolution.</p>
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
