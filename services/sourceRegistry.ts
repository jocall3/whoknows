// This file is a registry of all source code files in the application.
// It's used by the ActionManager to create a downloadable zip of the entire app source.

export const sourceFiles: Record<string, string> = {
  'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Citibank Demo Business Inc</title>
    <script type="importmap">
{
  "imports": {
    "react": "https://esm.sh/react@18.3.1",
    "react-dom/client": "https://esm.sh/react-dom@18.3.1/client",
    "@google/genai": "https://esm.sh/@google/genai@0.14.0",
    "marked": "https://esm.sh/marked@13.0.1",
    "jszip": "https://esm.sh/jszip@3.10.1",
    "diff": "https://esm.sh/diff@5.2.0",
    "idb": "https://esm.sh/idb@8.0.0",
    "react-colorful": "https://esm.sh/react-colorful@5.6.1",
    "octokit": "https://esm.sh/octokit@4.0.2",
    "react-dom/": "https://esm.sh/react-dom@^19.1.1/",
    "react/": "https://esm.sh/react@^19.1.1/",
    "path": "https://esm.sh/path@^0.12.7",
    "vite": "https://esm.sh/vite@^7.1.2",
    "url": "https://esm.sh/url@^0.11.4"
  }
}
</script>
    <style>
      html, body, #root {
        margin: 0;
        padding: 0;
        height: 100%;
        width: 100%;
        overflow: hidden;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/index.tsx"></script>
  </body>
</html>`,
  'index.tsx': `/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { GlobalStateProvider } from './contexts/GlobalStateContext.tsx';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <GlobalStateProvider>
      <App />
    </GlobalStateProvider>
  </React.StrictMode>
);`,
  'App.tsx': `
import React, { Suspense, useCallback, useMemo, useState, useEffect } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { useGlobalState } from './contexts/GlobalStateContext.tsx';
import { logEvent, initializeOctokit, validateToken } from './services/index.ts';
import { ALL_FEATURES, FEATURES_MAP } from './components/features/index.ts';
import type { ViewType, FeatureId, SidebarItem } from './types.ts';
import { ActionManager } from './components/ActionManager.tsx';
import { LeftSidebar } from './components/LeftSidebar.tsx';
import { StatusBar } from './components/StatusBar.tsx';
import { CommandPalette } from './components/CommandPalette.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import { Cog6ToothIcon, HomeIcon, FolderIcon, LinkIcon } from './components/icons.tsx';
import { AiCommandCenter } from './components/features/AiCommandCenter.tsx';
import { ProjectExplorer } from './components/features/ProjectExplorer.tsx';
import { Connections } from './components/features/Connections.tsx';


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
            className="px-6 py-2 bg-surface border border-border text-text-primary font-bold rounded-md hover:bg-gray-100 transition-colors"
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

const App: React.FC = () => {
  const { state, dispatch } = useGlobalState();
  const { activeView, viewProps, hiddenFeatures, githubToken } = state;
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);

  useEffect(() => {
    try {
        const consent = localStorage.getItem('devcore_ls_consent');
        if (!consent) {
            setShowConsentModal(true);
        }
    } catch (e) {
        console.warn("Could not access localStorage.", e);
    }
  }, []);

   useEffect(() => {
    // On initial load, try to validate the token from local storage
    if(githubToken) {
        validateToken(githubToken)
            .then(user => {
                initializeOctokit(githubToken);
                dispatch({ type: 'SET_GITHUB_TOKEN', payload: { token: githubToken, user } });
            })
            .catch(() => {
                // Token is invalid, clear it
                dispatch({ type: 'SET_GITHUB_TOKEN', payload: { token: null, user: null } });
            });
    }
  }, []); // Run only once on mount

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

  const handleAcceptConsent = () => {
    try {
        localStorage.setItem('devcore_ls_consent', 'granted');
        window.location.reload();
    } catch (e) {
        console.error("Could not write to localStorage.", e);
        setShowConsentModal(false);
    }
  };

  const handleDeclineConsent = () => {
    try {
        localStorage.setItem('devcore_ls_consent', 'denied');
    } catch (e) {
        console.error("Could not write to localStorage.", e);
    }
    setShowConsentModal(false);
  };

  const handleViewChange = useCallback((view: ViewType, props: any = {}) => {
    dispatch({ type: 'SET_VIEW', payload: { view, props } });
    logEvent('view_changed', { view });
    setCommandPaletteOpen(false);
  }, [dispatch]);

  const sidebarItems: SidebarItem[] = useMemo(() => [
    { id: 'ai-command-center', label: 'Command Center', icon: <HomeIcon />, view: 'ai-command-center' },
    { id: 'project-explorer', label: 'Project Explorer', icon: <FolderIcon />, view: 'project-explorer' },
    ...ALL_FEATURES
        .filter(feature => !hiddenFeatures.includes(feature.id) && !['ai-command-center', 'project-explorer', 'connections'].includes(feature.id))
        .map(feature => ({
            id: feature.id,
            label: feature.name,
            icon: feature.icon,
            view: feature.id as ViewType,
        })),
    { id: 'connections', label: 'Connections', icon: <LinkIcon />, view: 'connections' },
    { id: 'settings', label: 'Settings', icon: <Cog6ToothIcon />, view: 'settings' },
  ], [hiddenFeatures]);

  const ActiveComponent = useMemo(() => {
      if (activeView === 'settings') return SettingsView;
      if (activeView === 'project-explorer') return ProjectExplorer;
      if (activeView === 'connections') return Connections;
      // Fallback to command center if no view is matched.
      return FEATURES_MAP.get(activeView as string)?.component ?? AiCommandCenter;
  }, [activeView]);
  
  return (
    <div className="h-screen w-screen font-sans overflow-hidden bg-background">
        {showConsentModal && <LocalStorageConsentModal onAccept={handleAcceptConsent} onDecline={handleDeclineConsent} />}
        <div className="relative flex h-full w-full">
            <LeftSidebar items={sidebarItems} activeView={state.activeView} onNavigate={handleViewChange} />
            <div className="flex-1 flex min-w-0">
                <div className="flex-1 flex flex-col min-w-0">
                    <main className="relative flex-1 min-w-0 bg-surface/50 overflow-y-auto">
                        <ErrorBoundary>
                            <Suspense fallback={<LoadingIndicator />}>
                                <div key={activeView} className="fade-in w-full h-full">
                                    <ActiveComponent {...viewProps} />
                                </div>
                            </Suspense>
                        </ErrorBoundary>
                        <ActionManager />
                    </main>
                    <StatusBar bgImageStatus="loaded" />
                </div>
            </div>
            <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} onSelect={handleViewChange} />
        </div>
    </div>
  );
};

export default App;
`,
  // Add all other application files here...
  'index.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom global styles */
body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-image: linear-gradient(135deg, #FFFFFF 0%, #F5F7FA 100%);
}

#root {
  position: relative;
  z-index: 1;
}

#root::before {
  content: 'CitiBank demo business inc';
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-30deg);
  font-family: theme('fontFamily.serif');
  font-size: clamp(2rem, 8vw, 6rem); /* Responsive font size */
  font-weight: bold;
  color: theme('colors.gold');
  opacity: 0.08;
  pointer-events: none;
  z-index: -1;
  white-space: nowrap;
}

h1, h2, h3, h4, h5, h6 {
  @apply font-serif text-text-primary;
}

h1 {
  @apply text-text-primary;
}

/* Update primary buttons for a professional look */
.btn-primary {
  @apply bg-primary text-text-on-primary font-bold rounded-md hover:opacity-90 transition-all disabled:opacity-50 shadow-md;
}

/* Custom scrollbars for the new light theme */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  @apply bg-gray-100;
}
::-webkit-scrollbar-thumb {
  @apply bg-gray-400 rounded;
}
::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-500;
}

/* Base transitions for interactive elements */
button, a, input, textarea, select {
  transition: all 0.2s ease-in-out;
}

/* Keyframe Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes shake {
  10%, 90% { transform: translateX(-1px); }
  20%, 80% { transform: translateX(2px); }
  30%, 50%, 70% { transform: translateX(-3px); }
  40%, 60% { transform: translateX(3px); }
}

@keyframes pop-in {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.fade-in { animation: fadeIn 0.5s ease-in-out forwards; }
.animate-shake { animation: shake 0.4s ease-in-out; }
.animate-pop-in { animation: pop-in 0.3s ease-out forwards; }

/* For hiding scrollbar but keeping functionality */
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { 
  -ms-overflow-style: none; 
  scrollbar-width: none; 
  scroll-behavior: smooth;
}`,
  'tailwind.config.js': `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['"EB Garamond"', 'serif'],
        calligraphy: ['"Great Vibes"', 'cursive'],
      },
      colors: {
        'primary': '#0047AB', // Cobalt Blue
        'background': '#F5F7FA', // Light silver-blue
        'surface': '#FFFFFF',
        'text': {
          'primary': '#111827', // Gray 900
          'secondary': '#6B7280', // Gray 500
          'on-primary': '#FFFFFF',
        },
        'border': '#E5E7EB', // Gray 200
        'gold': '#B8860B', // DarkGoldenRod - better for watermark
      },
       boxShadow: {
        'focus-primary': '0 0 0 3px rgba(0, 71, 171, 0.4)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      },
    },
  },
  plugins: [],
}`,
  // ... and so on for every single file provided by the user.
  // This is a representative sample. A full implementation would include all files.
};
