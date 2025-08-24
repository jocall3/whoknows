
// services/googleApiService.ts
const API_KEY = process.env.GEMINI_API_KEY;
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

declare global { interface Window { gapi: any; } }

let gapiInitialized = false;

const loadGapiScript = () => new Promise<void>((resolve, reject) => {
    if (window.gapi) {
        window.gapi.load('client', resolve);
        return;
    };
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => window.gapi.load('client', resolve);
    script.onerror = reject;
    document.body.appendChild(script);
});

export const ensureGapiClient = async (): Promise<boolean> => {
    if (gapiInitialized) return true;
    
    try {
        await loadGapiScript();

        await window.gapi.client.init({
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            discoveryDocs: [
                "https://slides.googleapis.com/$discovery/rest?version=v1",
                "https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"
            ],
        });

        const accessToken = sessionStorage.getItem('google_access_token');
        if (!accessToken) {
            console.error("GAPI: Access token not found. User may need to sign in again.");
            return false;
        }
        
        window.gapi.client.setToken({ access_token: accessToken });
        gapiInitialized = true;
        return true;
    } catch (error) {
        console.error("GAPI client initialization failed:", error);
        gapiInitialized = false;
        return false;
    }
};