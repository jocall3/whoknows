import React, { useState } from 'react';
import { decomposeUserFlow, generateImage } from '../../services/aiService.ts';
import { PhotoIcon } from '../icons.tsx';
import { LoadingSpinner } from '../shared/index.tsx';
import { useNotification } from '../../contexts/NotificationContext.tsx';

interface StoryboardFrame {
    description: string;
    imageUrl: string;
}

export const StoryboardGenerator: React.FC = () => {
    const [flow, setFlow] = useState('User logs in, sees a dashboard with three widgets, and clicks a button to open a settings modal.');
    const [frames, setFrames] = useState<StoryboardFrame[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState('');
    const { addNotification } = useNotification();

    const handleGenerate = async () => {
        setIsLoading(true);
        setFrames([]);
        setProgress('Decomposing user flow...');
        try {
            const { steps } = await decomposeUserFlow(flow);
            const newFrames: StoryboardFrame[] = [];
            for (let i = 0; i < steps.length; i++) {
                setProgress(`Generating wireframe for: "${steps[i]}" (${i + 1}/${steps.length})`);
                const imageUrl = await generateImage(`A clean UI wireframe of: ${steps[i]}, user interface, UX design, simple, clean lines.`);
                newFrames.push({ description: steps[i], imageUrl });
                setFrames([...newFrames]);
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
            <div className="flex-grow mt-6 bg-background border rounded-lg p-4 overflow-x-auto">
                {isLoading && <div className="text-center"><LoadingSpinner /><p className="mt-2 text-sm text-text-secondary">{progress}</p></div>}
                <div className="flex gap-4 h-full">
                    {frames.map((frame, i) => (
                        <div key={i} className="flex-shrink-0 w-72 h-full bg-surface border rounded-md flex flex-col p-2">
                            <div className="flex-grow bg-gray-200 rounded-sm flex items-center justify-center">
                                <img src={frame.imageUrl} alt={frame.description} className="max-w-full max-h-full object-contain"/>
                            </div>
                            <p className="text-xs text-center mt-2 p-1">{frame.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
