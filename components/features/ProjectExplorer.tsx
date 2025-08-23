import React, { useState, useEffect, useCallback } from 'react';
import { useGlobalState } from '../../contexts/GlobalStateContext.tsx';
import { useVaultModal } from '../../contexts/VaultModalContext.tsx';
import * as vaultService from '../../services/vaultService.ts';
import { initializeOctokit } from '../../services/authService.ts';
import { getRepos, getRepoTree, getFileContent } from '../../services/githubService.ts';
import type { Repo, FileNode } from '../../types.ts';
import { FolderIcon, DocumentIcon } from '../icons.tsx';
import { LoadingSpinner } from '../shared/index.tsx';

const FileTree: React.FC<{ node: FileNode, onFileSelect: (path: string) => void }> = ({ node, onFileSelect }) => {
    const [isOpen, setIsOpen] = useState(true);

    if (node.type === 'file') {
        return (
            <div
                className="flex items-center space-x-2 pl-4 py-1 cursor-pointer hover:bg-gray-100 rounded"
                onClick={() => onFileSelect(node.path)}
            >
                <DocumentIcon />
                <span>{node.name}</span>
            </div>
        );
    }

    return (
        <div>
            <div
                className="flex items-center space-x-2 py-1 cursor-pointer hover:bg-gray-100 rounded"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className={`transform transition-transform ${isOpen ? 'rotate-90' : ''}`}>▶</div>
                <FolderIcon />
                <span className="font-semibold">{node.name}</span>
            </div>
            {isOpen && node.children && (
                <div className="pl-4 border-l border-border ml-3">
                    {node.children.map(child => <FileTree key={child.path} node={child} onFileSelect={onFileSelect} />)}
                </div>
            )}
        </div>
    );
};

export const ProjectExplorer: React.FC = () => {
    const { state, dispatch } = useGlobalState();
    const { vaultState, connections, selectedRepo, projectFiles } = state;
    const { requestUnlock } = useVaultModal();
    const [repos, setRepos] = useState<Repo[]>([]);
    const [isLoading, setIsLoading] = useState<'repos' | 'tree' | 'file' | null>(null);
    const [error, setError] = useState('');
    const [activeFileContent, setActiveFileContent] = useState<string | null>(null);
    
    const getApiClient = useCallback(async () => {
        if (!vaultState.isUnlocked) {
            const unlocked = await requestUnlock();
            if (!unlocked) throw new Error("Vault must be unlocked to access GitHub.");
        }
        const token = await vaultService.getDecryptedCredential('github_pat');
        if (!token) throw new Error("GitHub token not found in vault.");
        return initializeOctokit(token);
    }, [vaultState.isUnlocked, requestUnlock]);


    useEffect(() => {
        const loadRepos = async () => {
            if (connections.github) {
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
            }
        };
        loadRepos();
    }, [connections.github, getApiClient]);

    useEffect(() => {
        const loadTree = async () => {
             if (selectedRepo && connections.github) {
                setIsLoading('tree');
                setError('');
                setActiveFileContent(null);
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
    }, [selectedRepo, connections.github, dispatch, getApiClient]);

    const handleFileSelect = async (path: string) => {
        if (!selectedRepo) return;
        setIsLoading('file');
        try {
            const octokit = await getApiClient();
            const content = await getFileContent(octokit, selectedRepo.owner, selectedRepo.repo, path);
            setActiveFileContent(content);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsLoading(null);
        }
    };
    
    if (!connections.github) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center text-text-secondary p-4">
                <FolderIcon />
                <h2 className="text-lg font-semibold mt-2">Connect to GitHub</h2>
                <p>Please go to the "Security Vault" tab and provide a Personal Access Token to explore your repositories.</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col text-text-primary">
            <header className="p-4 border-b border-border flex-shrink-0">
                <h1 className="text-xl font-bold flex items-center"><FolderIcon /><span className="ml-3">Project Explorer</span></h1>
                <div className="mt-2">
                    <select
                        value={selectedRepo ? `${selectedRepo.owner}/${selectedRepo.repo}` : ''}
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
                    {projectFiles && <FileTree node={projectFiles} onFileSelect={handleFileSelect} />}
                </aside>
                <main className="flex-1 bg-surface">
                     {isLoading === 'file' ? <div className="flex items-center justify-center h-full"><LoadingSpinner /></div> :
                        <pre className="w-full h-full p-4 text-sm overflow-auto whitespace-pre-wrap">
                            <code>{activeFileContent ?? 'Select a file to view its content.'}</code>
                        </pre>
                    }
                </main>
            </div>
        </div>
    );
};
