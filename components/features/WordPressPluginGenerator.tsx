import React, { useState } from 'react';
import JSZip from 'jszip';
import { generateWordPressPlugin } from '../../services/aiService.ts';
import type { GeneratedFile } from '../../types.ts';
import { WordPressIcon } from '../icons.tsx';
import { LoadingSpinner, MarkdownRenderer } from '../shared/index.tsx';
import { useNotification } from '../../contexts/NotificationContext.tsx';
import { downloadFile } from '../../services/fileUtils.ts';

const examplePrompt = 'a simple shortcode that displays "Hello World"';

export const WordPressPluginGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState(examplePrompt);
    const [files, setFiles] = useState<GeneratedFile[]>([]);
    const [activeFile, setActiveFile] = useState<GeneratedFile | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { addNotification } = useNotification();

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            addNotification('Please provide a plugin description.', 'error');
            return;
        }
        setIsLoading(true);
        setFiles([]);
        setActiveFile(null);
        try {
            const result = await generateWordPressPlugin(prompt);
            setFiles(result);
            if (result.length > 0) {
                setActiveFile(result[0]);
            }
            addNotification('WordPress plugin generated!', 'success');
        } catch (err) {
            addNotification(err instanceof Error ? err.message : 'Failed to generate plugin', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadZip = async () => {
        if (files.length === 0) return;
        const zip = new JSZip();
        files.forEach(file => {
            zip.file(file.filePath, file.content);
        });
        
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(zipBlob);
        const pluginName = files[0]?.filePath.split('/')[0] || 'my-plugin';
        link.download = `${pluginName}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center"><WordPressIcon /><span className="ml-3">WordPress Plugin Generator</span></h1>
                <p className="text-text-secondary mt-1">Generate a functional WordPress plugin from a text description.</p>
            </header>
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col flex-1 min-h-0">
                        <label className="text-sm font-medium mb-2">Plugin Description</label>
                        <textarea value={prompt} onChange={e => setPrompt(e.target.value)} className="flex-grow p-2 bg-surface border rounded"/>
                    </div>
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary w-full py-3">{isLoading ? <LoadingSpinner/> : 'Generate Plugin'}</button>
                </div>
                <div className="flex flex-col min-h-0">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium">Generated Files</label>
                        {files.length > 0 && <button onClick={handleDownloadZip} className="btn-primary px-3 py-1 text-sm">Download as ZIP</button>}
                    </div>
                    <div className="flex-grow grid grid-cols-3 gap-2 min-h-0 bg-background border rounded-lg p-2">
                        <div className="col-span-1 overflow-y-auto">
                            {isLoading ? <div className="flex justify-center items-center h-full"><LoadingSpinner /></div> : (
                                files.map(file => (
                                    <div key={file.filePath} onClick={() => setActiveFile(file)} className={`p-2 text-sm rounded cursor-pointer ${activeFile?.filePath === file.filePath ? 'bg-primary/10 text-primary' : ''}`}>{file.filePath}</div>
                                ))
                            )}
                        </div>
                        <div className="col-span-2 bg-surface rounded overflow-y-auto">
                            {activeFile && <MarkdownRenderer content={'```php\n' + activeFile.content + '\n```'} />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
