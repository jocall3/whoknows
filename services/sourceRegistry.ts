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
    "axe-core": "https://esm.sh/axe-core@4.9.1",
    "mermaid": "https://esm.sh/mermaid@10.9.1",
    "@tailwindcss/typography": "https://esm.sh/@tailwindcss/typography@^0.5.16",
    "path": "https://esm.sh/path@^0.12.7",
    "url": "https://esm.sh/url@^0.11.4"
  }
}
</script>
    <script src="https://apis.google.com/js/api.js"></script>
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
    <script id="gsi-client" src="https://accounts.google.com/gsi/client" async defer></script>
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
import { logEvent } from './services/telemetryService.ts';
import { ALL_FEATURES, FEATURES_MAP } from './components/features/index.ts';
import type { ViewType, SidebarItem, AppUser } from './types.ts';
import { ActionManager } from './components/ActionManager.tsx';
import { LeftSidebar } from './components/LeftSidebar.tsx';
import { StatusBar } from './components/StatusBar.tsx';
import { CommandPalette } from './components/CommandPalette.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import { Cog6ToothIcon, HomeIcon, FolderIcon, RectangleGroupIcon } from './components/icons.tsx';
import { AiCommandCenter } from './components/features/AiCommandCenter.tsx';
import { NotificationProvider } from './contexts/NotificationContext.tsx';
import { useTheme } from './hooks/useTheme.ts';
import { VaultProvider } from './components/vault/VaultProvider.tsx';
import { initGoogleAuth } from './services/googleAuthService.ts';


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

const AppContent: React.FC = () => {
    const { state, dispatch } = useGlobalState();
    const { activeView, viewProps, hiddenFeatures } = state;
    const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  
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
  
    const handleViewChange = useCallback((view: ViewType, props: any = {}) => {
      dispatch({ type: 'SET_VIEW', payload: { view, props } });
      logEvent('view_changed', { view });
      setCommandPaletteOpen(false);
    }, [dispatch]);
  
    const sidebarItems: SidebarItem[] = useMemo(() => {
        const coreFeatures = ['ai-command-center', 'project-explorer', 'workspace-connector-hub'];
        return [
            { id: 'ai-command-center', label: 'Command Center', icon: <HomeIcon />, view: 'ai-command-center' },
            { id: 'project-explorer', label: 'Project Explorer', icon: <FolderIcon />, view: 'project-explorer' },
            { id: 'workspace-connector-hub', label: 'Workspace Hub', icon: <RectangleGroupIcon />, view: 'workspace-connector-hub' },
            ...ALL_FEATURES
                .filter(feature => !hiddenFeatures.includes(feature.id) && !coreFeatures.includes(feature.id))
                .map(feature => ({
                    id: feature.id,
                    label: feature.name,
                    icon: feature.icon,
                    view: feature.id as ViewType,
                })),
            { id: 'settings', label: 'Settings', icon: <Cog6ToothIcon />, view: 'settings' },
        ];
    }, [hiddenFeatures]);
  
    const ActiveComponent = useMemo(() => {
        if (activeView === 'settings') return SettingsView;
        return FEATURES_MAP.get(activeView as string)?.component ?? AiCommandCenter;
    }, [activeView]);
    
    return (
        <div className="relative flex h-full w-full">
            <LeftSidebar items={sidebarItems} activeView={state.activeView} onNavigate={handleViewChange} />
            <div className="flex-1 flex min-w-0">
                <div className="flex-1 flex flex-col min-w-0">
                    <main className="relative flex-1 min-w-0 bg-surface/50 dark:bg-slate-900/50 overflow-y-auto">
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
    )
}


const App: React.FC = () => {
    const [showConsentModal, setShowConsentModal] = useState(false);
    const { dispatch } = useGlobalState();
    useTheme(); // Initialize theme hook

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

    return (
        <div className="h-screen w-screen font-sans overflow-hidden bg-background">
            <NotificationProvider>
                <VaultProvider>
                    {showConsentModal && <LocalStorageConsentModal onAccept={handleAcceptConsent} onDecline={handleDeclineConsent} />}
                    <AppContent />
                </VaultProvider>
            </NotificationProvider>
        </div>
    );
};

export default App;
`,
  // Add all other application files here...
  'index.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-primary: #0047AB; /* Cobalt Blue */
  --color-primary-rgb: 0, 71, 171;
  --color-background: #F5F7FA; /* Light silver-blue */
  --color-surface: #FFFFFF;
  --color-text-primary: #111827; /* Gray 900 */
  --color-text-secondary: #6B7280; /* Gray 500 */
  --color-text-on-primary: #FFFFFF;
  --color-border: #E5E7EB; /* Gray 200 */
}

.dark {
  --color-primary: #38bdf8; /* sky-400 */
  --color-primary-rgb: 56, 189, 248;
  --color-background: #0f172a; /* slate-900 */
  --color-surface: #1e293b; /* slate-800 */
  --color-text-primary: #f8fafc; /* slate-50 */
  --color-text-secondary: #94a3b8; /* slate-400 */
  --color-text-on-primary: #0f172a; /* slate-900 */
  --color-border: #334155; /* slate-700 */
}

/* Custom global styles */
body {
  @apply bg-background text-text-primary transition-colors duration-300;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

html.dark body {
    background-image: none;
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
  @apply bg-gray-100 dark:bg-slate-800;
}
::-webkit-scrollbar-thumb {
  @apply bg-gray-400 dark:bg-slate-600 rounded;
}
::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-500 dark:bg-slate-500;
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
  'tailwind.config.js': `import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./App.tsx",
    "./index.tsx",
    "./constants.ts",
    "./types.ts",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./contexts/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['"EB Garamond"', 'serif'],
        calligraphy: ['"Great Vibes"', 'cursive'],
      },
      colors: {
        'primary': 'var(--color-primary)',
        'background': 'var(--color-background)',
        'surface': 'var(--color-surface)',
        'text': {
          'primary': 'var(--color-text-primary)',
          'secondary': 'var(--color-text-secondary)',
          'on-primary': 'var(--color-text-on-primary)',
        },
        'border': 'var(--color-border)',
        'gold': '#B8860B', // DarkGoldenRod - better for watermark
      },
       boxShadow: {
        'focus-primary': '0 0 0 3px rgba(var(--color-primary-rgb), 0.4)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      },
    },
  },
  plugins: [
     typography,
  ],
}`,
  'vite.config.ts': `

import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');

    return {
      optimizeDeps: {
        exclude: [
          'axe-core'
        ]
      },
      define: {
        // The API key is injected into the app during the build process.
        // It's crucial that this variable is set in your deployment environment.
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GOOGLE_CLIENT_ID': JSON.stringify(env.GOOGLE_CLIENT_ID),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      server: {
        // Disable CORS to mitigate vulnerability where malicious sites can request source files.
        cors: false,
      },
      build: {
        outDir: 'web', // Emit assets to a 'web' directory.
        sourcemap: true, // Enable source maps for easier debugging in production.
        rollupOptions: {
          output: {
            // Improve caching by splitting vendor code into separate chunks.
            manualChunks(id) {
              if (id.includes('node_modules')) {
                return id.toString().split('node_modules/')[1].split('/')[0].toString();
              }
            }
          }
        }
      }
    };
});`,
'components/features/ProjectExplorer.tsx': `import React, { useState, useEffect, useCallback } from 'react';
import { useGlobalState } from '../../contexts/GlobalStateContext.tsx';
import { useNotification } from '../../contexts/NotificationContext.tsx';
import { initializeOctokit } from '../../services/authService.ts';
import { getDecryptedCredential } from '../../services/vaultService.ts';
import { getRepos, getRepoTree, getFileContent, commitFiles } from '../../services/githubService.ts';
import { generateCommitMessageStream } from '../../services/index.ts';
import type { Repo, FileNode } from '../../types.ts';
import { FolderIcon, DocumentIcon } from '../icons.tsx';
import { LoadingSpinner } from '../shared/index.tsx';
import * as Diff from 'diff';

const FileTree: React.FC<{ node: FileNode, onFileSelect: (path: string, name: string) => void, activePath: string | null }> = ({ node, onFileSelect, activePath }) => {
    const [isOpen, setIsOpen] = useState(true);

    if (node.type === 'file') {
        const isActive = activePath === node.path;
        return (
            <div
                className={\`flex items-center space-x-2 pl-4 py-1 cursor-pointer rounded \${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-slate-700'}\`}
                onClick={() => onFileSelect(node.path, node.name)}
            >
                <DocumentIcon />
                <span>{node.name}</span>
            </div>
        );
    }

    return (
        <div>
            <div
                className="flex items-center space-x-2 py-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 rounded"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className={\`transform transition-transform \${isOpen ? 'rotate-90' : ''}\`}>▶</div>
                <FolderIcon />
                <span className="font-semibold">{node.name}</span>
            </div>
            {isOpen && node.children && (
                <div className="pl-4 border-l border-border ml-3">
                    {node.children.map(child => <FileTree key={child.path} node={child} onFileSelect={onFileSelect} activePath={activePath} />)}
                </div>
            )}
        </div>
    );
};

export const ProjectExplorer: React.FC = () => {
    const { state, dispatch } = useGlobalState();
    const { user, githubUser, selectedRepo, projectFiles } = state;
    const { addNotification } = useNotification();
    const [repos, setRepos] = useState<Repo[]>([]);
    const [isLoading, setIsLoading] = useState<'repos' | 'tree' | 'file' | 'commit' | null>(null);
    const [error, setError] = useState('');
    const [activeFile, setActiveFile] = useState<{ path: string; name: string; originalContent: string; editedContent: string} | null>(null);
    
    const getApiClient = useCallback(async () => {
        if (!user) {
            throw new Error("You must be logged in to use the Project Explorer.");
        }
        // NOTE: This assumes the vault is unlocked. A more robust implementation
        // might use the useVaultModal hook to prompt for unlock if needed.
        const token = await getDecryptedCredential('github_pat');
        if (!token) {
            throw new Error("GitHub token not found. Please add it on the Connections page.");
        }
        return initializeOctokit(token);
    }, [user]);


    useEffect(() => {
        const loadRepos = async () => {
            if (user && githubUser) {
                setIsLoading('repos');
                setError('');
                try {
                    const octokit = await getApiClient();
                    const userRepos = await getRepos(octokit);
                    setRepos(userRepos);
                } catch (err) {
                    setError(err instanceof Error ? err.message : 'Failed to load repositories');
                } finally {
                    setIsLoading(null);
                }
            } else {
                setRepos([]);
            }
        };
        loadRepos();
    }, [user, githubUser, getApiClient]);

    useEffect(() => {
        const loadTree = async () => {
             if (selectedRepo && user && githubUser) {
                setIsLoading('tree');
                setError('');
                setActiveFile(null);
                try {
                    const octokit = await getApiClient();
                    const tree = await getRepoTree(octokit, selectedRepo.owner, selectedRepo.repo);
                    dispatch({ type: 'LOAD_PROJECT_FILES', payload: tree });
                } catch (err) {
                     setError(err instanceof Error ? err.message : 'Failed to load repository tree');
                } finally {
                    setIsLoading(null);
                }
            }
        };
        loadTree();
    }, [selectedRepo, user, githubUser, dispatch, getApiClient]);

    const handleFileSelect = async (path: string, name: string) => {
        if (!selectedRepo) return;
        setIsLoading('file');
        try {
            const octokit = await getApiClient();
            const content = await getFileContent(octokit, selectedRepo.owner, selectedRepo.repo, path);
            setActiveFile({ path, name, originalContent: content, editedContent: content });
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsLoading(null);
        }
    };

    const handleCommit = async () => {
        if (!activeFile || !selectedRepo || activeFile.originalContent === activeFile.editedContent) return;

        setIsLoading('commit');
        setError('');
        try {
            const diff = Diff.createPatch(activeFile.path, activeFile.originalContent, activeFile.editedContent);
            
            const stream = generateCommitMessageStream(diff);
            let commitMessage = '';
            for await (const chunk of stream) { commitMessage += chunk; }
            
            const finalMessage = window.prompt("Confirm or edit commit message:", commitMessage);
            if (!finalMessage) {
                setIsLoading(null);
                return;
            }

            const octokit = await getApiClient();
            await commitFiles(
                octokit,
                selectedRepo.owner,
                selectedRepo.repo,
                [{ path: activeFile.path, content: activeFile.editedContent }],
                finalMessage
            );
            
            addNotification(\`Successfully committed to \${selectedRepo.repo}\`, 'success');
            setActiveFile(prev => prev ? { ...prev, originalContent: prev.editedContent } : null);

        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to commit changes';
            setError(message);
            addNotification(message, 'error');
        } finally {
            setIsLoading(null);
        }
    };
    
    if (!user) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center text-text-secondary p-4">
                <FolderIcon />
                <h2 className="text-lg font-semibold mt-2">Please Sign In</h2>
                <p>Sign in via the "Connections" tab to explore your repositories.</p>
            </div>
        );
    }
    
    if (!githubUser) {
         return (
            <div className="h-full flex flex-col items-center justify-center text-center text-text-secondary p-4">
                <FolderIcon />
                <h2 className="text-lg font-semibold mt-2">Connect to GitHub</h2>
                <p>Please go to the "Connections" tab and provide a Personal Access Token to explore your repositories.</p>
            </div>
        );
    }

    const hasChanges = activeFile ? activeFile.originalContent !== activeFile.editedContent : false;

    return (
        <div className="h-full flex flex-col text-text-primary">
            <header className="p-4 border-b border-border flex-shrink-0">
                <h1 className="text-xl font-bold flex items-center"><FolderIcon /><span className="ml-3">Project Explorer</span></h1>
                <div className="mt-2">
                    <select
                        value={selectedRepo ? \`\${selectedRepo.owner}/\${selectedRepo.repo}\` : ''}
                        onChange={e => {
                            const [owner, repo] = e.target.value.split('/');
                            dispatch({ type: 'SET_SELECTED_REPO', payload: { owner, repo } });
                        }}
                        className="w-full p-2 bg-surface border border-border rounded-md text-sm"
                    >
                        <option value="" disabled>{isLoading === 'repos' ? 'Loading...' : 'Select a repository'}</option>
                        {repos.map(r => <option key={r.id} value={r.full_name}>{r.full_name}</option>)}
                    </select>
                </div>
                {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
            </header>
            <div className="flex-grow flex min-h-0">
                <aside className="w-1/3 bg-background border-r border-border p-4 overflow-y-auto">
                    {isLoading === 'tree' && <div className="flex justify-center"><LoadingSpinner /></div>}
                    {projectFiles && <FileTree node={projectFiles} onFileSelect={handleFileSelect} activePath={activeFile?.path ?? null} />}
                </aside>
                <main className="flex-1 bg-surface flex flex-col">
                     <div className="flex justify-between items-center p-2 border-b border-border bg-gray-50 dark:bg-slate-800">
                        <span className="text-sm font-semibold">{activeFile?.name || 'No file selected'}</span>
                        <button onClick={handleCommit} disabled={!hasChanges || isLoading === 'commit'} className="btn-primary px-4 py-1 text-sm flex items-center justify-center min-w-[100px]">
                           {isLoading === 'commit' ? <LoadingSpinner/> : 'Commit'}
                        </button>
                     </div>
                     {isLoading === 'file' ? <div className="flex items-center justify-center h-full"><LoadingSpinner /></div> :
                        <textarea 
                            value={activeFile?.editedContent ?? 'Select a file to view its content.'}
                            onChange={e => setActiveFile(prev => prev ? { ...prev, editedContent: e.target.value } : null)}
                            disabled={!activeFile}
                            className="w-full h-full p-4 text-sm font-mono bg-transparent resize-none focus:outline-none"
                        />
                    }
                </main>
            </div>
        </div>
    );
};`,
};