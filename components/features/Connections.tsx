import React, { useState, useEffect } from 'react';
import { GithubIcon } from '../icons.tsx';
import { useGlobalState } from '../../contexts/GlobalStateContext.tsx';
import * as vaultService from '../../services/vaultService.ts';
import { validateToken } from '../../services/authService.ts';
import { useVaultModal } from '../../contexts/VaultModalContext.tsx';
import { LoadingSpinner } from '../shared/LoadingSpinner.tsx';
import type { User } from '../../types.ts';

const GitHubConnection: React.FC = () => {
    const { state, dispatch } = useGlobalState();
    const { github: githubUser } = state.connections;
    const { isInitialized, isUnlocked } = state.vaultState;
    const { requestUnlock, requestCreation } = useVaultModal();
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [tokenInput, setTokenInput] = useState('');
    const [error, setError] = useState('');

    // On load, check if a credential exists and try to validate it.
    useEffect(() => {
        const checkConnection = async () => {
            if (!isUnlocked) return;
            setStatus('loading');
            try {
                const token = await vaultService.getDecryptedCredential('github_pat');
                if (token) {
                    const user = await validateToken(token);
                    dispatch({ type: 'SET_GITHUB_CONNECTION', payload: user });
                    setStatus('success');
                } else {
                    dispatch({ type: 'SET_GITHUB_CONNECTION', payload: null });
                    setStatus('idle');
                }
            } catch (err) {
                setError('Failed to validate stored token.');
                setStatus('error');
            }
        };
        checkConnection();
    }, [isUnlocked, dispatch]);

    const handleConnect = async () => {
        if (!tokenInput.trim()) {
            setError('Token cannot be empty.');
            return;
        }

        let vaultReady = isUnlocked;
        if (!isInitialized) {
            vaultReady = await requestCreation();
        } else if (!isUnlocked) {
            vaultReady = await requestUnlock();
        }

        if (!vaultReady) return;

        setStatus('loading');
        setError('');
        try {
            const user: User = await validateToken(tokenInput);
            await vaultService.saveCredential('github_pat', tokenInput);
            dispatch({ type: 'SET_GITHUB_CONNECTION', payload: user });
            setStatus('success');
            setTokenInput('');
        } catch (err) {
            setError(err instanceof Error ? `Invalid Token: ${err.message}` : 'Could not connect.');
            setStatus('error');
        }
    };
    
    const handleDisconnect = async () => {
        // Here we'd need a flow to remove the credential from the vault,
        // which requires unlocking it. For now, we'll just log out from the session.
        dispatch({ type: 'LOGOUT_GITHUB' });
        setStatus('idle');
        alert("Disconnected from GitHub for this session. To permanently remove the credential, reset the vault in Settings.");
    };

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
                    <button onClick={handleDisconnect} className="px-4 py-2 bg-red-500/10 text-red-600 font-semibold rounded-lg hover:bg-red-500/20">
                        Disconnect
                    </button>
                 )}
            </div>
            
            {!githubUser && (
                <div className="mt-4 pt-4 border-t border-border">
                    <label htmlFor="github-pat" className="block text-sm font-medium text-text-secondary mb-1">Personal Access Token (Classic)</label>
                    <div className="flex gap-2">
                        <input
                            id="github-pat"
                            type="password"
                            value={tokenInput}
                            onChange={(e) => setTokenInput(e.target.value)}
                            placeholder="ghp_..."
                            className="flex-grow p-2 bg-background border border-border rounded-md text-sm"
                        />
                         <button onClick={handleConnect} disabled={status === 'loading'} className="btn-primary px-6 py-2 flex items-center justify-center min-w-[100px]">
                            {status === 'loading' ? <LoadingSpinner /> : 'Connect'}
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
                    <p className="text-xs text-text-secondary mt-2">
                        Your token is encrypted and stored only in your browser's local database. Required scopes: `repo`, `read:user`.
                    </p>
                </div>
            )}
        </div>
    );
};

export const Connections: React.FC = () => {
    return (
        <div className="h-full p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-4xl font-extrabold tracking-tight">Security Vault</h1>
                    <p className="mt-2 text-lg text-text-secondary">Manage your encrypted API credentials.</p>
                </header>
                <div className="space-y-6">
                    <GitHubConnection />
                </div>
            </div>
        </div>
    );
};
