import React, { useState } from 'react';
import { generateEcommerceComponent } from '../../services/aiService.ts';
import { ArchiveBoxIcon } from '../icons.tsx';
import { LoadingSpinner, MarkdownRenderer } from '../shared/index.tsx';
import { useNotification } from '../../contexts/NotificationContext.tsx';

export const EcommerceComponentGenerator: React.FC = () => {
    const [description, setDescription] = useState('a product page for a red shoe with three images and a price of $99');
    const [generatedCode, setGeneratedCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { addNotification } = useNotification();

    const handleGenerate = async () => {
        setIsLoading(true);
        setGeneratedCode('');
        try {
            const code = await generateEcommerceComponent(description);
            setGeneratedCode(code);
            addNotification('Component generated!', 'success');
        } catch (err) {
            addNotification(err instanceof Error ? err.message : 'Failed to generate component', 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center"><ArchiveBoxIcon /><span className="ml-3">E-commerce Component Generator</span></h1>
                <p className="text-text-secondary mt-1">Generate a product display component with schema.org markup.</p>
            </header>
            <div className="flex-grow flex flex-col gap-4 min-h-0">
                <div className="flex flex-col flex-1 min-h-0">
                    <label className="text-sm font-medium mb-2">Product Description</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} className="flex-grow p-2 bg-surface border rounded"/>
                </div>
                <button onClick={handleGenerate} disabled={isLoading} className="btn-primary w-full max-w-sm mx-auto py-3">{isLoading ? <LoadingSpinner/> : 'Generate Component'}</button>
                <div className="flex flex-col flex-grow min-h-0 mt-4">
                    <label className="text-sm font-medium mb-2">Generated React Component</label>
                    <div className="flex-grow p-1 bg-background border rounded overflow-auto">
                        {isLoading ? <div className="flex justify-center items-center h-full"><LoadingSpinner /></div> : (
                            generatedCode && <MarkdownRenderer content={generatedCode} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
