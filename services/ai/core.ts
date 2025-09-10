/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { Type } from "@google/genai";
import { logError } from '../telemetryService.ts';

// --- TYPES ---
export interface CommandResponse {
    text: string;
    functionCalls?: { name: string; args: any; }[];
}

export interface CronParts {
    minute: string;
    hour: string;
    dayOfMonth: string;
    month: string;
    dayOfWeek: string;
}

// --- SCHEMAS ---
export const filesSchema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { filePath: { type: Type.STRING }, content: { type: Type.STRING }, description: { type: Type.STRING } }, required: ["filePath", "content", "description"] } };

export const openApiParseSchema = {
    type: Type.OBJECT,
    properties: {
        routes: {
            type: Type.ARRAY,
            description: "A list of all API endpoints found in the spec.",
            items: {
                type: Type.OBJECT,
                properties: {
                    path: { type: Type.STRING, description: "The URL path of the endpoint, e.g., /api/users/{id}." },
                    method: { type: Type.STRING, description: "The HTTP method for the endpoint (e.g., GET, POST)." },
                    schemaName: { type: Type.STRING, description: "The name of the schema from the components/schemas section that this endpoint's successful response should be based on." }
                },
                required: ["path", "method", "schemaName"]
            }
        },
        schemas: {
            type: Type.ARRAY,
            description: "A list of all data schemas found in the spec's components/schemas section.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The name of the schema, e.g., 'user' or 'account_detail'." },
                    description: { type: Type.STRING, description: "A natural language description of the schema's properties, suitable for generating mock data." }
                },
                required: ["name", "description"]
            }
        }
    },
    required: ["routes", "schemas"]
};


// --- Unified AI Proxy Helpers ---
// FIX: Export fetchFromProxy so it can be used by other services.
export async function fetchFromProxy(endpoint: string, body: object): Promise<any> {
    try {
        const response = await fetch(`/api/proxy${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(error.message || `AI proxy request failed with status ${response.status}`);
        }

        return response.json();
    } catch (error) {
        logError(error as Error, { endpoint, body });
        throw error;
    }
}

async function* streamFromProxy(endpoint: string, body: object): AsyncGenerator<string> {
    try {
        const response = await fetch(`/api/proxy${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!response.ok || !response.body) {
            const error = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(error.message || `AI proxy stream request failed with status ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            yield decoder.decode(value);
        }
    } catch (error) {
        logError(error as Error, { endpoint, body });
        if (error instanceof Error) {
            yield `An error occurred while communicating with the AI model: ${error.message}`;
        } else {
            yield "An unknown error occurred while generating the response.";
        }
    }
}

// --- Core Generative Functions ---
export async function* streamContent(prompt: string | { parts: any[] }, systemInstruction: string, temperature = 0.5) {
    yield* streamFromProxy('/streamContent', {
        model: 'gemini-2.5-flash',
        contents: prompt as any,
        config: { systemInstruction, temperature }
    });
}

export async function generateContent(prompt: string, systemInstruction: string, temperature = 0.5): Promise<string> {
    const response = await fetchFromProxy('/generateContent', {
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { systemInstruction, temperature }
    });
    return response.text;
}


export async function generateJson<T>(prompt: any, systemInstruction: string, schema: any, temperature = 0.2): Promise<T> {
    const response = await fetchFromProxy('/generateContent', {
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: schema,
            temperature,
        }
    });
    return JSON.parse(response.text.trim());
}