import React, { useState, useEffect, useRef } from 'react';
import { CodeBracketSquareIcon } from '../icons.tsx';
import { MarkdownRenderer } from '../shared/index.tsx';

const useEventListener = (eventName: string, handler: (event: any) => void, element = window) => {
    const savedHandler = useRef<((event: any) => void) | null>(null);

    useEffect(() => {
        savedHandler.current = handler;
    }, [handler]);

    useEffect(() => {
        const isSupported = element && element.addEventListener;
        if (!isSupported) return;

        const eventListener = (event: any) => savedHandler.current?.(event);
        element.addEventListener(eventName, eventListener);
        return () => {
            element.removeEventListener(eventName, eventListener);
        };
    }, [eventName, element]);
};

const hookCode = `
\`\`\`tsx
import { useEffect, useRef } from 'react';

export const useEventListener = (eventName, handler, element = window) => {
    const savedHandler = useRef(null);

    useEffect(() => {
        savedHandler.current = handler;
    }, [handler]);

    useEffect(() => {
        const isSupported = element && element.addEventListener;
        if (!isSupported) return;

        const eventListener = (event) => savedHandler.current(event);
        element.addEventListener(eventName, eventListener);
        return () => {
            element.removeEventListener(eventName, eventListener);
        };
    }, [eventName, element]);
};
\`\`\`
`;

export const UseEventListenerHookGenerator: React.FC = () => {
    const [coords, setCoords] = useState({ x: 0, y: 0 });
    
    useEventListener('mousemove', (event) => {
        setCoords({ x: event.clientX, y: event.clientY });
    });

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <CodeBracketSquareIcon />
                    <span className="ml-3">useEventListener Hook Generator</span>
                </h1>
                <p className="text-text-secondary mt-1">Generate a custom useEventListener hook.</p>
            </header>
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                <div className="flex flex-col">
                    <label className="text-sm font-medium mb-2">Hook Code</label>
                    <div className="flex-grow p-1 bg-background border rounded overflow-auto">
                        <MarkdownRenderer content={hookCode} />
                    </div>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium mb-2">Live Demo</label>
                    <div className="flex-grow p-4 bg-surface border rounded flex items-center justify-center">
                        <p>Mouse position: ({coords.x}, {coords.y})</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
