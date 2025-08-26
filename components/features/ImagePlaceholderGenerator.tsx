import React, { useState, useMemo } from 'react';
import { PhotoIcon } from '../icons.tsx';
import { useNotification } from '../../contexts/NotificationContext.tsx';

export const ImagePlaceholderGenerator: React.FC = () => {
    const [width, setWidth] = useState(300);
    const [height, setHeight] = useState(200);
    const [text, setText] = useState('');
    const { addNotification } = useNotification();

    const url = useMemo(() => {
        return `https://via.placeholder.com/${width}x${height}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
    }, [width, height, text]);

    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        addNotification('URL copied to clipboard!', 'success');
    };

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <PhotoIcon />
                    <span className="ml-3">Image Placeholder Generator</span>
                </h1>
                <p className="text-text-secondary mt-1">Generate placeholder images of any size and color.</p>
            </header>
            <div className="flex-grow flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 p-4 bg-surface rounded-lg border">
                    <input type="number" value={width} onChange={e => setWidth(Number(e.target.value))} className="w-24 p-2 bg-background border rounded"/>
                    <span>x</span>
                    <input type="number" value={height} onChange={e => setHeight(Number(e.target.value))} className="w-24 p-2 bg-background border rounded"/>
                     <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="Optional text..." className="p-2 bg-background border rounded"/>
                </div>
                <div className="p-4 bg-background border rounded-lg">
                    <img src={url} alt="placeholder" />
                </div>
                <div className="flex items-center gap-2 p-2 bg-surface rounded-lg border w-full max-w-xl">
                    <input type="text" value={url} readOnly className="flex-grow p-2 bg-background border rounded font-mono text-sm"/>
                    <button onClick={handleCopy} className="btn-primary px-4 py-2">Copy URL</button>
                </div>
            </div>
        </div>
    );
};
