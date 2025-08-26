

import React, { Suspense, useCallback, useMemo, useState, useEffect } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { useGlobalState } from './contexts/GlobalStateContext.tsx';
import type { ViewType, AppUser, Feature, CustomFeature } from './types.ts';
import { CommandPalette } from './components/CommandPalette.tsx';
import { NotificationProvider } from './contexts/NotificationContext.tsx';
import { useTheme } from './hooks/useTheme.ts';
import { VaultProvider } from './components/vault/VaultProvider.tsx';
import { initGoogleAuth, getAllCustomFeatures } from './services/index.ts';
import { Window } from './components/desktop/Window.tsx';
import { FeatureDock } from './components/desktop/FeatureDock.tsx';
import { Taskbar } from './components/desktop/Taskbar.tsx';
import { FEATURES_MAP, componentMap } from './components/features/index.ts';
import { LandingPage } from './components/LandingPage.tsx';
import { OnboardingModal } from './components/OnboardingModal.tsx';
import { useLocalStorage } from './hooks/useLocalStorage.ts';


export const LoadingIndicator: React.FC = () => (
    <div className="w-full h-full flex items-center justify-center bg-surface">
        <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0s' }}></div>
            <div className="w-4 h-4 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-4 h-4 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            <span className="text-text-secondary ml-2">Loading Feature...</span>
        </div>
    </div>
);

interface LocalStorageConsentModalProps {
  onAccept: () => void;
  onDecline: () => void;
}

const LocalStorageConsentModal: React.FC<LocalStorageConsentModalProps> = ({ onAccept, onDecline }) => {
  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center fade-in">
      <div 
        className="bg-surface border border-border rounded-2xl shadow-2xl shadow-black/50 w-full max-w-md m-4 p-8 text-center animate-pop-in"
      >
        <h2 className="text-2xl mb-4">Store Data Locally?</h2>
        <p className="text-text-secondary mb-6">
          This application uses your browser's local storage to save your settings and remember your progress between sessions. This data stays on your computer and is not shared.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onDecline}
            className="px-6 py-2 bg-surface border border-border text-text-primary font-bold rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={onAccept}
            className="btn-primary px-6 py-2"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

interface WindowState {
  id: string;
  props?: any;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  isMinimized: boolean;
}

const Z_INDEX_BASE = 10;

const DesktopExperience: React.FC = () => {
    const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
    const [windows, setWindows] = useState<Record<string, WindowState>>({});
    const [activeId, setActiveId] = useState<string | null>(null);
    const [nextZIndex, setNextZIndex] = useState(Z_INDEX_BASE);
    const [customFeatures, setCustomFeatures] = useState<CustomFeature[]>([]);

    const fetchCustomFeatures = useCallback(async () => {
        const features = await getAllCustomFeatures();
        setCustomFeatures(features);
    }, []);
  
    useEffect(() => {
        fetchCustomFeatures();
        // Listen for an event that indicates a feature was saved in the forge
        const handleFeatureUpdated = () => {
          window.dispatchEvent(new CustomEvent('custom-feature-update'));
          fetchCustomFeatures();
        };
        window.addEventListener('custom-feature-update', handleFeatureUpdated);
        return () => window.removeEventListener('custom-feature-update', handleFeatureUpdated);
    }, [fetchCustomFeatures]);
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setCommandPaletteOpen(isOpen => !isOpen);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const openWindow = useCallback((featureId: ViewType, props: any = {}) => {
        const newZIndex = nextZIndex + 1;
        setNextZIndex(newZIndex);
        setActiveId(featureId);
        setCommandPaletteOpen(false);

        setWindows(prev => {
            const existingWindow = prev[featureId];
            if (existingWindow) {
                return {
                    ...prev,
                    [featureId]: {
                        ...existingWindow,
                        props: { ...existingWindow.props, ...props },
                        isMinimized: false,
                        zIndex: newZIndex,
                    }
                };
            }

            const openWindowsCount = Object.values(prev).filter(w => !w.isMinimized).length;
            const newWindow: WindowState = {
                id: featureId,
                props,
                position: { x: 100 + openWindowsCount * 30, y: 100 + openWindowsCount * 30 },
                size: { width: 800, height: 600 },
                zIndex: newZIndex,
                isMinimized: false,
            };
            return { ...prev, [featureId]: newWindow };
        });
    }, [nextZIndex]);
    
    const closeWindow = (id: string) => {
        setWindows(prev => {
            const newState = { ...prev };
            delete newState[id];
            return newState;
        });
    };

    const minimizeWindow = (id: string) => {
        setWindows(prev => ({
            ...prev,
            [id]: { ...prev[id], isMinimized: true }
        }));
        setActiveId(null);
    };

    const focusWindow = (id: string) => {
        if (id === activeId && windows[id]?.zIndex === nextZIndex) {
             setWindows(prev => ({ ...prev, [id]: { ...prev[id], isMinimized: false }}));
             return;
        }
        const newZIndex = nextZIndex + 1;
        setNextZIndex(newZIndex);
        setActiveId(id);
        setWindows(prev => ({
            ...prev,
            [id]: { ...prev[id], zIndex: newZIndex, isMinimized: false }
        }));
    };
    
    const updateWindowState = (id: string, updates: Partial<WindowState>) => {
        setWindows(prev => ({
            ...prev,
            [id]: { ...prev[id], ...updates }
        }));
    };
    
    const openWindows = Object.values(windows).filter(w => !w.isMinimized);
    const minimizedWindows = Object.values(windows).filter(w => w.isMinimized);

    const allFeaturesMap = useMemo(() => {
        const combined = new Map(FEATURES_MAP);
        customFeatures.forEach(cf => {
            combined.set(cf.id, {
                ...cf,
                component: componentMap['custom-feature-runner'],
                category: 'Custom'
            });
        });
        return combined;
    }, [customFeatures]);


    return (
        <div className="h-full w-full relative overflow-hidden bg-cover bg-center" style={{backgroundImage: 'url(https://source.unsplash.com/random/1920x1080?abstract)'}}>
            <ErrorBoundary>
                <FeatureDock onOpen={openWindow} customFeatures={customFeatures} />
                <main className="w-full h-full">
                    {openWindows.map(win => {
                        const feature = allFeaturesMap.get(win.id);
                        if (!feature) return null;
                        
                        const props = feature.id.startsWith('custom-') ? { ...win.props, feature } : win.props;
                        
                        return (
                            <Suspense key={win.id} fallback={<div />}>
                                <Window
                                    feature={feature}
                                    state={{...win, props}}
                                    isActive={win.id === activeId}
                                    onClose={closeWindow}
                                    onMinimize={minimizeWindow}
                                    onFocus={focusWindow}
                                    onUpdate={updateWindowState}
                                />
                            </Suspense>
                        );
                    })}
                </main>
                <Taskbar
                    minimizedWindows={minimizedWindows.map(w => allFeaturesMap.get(w.id)).filter(Boolean) as (Feature | CustomFeature)[]}
                    onRestore={focusWindow}
                />
                <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} onSelect={openWindow} />
            </ErrorBoundary>
        </div>
    );
};


const App: React.FC = () => {
    const [appState, setAppState] = useState<'consent' | 'onboarding' | 'landing' | 'desktop'>('consent');
    const [hasOnboarded, setHasOnboarded] = useLocalStorage('devcore_onboarded', false);
    const { dispatch } = useGlobalState();
    useTheme(); // Initialize theme hook

    useEffect(() => {
      try {
          const consent = localStorage.getItem('devcore_ls_consent');
          if (consent) {
              if (hasOnboarded) {
                setAppState('landing');
              } else {
                setAppState('onboarding');
              }
          } else {
              setAppState('consent');
          }
      } catch (e) {
          console.warn("Could not access localStorage.", e);
          setAppState('landing'); // Proceed without persistence
      }
    }, [hasOnboarded]);

    useEffect(() => {
        const handleUserChanged = (user: AppUser | null) => {
            dispatch({ type: 'SET_APP_USER', payload: user });
        };

        const init = () => {
            if (window.google) {
                initGoogleAuth(handleUserChanged);
            }
        };

        const gsiScript = document.getElementById('gsi-client');
        if (window.google) {
            init();
        } else if (gsiScript) {
            gsiScript.addEventListener('load', init);
            return () => gsiScript.removeEventListener('load', init);
        }
    }, [dispatch]);
    
    const handleConsent = (consent: 'granted' | 'denied') => {
        try {
            localStorage.setItem('devcore_ls_consent', consent);
        } catch(e) {
            console.error("Could not write to localStorage.", e);
        }

        if (hasOnboarded) {
            setAppState('landing');
        } else {
            setAppState('onboarding');
        }
    }
  
    const handleAcknowledgeOnboarding = () => {
        setHasOnboarded(true);
        setAppState('landing');
    };

    const renderOverlay = () => {
        switch (appState) {
            case 'consent':
                return <LocalStorageConsentModal onAccept={() => handleConsent('granted')} onDecline={() => handleConsent('denied')} />;
            case 'onboarding':
                return <OnboardingModal onAcknowledge={handleAcknowledgeOnboarding} />;
            case 'landing':
                return <LandingPage onLaunch={() => setAppState('desktop')} />;
            default:
                return null;
        }
    };

    return (
        <div className="h-screen w-screen font-sans overflow-hidden bg-background">
            <NotificationProvider>
                <VaultProvider>
                    <DesktopExperience />
                    {renderOverlay()}
                </VaultProvider>
            </NotificationProvider>
        </div>
    );
};

export default App;
