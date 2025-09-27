/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Type, FunctionDeclaration } from "@google/genai";
import { streamContent, generateJson, generateContent, fetchFromProxy, openApiParseSchema, CommandResponse, CronParts } from './core.ts';
import type { SemanticColorTheme, FileNode, CustomFeature } from '../../types.ts';

export const fileTreeToString = (node: FileNode, indent = 0): string => {
    let str = ' '.repeat(indent) + (node.type === 'folder' ? `/${node.name}` : node.name) + '\n';
    if (node.children) {
        node.children.forEach(child => {
            str += fileTreeToString(child, indent + 2);
        });
    }
    return str;
};

// --- Tool-Specific Functions ---
export const generateImage = async (prompt: string): Promise<string> => {
    const response = await fetchFromProxy('/generateImages', {
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: { numberOfImages: 1, outputMimeType: 'image/png' },
    });
    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/png;base64,${base64ImageBytes}`;
};

export const generateImageFromImageAndText = async (prompt: string, base64Image: string, mimeType: string): Promise<string> => {
    console.warn("Image-to-image generation is simulated; using text prompt only.");
    return generateImage(prompt);
};

export const generateSemanticTheme = (prompt: { parts: any[] }): Promise<SemanticColorTheme> => {
    const systemInstruction = `You are a world-class UI/UX designer with an expert understanding of color theory, accessibility, and branding. Your task is to generate a comprehensive, semantically named color theme from a user's prompt.`;
    const colorObjectSchema = { type: Type.OBJECT, properties: { value: { type: Type.STRING }, name: { type: Type.STRING } }, required: ["value", "name"] };
    const accessibilityCheckSchema = { type: Type.OBJECT, properties: { ratio: { type: Type.NUMBER }, score: { type: Type.STRING, enum: ["AAA", "AA", "Fail"] } }, required: ["ratio", "score"] };
    const schema = { type: Type.OBJECT, properties: { mode: { type: Type.STRING, enum: ["light", "dark"] }, palette: { type: Type.OBJECT, properties: { primary: colorObjectSchema, secondary: colorObjectSchema, accent: colorObjectSchema, neutral: colorObjectSchema, }, required: ["primary", "secondary", "accent", "neutral"] }, theme: { type: Type.OBJECT, properties: { background: colorObjectSchema, surface: colorObjectSchema, textPrimary: colorObjectSchema, textSecondary: colorObjectSchema, textOnPrimary: colorObjectSchema, border: colorObjectSchema, }, required: ["background", "surface", "textPrimary", "textSecondary", "textOnPrimary", "border"] }, accessibility: { type: Type.OBJECT, properties: { primaryOnSurface: accessibilityCheckSchema, textPrimaryOnSurface: accessibilityCheckSchema, textSecondaryOnSurface: accessibilityCheckSchema, textOnPrimaryOnPrimary: accessibilityCheckSchema, }, required: ["primaryOnSurface", "textPrimaryOnSurface", "textSecondaryOnSurface", "textOnPrimaryOnPrimary"] } }, required: ["mode", "palette", "theme", "accessibility"] };
    return generateJson(prompt, systemInstruction, schema);
};

export const getInferenceFunction = async (prompt: string, functionDeclarations: FunctionDeclaration[], knowledgeBase: string): Promise<CommandResponse> => {
    const response = await fetchFromProxy('/generateContent', {
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            systemInstruction: `You are a helpful assistant for a developer tool. You must decide which function to call to satisfy the user's request, based on your knowledge base. If no specific tool seems appropriate, respond with text.\n\nKnowledge Base:\n${knowledgeBase}`,
            tools: [{ functionDeclarations }]
        }
    });
    const functionCalls: { name: string, args: any }[] = [];
    const parts = response.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) { if (part.functionCall) { functionCalls.push({ name: part.functionCall.name, args: part.functionCall.args }); } }
    return { text: response.text, functionCalls: functionCalls.length > 0 ? functionCalls : undefined };
};

export const generateMockData = (schemaDescription: string, count: number): Promise<any[]> => {
    const prompt = `Generate an array of ${count} mock data objects based on this schema description: "${schemaDescription}"`;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: {} } };
    return generateJson(prompt, "You are an expert at generating realistic mock data. You only respond with a valid JSON array of objects.", schema);
};

export const parseOpenApiForMocking = (spec: string): Promise<{ routes: { path: string, method: string, schemaName: string }[], schemas: { name: string, description: string }[] }> => {
    const systemInstruction = `You are an expert API engineer. Your task is to parse an OpenAPI 3 specification provided in YAML format and extract key information for setting up a mock server.

You need to identify:
1. All the defined schemas in the 'components/schemas' section. For each schema, create a concise, natural language description of its properties. This description will be used by another AI to generate mock data. For example, for a schema with 'user_id' (integer) and 'name' (string), the description could be "a user object with a numeric user_id and a string name".
2. All the API routes (paths and their HTTP methods). For each route, you must determine which schema from the 'components/schemas' section should be used for a successful response (e.g., a 200 or 201 response). Extract the schema name from the '$ref' property. For example, if a response schema is '$ref: "#/components/schemas/account_detail"', the schemaName is 'account_detail'.

You must return a single JSON object that strictly adheres to the provided schema.`;

    const prompt = `Parse the following OpenAPI specification:\n\n\`\`\`yaml\n${spec}\n\`\`\``;

    return generateJson(prompt, systemInstruction, openApiParseSchema, 0.1);
};

export const generateWeeklyDigest = (commitLogs: string, telemetry: any): Promise<string> => {
    const prompt = `Generate a concise and engaging weekly digest email in HTML format for a project manager. The email should summarize the key achievements and project health based on the provided data.\n\nRecent Commits:\n${commitLogs}\n\nPerformance Telemetry:\n${JSON.stringify(telemetry, null, 2)}`;
    return generateContent(prompt, "You are an AI assistant that writes engaging project summary emails for stakeholders. Respond with only the raw HTML for the email body.");
};

export const generateColorPalette = (baseColor: string): Promise<{ colors: string[] }> => {
    const prompt = `Generate a 6-color palette based on the hex color ${baseColor}. The palette should be harmonious and suitable for a web UI. Include shades from light to dark.`;
    const schema = { type: Type.OBJECT, properties: { colors: { type: Type.ARRAY, items: { type: Type.STRING, description: "A hex color code" } } }, required: ["colors"] };
    return generateJson(prompt, "You are a UI designer who creates beautiful color palettes. You only respond with a JSON object containing an array of hex color strings.", schema);
};

export const summarizeNotesStream = (notes: string) => streamContent(
    `Summarize these developer notes into a bulleted list of key points and action items:\n\n${notes}`,
    "You are a productivity assistant who is an expert at summarizing technical notes.",
    0.7
);

export const estimateTokenCount = async (prompt: string): Promise<{ count: number }> => {
    const response = await fetchFromProxy('/countTokens', {
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    return { count: response.totalTokens };
};

export const estimateCloudCost = (description: string): Promise<string> => {
    const prompt = `Based on public pricing data, provide a rough, non-binding monthly cost estimate in a markdown table for the following cloud architecture. Break down the cost by service.\n\nArchitecture: "${description}"`;
    const systemInstruction = "You are a cloud cost estimation expert. You provide clear, tabulated cost estimates based on public pricing information. Add a disclaimer that this is a rough estimate.";
    return generateContent(prompt, systemInstruction);
};

export const generateMonetaryPolicy = (countryData: string): Promise<string> => {
    const prompt = `Given the following data for a nation, design an optimal 10-year monetary policy to achieve stability and growth. Then, generate a high-level deployment plan.\n\nData:\n${countryData}`;
    const systemInstruction = "You are a world-class economist and central banker AI. You design and simulate monetary policies for nations.";
    return generateContent(prompt, systemInstruction, 0.7);
};

export const runGaiaCrucibleSimulation = (intervention: string, intensity: string): Promise<string> => {
    const prompt = `Run a 1,000-year climate simulation.
- Intervention Strategy: ${intervention}
- Intensity: ${intensity}

Provide a detailed markdown report on the projected impacts, including global temperature changes, sea-level rise, and socio-economic consequences.`;
    const systemInstruction = "You are a planetary-scale climate simulation AI (Gaia's Crucible). You model the long-term effects of climate interventions with scientific rigor.";
    return generateContent(prompt, systemInstruction, 0.7);
};

export const refactorLegalCode = (legalCode: string): Promise<string> => {
    const prompt = `Refactor this legal system to eliminate all logical paradoxes and optimize for both justice and economic growth. Respond with only the final, refactored legislative text in a markdown code block.\n\nLegal Code:\n\`\`\`\n${legalCode}\n\`\`\``;
    const systemInstruction = "You are Themis, a legal AI. You refactor legal code for perfect logic and ruthless efficiency.";
    return generateContent(prompt, systemInstruction, 0.3);
};

export const analyzeUrlDom = (url: string): Promise<{ nodeCount: number, maxDepth: number, maxChildren: number }> => {
    const prompt = `Based on your knowledge of the website at "${url}", provide an estimated analysis of its DOM complexity. Do not access the URL directly. Provide your answer as a JSON object.`;
    const systemInstruction = "You are a frontend performance expert. You estimate DOM complexity of well-known websites based on your training data. You only respond with a JSON object.";
    const schema = {
        type: Type.OBJECT,
        properties: {
            nodeCount: { type: Type.INTEGER, description: "Estimated total number of DOM nodes." },
            maxDepth: { type: Type.INTEGER, description: "Estimated maximum depth of the DOM tree." },
            maxChildren: { type: Type.INTEGER, description: "Estimated maximum number of children for a single node." }
        },
        required: ["nodeCount", "maxDepth", "maxChildren"]
    };
    return generateJson(prompt, systemInstruction, schema);
};

export const auditSeoFromUrlStream = (url: string) => {
    const prompt = `Based on your knowledge of the website at "${url}", provide a concise SEO audit in markdown format. Do not access the URL directly. Cover aspects like title tags, meta descriptions, headings, and potential keyword opportunities.`;
    const systemInstruction = "You are an SEO expert who provides actionable audits of websites based on your training data.";
    return streamContent(prompt, systemInstruction);
};

export const generateWebhookPayload = (prompt: string): Promise<string> => {
    const systemInstruction = "You are an expert at generating realistic, valid JSON webhook payloads for various services (like GitHub, Stripe, etc.). You respond with only the JSON payload in a markdown block.";
    return generateContent(`Generate a webhook payload for: "${prompt}"`, systemInstruction);
};

export const decomposeUserFlow = (flow: string): Promise<{ steps: string[] }> => {
    const prompt = `Decompose the following user flow description into a series of simple, distinct steps. Each step should describe a single screen or user interaction.\n\nFlow: "${flow}"`;
    const systemInstruction = "You are a UX designer who breaks down user flows into simple steps. Respond only with a JSON object containing an array of step strings.";
    const schema = { type: Type.OBJECT, properties: { steps: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["steps"] };
    return generateJson(prompt, systemInstruction, schema);
};

export const generateUserPersona = (description: string): Promise<{ name: string, photoDescription: string, demographics: string, goals: string[], frustrations: string[], techStack: string }> => {
    const prompt = `Create a detailed user persona based on the following description: "${description}". Invent a realistic name and provide a simple, SFW description for an AI image generator to create their photo.`;
    const systemInstruction = "You are a UX researcher and product manager who creates detailed, empathetic user personas.";
    const schema = {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING },
            photoDescription: { type: Type.STRING },
            demographics: { type: Type.STRING },
            goals: { type: Type.ARRAY, items: { type: Type.STRING } },
            frustrations: { type: Type.ARRAY, items: { type: Type.STRING } },
            techStack: { type: Type.STRING }
        },
        required: ["name", "photoDescription", "demographics", "goals", "frustrations", "techStack"]
    };
    return generateJson(prompt, systemInstruction, schema);
};

export const analyzeCompetitorUrl = (url: string): Promise<string> => {
    const prompt = `Based on your training data, analyze the website at the URL "${url}". Provide a markdown summary of its likely tech stack (frontend, backend, key libraries), main features, and target audience. Do not attempt to access the URL directly.`;
    const systemInstruction = "You are a market and technology analyst. You provide concise competitive analyses of websites based on your existing knowledge.";
    return generateContent(prompt, systemInstruction);
};

export const generateComponentFromImageStream = (base64Image: string) => streamContent(
    { parts: [{ text: "Generate a React component with Tailwind CSS based on this UI screenshot." }, { inlineData: { mimeType: 'image/png', data: base64Image } }] },
    "You are an expert at creating React components from images. You respond with only the component code in a markdown block."
);

export const transcribeAudioToCodeStream = (base64Audio: string, mimeType: string) => streamContent(
    { parts: [{ text: "Transcribe the following audio recording into a functional code snippet. Infer the language and functionality from the speech." }, { inlineData: { mimeType, data: base64Audio } }] },
    "You are a specialized AI that converts spoken descriptions of code into functional code snippets."
);

export const generateCronFromDescription = (description: string): Promise<CronParts> => {
    const prompt = `Convert the following description into its five cron parts (minute, hour, day of month, month, day of week). Use standard cron syntax, like '*' for every, or '1-5' for a range.\n\nDescription: "${description}"`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            minute: { type: Type.STRING },
            hour: { type: Type.STRING },
            dayOfMonth: { type: Type.STRING },
            month: { type: Type.STRING },
            dayOfWeek: { type: Type.STRING },
        },
        required: ["minute", "hour", "dayOfMonth", "month", "dayOfWeek"],
    };
    return generateJson(prompt, "You are an expert at converting natural language to cron expressions. You respond only with a JSON object of the cron parts.", schema);
};

// Fix: Add missing function generateRegExStream
export const generateRegExStream = (description: string) => streamContent(
    `Generate a JavaScript regex literal that matches the following description: "${description}". Respond with only the regex literal itself, without any explanation or markdown backticks.`,
    "You are an expert at writing regular expressions. You only respond with the regex literal.",
    0.3
);

// Fix: Add missing function generatePostmortem
export const generatePostmortem = (details: any): Promise<string> => {
    const prompt = `Generate a blameless post-mortem document in markdown format based on the following details:\n\n${JSON.stringify(details, null, 2)}`;
    return generateContent(prompt, "You are a senior site reliability engineer who writes clear, blameless post-mortems.");
};

// Fix: Add missing function anonymizeData
export const anonymizeData = (data: string, fields: string[]): Promise<{ anonymizedData: string }> => {
    const prompt = `Anonymize the following data by replacing the values in the specified fields with realistic-looking fake data. Maintain the original format (JSON or CSV). Fields to anonymize: ${fields.join(', ')}.\n\nData:\n${data}`;
    const schema = { type: Type.OBJECT, properties: { anonymizedData: { type: Type.STRING } }, required: ["anonymizedData"] };
    return generateJson(prompt, "You are a data anonymization expert. You only respond with a JSON object containing the anonymized data string.", schema);
};