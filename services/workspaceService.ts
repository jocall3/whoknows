
import { ensureGapiClient } from './googleApiService.ts';
import { logError } from './telemetryService.ts';
import type { SlideSummary } from '../types.ts';

declare var gapi: any;

// --- Docs Service ---
export const createDocument = async (title: string): Promise<{ documentId: string; webViewLink: string }> => {
    try {
        const isReady = await ensureGapiClient();
        if (!isReady) throw new Error("Google API client not ready.");
        
        await gapi.client.load('https://docs.googleapis.com/$discovery/rest?version=v1');

        const response = await gapi.client.docs.documents.create({ title });
        const doc = response.result;
        return { documentId: doc.documentId, webViewLink: `https://docs.google.com/document/d/${doc.documentId}/edit` };
    } catch (error) {
        logError(error as Error, { service: 'workspaceService', function: 'createDocument' });
        throw error;
    }
};

export const insertText = async (documentId: string, text: string): Promise<void> => {
     try {
        const isReady = await ensureGapiClient();
        if (!isReady) throw new Error("Google API client not ready.");

        await gapi.client.load('https://docs.googleapis.com/$discovery/rest?version=v1');

        await gapi.client.docs.documents.batchUpdate({
            documentId,
            resource: {
                requests: [{
                    insertText: {
                        text: text,
                        location: { index: 1 }
                    }
                }]
            }
        });
    } catch (error) {
        logError(error as Error, { service: 'workspaceService', function: 'insertText' });
        throw error;
    }
};

// --- Slides Service ---
export const createPresentation = async (title: string): Promise<{ presentationId: string; webViewLink: string }> => {
    try {
        const isReady = await ensureGapiClient();
        if (!isReady) throw new Error("Google API client not ready.");
        
        const response = await gapi.client.slides.presentations.create({ title });
        const presentation = response.result;
        return { presentationId: presentation.presentationId, webViewLink: `https://docs.google.com/presentation/d/${presentation.presentationId}/edit` };
    } catch (error) {
        logError(error as Error, { service: 'workspaceService', function: 'createPresentation' });
        throw error;
    }
};

export const addSlide = async (presentationId: string, content: SlideSummary): Promise<void> => {
    try {
        const isReady = await ensureGapiClient();
        if (!isReady) throw new Error("Google API client not ready.");
        
        const slideId = `slide_${Date.now()}_${Math.random().toString(36).substring(2)}`;
        const titleId = `title_${Date.now()}_${Math.random().toString(36).substring(2)}`;
        const bodyId = `body_${Date.now()}_${Math.random().toString(36).substring(2)}`;
        
        const requests = [
            {
                createSlide: {
                    objectId: slideId,
                    slideLayoutReference: {
                        predefinedLayout: 'TITLE_AND_BODY'
                    },
                    placeholderIdMappings: [
                        { layoutPlaceholder: { type: 'TITLE' }, objectId: titleId },
                        { layoutPlaceholder: { type: 'BODY' }, objectId: bodyId }
                    ]
                }
            },
            {
                insertText: {
                    objectId: titleId,
                    text: content.title
                }
            },
            {
                insertText: {
                    objectId: bodyId,
                    text: content.body
                }
            }
        ];

        await gapi.client.slides.presentations.batchUpdate({
            presentationId,
            resource: { requests }
        });
    } catch (error) {
        logError(error as Error, { service: 'workspaceService', function: 'addSlide' });
        throw error;
    }
};

// --- Gmail Service ---
const createEmail = (to: string, subject: string, message: string): string => {
    const emailLines = [
        `Content-Type: text/html; charset="UTF-8"`,
        `To: ${to}`,
        `Subject: ${subject}`,
        '',
        message
    ];
    const email = emailLines.join('\r\n');
    return btoa(email).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

export const sendEmail = async (to: string, subject: string, htmlBody: string): Promise<void> => {
    try {
        const isReady = await ensureGapiClient();
        if (!isReady) throw new Error("Google API client not ready.");

        const rawEmail = createEmail(to, subject, htmlBody);

        await gapi.client.gmail.users.messages.send({
            userId: 'me',
            resource: {
                raw: rawEmail
            }
        });
    } catch (error) {
        logError(error as Error, { service: 'workspaceService', function: 'sendEmail' });
        throw error;
    }
};

// --- Drive Service ---

const getDriveClient = async () => {
    const isReady = await ensureGapiClient();
    if (!isReady) throw new Error("Google API client not ready.");
    await gapi.client.load('https://www.googleapis.com/discovery/v1/apis/drive/v3/rest');
    return gapi.client.drive;
};

export const findOrCreateFolder = async (folderName: string): Promise<string> => {
    try {
        const drive = await getDriveClient();
        const query = `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`;
        const response = await drive.files.list({ q: query, fields: 'files(id, name)' });
        
        if (response.result.files && response.result.files.length > 0) {
            return response.result.files[0].id;
        } else {
            const fileMetadata = {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder'
            };
            const createResponse = await drive.files.create({ resource: fileMetadata, fields: 'id' });
            return createResponse.result.id;
        }
    } catch (error) {
        logError(error as Error, { service: 'workspaceService', function: 'findOrCreateFolder' });
        throw error;
    }
};

export const uploadFile = async (folderId: string, fileName: string, content: string, mimeType: string): Promise<any> => {
    try {
        await getDriveClient(); // Ensures client is loaded
        
        const metadata = {
            name: fileName,
            parents: [folderId],
            mimeType,
        };
        
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', new Blob([content], { type: mimeType }));

        const token = sessionStorage.getItem('google_access_token');
        if (!token) throw new Error("Not authenticated");

        const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: form
        });
        
        if (!res.ok) {
            const errorBody = await res.json();
            throw new Error(`Failed to upload file: ${errorBody.error.message}`);
        }

        return await res.json();
    } catch (error) {
        logError(error as Error, { service: 'workspaceService', function: 'uploadFile' });
        throw error;
    }
};

// Stubs for other Workspace services
export const appendRowToSheet = async (sheetId: string, rowData: any[]) => { console.log('appendRowToSheet called', sheetId, rowData); };
export const createTask = async (listId: string, title: string, notes: string) => { console.log('createTask called', listId, title, notes); };
export const createCalendarEvent = async (title: string, description: string, date: string) => { console.log('createCalendarEvent called', title, description, date); };
