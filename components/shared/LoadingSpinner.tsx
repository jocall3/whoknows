// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from 'react';

export const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center space-x-2" aria-label="Loading">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0s' }}></div>
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.2s' }}></div>
    </div>
);
