import React, { useState } from 'react';
import { BeakerIcon } from '../icons.tsx';

export const FeatureFlagSimulator: React.FC = () => {
    const [flags, setFlags] = useState({
        newDashboard: true,
        darkMode: false,
        betaFeature: false,
    });

    const handleToggle = (flag: keyof typeof flags) => {
        setFlags(prev => ({ ...prev, [flag]: !prev[flag] }));
    };

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <BeakerIcon />
                    <span className="ml-3">Feature Flag Simulator</span>
                </h1>
                <p className="text-text-secondary mt-1">Simulate and test feature flags in your application.</p>
            </header>
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-surface p-4 rounded-lg border">
                    <h3 className="font-bold mb-2">Controls</h3>
                    {Object.entries(flags).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-2">
                            <code>{key}</code>
                            <button onClick={() => handleToggle(key as keyof typeof flags)} className={`px-2 py-1 rounded-full text-xs ${value ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>{value ? 'ON' : 'OFF'}</button>
                        </div>
                    ))}
                </div>
                 <div className="bg-background p-4 rounded-lg border">
                    <h3 className="font-bold mb-2">Simulated App State</h3>
                    {flags.newDashboard && <div className="p-2 bg-blue-500/10 text-blue-700 rounded mb-2">New Dashboard is visible</div>}
                    {flags.darkMode && <div className="p-2 bg-gray-800/10 text-gray-400 rounded mb-2">Dark Mode is enabled</div>}
                    {flags.betaFeature && <div className="p-2 bg-yellow-500/10 text-yellow-700 rounded mb-2">Secret Beta Feature is enabled</div>}
                </div>
            </div>
        </div>
    );
};
