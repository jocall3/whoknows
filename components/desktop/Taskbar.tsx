
import React from 'react';
import type { Feature, ViewType } from '../../types.ts';

interface TaskbarProps {
  minimizedWindows: Feature[];
  onRestore: (id: ViewType) => void;
}

export const Taskbar: React.FC<TaskbarProps> = ({ minimizedWindows, onRestore }) => {
  return (
    <footer className="absolute bottom-0 left-0 right-0 h-12 bg-surface/80 backdrop-blur-md border-t border-border/50 flex items-center px-4 gap-2 z-50">
      {minimizedWindows.map(feature => (
        <button
          key={feature.id}
          onClick={() => onRestore(feature.id)}
          className="h-9 px-3 flex items-center gap-2 rounded-md bg-surface hover:bg-gray-100 dark:hover:bg-slate-700 text-text-primary text-sm shadow-sm border border-border"
          title={`Restore ${feature.name}`}
        >
          <div className="w-5 h-5">{feature.icon}</div>
          <span className="hidden sm:inline">{feature.name}</span>
        </button>
      ))}
    </footer>
  );
};
