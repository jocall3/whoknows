import React, { useState } from 'react';
import { generateUserPersona, generateImage } from '../../services/aiService.ts';
import { DocumentTextIcon } from '../icons.tsx';
import { LoadingSpinner } from '../shared/index.tsx';
import { useNotification } from '../../contexts/NotificationContext.tsx';

interface Persona {
    name: string;
    photoUrl: string;
    demographics: string;
    goals: string[];
    frustrations: string[];
    techStack: string;
}

export const UserPersonaGenerator: React.FC = () => {
    const [description, setDescription] = useState('A busy project manager at a mid-sized tech company who needs to track team progress.');
    const [persona, setPersona] = useState<Persona | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { addNotification } = useNotification();

    const handleGenerate = async () => {
        setIsLoading(true);
        setPersona(null);
        try {
            const personaData = await generateUserPersona(description);
            const photoUrl = await generateImage(`A photorealistic portrait of ${personaData.photoDescription}`);
            setPersona({ ...personaData, photoUrl });
            addNotification('Persona generated!', 'success');
        } catch (err) {
            addNotification(err instanceof Error ? err.message : 'Failed to generate persona', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center"><DocumentTextIcon /><span className="ml-3">User Persona Generator</span></h1>
                <p className="text-text-secondary mt-1">Create detailed user personas from a brief description of a target audience.</p>
            </header>
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col flex-1 min-h-0">
                        <label className="text-sm font-medium mb-2">Target Audience Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} className="flex-grow p-2 bg-surface border rounded"/>
                    </div>
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary w-full py-3">{isLoading ? <LoadingSpinner/> : 'Generate Persona'}</button>
                </div>
                <div className="bg-surface p-6 border rounded-lg overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                    {persona && (
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-shrink-0 w-32 h-32">
                                <img src={persona.photoUrl} alt={persona.name} className="w-full h-full rounded-full object-cover shadow-md"/>
                            </div>
                            <div className="flex-grow">
                                <h2 className="text-2xl font-bold">{persona.name}</h2>
                                <p className="text-sm text-text-secondary">{persona.demographics}</p>
                                <div className="mt-4">
                                    <h3 className="font-semibold">Goals</h3>
                                    <ul className="list-disc list-inside text-sm">
                                        {persona.goals.map((g, i) => <li key={i}>{g}</li>)}
                                    </ul>
                                </div>
                                 <div className="mt-4">
                                    <h3 className="font-semibold">Frustrations</h3>
                                    <ul className="list-disc list-inside text-sm">
                                        {persona.frustrations.map((f, i) => <li key={i}>{f}</li>)}
                                    </ul>
                                </div>
                                <div className="mt-4">
                                    <h3 className="font-semibold">Tech Stack</h3>
                                    <p className="text-sm">{persona.techStack}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
