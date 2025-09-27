import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useGlobalState } from '../../contexts/GlobalStateContext.tsx';
import * as vaultService from '../../services/vaultService.ts';
import { useNotification } from '../../contexts/NotificationContext.tsx';
import { validateToken } from '../../services/authService.ts';
import { ACTION_REGISTRY, executeWorkspaceAction } from '../../services/workspaceConnectorService.ts';
// Fix: Corrected import path for icons.
import { RectangleGroupIcon, GithubIcon, SparklesIcon } from '../icons/index.ts';
import { LoadingSpinner } from '../shared/index.tsx';
import { signInWithGoogle } from '../../services/googleAuthService.ts';
import { useVaultModal } from '../../contexts/VaultModalContext.tsx';

const ServiceConnectionCard: React.FC<{
    serviceName: string;
    icon: React.ReactNode;
    fields: { id: string; label: string; placeholder: string }[];
    onConnect: (credentials: Record<string, string>) => Promise<void>;
    onDisconnect: () => Promise<void>;
    status: string;
    isLoading: boolean;
}> = ({ serviceName, icon, fields, onConnect, onDisconnect, status, isLoading }) => {
    const [creds, setCreds] = useState<Record<string, string>>({});

    const handleConnect = () => {
        onConnect(creds);
    };

    const isConnected = status.startsWith('Connected');

    return (
        <div className="bg-surface border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10">{icon}</div>
                    <div>
                        <h3 className="text-lg font-bold text-text-primary">{serviceName}</h3>
                        <p className={`text-sm ${isConnected ? 'text-green-600' : 'text-text-secondary'}`}>{status}</p>
                    </div>
                </div>
                {isConnected && (
                    <button onClick={onDisconnect} className="px-4 py-2 bg-red-500/10 text-red-600 font-semibold rounded-lg hover:bg-red-500/20">
                        Disconnect
                    </button>
                )}
            </div>
            {!isConnected && (
                <div className="mt-4 pt-4 border-t border-border space-y-2">
                    {fields.map(field => (
                        <div key={field.id}>
                            <label className="text-xs text-text-secondary">{field.label}</label>
                            <input
                                type={field.id.includes('token') || field.id.includes('pat') ? 'password' : 'text'}
                                value={creds[field.id] || ''}
                                onChange={e => setCreds(prev => ({ ...prev, [field.id]: e.target.value }))}
                                placeholder={field.placeholder}
                                className="w-full mt-1 p-2 bg-background border border-border rounded-md text-sm"
                            />
                        </div>
                    ))}
                    <button onClick={handleConnect} disabled={isLoading} className="btn-primary w-full mt-2 py-2 flex items-center justify-center">
                        {isLoading ? <LoadingSpinner /> : 'Connect'}
                    </button>
                </div>
            )}
        </div>
    );
};


export const WorkspaceConnectorHub: React.FC = () => {
    const { state, dispatch } = useGlobalState();
    const { user, githubUser, vaultState } = state;
    const { addNotification } = useNotification();
    const { requestUnlock, requestCreation } = useVaultModal();
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
    const [connectionStatuses, setConnectionStatuses] = useState<Record<string, string>>({});
    
    // Manual action state
    const [selectedActionId, setSelectedActionId] = useState<string>([...ACTION_REGISTRY.keys()][0]);
    const [actionParams, setActionParams] = useState<Record<string, any>>({});
    const [isExecuting, setIsExecuting] = useState(false);
    const [actionResult, setActionResult] = useState<string>('');

    const services = useMemo(() => {
        const serviceMap = new Map();
        ACTION_REGISTRY.forEach(action => {
            if (!serviceMap.has(action.service)) {
                serviceMap.set(action.service, {
                    name: action.service,
                    actions: [],
                });
            }
            serviceMap.get(action.service).actions.push(action);
        });
        return Array.from(serviceMap.values());
    }, []);

    const checkConnections = useCallback(async () => {
        if (!user || !vaultState.isUnlocked) return;
        
        const checkCred = async (credId: string, serviceName: string, successMessage: string) => {
             const token = await vaultService.getDecryptedCredential(credId);
             setConnectionStatuses(s => ({ ...s, [serviceName]: token ? successMessage : 'Not Connected' }));
        };

        await checkCred('github_pat', 'GitHub', githubUser ? `Connected as ${githubUser.login}`: 'Connected');
        await checkCred('jira_pat', 'Jira', 'Connected');
        await checkCred('slack_bot_token', 'Slack', 'Connected');

    }, [user, vaultState.isUnlocked, githubUser]);

    useEffect(() => {
        checkConnections();
    }, [checkConnections]);
    
    const withVault = useCallback(async (callback