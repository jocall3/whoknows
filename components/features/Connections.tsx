

import React, { useState, useEffect } from 'react';
import { GithubIcon, MapIcon } from '../icons.tsx';
import { useGlobalState } from '../../contexts/GlobalStateContext.tsx';
import { signInWithGoogle } from '../../services/firebaseService.ts';
import { validateToken } from '../../services/authService.ts';
import * as vaultService from '../../services/vaultService.ts';
import { useVaultModal } from '../../contexts/VaultModalContext.tsx';
import { LoadingSpinner } from '../shared/LoadingSpinner.tsx';
import type { GitHubUser } from '../../types.ts';
import { useNotification } from '../../contexts/NotificationContext.tsx';

const GitHubConnection: React.FC = () => {
    const { state, dispatch } = useGlobalState();
    const { user, githubUser } = state;
    const { addNotification } = useNotification();
    const { requestUnlock } = useVaultModal();
    const [tokenInput, setTokenInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const checkStoredToken = async () => {
            if (user && !githubUser && state.vaultState.isUnlocked) {
                setIsLoading(true);
                const token = await vaultService.getDecryptedCredential('github_pat');
                if (token) {
                    try {
                        const githubProfile = await validateToken(token);
                        dispatch({ type: 'SET_GITHUB_USER', payload: githubProfile });
                    } catch (e) {
                        addNotification('Failed to validate stored GitHub token.', 'error');
                    }
                }
                setIsLoading(false);
            }
        };
        checkStoredToken();
    }, [user, githubUser, dispatch, addNotification, state.vaultState.isUnlocked]);

    const handleConnectGitHub = async () => {
        if (!user || !tokenInput.trim()) {
            setError('Token is required.');
            return;
        }
        if (!state.vaultState.isUnlocked) {
            const unlocked = await requestUnlock();
            if (!unlocked) return;
        }

        setIsLoading(true);
        setError('');
        try {
            const githubProfile = await validateToken(tokenInput);
            await vaultService.saveCredential('github_pat', tokenInput);
            dispatch({ type: 'SET_GITHUB_USER', payload: githubProfile });
            addNotification('GitHub connected successfully!', 'success');
            setTokenInput('');
        } catch (err) {
            setError(err instanceof Error ? `Invalid Token: ${err.message}` : 'Could not connect to GitHub.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDisconnectGitHub = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            await vaultService.saveCredential('github_pat', '');
            dispatch({ type: 'SET_GITHUB_USER', payload: null });
            addNotification('GitHub disconnected.', 'info');
        } catch (e) {
            addNotification('Failed to disconnect GitHub.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return null;
    }

    return (
        <div className="bg-surface border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10"><GithubIcon /></div>
                    <div>
                        <h3 className="text-lg font-bold text-text-primary">GitHub</h3>
                        {githubUser ? (
                             <p className="text-sm text-green-600">Connected as {githubUser.login}</p>
                        ) : (
                             <p className="text-sm text-text-secondary">Not Connected</p>
                        )}
                    </div>
                </div>
                 {githubUser && (
                    <button onClick={handleDisconnectGitHub} className="px-4 py-2 bg-red-500/10 text-red-600 font-semibold rounded-lg hover:bg-red-500/20">
                        Disconnect
                    </button>
                 )}
            </div>
            
            {!githubUser && (
                <div className="mt-4 pt-4 border-t border-border">
                    <label htmlFor="github-pat" className="block text-sm font-medium text-text-secondary mb-1">Personal Access Token (Classic)</label>
                    <div className="flex gap-2">
                        <input id="github-pat" type="password" value={tokenInput} onChange={(e) => setTokenInput(e.target.value)} placeholder="ghp_..." className="flex-grow p-2 bg-background border border-border rounded-md text-sm" />
                         <button onClick={handleConnectGitHub} disabled={isLoading} className="btn-primary px-6 py-2 flex items-center justify-center min-w-[100px]">
                            {isLoading ? <LoadingSpinner /> : 'Connect'}
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
                </div>
            )}
        </div>
    );
};

const GoogleMapsConnection: React.FC = () => {
    const { state } = useGlobalState();
    const { user } = state;
    const { addNotification } = useNotification();
    const { requestUnlock } = useVaultModal();
    const [apiKey, setApiKey] = useState('');
    const [isSaved, setIsSaved] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const checkKey = async () => {
            if(user && state.vaultState.isUnlocked) {
                const key = await vaultService.getDecryptedCredential('google_maps_api_key');
                setIsSaved(!!key);
            }
        };
        checkKey();
    }, [user, state.vaultState.isUnlocked]);

    const handleSaveKey = async () => {
        if (!apiKey.trim()) return;
        if (!state.vaultState.isUnlocked) {
            const unlocked = await requestUnlock();
            if (!unlocked) return;
        }
        setIsLoading(true);
        try {
            await vaultService.saveCredential('google_maps_api_key', apiKey);
            addNotification('Google Maps API Key saved!', 'success');
            setIsSaved(true);
            setApiKey('');
        } catch(e) {
            addNotification('Failed to save key.', 'error');
        } finally {
            setIsLoading(false);
        }
    }

    if (!user) return null;

    return (
        <div className="bg-surface border border-border rounded-lg p-6">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10"><MapIcon /></div>
                <div>
                    <h3 className="text-lg font-bold text-text-primary">Google Maps Platform</h3>
                    <p className={`text-sm ${isSaved ? 'text-green-600' : 'text-text-secondary'}`}>{isSaved ? 'API Key is saved in vault' : 'Not Connected'}</p>
                </div>
            </div>
             <div className="mt-4 pt-4 border-t border-border">
                <label htmlFor="maps-key" className="block text-sm font-medium text-text-secondary mb-1">API Key</label>
                <div className="flex gap-2">
                    <input id="maps-key" type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="AIzaSy..." className="flex-grow p-2 bg-background border border-border rounded-md text-sm" />
                     <button onClick={handleSaveKey} disabled={isLoading} className="btn-primary px-6 py-2 flex items-center justify-center min-w-[100px]">
                        {isLoading ? <LoadingSpinner /> : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export const Connections: React.FC = () => {
    const { state } = useGlobalState();
    const { user } = state;
    const { addNotification } = useNotification();
    const [isLoading, setIsLoading] = useState(false);

    const handleSignIn = async () => {
        setIsLoading(true);
        try {
            await signInWithGoogle();
            addNotification('Signed in successfully!', 'success');
        } catch (error) {
            addNotification('Failed to sign in.', 'error');
            console.error(error);
        }
        setIsLoading(false);
    };

    return (
        <div className="h-full p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-4xl font-extrabold tracking-tight">Connections</h1>
                    <p className="mt-2 text-lg text-text-secondary">Sign in and connect to external services.</p>
                </header>

                {!user ? (
                    <div className="text-center bg-surface p-8 rounded-lg border border-border">
                        <h2 className="text-xl font-bold">Sign In Required</h2>
                        <p className="text-text-secondary my-4">Please sign in with your Google account to manage connections and save your data.</p>
                        <button onClick={handleSignIn} disabled={isLoading} className="btn-primary px-6 py-3 flex items-center justify-center gap-2 mx-auto">
                           {isLoading ? <LoadingSpinner/> : 'Sign in with Google'}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <GitHubConnection />
                        <GoogleMapsConnection />
                    </div>
                )}
            </div>
        </div>
    );
};
