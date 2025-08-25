

import React from 'react';
import { ALL_FEATURES } from '../features/index.ts';
import type { Feature, ViewType, CustomFeature } from '../../types.ts';
import { CpuChipIcon } from '../icons.tsx';

const ICON_MAP: Record<string, React.FC> = ALL_FEATURES.reduce((acc, feature) => {
    const iconType = (feature.icon as React.ReactElement)?.type;
    if (typeof iconType === 'function' && iconType.name) {
      const iconName = iconType.name;
      acc[iconName] = iconType as React.FC;
    }
    return acc;
  }, {} as Record<string, React.FC>);
  
const IconComponent = ({ name }: { name: string }) => {
    const Comp = ICON_MAP[name];
    return Comp ? <Comp /> : <CpuChipIcon />;
};

interface FeatureButtonProps {
    feature: Feature | CustomFeature;
    onOpen: (id: ViewType) => void;
}

const FeatureButton: React.FC<FeatureButtonProps> = ({ feature, onOpen }) => {
    const featureIcon = typeof feature.icon === 'string' ? <IconComponent name={feature.icon} /> : feature.icon;
    return (
        <button
            onClick={() => onOpen(feature.id)}
            className="w-24 h-24 flex flex-col items-center justify-center p-2 rounded-lg bg-surface/30 backdrop-blur-sm border border-white/10 text-white hover:bg-surface/50 transition-colors group"
            title={feature.name}
        >
            <div className="w-8 h-8 text-primary group-hover:scale-110 transition-transform">{featureIcon}</div>
            <span className="text-xs text-text-on-primary mt-2 text-center w-full break-words leading-tight">{feature.name}</span>
        </button>
    );
};

interface FeatureDockProps {
    onOpen: (id: ViewType, props?: any) => void;
    customFeatures: CustomFeature[];
}

export const FeatureDock: React.FC<FeatureDockProps> = ({ onOpen, customFeatures }) => {
    const allFeatures = [...ALL_FEATURES, ...customFeatures];
    return (
        <div className="absolute inset-0 p-8 overflow-y-auto">
            <div className="flex flex-wrap gap-4 justify-center">
                {allFeatures.map(feature => (
                    <FeatureButton key={feature.id} feature={feature} onOpen={onOpen} />
                ))}
            </div>
        </div>
    );
};