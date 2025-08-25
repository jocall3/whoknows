import React, { useState } from 'react';
import { decomposeUserFlow, generateImage } from '../../services/aiService.ts';
import { PhotoIcon, SparklesIcon } from '../icons.tsx';
import { LoadingSpinner } from '../shared/index.tsx';
import { useNotification } from '../../contexts/NotificationContext.tsx';

export const StoryboardGenerator: React.FC = () => {
    const [flow, setFlow] = useState('User logs in, sees a dashboard with three widgets, and clicks a button to open a settings modal.');
    const [images, setImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState('');
    const { addNotification } = useNotification();

    const handleGenerate = async () => {
        setIsLoading(true);
        setImages([]);
        setProgress('Decomposing user flow...');
        try {
            const { steps } = await decomposeUserFlow(flow);
            for (let i = 0; i < steps.length; i++) {
                setProgress(`Generating wireframe for: "${steps[i]}" (${i + 1}/${steps.length})`);
                const imageUrl = await generateImage(`A clean UI wireframe of: ${steps[i]}, user interface, UX design, simple, clean lines.`);
                setImages(prev => [...prev, imageUrl]);
            }
            addNotification('Storyboard generated!', 'success');
        } catch (err) {
            addNotification(err instanceof Error ? err.message : 'Generation failed', 'error');
        } finally {
            setIsLoading(false);
            setProgress('');
        }
    };

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center"><PhotoIcon /><span className="ml-3">Storyboard Generator</span></h1>
                <p className="text-text-secondary mt-1">Create a sequence of UI mockups from a user flow description.</p>
            </header>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col">
                    <label className="text-sm font-medium mb-2">User Flow Description</label>
                    <textarea value={flow} onChange={e => setFlow(e.target.value)} className="w-full p-2 bg-surface border rounded text-sm"/>
                </div>
                <button onClick={handleGenerate} disabled={isLoading} className="btn-primary w-full max-w-sm mx-auto py-3">{isLoading ? <LoadingSpinner/> : 'Generate Storyboard'}</button>
            </div>
            <div className="flex-grow mt-6 bg-background border rounded-lg p-4 overflow-auto">
                {isLoading && <div className="text-center"><LoadingSpinner /><p className="mt-2 text-sm text-text-secondary">{progress}</p></div>}
                <div className="flex gap-4">
                    {images.map((img, i) => (
                        <div key={i} className="flex-shrink-0 w-64 h-64 bg-surface border rounded-md">
                            <img src={img} alt={`Storyboard frame ${i + 1}`} className="w-full h-full object-contain"/>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
