import React, { useState } from 'react';
import { generateDocumentationForFiles } from '../../services/aiService.ts';
import { useGlobalState } from '../../contexts/GlobalStateContext.tsx';
import type { FileNode } from '../../types.ts';
import { DocumentTextIcon, FolderIcon } from '../icons.tsx';
import { LoadingSpinner, MarkdownRenderer } from '../shared/index.tsx';
import { useNotification } from '../../contexts/NotificationContext.tsx';

const FileTreeSelector: React.FC<{ node: FileNode, selectedPaths: Set<string>, onToggle: (path: string, isFolder: boolean) => void }> = ({ node, selectedPaths, onToggle }) => {
    const [isOpen, setIsOpen] = useState(true);
    const isSelected = selectedPaths.has(node.path);

    const handleToggle = () => {
        onToggle(node.path, node.type === 'folder');
    };

    if (node.type === 'file') {
        return (
            <div className="flex items-center space-x-2 pl-4 py-1">
                <input type="checkbox" checked={isSelected} onChange={handleToggle} />
                <DocumentTextIcon />
                <span>{node.name}</span>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center space-x-2 py-1">
                <input type="checkbox" checked={isSelected} onChange={handleToggle} />
                <button onClick={() => setIsOpen(!isOpen)} className={`transform transition-transform ${isOpen ? 'rotate-90' : ''}`}>▶</button>
                <FolderIcon />
                <span className="font-semibold">{node.name}</span>
            </div>
            {isOpen && node.children && (
                <div className="pl-4 border-l border-border ml-3">
                    {node.children.map(child => <FileTreeSelector key={child.path} node={child} selectedPaths={selectedPaths} onToggle={onToggle} />)}
                </div>
            )}
        </div>
    );
};


export const CodeDocumentationWriter: React.FC = () => {
    const { state } = useGlobalState();
    const { projectFiles } = state;
    const [selectedPaths, setSelectedPaths] = useState(new Set<string>());
    const [documentation, setDocumentation] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { addNotification } = useNotification();

    const handleGenerate = async () => {
        if (selectedPaths.size === 0) {
            addNotification('Please select files to document.', 'error');
            return;
        }
        setIsLoading(true);
        setDocumentation('');
        try {
            // This is a simplified fetcher. In a real app, this would need to get content from the GitHubService
            // or wherever the file content is stored. Here we assume it's pre-loaded or mock it.
            const filesToDocument = Array.from(selectedPaths).map(path => ({ path, content: `// Content for ${path}`}));
            
            const result = await generateDocumentationForFiles(filesToDocument);
            setDocumentation(result);
            addNotification('Documentation generated!', 'success');
        } catch (err) {
            addNotification(err instanceof Error ? err.message : 'Failed to generate documentation.', 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const getAllChildPaths = (node: FileNode): string[] => {
        let paths = [node.path];
        if (node.children) {
            paths = paths.concat(...node.children.map(getAllChildPaths));
        }
        return paths;
    };
    
    const findNodeByPath = (node: FileNode, path: string): FileNode | null => {
        if (node.path === path) return node;
        if (node.children) {
            for (const child of node.children) {
                const found = findNodeByPath(child, path);
                if (found) return found;
            }
        }
        return null;
    }
    
    const handleToggle = (path: string, isFolder: boolean) => {
        const newSelected = new Set(selectedPaths);
        const isSelected = newSelected.has(path);
        
        let pathsToToggle: string[] = [path];
        if (isFolder && projectFiles) {
            const folderNode = findNodeByPath(projectFiles, path);
            if(folderNode) pathsToToggle = getAllChildPaths(folderNode);
        }
        
        if (isSelected) {
            pathsToToggle.forEach(p => newSelected.delete(p));
        } else {
            pathsToToggle.forEach(p => newSelected.add(p));
        }
        setSelectedPaths(newSelected);
    };

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center"><DocumentTextIcon /><span className="ml-3">Code Documentation Writer</span></h1>
                <p className="text-text-secondary mt-1">Select files from your project to generate comprehensive documentation.</p>
            </header>
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                <div className="flex flex-col">
                     <label className="text-sm font-medium mb-2">Select Files</label>
                     <div className="flex-grow p-2 bg-surface border rounded overflow-auto">
                        {projectFiles ? <FileTreeSelector node={projectFiles} selectedPaths={selectedPaths} onToggle={handleToggle} /> : <p>Load a project in the Project Explorer first.</p>}
                     </div>
                     <button onClick={handleGenerate} disabled={isLoading || selectedPaths.size === 0} className="btn-primary w-full mt-4 py-3">{isLoading ? <LoadingSpinner/> : 'Generate Documentation'}</button>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium mb-2">Generated Documentation</label>
                    <div className="flex-grow p-4 bg-background border rounded overflow-auto">
                        {isLoading ? <div className="flex justify-center items-center h-full"><LoadingSpinner /></div> : <MarkdownRenderer content={documentation} />}
                    </div>
                </div>
            </div>
        </div>
    );
};
