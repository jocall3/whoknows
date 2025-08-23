import React, { useState, useCallback, useEffect } from 'react';
import { SparklesIcon, ArrowDownTrayIcon } from '../icons.tsx';
import { generateThemeFromDescription } from '../../services/geminiService.ts';
import type { ColorTheme } from '../../types.ts';
import { LoadingSpinner } from '../shared/index.tsx';
import { HexColorPicker } from 'react-colorful';
import { downloadFile } from '../../services/fileUtils.ts';

const ColorInput: React.FC<{ label: string; color: string; onChange: (color: string) => void; }> = ({ label, color, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
         <div className="relative">
             <div onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between p-3 bg-background rounded-md cursor-pointer border-2 border-border hover:border-gray-300">
                <div className="flex items-center gap-3">
                     <div className="w-6 h-6 rounded border border-border" style={{ backgroundColor: color }} />
                     <span className="text-sm font-medium text-text-primary">{label}</span>
                </div>
                <span className="font-mono text-sm text-text-secondary">{color}</span>
            </div>
            {isOpen && (
                <div className="absolute z-10 top-full mt-2 right-0">
                     <div className="fixed inset-0" onClick={() => setIsOpen(false)} />
                    <HexColorPicker color={color} onChange={onChange} />
                </div>
            )}
        </div>
    );
};

const randomPrompts = [
    'A serene forest at dawn',
    'A retro 8-bit video game',
    'A cyberpunk cityscape at night',
    'A warm, cozy coffee shop',
    'An arctic expedition with icy blues',
    'A vibrant coral reef',
];

export const ThemeDesigner: React.FC<{ initialPrompt?: string }> = ({ initialPrompt }) => {
    const [theme, setTheme] = useState<ColorTheme>({
        primary: '#0047AB', background: '#F5F7FA', surface: '#FFFFFF', textPrimary: '#111827', textSecondary: '#6B7280',
    });
    const [prompt, setPrompt] = useState(initialPrompt || 'A professional and clean corporate blue theme.');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = useCallback(async (p: string) => {
        if (!p.trim()) { setError('Please enter a description.'); return; }
        setIsLoading(true); setError('');
        try {
            const newTheme = await generateThemeFromDescription(p);
            setTheme(newTheme);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleRandom = () => {
        const randomPrompt = randomPrompts[Math.floor(Math.random() * randomPrompts.length)];
        setPrompt(randomPrompt);
        handleGenerate(randomPrompt);
    };

    const handleColorChange = (key: keyof ColorTheme, color: string) => {
        setTheme(prev => ({...prev, [key]: color}));
    };
    
    const getExportContent = (type: 'css' | 'tailwind') => {
        if (type === 'css') {
            return `:root {\n` +
                   `  --primary: ${theme.primary};\n` +
                   `  --background: ${theme.background};\n` +
                   `  --surface: ${theme.surface};\n` +
                   `  --text-primary: ${theme.textPrimary};\n` +
                   `  --text-secondary: ${theme.textSecondary};\n` +
                   `}`;
        }
        return `// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '${theme.primary}',
        background: '${theme.background}',
        surface: '${theme.surface}',
        'text-primary': '${theme.textPrimary}',
        'text-secondary': '${theme.textSecondary}',
      },
    },
  },
};`;
    };

    useEffect(() => {
        if (initialPrompt) handleGenerate(initialPrompt);
    }, [initialPrompt, handleGenerate]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center"><SparklesIcon /><span className="ml-3">AI Theme Designer</span></h1>
                <p className="text-text-secondary mt-1">Describe, generate, fine-tune, and export a color theme for your application.</p>
            </header>
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
                <div className="md:col-span-1 flex flex-col gap-4 bg-surface border border-border p-6 rounded-lg overflow-y-auto">
                    <h3 className="text-xl font-bold">Describe your theme</h3>
                    <textarea value={prompt} onChange={e => setPrompt(e.target.value)} className="p-2 bg-background border border-border rounded-md resize-none text-sm h-24" placeholder="e.g., A light, airy theme for a blog" />
                     <div className="flex gap-2">
                         <button onClick={() => handleGenerate(prompt)} disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2 px-4 py-2">
                            {isLoading ? <LoadingSpinner /> : 'Generate Theme'}
                        </button>
                         <button onClick={handleRandom} disabled={isLoading} className="px-4 py-2 bg-gray-100 border border-border rounded-md hover:bg-gray-200" title="Random Theme">🎲</button>
                     </div>
                    {error && <p className="text-red-500 text-xs text-center">{error}</p>}

                    <div className="mt-4 border-t border-border pt-4 space-y-2 flex-grow overflow-y-auto pr-2">
                         <h3 className="text-lg font-bold">Fine-Tune Palette</h3>
                         <ColorInput label="Primary" color={theme.primary} onChange={c => handleColorChange('primary', c)} />
                         <ColorInput label="Background" color={theme.background} onChange={c => handleColorChange('background', c)} />
                         <ColorInput label="Surface" color={theme.surface} onChange={c => handleColorChange('surface', c)} />
                         <ColorInput label="Text Primary" color={theme.textPrimary} onChange={c => handleColorChange('textPrimary', c)} />
                         <ColorInput label="Text Secondary" color={theme.textSecondary} onChange={c => handleColorChange('textSecondary', c)} />
                    </div>
                    <div className="flex-shrink-0 pt-4 border-t border-border flex flex-col gap-2">
                        <button onClick={() => downloadFile(getExportContent('css'), 'theme.css', 'text/css')} className="flex-1 text-sm py-2 bg-gray-100 border border-border rounded-md flex items-center justify-center gap-2 hover:bg-gray-200">
                            <ArrowDownTrayIcon className="w-4 h-4"/> Download CSS
                        </button>
                        <button onClick={() => downloadFile(getExportContent('tailwind'), 'tailwind.config.js', 'application/javascript')} className="flex-1 text-sm py-2 bg-gray-100 border border-border rounded-md flex items-center justify-center gap-2 hover:bg-gray-200">
                             <ArrowDownTrayIcon className="w-4 h-4"/> Download Tailwind Config
                        </button>
                    </div>
                </div>
                <div className="md:col-span-1 rounded-lg p-8 overflow-y-auto border border-border" style={{ backgroundColor: theme.background, color: theme.textPrimary }}>
                     <h3 className="text-2xl font-bold mb-6" style={{ color: theme.textPrimary }}>Live Preview</h3>
                     <div className="p-6 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-6" style={{ backgroundColor: theme.surface }}>
                        <div className="space-y-4">
                            <h4 className="text-lg font-bold">Sample Card</h4>
                            <p className="text-sm" style={{color: theme.textSecondary}}>This is a sample card to demonstrate the theme colors. It contains a primary button and some secondary text.</p>
                            <button className="px-4 py-2 rounded-md font-bold transition-colors" style={{ backgroundColor: theme.primary, color: theme.textSecondary.includes('#F') ? '#000' : '#FFF' }}>Primary Button</button>
                        </div>
                         <div className="space-y-4">
                            <input type="text" placeholder="Text input" className="w-full px-3 py-2 rounded-md border" style={{backgroundColor: theme.background, borderColor: theme.primary, color: theme.textPrimary}} />
                            <div className="p-3 border rounded" style={{borderColor: theme.primary, color: theme.textSecondary}}>
                                <p>A bordered container.</p>
                            </div>
                         </div>
                     </div>
                     <div className="mt-6">
                        <h4 className="text-lg font-bold mb-2">Typography</h4>
                        <h1>Heading 1</h1>
                        <h2>Heading 2</h2>
                        <p style={{color: theme.textPrimary}}>This is a paragraph of primary text. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                        <p style={{color: theme.textSecondary}}>This is secondary text, for less important information.</p>
                     </div>
                </div>
            </div>
        </div>
    );
};