import React, { useState, useCallback } from 'react';
import { generateUnitTestsStream, downloadFile } from '../../services/index.ts';
import { BeakerIcon, ArrowDownTrayIcon } from '../icons/index.ts';
import { LoadingSpinner } from '../shared/index.tsx';
import { MarkdownRenderer } from '../shared/index.tsx';

const exampleCode = `import React from 'react';

export const Greeting = ({ name }) => {
  if (!name) {
    return <div>Hello, Guest!</div>;
  }
  return <div>Hello, {name}!</div>;
};`;

export const AiUnitTestGenerator: React.FC = () => {
    const [code, setCode] = useState<string>(exampleCode);
    const [tests, setTests] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!code.trim()) {
            setError('Please enter some code to generate tests for.');
            return;
        }
        setIsLoading(true);
        setError('');
        setTests('');
        try {
            const stream = generateUnitTestsStream(code);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setTests(fullResponse);
            }
        } catch (err) {
            const errorMessage = err