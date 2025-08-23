import React from 'react';
import { useGlobalState } from '../contexts/GlobalStateContext.tsx';
import * as vaultService from '../services/vaultService.ts';
import { clearAllFiles } from '../services/dbService.ts';
import { useLocalStorage } from '../hooks/useLocalStorage.ts';
import { ALL_FEATURES } from './features/index.ts';
import { TrashIcon, LockClosedIcon } from './icons.tsx';

const ToggleSwitch: React.FC<{ checked: boolean, onChange: () => void }> = ({ checked, onChange }) => {
    return (
        <button
            role="switch"
            aria-checked={checked}
            onClick={onChange}
            className={`${checked ? 'bg-primary' : 'bg-gray-300'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
        >
            <span className={`${checked ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
        </button>
    );
};

export const SettingsView: React.FC = () => {
    const { state, dispatch } = useGlobalState();
    const [, setSnippets] = useLocalStorage('devcore_snippets', []);
    const [, setNotes] = useLocalStorage('devcore_moodboard', []);
    const [, setDevNotes] = useLocalStorage('devcore_notes', []);

    const handleLockVault = () => {
        vaultService.lockVault();
        dispatch({ type: 'SET_VAULT_STATE', payload: { isUnlocked: false } });
        dispatch({ type: 'LOGOUT_GITHUB' });
        alert("Vault has been locked.");
    };

    const handleResetVault = async () => {
        if (window.confirm("ARE YOU SURE? This will permanently delete your encrypted credentials and master password. This action cannot be undone.")) {
            await vaultService.resetVault();
            dispatch({ type: 'SET_VAULT_STATE', payload: { isInitialized: false, isUnlocked: false } });
            dispatch({ type: 'LOGOUT_GITHUB' });
            alert("Vault has been reset.");
        }
    };

    const handleClearGeneratedFiles = async () => {
        if (window.confirm("Are you sure you want to delete all AI-generated files? This cannot be undone.")) {
            await clearAllFiles();
            alert("Generated files cleared.");
        }
    };
    
    const handleClearSnippets = () => {
        if (window.confirm("Are you sure you want to delete all saved snippets? This cannot be undone.")) {
            setSnippets([]);
            alert("Snippets cleared.");
        }
    };

    const handleClearNotes = () => {
        if (window.confirm("Are you sure you want to delete all notes and moodboard items? This cannot be undone.")) {
            setNotes([]);
            setDevNotes([]);
            alert("Notes & Moodboard cleared.");
        }
    };

    return (
        <div className="w-full text-text-primary">
            <header className="sticky top-0 z-10 p-4 sm:p-6 lg:p-8 border-b border-border bg-surface/80 backdrop-blur-sm">
                <div className="max-w-4xl mx-auto w-full">
                    <h1 className="text-4xl font-extrabold tracking-tight">Settings</h1>
                    <p className="mt-2 text-lg text-text-secondary">Manage application preferences and data.</p>
                </div>
            </header>

            <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-4xl mx-auto w-full">
                {/* Security Section */}
                {state.vaultState.isInitialized && (
                    <section>
                        <h2 className="text-2xl font-bold border-b border-border pb-2 mb-4">Security</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-surface border border-border rounded-lg">
                                <div>
                                    <p className="font-medium">Lock Vault</p>
                                    <p className="text-sm text-text-secondary">Ends the current session and requires the Master Password on next use.</p>
                                </div>
                                <button onClick={handleLockVault} className="flex items-center gap-2 px-4 py-2 rounded-md bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 transition-colors">
                                    <LockClosedIcon /> Lock Now
                                </button>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-surface border border-red-500/20 rounded-lg">
                                <div>
                                    <p className="font-medium text-red-700">Reset Vault</p>
                                    <p className="text-sm text-text-secondary">Permanently deletes all encrypted credentials and your Master Password setup.</p>
                                </div>
                                <button onClick={handleResetVault} className="flex items-center gap-2 px-4 py-2 rounded-md bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors">
                                    <TrashIcon /> Reset Vault
                                </button>
                            </div>
                        </div>
                    </section>
                )}
                
                 {/* Feature Visibility Section */}
                <section>
                    <h2 className="text-2xl font-bold border-b border-border pb-2 mb-4">Feature Visibility</h2>
                     <p className="text-sm text-text-secondary mb-4">
                        Hide or show features in the main sidebar. This does not disable them; they can still be accessed via the AI Command Center.
                    </p>
                    <div className="space-y-2">
                        {ALL_FEATURES.filter(f => !['ai-command-center', 'connections', 'project-explorer'].includes(f.id)).map(feature => {
                            const isVisible = !state.hiddenFeatures.includes(feature.id);
                            return (
                                <div key={feature.id} className="flex items-center justify-between p-4 bg-surface border border-border rounded-lg">
                                    <div>
                                        <p className="font-medium">{feature.name}</p>
                                        <p className="text-sm text-text-secondary">{feature.description}</p>
                                    </div>
                                    <ToggleSwitch 
                                        checked={isVisible}
                                        onChange={() => dispatch({ type: 'TOGGLE_FEATURE_VISIBILITY', payload: { featureId: feature.id } })}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </section>
                
                {/* Data Management Section */}
                <section>
                    <h2 className="text-2xl font-bold border-b border-border pb-2 mb-4">Data Management</h2>
                    <div className="space-y-4">
                         <div className="flex items-center justify-between p-4 bg-surface border border-border rounded-lg">
                             <div>
                                <p className="font-medium">Clear Generated Files</p>
                                <p className="text-sm text-text-secondary">Removes all files created by the AI Feature Builder.</p>
                             </div>
                             <button onClick={handleClearGeneratedFiles} className="flex items-center gap-2 px-4 py-2 rounded-md bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors">
                                <TrashIcon /> Clear
                             </button>
                         </div>
                         <div className="flex items-center justify-between p-4 bg-surface border border-border rounded-lg">
                             <div>
                                <p className="font-medium">Clear Snippet Vault</p>
                                <p className="text-sm text-text-secondary">Removes all saved code snippets.</p>
                             </div>
                             <button onClick={handleClearSnippets} className="flex items-center gap-2 px-4 py-2 rounded-md bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors">
                                <TrashIcon /> Clear
                             </button>
                         </div>
                         <div className="flex items-center justify-between p-4 bg-surface border border-border rounded-lg">
                             <div>
                                <p className="font-medium">Clear Notes & Moodboard</p>
                                <p className="text-sm text-text-secondary">Removes all items from Dev Notes and Moodboard.</p>
                             </div>
                             <button onClick={handleClearNotes} className="flex items-center gap-2 px-4 py-2 rounded-md bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors">
                                <TrashIcon /> Clear
                             </button>
                         </div>
                    </div>
                </section>
            </div>
        </div>
    );
};
