import React, { useState } from 'react';
import { CodeBracketSquareIcon } from '../icons.tsx';
import { MarkdownRenderer } from '../shared/index.tsx';

const hookCode = `
\`\`\`tsx
import { useState } from 'react';

export const useForm = (initialValues) => {
    const [values, setValues] = useState(initialValues);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setValues({ ...values, [name]: value });
    };

    return [values, handleChange];
};
\`\`\`
`;

const useForm = (initialValues: any) => {
    const [values, setValues] = useState(initialValues);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setValues({ ...values, [name]: value });
    };
    return [values, handleChange] as const;
};

export const UseFormHookGenerator: React.FC = () => {
    const [values, handleChange] = useForm({ name: '', email: ''});

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <CodeBracketSquareIcon />
                    <span className="ml-3">useForm Hook Generator</span>
                </h1>
                <p className="text-text-secondary mt-1">Generate a custom useForm hook for form state management.</p>
            </header>
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                <div className="flex flex-col">
                    <label className="text-sm font-medium mb-2">Hook Code</label>
                    <div className="flex-grow p-1 bg-background border rounded overflow-auto">
                        <MarkdownRenderer content={hookCode} />
                    </div>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium mb-2">Live Demo</label>
                    <div className="flex-grow p-4 bg-surface border rounded">
                        <div className="space-y-2">
                            <input name="name" value={values.name} onChange={handleChange} placeholder="Name" className="w-full p-2 bg-background border rounded"/>
                            <input name="email" value={values.email} onChange={handleChange} placeholder="Email" className="w-full p-2 bg-background border rounded"/>
                        </div>
                        <pre className="text-xs mt-4 bg-background p-2 rounded">{JSON.stringify(values, null, 2)}</pre>
                    </div>
                </div>
            </div>
        </div>
    );
};
