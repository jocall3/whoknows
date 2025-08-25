
import React from 'react';
import { ALL_FEATURES } from '../features/index.ts';
import type { Feature, ViewType } from '../../types.ts';

interface FeatureButtonProps {
    feature: Feature;
    onOpen: (id: ViewType) => void;
}

const FeatureButton: React.FC<FeatureButtonProps> = ({ feature, onOpen }) => {
    return (
        <button
            onClick={() => onOpen(feature.id)}
            className="w-24 h-24 flex flex-col items-center justify-center p-2 rounded-lg bg-surface/30 backdrop-blur-sm border border-white/10 text-white hover:bg-surface/50 transition-colors group"
            title={feature.name}
        >
            <div className="w-8 h-8 text-primary group-hover:scale-110 transition-transform">{feature.icon}</div>
            <span className="text-xs text-text-on-primary mt-2 text-center w-full break-words leading-tight">{feature.name}</span>
        </button>
    );
};

interface FeatureDockProps {
    onOpen: (id: ViewType) => void;
}

export const FeatureDock: React.FC<FeatureDockProps> = ({ onOpen }) => {
    return (
        <div className="absolute inset-0 p-8 overflow-y-auto">
            <div className="flex flex-wrap gap-4 justify-center">
                {ALL_FEATURES.map(feature => (
                    <FeatureButton key={feature.id} feature={feature} onOpen={onOpen} />
                ))}
            </div>
        </div>
    );
};
