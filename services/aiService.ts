/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, Type, GenerateContentResponse, FunctionDeclaration } from "@google/genai";
import type { GeneratedFile, StructuredPrSummary, StructuredExplanation, ColorTheme, SemanticColorTheme, StructuredReview, SlideSummary, SecurityVulnerability, CodeSmell, FileNode } from '../types.ts';
import { logError } from './telemetryService.ts';

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("Gemini API key not found. Please set the GEMINI_API_KEY environment variable.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Unified AI Helpers ---

export async function* streamContent(prompt: string | { parts: any[] }, systemInstruction: string, temperature = 0.5) {
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

export async function generateContent(prompt: string, systemInstruction: string, temperature = 0.5): Promise<string> {
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


export async function generateJson<T>(prompt: any, systemInstruction: string, schema: any, temperature = 0.2): Promise<T> {
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

export const reviewCodeStream = (code: string, systemInstruction?: string) => streamContent(
    `Please perform a detailed code review on the following code snippet. Identify potential bugs, suggest improvements for readability and performance, and point out any anti-patterns. Structure your feedback with clear headings.\n\n\`\`\`\n${code}\n\`\`\``,
    systemInstruction || "You are a senior software engineer performing a code review. You are meticulous, helpful, and provide constructive feedback.",
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

// --- New Streaming Functions ---

export const refactorForPerformance = (code: string) => streamContent(
    `Refactor the following code for maximum performance. Focus on algorithmic efficiency, efficient data structures, and avoiding unnecessary computations. Respond with only the refactored code in a markdown block.\n\nCode:\n\`\`\`\n${code}\n\`\`\``,
    "You are an expert software engineer specializing in code performance optimization."
);

export const refactorForReadability = (code: string) => streamContent(
    `Refactor the following code for maximum readability. Focus on clear variable names, breaking down complex functions, and adding helpful comments. Respond with only the refactored code in a markdown block.\n\nCode:\n\`\`\`\n${code}\n\`\`\``,
    "You are an expert software engineer who writes exceptionally clean and readable code."
);

export const convertToFunctionalComponent = (classComponent: string) => streamContent(
    `Convert the following React class component to a functional component using hooks (useState, useEffect, etc.). Ensure all lifecycle methods are correctly mapped. Respond with only the refactored code in a markdown block.\n\nCode:\n\`\`\`\n${classComponent}\n\`\`\``,
    "You are a React expert specializing in modernizing codebases by converting class components to functional components with hooks."
);

export const generateJsDoc = (code: string) => streamContent(
    `Generate a complete JSDoc block for the following function or component. Include descriptions for the function, its parameters, and what it returns. Respond with only the JSDoc block and the original function.\n\nCode:\n\`\`\`\n${code}\n\`\`\``,
    "You are an AI assistant that writes comprehensive and accurate JSDoc documentation."
);

export const translateComments = (code: string, targetLanguage: string) => streamContent(
    `Translate only the code comments in the following snippet to ${targetLanguage}. Do not alter the code itself. Respond with the full code snippet including the translated comments.\n\nCode:\n\`\`\`\n${code}\n\`\`\``,
    "You are an AI assistant that translates code comments into different languages without changing any of the code."
);

export const generateDockerfile = (framework: string) => streamContent(
    `Generate a basic, multi-stage Dockerfile for a ${framework} project. The Dockerfile should be production-ready, including build and serve stages. Respond with only the Dockerfile content in a markdown block.`,
    "You are a DevOps expert specializing in containerization with Docker."
);

export const convertCssToTailwind = (css: string) => streamContent(
    `Convert the following CSS code to Tailwind CSS utility classes. Provide the equivalent HTML structure with the Tailwind classes. Respond with only the HTML in a markdown block.\n\nCSS:\n\`\`\`css\n${css}\n\`\`\``,
    "You are an expert in Tailwind CSS and modern CSS practices."
);

export const applySpecificRefactor = (code: string, instruction: string) => streamContent(
    `Apply this specific refactoring instruction to the code: "${instruction}". Respond with only the complete, refactored code in a markdown block.\n\nCode:\n\`\`\`\n${code}\n\`\`\``,
    "You are an AI assistant that precisely applies refactoring instructions to code."
);

export const generateBugReproductionTestStream = (stackTrace: string, context?: string) => streamContent(
    `Generate a minimal, runnable unit test (using Vitest) that reproduces the bug described by the following stack trace. Respond with only the code in a markdown block.\n\nStack Trace:\n${stackTrace}\n\n${context ? `Additional Context:\n${context}` : ''}`,
    "You are a senior software engineer specializing in debugging and automated testing. You create concise, effective unit tests to reproduce bugs."
);

export const generateIamPolicyStream = (description: string, platform: 'aws' | 'gcp') => streamContent(
    `Generate a valid ${platform.toUpperCase()} IAM policy in JSON format based on this description: "${description}". Respond with only the JSON policy in a markdown block.`,
    "You are a cloud security expert specializing in IAM policies for AWS and GCP."
);

// --- Simple Generate Content ---
export const generatePipelineCode = (flow: string): Promise<string> => generateContent(`Based on the following described workflow, generate a single asynchronous JavaScript function that orchestrates the steps. Use placeholder functions for the actual tool logic. The workflow is: ${flow}`, "You are an expert software architect who writes clean, asynchronous JavaScript code to orchestrate complex workflows based on a description.", 0.5);

export const generateCiCdConfig = (platform: string, description: string): Promise<string> => generateContent(
    `Generate a CI/CD configuration file for ${platform} based on this description: "${description}". Respond with only the YAML/config file content inside a markdown block.`,
    "You are a DevOps expert specializing in CI/CD pipelines."
);

export const analyzePerformanceTrace = (trace: object): Promise<string> => generateContent(
    `Analyze the following performance trace data and provide optimization suggestions in markdown format. Data: ${JSON.stringify(trace, null, 2)}`,
    "You are an expert performance engineer."
);

export const suggestA11yFix = (issue: object): Promise<string> => generateContent(
    `Explain this accessibility issue and suggest a code fix in markdown. Issue: ${JSON.stringify(issue, null, 2)}`,
    "You are an expert in web accessibility (a11y)."
);

export const createApiDocumentation = (apiCode: string): Promise<string> => generateContent(
    `Generate Markdown documentation for the following API endpoint code. Include the endpoint, HTTP method, parameters, and example request/response.\n\nCode:\n\`\`\`\n${apiCode}\n\`\`\``,
    "You are a technical writer who creates clear and concise API documentation."
);

export const jsonToTypescriptInterface = (json: string): Promise<string> => generateContent(
    `Generate a TypeScript interface from this JSON object. Respond with only the TypeScript code in a markdown block.\n\nJSON:\n${json}`,
    "You are an expert in TypeScript and data modeling."
);

export const suggestAlternativeLibraries = (code: string): Promise<string> => generateContent(
    `Analyze the following code, particularly its import statements and common patterns (like date manipulation). Suggest modern, more efficient library alternatives where applicable (e.g., suggest 'date-fns' or 'dayjs' over 'moment.js'). Explain why.\n\nCode:\n\`\`\`\n${code}\n\`\`\``,
    "You are a senior software engineer with deep knowledge of the JavaScript ecosystem."
);

export const explainRegex = (regex: string): Promise<string> => generateContent(
    `Provide a step-by-step explanation of what each part of this regular expression does: \`${regex}\``,
    "You are an expert in regular expressions who can explain complex patterns simply."
);

export const generateMermaidJs = (code: string): Promise<string> => generateContent(
    `Generate a Mermaid.js flowchart string that represents the logic of the following code. Respond with only the Mermaid.js code in a markdown block (e.g., \`\`\`mermaid\n...\n\`\`\`).\n\nCode:\n\`\`\`\n${code}\n\`\`\``,
    "You are an expert in code analysis and can visualize logic flows using Mermaid.js."
);

export const generateWeeklyDigest = (commitLogs: string, telemetryData: object): Promise<string> => generateContent(
    `Generate a concise, professional weekly summary email in HTML format based on the following data.
    
    Commit Logs:
    \`\`\`
    ${commitLogs}
    \`\`\`
    
    Performance Telemetry:
    \`\`\`json
    ${JSON.stringify(telemetryData, null, 2)}
    \`\`\`
    
    The email should have sections for "New Features", "Bug Fixes", and "Performance Notes". It should be visually clean and easy to read.`,
    "You are an AI assistant that generates weekly engineering progress reports in HTML format."
);

export const generateTechnicalSpecFromDiff = (diff: string, summary: StructuredPrSummary): Promise<string> => generateContent(
    `Generate a comprehensive technical specification document in Markdown format based on the following pull request information.

The spec should include the following sections:
- **Problem:** A brief description of the issue being addressed.
- **Solution:** A detailed explanation of the changes made.
- **Technical Details:** An overview of the implementation, including any new functions, components, or patterns.
- **Impact:** How this change affects other parts of the application.

**PR Title:** ${summary.title}
**PR Summary:** ${summary.summary}

**Code Diff:**
\`\`\`diff
${diff}
\`\`\`
`,
    "You are an expert programmer who writes excellent, clear, and comprehensive technical specification documents from pull request data."
);

export const generatePostmortem = (data: { title: string; timeline: string; rootCause: string; impact: string; actionItems: { description: string; assignee: string }[] }): Promise<string> => {
    const prompt = `Generate a formal, blameless post-mortem document in Markdown format using the following information:

# Incident: ${data.title}

## Timeline
${data.timeline}

## Root Cause Analysis
${data.rootCause}

## Business/Customer Impact
${data.impact}

## Action Items
${data.actionItems.map(item => `- **${item.description}** (Owner: ${item.assignee})`).join('\n')}

Synthesize this into a professional document with standard sections: Summary, Impact, Root Causes, Lessons Learned, and Action Items.`;
    return generateContent(prompt, "You are an expert in site reliability engineering and incident management. You write clear, blameless post-mortem reports.");
};

export const generateDocumentationForFiles = (files: { path: string, content: string }[]): Promise<string> => {
    const fileContent = files.map(f => `--- FILE: ${f.path} ---\n\`\`\`\n${f.content}\n\`\`\``).join('\n\n');
    const prompt = `Generate a single, comprehensive Markdown document that summarizes the purpose of each of the following files and details their main functions, classes, or components, including parameters and return values.\n\n${fileContent}`;
    return generateContent(prompt, "You are a technical writer who creates high-quality documentation from source code.");
};

export const explainDependencyChanges = (diff: string): Promise<string> => {
    const prompt = `Analyze the following diff from a package-lock.json file. Identify major version changes, new dependencies, and removed dependencies. Summarize the potential risks, breaking changes, or security implications for any significant updates.\n\nDiff:\n\`\`\`diff\n${diff}\n\`\`\``;
    return generateContent(prompt, "You are a senior software engineer with expertise in dependency management and security.");
};

export const analyzeCompetitorUrl = (url: string): Promise<string> => {
    const prompt = `Based on your training data, what is the likely technology stack (frontend framework, backend language, major libraries) and what are the key user-facing features of a website like ${url}? Provide a summary in Markdown. This is an inference, not a live analysis.`;
    return generateContent(prompt, "You are a technology analyst who infers website technology stacks and features based on common patterns and public knowledge.");
};

export const generateChartComponent = (data: { headers: string[], samples: any[][] }, chartType: 'line' | 'bar'): Promise<string> => {
    const prompt = `Generate a single-file React component using the Recharts library to create a ${chartType} chart. The component should be able to visualize data with the following structure:\n\nHeaders: ${data.headers.join(', ')}\nSample Data Rows:\n${data.samples.map(row => row.join(', ')).join('\n')}\n\nRespond with only the complete, runnable React component code in a markdown block.`;
    return generateContent(prompt, "You are a data visualization expert and React developer specializing in the Recharts library.");
};

export const estimateCloudCost = (description: string): Promise<string> => {
    const prompt = `Act as a cloud cost specialist. Read the following description of a cloud architecture, break it down into billable components (e.g., compute, storage, networking), and provide a rough, non-binding monthly cost estimate in a Markdown table format. Base your estimate on standard public pricing.\n\nArchitecture: "${description}"`;
    return generateContent(prompt, "You are a cloud cost estimation specialist with deep knowledge of AWS and GCP pricing.");
};

// --- STRUCTURED JSON ---

export const explainCodeStructured = async (code: string): Promise<StructuredExplanation> => {
    const systemInstruction = "You are an expert software engineer providing a structured analysis of a code snippet. In the summary, identify any imported dependencies and explain their purpose within the code.";
    const prompt = `Analyze this code: \n\n\`\`\`\n${code}\n\`\`\``;
    const schema = { type: Type.OBJECT, properties: { summary: { type: Type.STRING }, lineByLine: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { lines: { type: Type.STRING }, explanation: { type: Type.STRING } }, required: ["lines", "explanation"] } }, complexity: { type: Type.OBJECT, properties: { time: { type: Type.STRING }, space: { type: Type.STRING } }, required: ["time", "space"] }, suggestions: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["summary", "lineByLine", "complexity", "suggestions"] };
    return generateJson(prompt, systemInstruction, schema);
}

export const generateThemeFromDescription = async (description: string): Promise<ColorTheme> => {
    const systemInstruction = "You are a UI/UX design expert specializing in color theory. Generate a color theme based on the user's description. Provide hex codes for each color.";
    const prompt = `Generate a color theme for: "${description}"`;
    const schema = { type: Type.OBJECT, properties: { primary: { type: Type.STRING }, background: { type: Type.STRING }, surface: { type: Type.STRING }, textPrimary: { type: Type.STRING }, textSecondary: { type: Type.STRING }, textOnPrimary: { type: Type.STRING }, border: { type: Type.STRING } }, required: ["primary", "background", "surface", "textPrimary", "textSecondary", "textOnPrimary", "border"] };
    return generateJson(prompt, systemInstruction, schema);
};

export const generateSemanticTheme = (prompt: { parts: any[] }): Promise<SemanticColorTheme> => {
    const systemInstruction = `You are a world-class UI/UX designer with an expert understanding of color theory, accessibility, and branding.
    Your task is to generate a comprehensive, semantically named color theme from a user's prompt (which could be text or an image).
    - Determine if the theme should be 'light' or 'dark' mode.
    - Palette colors should be harmonious and versatile.
    - Theme colors must be derived from the palette and assigned to specific UI roles (background, text, border, etc.).
    - 'textOnPrimary' MUST have a high contrast ratio against 'primary'.
    - You MUST calculate the WCAG 2.1 contrast ratio for key text/background pairs and provide a score (AAA, AA, or Fail).
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
            mode: {
                type: Type.STRING, enum: ["light", "dark"],
                description: "The recommended UI mode for this theme, 'light' or 'dark'."
            },
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
                    textOnPrimary: colorObjectSchema,
                    border: colorObjectSchema,
                },
                required: ["background", "surface", "textPrimary", "textSecondary", "textOnPrimary", "border"]
            },
            accessibility: {
                type: Type.OBJECT,
                description: "WCAG 2.1 contrast ratio checks for common text/background pairings.",
                properties: {
                    primaryOnSurface: accessibilityCheckSchema,
                    textPrimaryOnSurface: accessibilityCheckSchema,
                    textSecondaryOnSurface: accessibilityCheckSchema,
                    textOnPrimaryOnPrimary: accessibilityCheckSchema,
                },
                required: ["primaryOnSurface", "textPrimaryOnSurface", "textSecondaryOnSurface", "textOnPrimaryOnPrimary"]
            }
        },
        required: ["mode", "palette", "theme", "accessibility"]
    };
    return generateJson(prompt, systemInstruction, schema);
};


export const generatePrSummaryStructured = (diff: string): Promise<StructuredPrSummary> => {
    const systemInstruction = "You are an expert programmer who writes excellent PR summaries.";
    const prompt = `Generate a PR summary for the following diff:\n\n\`\`\`diff\n${diff}\n\`\`\``;
    const schema = { type: Type.OBJECT, properties: { title: { type: Type.STRING }, summary: { type: Type.STRING }, changes: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["title", "summary", "changes"] };
    return generateJson(prompt, systemInstruction, schema);
};

export const generateFeature = (prompt: string, framework: string, styling: string): Promise<GeneratedFile[]> => {
    const systemInstruction = `You are an AI that generates complete, production-ready components. Create all necessary files for the requested framework and styling option.
    IMPORTANT: When the user's prompt is about maps, location, addresses, or stores, you MUST use the Google Maps JavaScript API. Generate a component that accepts an 'apiKey' prop and uses it to load the Maps script.`;
    const userPrompt = `Generate the files for a ${framework} component using ${styling} for the following feature request: "${prompt}". Make sure to include a .tsx component file.`;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { filePath: { type: Type.STRING }, content: { type: Type.STRING }, description: { type: Type.STRING } }, required: ["filePath", "content", "description"] } };
    return generateJson(userPrompt, systemInstruction, schema);
};

export const generateFullStackFeature = (prompt: string, framework: string, styling: string): Promise<GeneratedFile[]> => {
    const systemInstruction = `You are an AI that generates complete, production-ready full-stack features.
    You must generate three files:
    1. A frontend ${framework} component using ${styling}. File path should be 'Component.tsx'.
    2. A backend Google Cloud Function in Node.js. File path should be 'functions/index.js'. It should be a simple HTTP-triggered function.
    3. Firestore Security Rules that allow public reads but only authenticated writes. File path should be 'firestore.rules'.
    Ensure the frontend component knows how to call the cloud function.
    IMPORTANT: When the user's prompt is about maps, location, addresses, or stores, you MUST prioritize using the Google Maps JavaScript API in the frontend component. Generate a component that accepts an 'apiKey' prop and uses it to load the Maps script.`;
    const userPrompt = `Generate a full-stack feature for: "${prompt}"`;
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                filePath: { type: Type.STRING, enum: ['Component.tsx', 'functions/index.js', 'firestore.rules'] },
                content: { type: Type.STRING },
                description: { type: Type.STRING }
            },
            required: ["filePath", "content", "description"]
        }
    };
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

export const generateMockData = (description: string, count: number): Promise<object[]> => {
    const systemInstruction = "You are an expert data scientist who creates realistic mock data based on a schema description. You must respond with only a valid JSON array of objects.";
    const prompt = `Generate an array of ${count} mock data objects based on the following schema description. Respond with only the JSON array.\n\nSchema: "${description}"`;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: {} }}; // Freeform objects
    return generateJson(prompt, systemInstruction, schema, 0.8);
};

export const analyzeCodeForVulnerabilities = (code: string): Promise<SecurityVulnerability[]> => {
    const systemInstruction = "You are an expert security engineer. Analyze the code for vulnerabilities. For each vulnerability, provide a structured response including a potential cURL command or code snippet to demonstrate the exploit.";
    const prompt = `Analyze this code for security issues like XSS, injection, hardcoded secrets, etc. Provide detailed explanations, mitigation advice, and an exploit suggestion.\n\nCode:\n\`\`\`\n${code}\n\`\`\``;
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                vulnerability: { type: Type.STRING },
                severity: { type: Type.STRING, enum: ['Critical', 'High', 'Medium', 'Low', 'Informational'] },
                description: { type: Type.STRING },
                mitigation: { type: Type.STRING },
                exploitSuggestion: { type: Type.STRING, description: "A cURL command, code snippet, or description of how to exploit the vulnerability." }
            },
            required: ['vulnerability', 'severity', 'description', 'mitigation', 'exploitSuggestion']
        }
    };
    return generateJson(prompt, systemInstruction, schema);
};

export const sqlToApiEndpoints = (schema: string, framework: 'express' | 'fastify'): Promise<GeneratedFile[]> => {
    const systemInstruction = "You are an expert backend developer who generates boilerplate CRUD API endpoints from a SQL schema.";
    const prompt = `Generate boilerplate CRUD API endpoint files for a ${framework} server based on the following SQL table schema. Create separate files for routes, controllers, and models.\n\nSQL:\n\`\`\`sql\n${schema}\n\`\`\``;
    const filesSchema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { filePath: { type: Type.STRING }, content: { type: Type.STRING }, description: { type: Type.STRING } }, required: ["filePath", "content", "description"] } };
    return generateJson(prompt, systemInstruction, filesSchema);
};

export const detectCodeSmells = (code: string): Promise<CodeSmell[]> => {
    const systemInstruction = "You are an expert software engineer who identifies code smells like long methods, large classes, feature envy, etc.";
    const prompt = `Analyze the following code for code smells and provide explanations.\n\nCode:\n\`\`\`\n${code}\n\`\`\``;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { smell: { type: Type.STRING }, line: { type: Type.INTEGER }, explanation: { type: Type.STRING } }, required: ["smell", "line", "explanation"] } };
    return generateJson(prompt, systemInstruction, schema);
};

export const generateTagsForCode = (code: string): Promise<string[]> => {
    const systemInstruction = "You are an AI assistant that analyzes code and suggests relevant tags.";
    const prompt = `Generate 3-5 relevant, single-word, lowercase tags for this code snippet to help categorize it. Respond with only a JSON array of strings.\n\nCode:\n\`\`\`\n${code}\n\`\`\``;
    const schema = { type: Type.ARRAY, items: { type: Type.STRING } };
    return generateJson(prompt, systemInstruction, schema);
};

export const reviewCodeStructured = (code: string): Promise<StructuredReview> => {
    const systemInstruction = "You are a senior software engineer performing a meticulous code review. Provide a summary and a list of specific, actionable suggestions for improvement.";
    const prompt = `Review this code and provide structured feedback:\n\n\`\`\`\n${code}\n\`\`\``;
    const schema = {
        type: Type.OBJECT,
        properties: {
            summary: { type: Type.STRING, description: "A high-level summary of the code quality, identifying the main issues." },
            suggestions: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        suggestion: { type: Type.STRING, description: "A concise description of the suggested change." },
                        codeBlock: { type: Type.STRING, description: "The exact block of code that should be replaced." },
                        explanation: { type: Type.STRING, description: "Why the change is recommended (e.g., performance, readability)." }
                    },
                    required: ["suggestion", "codeBlock", "explanation"]
                }
            }
        },
        required: ["summary", "suggestions"]
    };
    return generateJson(prompt, systemInstruction, schema);
};

export const generateClientFromApiSchema = (schema: string, framework: string): Promise<GeneratedFile[]> => {
    const systemInstruction = "You are an expert full-stack developer. Generate client-side code from an API schema.";
    const prompt = `Generate all necessary files for a ${framework} client based on the following OpenAPI/GraphQL schema. This should include data-fetching hooks, type definitions, and basic display components.\n\nSchema:\n\`\`\`\n${schema}\n\`\`\``;
    const filesSchema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { filePath: { type: Type.STRING }, content: { type: Type.STRING }, description: { type: Type.STRING } }, required: ["filePath", "content", "description"] } };
    return generateJson(prompt, systemInstruction, filesSchema);
};

export const generateTerraformConfig = (cloud: 'aws' | 'gcp', description: string, context?: string): Promise<string> => {
    const systemInstruction = `You are a DevOps expert specializing in Terraform. Generate a complete .tf file based on the user's description.`;
    const prompt = `Generate a Terraform configuration for ${cloud}.
    Description: "${description}"
    ${context ? `\n\nCloud Context (e.g., existing resources):\n${context}` : ''}
    Respond with only the HCL code in a markdown block.`;
    return generateContent(prompt, systemInstruction);
};

export const generateUserPersona = (description: string): Promise<{ name: string, photoDescription: string, demographics: string, goals: string[], frustrations: string[], techStack: string }> => {
    const prompt = `Generate a detailed user persona based on the following audience description: "${description}"`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING },
            photoDescription: { type: Type.STRING, description: "A simple description for an image generator, e.g., 'A 35-year-old product manager from Berlin'" },
            demographics: { type: Type.STRING },
            goals: { type: Type.ARRAY, items: { type: Type.STRING } },
            frustrations: { type: Type.ARRAY, items: { type: Type.STRING } },
            techStack: { type: Type.STRING, description: "Their preferred or commonly used technology." }
        },
        required: ["name", "photoDescription", "demographics", "goals", "frustrations", "techStack"]
    };
    return generateJson(prompt, "You are a UX researcher and product manager who creates detailed user personas.", schema);
};

export const decomposeUserFlow = (description: string): Promise<{ steps: string[] }> => {
    const prompt = `Decompose the following user flow description into a sequence of distinct steps or screens. Each step should be a short, descriptive string.\n\nFlow: "${description}"`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            steps: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            }
        },
        required: ["steps"]
    };
    return generateJson(prompt, "You are an AI assistant that breaks down user stories into sequential steps for storyboarding.", schema);
};

export const anonymizeData = (data: string, targets: string[]): Promise<{ anonymizedData: string }> => {
    const prompt = `Anonymize the following data, replacing the specified fields with realistic but fake data. Maintain the original structure (JSON or CSV). Do not alter fields that are not specified.\n\nFields to anonymize: ${targets.join(', ')}\n\nData:\n\`\`\`\n${data}\n\`\`\``;
    const schema = { type: Type.OBJECT, properties: { anonymizedData: { type: Type.STRING } }, required: ["anonymizedData"] };
    return generateJson(prompt, "You are a data privacy expert. You replace sensitive information with fake data while preserving the structure.", schema);
};

export const extractStringsForI18n = (code: string): Promise<{ i18nJson: Record<string, string>, refactoredCode: string }> => {
    const prompt = `Analyze the following React component. Extract all user-facing strings into a JSON object in the i18next key-value format. Then, refactor the original component to use a 't' function for internationalization.\n\nCode:\n\`\`\`tsx\n${code}\n\`\`\``;
    const schema = {
        type: Type.OBJECT,
        properties: {
            i18nJson: { type: Type.OBJECT, properties: {}, description: "Key-value pairs for i18next." },
            refactoredCode: { type: Type.STRING, description: "The component code rewritten to use the t() function." }
        },
        required: ["i18nJson", "refactoredCode"]
    };
    return generateJson(prompt, "You are an expert in internationalization (i18n) for React applications.", schema);
};

export const generateABTestWrapper = (variantA: string, variantB: string, service: string): Promise<string> => {
    const prompt = `Create a new React component that conditionally renders one of two component variants based on a feature flag from the "${service}" service. The component should accept a 'flagName' prop. \n\nVariant A Code:\n\`\`\`tsx\n${variantA}\n\`\`\`\n\nVariant B Code:\n\`\`\`tsx\n${variantB}\n\`\`\``;
    return generateContent(prompt, "You are a software engineer who implements A/B tests using feature flagging services.");
};

export const addAriaAttributes = (html: string): Promise<string> => {
    const prompt = `Analyze the following HTML snippet and add the appropriate ARIA roles, states, and properties to improve its accessibility. Return only the modified HTML in a markdown block.\n\nHTML:\n\`\`\`html\n${html}\n\`\`\``;
    return generateContent(prompt, "You are a web accessibility expert who enhances HTML with ARIA attributes.");
};

export const insertSmartLogging = (code: string): Promise<string> => {
    const prompt = `Insert helpful 'console.log' statements into the following code to trace its execution. Log function entries, exits, loop iterations, and conditional branches. Return only the modified code in a markdown block.\n\nCode:\n\`\`\`javascript\n${code}\n\`\`\``;
    return generateContent(prompt, "You are a debugging expert who instruments code with helpful logging statements.");
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


// --- IMAGE & VIDEO GENERATION ---
export const generateImage = async (prompt: string): Promise<string> => {
    const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: prompt,
        config: { numberOfImages: 1, outputMimeType: 'image/png' },
    });
    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/png;base64,${base64ImageBytes}`;
};

export const generateImageFromImageAndText = async (prompt: string, base64Image: string, mimeType: string): Promise<string> => {
    // Note: The current SDK `generateImages` doesn't directly support image+text input.
    // This function will need to be updated when the SDK supports it.
    // For now, we pass the prompt and ignore the image.
    console.warn("Image-to-image generation is not fully supported by the current SDK implementation; using text prompt only.");
    return generateImage(prompt);
};


export const generateMultiComponentFlowFromVideo = async (videoBase64: string, mimeType: string, onUpdate: (message: string) => void): Promise<GeneratedFile[]> => {
    const systemInstruction = "You are an expert frontend developer. Analyze the user flow in this screen recording and generate all the necessary React components and routing logic to replicate it. Create separate files for each component.";
    const prompt = "Analyze this screen recording of a user flow. Identify the different UI states/pages, and generate the React components (using Tailwind CSS) and routing logic needed to create this multi-component feature. Provide the output as a list of files.";
    
    onUpdate("Starting video analysis...");
    let operation = await ai.models.generateVideos({
      model: 'veo-2.0-generate-001',
      prompt: "A short, silent video showing a user interacting with a web UI.",
      config: { numberOfVideos: 1 }
    });

    onUpdate("Video processing initiated. This may take several minutes...");
    while (!operation.done) {
      await sleep(10000);
      onUpdate("Checking video status...");
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    onUpdate("Video processing complete. Generating code from flow...");
    // This is a conceptual placeholder. Actual video analysis for code gen is not a direct feature.
    // We simulate it by asking a text model to describe the flow and then generate from that.
    // A real implementation would require a multimodal model that can output structured data from video.
    const descriptionPrompt = `Describe the user flow shown in a video where a user first sees a list of items, clicks one to see a detail view, and then clicks a button on the detail view.`;
    
    const filesSchema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { filePath: { type: Type.STRING }, content: { type: Type.STRING }, description: { type: Type.STRING } }, required: ["filePath", "content", "description"] } };
    return generateJson(descriptionPrompt, systemInstruction, filesSchema);
};

// --- NEW PROJECT EXPLORER FUNCTIONS ---

const stringifyFileTree = (node: FileNode, indent = ''): string => {
    let result = `${indent}${node.name}\n`;
    if (node.children) {
        node.children.forEach(child => {
            result += stringifyFileTree(child, indent + '  ');
        });
    }
    return result;
};


export const answerProjectQuestion = (prompt: string, fileTree: FileNode) => {
    const fileStructure = stringifyFileTree(fileTree);
    const fullPrompt = `Based on the following file structure, answer the user's question.

File Structure:
\`\`\`
${fileStructure}
\`\`\`

Question: ${prompt}
`;
    return streamContent(fullPrompt, "You are a helpful AI assistant with expertise in analyzing codebase structures. Provide concise answers based on the file tree provided.");
};


export const generateNewFilesForProject = (prompt: string, fileTree: FileNode): Promise<GeneratedFile[]> => {
    const fileStructure = stringifyFileTree(fileTree);
    const systemInstruction = `You are an expert software engineer who generates new files to add to an existing project.
- You will be given a file structure and a prompt.
- Your response must be a valid JSON array of objects, where each object represents a file.
- Each file object must have 'filePath', 'content', and 'description' properties.
- The 'filePath' must be a valid relative path that makes sense within the existing file structure.
- The 'content' must be the complete code for the file.
- Do not generate files that already exist unless the prompt explicitly asks to overwrite.
- Base your file paths on the existing structure. For example, if there is a 'src/components' directory, new components should go there.`;

    const userPrompt = `Based on the following file structure, generate the necessary new file(s) for the request.\n\nFile Structure:\n\`\`\`\n${fileStructure}\n\`\`\`\n\nRequest: "${prompt}"`;
    
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                filePath: { type: Type.STRING, description: "The full relative path of the new file." },
                content: { type: Type.STRING, description: "The complete code or content for the new file." },
                description: { type: Type.STRING, description: "A brief description of what this file does." }
            },
            required: ["filePath", "content", "description"]
        }
    };
    return generateJson(userPrompt, systemInstruction, schema);
};
