import { GoogleGenAI, Type, GenerateContentResponse, FunctionDeclaration } from "@google/genai";
import type { GeneratedFile, StructuredPrSummary, StructuredExplanation, ColorTheme, SemanticColorTheme } from '../types.ts';
import { logError } from './telemetryService.ts';

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("Gemini API key not found. Please set the GEMINI_API_KEY environment variable.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Unified AI Helpers ---

async function* streamContent(prompt: string | { parts: any[] }, systemInstruction: string, temperature = 0.5) {
    try {
        const response = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: prompt as any,
            config: { systemInstruction, temperature }
        });

        for await (const chunk of response) {
            yield chunk.text;
        }
    } catch (error) {
        console.error("Error streaming from AI model:", error);
        logError(error as Error, { prompt, systemInstruction });
        if (error instanceof Error) {
            yield `An error occurred while communicating with the AI model: ${error.message}`;
        } else {
            yield "An unknown error occurred while generating the response.";
        }
    }
}

async function generateContent(prompt: string, systemInstruction: string, temperature = 0.5): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { systemInstruction, temperature }
        });
        return response.text;
    } catch (error) {
         console.error("Error generating content from AI model:", error);
        logError(error as Error, { prompt, systemInstruction });
        throw error;
    }
}


async function generateJson<T>(prompt: any, systemInstruction: string, schema: any, temperature = 0.2): Promise<T> {
    try {
        const response = await ai.models.generateContent({
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
    } catch (error) {
        console.error("Error generating JSON from AI model:", error);
        logError(error as Error, { prompt, systemInstruction });
        throw error;
    }
}


// --- Unified Feature Functions (Streaming) ---

export const explainCodeStream = (code: string) => streamContent(
    `Please explain the following code snippet:\n\n\`\`\`\n${code}\n\`\`\``,
    "You are an expert software engineer providing a clear, concise explanation of code."
);

export const generateRegExStream = (description: string) => streamContent(
    `Generate a single valid JavaScript regex literal (e.g., /abc/gi) for the following description. Respond with ONLY the regex literal and nothing else: "${description}"`,
    "You are an expert in regular expressions. You only output valid JavaScript regex literals.",
    0.7
);

export const generateCommitMessageStream = (diff: string) => streamContent(
    `Generate a conventional commit message for the following context of new files being added:\n\n${diff}`,
    "You are an expert programmer who writes excellent, conventional commit messages. The response should be only the commit message text.",
    0.8
);

export const generateUnitTestsStream = (code: string) => streamContent(
    `Generate Vitest unit tests for this React component code:\n\n\`\`\`tsx\n${code}\n\`\`\``,
    "You are a software quality engineer specializing in writing comprehensive and clear unit tests using Vitest and React Testing Library.",
    0.6
);

export const formatCodeStream = (code: string) => streamContent(
    `Format this code:\n\n\`\`\`javascript\n${code}\n\`\`\``,
    "You are a code formatter. Your only purpose is to format code. Respond with only the formatted code, enclosed in a single markdown block.",
    0.2
);

export const generateComponentFromImageStream = (base64Image: string) => streamContent(
    {
        parts: [
            { text: "Generate a single-file React component using Tailwind CSS that looks like this image. Respond with only the code in a markdown block." },
            { inlineData: { mimeType: 'image/png', data: base64Image } }
        ]
    },
    "You are an expert frontend developer specializing in React and Tailwind CSS. You create clean, functional components from screenshots."
);

export const transcribeAudioToCodeStream = (base64Audio: string, mimeType: string) => streamContent(
    {
        parts: [
            { text: "Transcribe my speech into a code snippet. If I describe a function or component, write it out." },
            { inlineData: { mimeType, data: base64Audio } }
        ]
    },
    "You are an expert programmer. You listen to a user's voice and transcribe their ideas into code."
);

export const transferCodeStyleStream = (args: { code: string, styleGuide: string }) => streamContent(
    `Rewrite the following code to match the provided style guide.\n\nStyle Guide:\n${args.styleGuide}\n\nCode to rewrite:\n\`\`\`\n${args.code}\n\`\`\``,
    "You are an AI assistant that rewrites code to match a specific style guide. Respond with only the rewritten code in a markdown block.",
    0.3
);

export const generateCodingChallengeStream = (_: any) => streamContent(
    `Generate a new, interesting coding challenge suitable for an intermediate developer. Include a clear problem description, one or two examples, and any constraints. Format it in markdown.`,
    "You are an AI that creates unique and interesting coding challenges for software developers.",
    0.9
);

export const reviewCodeStream = (code: string) => streamContent(
    `Please perform a detailed code review on the following code snippet. Identify potential bugs, suggest improvements for readability and performance, and point out any anti-patterns. Structure your feedback with clear headings.\n\n\`\`\`\n${code}\n\`\`\``,
    "You are a senior software engineer performing a code review. You are meticulous, helpful, and provide constructive feedback.",
    0.6
);

export const generateChangelogFromLogStream = (log: string) => streamContent(
    `Analyze this git log and create a changelog:\n\n\`\`\`\n${log}\n\`\`\``,
    "You are a git expert and project manager. Analyze the provided git log and generate a clean, categorized changelog in Markdown format. Group changes under 'Features' and 'Fixes'.",
    0.6
);

export const enhanceSnippetStream = (code: string) => streamContent(
    `Enhance this code snippet. Add comments, improve variable names, and refactor for clarity or performance if possible.\n\n\`\`\`\n${code}\n\`\`\``,
    "You are a senior software engineer who excels at improving code. Respond with only the enhanced code in a markdown block.",
    0.5
);

export const summarizeNotesStream = (notes: string) => streamContent(
    `Summarize these developer notes into a bulleted list of key points and action items:\n\n${notes}`,
    "You are a productivity assistant who is an expert at summarizing technical notes.",
    0.7
);

export const migrateCodeStream = (code: string, from: string, to: string) => streamContent(
    `Translate this ${from} code to ${to}. Respond with only the translated code in a markdown block.\n\n\`\`\`\n${code}\n\`\`\``,
    `You are an expert polyglot programmer who specializes in migrating code between languages and frameworks.`,
    0.4
);

export const analyzeConcurrencyStream = (code: string) => streamContent(
    `Analyze this JavaScript code for potential concurrency issues, especially related to Web Workers. Identify race conditions, deadlocks, or inefficient data passing.\n\n\`\`\`javascript\n${code}\n\`\`\``,
    "You are an expert in JavaScript concurrency, web workers, and multi-threaded programming concepts.",
    0.6
);

export const debugErrorStream = (error: Error) => streamContent(
    `I encountered an error in my React application. Here are the details:\n    \n    Message: ${error.message}\n    \n    Stack Trace:\n    ${error.stack}\n    \n    Please analyze this error. Provide a brief explanation of the likely cause, followed by a bulleted list of potential solutions or debugging steps. Structure your response in clear, concise markdown.`,
    "You are an expert software engineer specializing in debugging React applications. You provide clear, actionable advice to help developers solve errors."
);

export const convertJsonToXbrlStream = (json: string) => streamContent(
    `Convert the following JSON to a simplified, XBRL-like XML format. Use meaningful tags based on the JSON keys. The root element should be <xbrl>. Do not include XML declarations or namespaces.\n\nJSON:\n${json}`,
    "You are an expert in data formats who converts JSON to clean, XBRL-like XML."
);

// --- Simple Generate Content ---
export const generatePipelineCode = (flow: string): Promise<string> => generateContent(`Based on the following described workflow, generate a single asynchronous JavaScript function that orchestrates the steps. Use placeholder functions for the actual tool logic. The workflow is: ${flow}`, "You are an expert software architect who writes clean, asynchronous JavaScript code to orchestrate complex workflows based on a description.", 0.5);


// --- STRUCTURED JSON ---

export const explainCodeStructured = async (code: string): Promise<StructuredExplanation> => {
    const systemInstruction = "You are an expert software engineer providing a structured analysis of a code snippet.";
    const prompt = `Analyze this code: \n\n\`\`\`\n${code}\n\`\`\``;
    const schema = { type: Type.OBJECT, properties: { summary: { type: Type.STRING }, lineByLine: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { lines: { type: Type.STRING }, explanation: { type: Type.STRING } }, required: ["lines", "explanation"] } }, complexity: { type: Type.OBJECT, properties: { time: { type: Type.STRING }, space: { type: Type.STRING } }, required: ["time", "space"] }, suggestions: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["summary", "lineByLine", "complexity", "suggestions"] };
    return generateJson(prompt, systemInstruction, schema);
}

export const generateThemeFromDescription = async (description: string): Promise<ColorTheme> => {
    const systemInstruction = "You are a UI/UX design expert specializing in color theory. Generate a color theme based on the user's description. Provide hex codes for each color.";
    const prompt = `Generate a color theme for: "${description}"`;
    const schema = { type: Type.OBJECT, properties: { primary: { type: Type.STRING }, background: { type: Type.STRING }, surface: { type: Type.STRING }, textPrimary: { type: Type.STRING }, textSecondary: { type: Type.STRING } }, required: ["primary", "background", "surface", "textPrimary", "textSecondary"] };
    return generateJson(prompt, systemInstruction, schema);
};

export const generateSemanticTheme = (prompt: { parts: any[] }): Promise<SemanticColorTheme> => {
    const systemInstruction = `You are a world-class UI/UX designer with an expert understanding of color theory, accessibility, and branding.
    Your task is to generate a comprehensive, semantically named color theme from a user's prompt (which could be text or an image).
    - Palette colors should be harmonious and versatile.
    - Theme colors must be derived from the palette and assigned to specific UI roles (background, text, etc.).
    - You MUST calculate the WCAG 2.1 contrast ratio for text/background pairs and provide a score (AAA, AA, or Fail).
    - Provide creative, evocative names for each color (e.g., "Midnight Blue", "Dune Sand").`;

    const colorObjectSchema = {
        type: Type.OBJECT,
        properties: {
            value: { type: Type.STRING, description: "The hex code of the color, e.g., #RRGGBB" },
            name: { type: Type.STRING, description: "A creative, evocative name for the color." }
        },
        required: ["value", "name"]
    };

    const accessibilityCheckSchema = {
        type: Type.OBJECT,
        properties: {
            ratio: { type: Type.NUMBER, description: "The calculated contrast ratio." },
            score: { type: Type.STRING, enum: ["AAA", "AA", "Fail"], description: "The WCAG 2.1 accessibility score." }
        },
        required: ["ratio", "score"]
    };

    const schema = {
        type: Type.OBJECT,
        properties: {
            palette: {
                type: Type.OBJECT,
                description: "A harmonious 4-color palette extracted from the prompt.",
                properties: {
                    primary: colorObjectSchema,
                    secondary: colorObjectSchema,
                    accent: colorObjectSchema,
                    neutral: colorObjectSchema,
                },
                required: ["primary", "secondary", "accent", "neutral"]
            },
            theme: {
                type: Type.OBJECT,
                description: "Specific color assignments for UI elements, derived from the palette.",
                properties: {
                    background: colorObjectSchema,
                    surface: colorObjectSchema,
                    textPrimary: colorObjectSchema,
                    textSecondary: colorObjectSchema,
                },
                required: ["background", "surface", "textPrimary", "textSecondary"]
            },
            accessibility: {
                type: Type.OBJECT,
                description: "WCAG 2.1 contrast ratio checks for common text/background pairings.",
                properties: {
                    primaryOnSurface: accessibilityCheckSchema,
                    textPrimaryOnSurface: accessibilityCheckSchema,
                    textSecondaryOnSurface: accessibilityCheckSchema,
                },
                required: ["primaryOnSurface", "textPrimaryOnSurface", "textSecondaryOnSurface"]
            }
        },
        required: ["palette", "theme", "accessibility"]
    };
    return generateJson(prompt, systemInstruction, schema);
};


export const generatePrSummaryStructured = (diff: string): Promise<StructuredPrSummary> => {
    const systemInstruction = "You are an expert programmer who writes excellent PR summaries.";
    const prompt = `Generate a PR summary for the following diff:\n\n\`\`\`diff\n${diff}\n\`\`\``;
    const schema = { type: Type.OBJECT, properties: { title: { type: Type.STRING }, summary: { type: Type.STRING }, changes: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["title", "summary", "changes"] };
    return generateJson(prompt, systemInstruction, schema);
};

export const generateFeature = (prompt: string): Promise<GeneratedFile[]> => {
    const systemInstruction = "You are an AI that generates complete, production-ready React components. Create all necessary files (component, styles, etc.).";
    const userPrompt = `Generate the files for the following feature request: "${prompt}". Make sure to include a .tsx component file.`;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { filePath: { type: Type.STRING }, content: { type: Type.STRING }, description: { type: Type.STRING } }, required: ["filePath", "content", "description"] } };
    return generateJson(userPrompt, systemInstruction, schema);
};

export interface CronParts { minute: string; hour: string; dayOfMonth: string; month: string; dayOfWeek: string; }
export const generateCronFromDescription = (description: string): Promise<CronParts> => {
    const systemInstruction = "You are an expert in cron expressions. Convert the user's description into a valid cron expression parts.";
    const prompt = `Convert this schedule to a cron expression: "${description}"`;
    const schema = { type: Type.OBJECT, properties: { minute: { type: Type.STRING }, hour: { type: Type.STRING }, dayOfMonth: { type: Type.STRING }, month: { type: Type.STRING }, dayOfWeek: { type: Type.STRING } }, required: ["minute", "hour", "dayOfMonth", "month", "dayOfWeek"] };
    return generateJson(prompt, systemInstruction, schema);
};

export const generateColorPalette = (baseColor: string): Promise<{ colors: string[] }> => {
    const systemInstruction = "You are a color theory expert. Generate a 6-color palette based on the given base color.";
    const prompt = `Generate a harmonious 6-color palette based on the color ${baseColor}.`;
    const schema = { type: Type.OBJECT, properties: { colors: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["colors"] };
    return generateJson(prompt, systemInstruction, schema);
};

// --- FUNCTION CALLING ---
export interface CommandResponse { text: string; functionCalls?: { name: string; args: any; }[]; }
export const getInferenceFunction = async (prompt: string, functionDeclarations: FunctionDeclaration[], knowledgeBase: string): Promise<CommandResponse> => {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt, config: { systemInstruction: `You are a helpful assistant for a developer tool. You must decide which function to call to satisfy the user's request, based on your knowledge base. If no specific tool seems appropriate, respond with text.\n\nKnowledge Base:\n${knowledgeBase}`, tools: [{ functionDeclarations }] } });
        const functionCalls: { name: string, args: any }[] = [];
        const parts = response.candidates?.[0]?.content?.parts ?? [];
        for (const part of parts) { if (part.functionCall) { functionCalls.push({ name: part.functionCall.name, args: part.functionCall.args }); } }
        return { text: response.text, functionCalls: functionCalls.length > 0 ? functionCalls : undefined };
    } catch (error) {
        logError(error as Error, { prompt });
        throw error;
    }
};


// --- IMAGE GENERATION (Fetch-based for specific model) ---
export const generateImage = async (prompt: string): Promise<string> => {
    const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent";
    const fetchApiKey = process.env.GEMINI_API_KEY;
    if (!fetchApiKey) throw new Error("Gemini API key not found.");

    const body = { "contents": [{ "parts": [{ "text": prompt }] }], "generationConfig": { "responseModalities": ["TEXT", "IMAGE"] } };
    let lastError: Error | null = null;

    for (let i = 0; i < 3; i++) {
        try {
            const response = await fetch(API_URL, { method: 'POST', headers: { 'x-goog-api-key': fetchApiKey, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            if (!response.ok) throw new Error(`API request failed with status ${response.status}: ${await response.text()}`);
            const data = await response.json();
            const imagePart = data.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
            if (imagePart?.inlineData?.data) return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
            const textResponse = data.candidates?.[0]?.content?.parts?.find((p: any) => p.text)?.text;
            if (textResponse) throw new Error(`API returned text instead of an image: ${textResponse}`);
            throw new Error("API response did not contain valid image data.");
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            logError(lastError, { context: 'generateImageFetch', attempt: i + 1 });
            if (i < 2) await sleep(1000 * Math.pow(2, i));
        }
    }
    throw new Error(`Failed to generate image after 3 attempts. Last error: ${lastError?.message}`);
};

export const generateImageFromImageAndText = async (prompt: string, base64Image: string, mimeType: string): Promise<string> => {
    const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent";
    const fetchApiKey = process.env.GEMINI_API_KEY;
    if (!fetchApiKey) throw new Error("Gemini API key not found.");

    const body = { "contents": [{ "parts": [{ "text": prompt }, { "inlineData": { "mimeType": mimeType, "data": base64Image } }] }], "generationConfig": { "responseModalities": ["TEXT", "IMAGE"] } };
    try {
        const response = await fetch(API_URL, { method: 'POST', headers: { 'x-goog-api-key': fetchApiKey, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (!response.ok) throw new Error(`API request failed with status ${response.status}: ${await response.text()}`);
        const data = await response.json();
        const imagePart = data.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
        if (imagePart?.inlineData?.data) return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
        const textResponse = data.candidates?.[0]?.content?.parts?.find((p: any) => p.text)?.text;
        if (textResponse) throw new Error(`API returned text instead of an image: ${textResponse}`);
        throw new Error("API response did not contain valid image data.");
    } catch (error) {
        logError(error as Error, { context: 'generateImageFromImageAndTextFetch' });
        throw error;
    }
};