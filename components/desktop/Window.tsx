
import React, { Suspense, useRef } from 'react';
import type { Feature, CustomFeature } from '../../types.ts';
import { LoadingIndicator } from '../../App.tsx';
import { MinimizeIcon, XMarkIcon, CpuChipIcon } from '../icons.tsx';
import { ALL_FEATURES } from '../features/index.ts';

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


interface WindowState {
  id: string;
  props?: any;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  isMinimized: boolean;
}

interface WindowProps {
  feature: Feature & { props?: any };
  state: WindowState;
  isActive: boolean;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onFocus: (id: string) => void;
  onUpdate: (id: string, updates: Partial<WindowState>) => void;
}

export const Window: React.FC<WindowProps> = ({ feature, state, isActive, onClose, onMinimize, onFocus, onUpdate }) => {
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const initialPos = useRef<{ x: number; y: number } | null>(null);
  
  const FeatureComponent = feature.component;
  const featureIcon = typeof feature.icon === 'string' ? <IconComponent name={feature.icon} /> : feature.icon;

  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    onFocus(feature.id);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    initialPos.current = { x: state.position.x, y: state.position.y };
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
  };

  const handleDragMove = (e: MouseEvent) => {
    if (!dragStartPos.current || !initialPos.current) return;
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;
    onUpdate(feature.id, { position: { x: initialPos.current.x + dx, y: initialPos.current.y + dy }});
  };

  const handleDragEnd = () => {
    dragStartPos.current = null;
    initialPos.current = null;
    window.removeEventListener('mousemove', handleDragMove);
    window.removeEventListener('mouseup', handleDragEnd);
  };
  
  return (
    <div
      className={`absolute bg-surface/70 backdrop-blur-md border rounded-lg shadow-2xl shadow-black/50 flex flex-col transition-all duration-100 ${isActive ? 'border-primary/50' : 'border-slate-700/50'}`}
      style={{
        left: state.position.x,
        top: state.position.y,
        width: state.size.width,
        height: state.size.height,
        zIndex: state.zIndex,
        minWidth: 400,
        minHeight: 300,
      }}
      onMouseDown={() => onFocus(feature.id)}
    >
      <header
        className={`flex items-center justify-between h-8 px-2 border-b ${isActive ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-800/50 border-slate-700'} rounded-t-lg cursor-move`}
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center gap-2 text-xs text-text-primary">
           <div className="w-4 h-4">{featureIcon}</div>
           <span>{feature.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => onMinimize(feature.id)} className="p-1 rounded hover:bg-slate-600"><MinimizeIcon /></button>
          <button onClick={() => onClose(feature.id)} className="p-1 rounded hover:bg-red-500/50"><XMarkIcon className="w-4 h-4"/></button>
        </div>
      </header>
      <main className="flex-1 overflow-auto bg-transparent rounded-b-lg">
        {FeatureComponent ? (
          <Suspense fallback={<LoadingIndicator/>}>
            <FeatureComponent {...state.props} />
          </Suspense>
        ) : (
            <div className="p-4 text-red-400">Error: Component not found for {feature.name}</div>
        )}
      </main>
    </div>
  );
};
