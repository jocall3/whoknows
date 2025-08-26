

import React from 'react';
import type { Feature, ViewType, CustomFeature } from '../../types.ts';
import { ALL_FEATURES } from '../features/index.ts';
import { CpuChipIcon } from '../icons.tsx';

// Helper to resolve string icon names for custom features
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

interface TaskbarProps {
  minimizedWindows: (Feature | CustomFeature)[];
  onRestore: (id: ViewType) => void;
}

export const Taskbar: React.FC<TaskbarProps> = ({ minimizedWindows, onRestore }) => {
  return (
    <footer className="absolute bottom-0 left-0 right-0 h-12 bg-surface/80 backdrop-blur-md border-t border-border/50 flex items-center px-4 gap-2 z-50">
      {minimizedWindows.map(feature => {
        const featureIcon = typeof feature.icon === 'string' ? <IconComponent name={feature.icon} /> : feature.icon;
        return (
            <button
            key={feature.id}
            onClick={() => onRestore(feature.id)}
            className="h-9 px-3 flex items-center gap-2 rounded-md bg-surface hover:bg-gray-100 dark:hover:bg-slate-700 text-text-primary text-sm shadow-sm border border-border"
            title={`Restore ${feature.name}`}
            >
            <div className="w-5 h-5">{featureIcon}</div>
            <span className="hidden sm:inline">{feature.name}</span>
            </button>
        )
      })}
    </footer>
  );
};
