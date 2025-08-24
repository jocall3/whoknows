import React, { useState, useCallback } from 'react';
import { generateWeeklyDigest } from '../../services/index.ts';
import { sendEmail } from '../../services/workspaceService.ts';
import { useGlobalState } from '../../contexts/GlobalStateContext.tsx';
import { useNotification } from '../../contexts/NotificationContext.tsx';
import { MailIcon, SparklesIcon } from '../icons.tsx';
import { LoadingSpinner } from '../shared/index.tsx';

// Dummy data for demonstration purposes
const dummyCommitLogs = `
feat: implement user authentication
fix: resolve issue with button alignment
feat: add dark mode toggle
chore: update dependencies
refactor: simplify data fetching logic
`;
const dummyTelemetry = {
    avgPageLoad: 120,
    errorRate: '0.5%',
    uptime: '99.98%'
};

export const WeeklyDigestGenerator: React.FC = () => {
    const { state } = useGlobalState();
    const { user } = state;
    const { addNotification } = useNotification();
    const [emailHtml, setEmailHtml] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const handleGenerate = useCallback(async () => {
        setIsLoading(true);
        setEmailHtml('');
        try {
            const html = await generateWeeklyDigest(dummyCommitLogs, dummyTelemetry);
            setEmailHtml(html);
            addNotification('Digest content generated!', 'success');
        } catch (e) {
            addNotification(e instanceof Error ? e.message : 'Failed to generate digest', 'error');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleSend = async () => {
        if (!emailHtml || !user?.email) {
            addNotification('Cannot send email. Generate content and ensure you are signed in.', 'error');
            return;
        }
        setIsSending(true);
        try {
            await sendEmail(user.email, 'Your Weekly Project Digest', emailHtml);
            addNotification(`Weekly digest sent to ${user.email}!`, 'success');
        } catch (e) {
             addNotification(e instanceof Error ? e.message : 'Failed to send email', 'error');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center"><MailIcon /><span className="ml-3">Weekly Digest Generator</span></h1>
                <p className="text-text-secondary mt-1">Generate an AI-powered weekly summary and send it via your Gmail.</p>
            </header>

            <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                <div className="bg-surface p-4 border border-border rounded-lg flex flex-col items-center justify-center text-center">
                    <h3 className="text-lg font-bold">Generate & Send</h3>
                    <p className="text-sm text-text-secondary my-4">This tool will use dummy data to generate a project summary and send it to your signed-in email address ({user?.email || 'N/A'}).</p>
                    <div className="flex flex-col gap-4 w-full max-w-xs">
                        <button onClick={handleGenerate} disabled={isLoading || isSending} className="btn-primary flex items-center justify-center gap-2 py-3">
                            {isLoading ? <LoadingSpinner /> : <><SparklesIcon /> Generate Digest</>}
                        </button>
                        <button onClick={handleSend} disabled={!emailHtml || isSending || isLoading || !user} className="btn-primary flex items-center justify-center gap-2 py-3 bg-emerald-600">
                           {isSending ? <LoadingSpinner /> : 'Send Email via Gmail'}
                        </button>
                    </div>
                </div>

                <div className="bg-surface p-4 border border-border rounded-lg flex flex-col">
                    <h3 className="text-lg font-bold mb-2">Email Preview</h3>
                    <div className="flex-grow bg-white border rounded overflow-hidden">
                        {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                        {emailHtml && <iframe srcDoc={emailHtml} title="Email Preview" className="w-full h-full" />}
                        {!isLoading && !emailHtml && <div className="flex justify-center items-center h-full text-text-secondary">Preview will appear here.</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};