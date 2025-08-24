
import { ensureGapiClient } from './googleApiService.ts';
import type { SlideSummary } from '../types.ts';

declare global { interface Window { gapi: any; } }

// --- Slides Service ---
export const createPresentation = async (title: string): Promise<any> => {
    const isReady = await ensureGapiClient();
    if (!isReady) throw new Error("Google API client not ready.");

    const response = await window.gapi.client.slides.presentations.create({ title });
    return response.result;
};

export const addSlide = async (presentationId: string, summary: SlideSummary) => {
    const isReady = await ensureGapiClient();
    if (!isReady) throw new Error("Google API client not ready.");

    const titleObjectId = `title_${Date.now()}`;
    const bodyObjectId = `body_${Date.now()}`;

    const requests = [{
        createSlide: {
            slideLayoutReference: { predefinedLayout: 'TITLE_AND_BODY' },
             placeholderIdMappings: [
                {
                    layoutPlaceholder: { type: 'TITLE' },
                    objectId: titleObjectId,
                },
                {
                    layoutPlaceholder: { type: 'BODY' },
                    objectId: bodyObjectId,
                },
            ],
        }
    }];
    
    await window.gapi.client.slides.presentations.batchUpdate({ presentationId, requests });

    const textRequests = [
        { insertText: { objectId: titleObjectId, text: summary.title } },
        { insertText: { objectId: bodyObjectId, text: summary.body } },
    ];

    await window.gapi.client.slides.presentations.batchUpdate({ presentationId, requests: textRequests });
};


// --- Gmail Service ---
export const sendEmail = async (to: string, subject: string, body: string): Promise<any> => {
    const isReady = await ensureGapiClient();
    if (!isReady) throw new Error("Google API client not ready.");
    
    const email = [
        `To: ${to}`,
        'Content-Type: text/html; charset="UTF-8"',
        'MIME-Version: 1.0',
        `Subject: ${subject}`,
        '',
        body
    ].join('\n');

    // Using btoa which is fine for this client-side context
    const base64EncodedEmail = btoa(unescape(encodeURIComponent(email))).replace(/\+/g, '-').replace(/\//g, '_');
    
    const request = await window.gapi.client.gmail.users.messages.send({
        userId: 'me',
        resource: { raw: base64EncodedEmail }
    });

    return request.result;
};