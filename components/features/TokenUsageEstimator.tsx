import React from 'react';
import { CpuChipIcon } from '../icons.tsx';

export const TokenUsageEstimator: React.FC = () => {
    return (
        <div className="h-full flex flex-col items-center justify-center p-4 text-center">
            <div className="text-4xl text-primary mb-4"><CpuChipIcon /></div>
            <h1 className="text-2xl font-bold">Token Usage Estimator</h1>
            <p className="text-text-secondary mt-2 max-w-md">
                This feature would estimate the token count for a given prompt to help manage API costs.
                A full client-side implementation requires access to the model's tokenizer, which is not currently available.
            </p>
             <div className="mt-4 p-4 bg-surface border rounded-lg">
                <h3 className="font-semibold">Conceptual Implementation</h3>
                <p className="text-sm text-text-secondary mt-1">This would involve using a client-side tokenizer library (like one for GPT) to provide a rough estimate, or making a dedicated 'countTokens' API call if provided by the Gemini API in the future.</p>
            </div>
        </div>
    );
};
