import React, { useState, useEffect, useRef } from 'react';
import { decomposeUserFlow, generateImage } from '../../services/aiService.ts';
import { VideoCameraIcon } from '../icons.tsx';
import { LoadingSpinner } from '../shared/index.tsx';
import { useNotification } from '../../contexts/NotificationContext.tsx';

export const AiVideoGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState('A cinematic shot of a robot skateboarding through a neon-lit city at night.');
    const [images, setImages] = useState<string[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const intervalRef = useRef<number | null>(null);
    const { addNotification } = useNotification();

    const handleGenerate = async () => {
        setIsLoading(true);
        setImages([]);
        try {
            const { steps } = await decomposeUserFlow(`Create a short video clip based on this prompt: "${prompt}". Break it down into 4 keyframes.`);
            for (let i = 0; i < steps.length; i++) {
                const imageUrl = await generateImage(`A cinematic frame from a video of: ${steps[i]}.`);
                setImages(prev => [...prev, imageUrl]);
            }
            addNotification('Video frames generated!', 'success');
        } catch (err) {
            addNotification(err instanceof Error ? err.message : 'Generation failed', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isPlaying) {
            intervalRef.current = window.setInterval(() => {
                setCurrentImageIndex(prev => (prev + 1) % images.length);
            }, 200); // 5 fps
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isPlaying, images.length]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center"><VideoCameraIcon /><span className="ml-3">AI Video Generator (Simulated)</span></h1>
                <p className="text-text-secondary mt-1">Generate a sequence of images from a prompt to simulate video creation.</p>
            </header>
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col flex-1 min-h-0">
                        <label className="text-sm font-medium mb-2">Prompt</label>
                        <textarea value={prompt} onChange={e => setPrompt(e.target.value)} className="flex-grow p-2 bg-surface border rounded"/>
                    </div>
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary w-full py-3">{isLoading ? <LoadingSpinner/> : 'Generate Video Frames'}</button>
                    <p className="text-xs text-center text-yellow-600 bg-yellow-400/10 p-2 rounded-md">
                        <strong>Note:</strong> This is a simulation. It generates a sequence of images and plays them as a slideshow to mimic video generation, as client-side video generation APIs are not yet standard.
                    </p>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium mb-2">Generated Video</label>
                    <div className="flex-grow bg-background border rounded overflow-hidden relative">
                        {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                        {images.length > 0 && <img src={images[currentImageIndex]} alt="Generated frame" className="w-full h-full object-contain"/>}
                        {images.length > 0 && !isLoading && (
                            <button onClick={() => setIsPlaying(!isPlaying)} className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full">
                                {isPlaying ? 'Pause' : 'Play'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
