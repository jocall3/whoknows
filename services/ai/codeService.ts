/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Type } from "@google/genai";
import { streamContent, generateJson, generateContent } from './core.ts';
import { filesSchema } from './core.ts';
import type { GeneratedFile, StructuredPrSummary, StructuredExplanation, StructuredReview, SecurityVulnerability, CodeSmell, FileNode, CustomFeature } from '../../types.ts';

// --- Code Analysis & Explanation ---
export const explainCodeStream = (code: string) => streamContent(
    `Please explain the following code snippet:\n\n\`\`\`\n${code}\n\`\`\``,
    "You are an expert software engineer providing a clear, concise explanation of code."
);

export const explainCodeStructured = async (code: string): Promise<StructuredExplanation> => {
    const systemInstruction = "You are an expert software engineer providing a structured analysis of a code snippet.";
    const prompt = `Analyze this code: \n\n\`\`\`\n${code}\n\`\`\``;
    const schema = { type: Type.OBJECT, properties: { summary: { type: Type.STRING }, lineByLine: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { lines: { type: Type.STRING }, explanation: { type: Type.STRING } }, required: ["lines", "explanation"] } }, complexity: { type: Type.OBJECT, properties: { time: { type: Type.STRING }, space: { type: Type.STRING } }, required: ["time", "space"] }, suggestions: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["summary", "lineByLine", "complexity", "suggestions"] };
    return generateJson(prompt, systemInstruction, schema);
}

export const reviewCodeStream = (code: string, systemInstruction?: string) => streamContent(
    `Please perform a detailed code review on the following code snippet. Identify potential bugs, suggest improvements for readability and performance, and point out any anti-patterns. Structure your feedback with clear headings.\n\n\`\`\`\n${code}\n\`\`\``,
    systemInstruction || "You are a senior software engineer performing a code review. You are meticulous, helpful, and provide constructive feedback.",
    0.6
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

export const analyzeCodeForVulnerabilities = (code: string): Promise<SecurityVulnerability[]> => {
    const prompt = `Analyze the following code for security vulnerabilities. Identify the vulnerability, its severity, and suggest a mitigation. Also provide a simple shell command to simulate a potential exploit if applicable.\n\nCode:\n\`\`\`\n${code}\n\`\`\``;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { vulnerability: { type: Type.STRING }, severity: { type: Type.STRING, enum: ["Critical", "High", "Medium", "Low", "Informational"] }, description: { type: Type.STRING }, mitigation: { type: Type.STRING }, exploitSuggestion: { type: Type.STRING } }, required: ["vulnerability", "severity", "description", "mitigation"] } };
    return generateJson(prompt, "You are a security expert who analyzes code for vulnerabilities. You respond in a structured JSON format.", schema);
};

export const detectCodeSmells = (code: string): Promise<CodeSmell[]> => {
    const prompt = `Analyze the following code for common code smells like "Long Method", "Duplicated Code", "Large Class", etc. For each smell found, provide the name of the smell, the approximate line number, and a brief explanation.\n\nCode:\n\`\`\`\n${code}\n\`\`\``;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { smell: { type: Type.STRING }, line: { type: Type.NUMBER }, explanation: { type: Type.STRING } }, required: ["smell", "line", "explanation"] } };
    return generateJson(prompt, "You are a software quality expert who detects code smells. You respond in a structured JSON format.", schema);
};


// --- Code Generation & Transformation ---
export const formatCodeStream = (code: string) => streamContent(
    `Format this code:\n\n\`\`\`javascript\n${code}\n\`\`\``,
    "You are a code formatter. Your only purpose is to format code. Respond with only the formatted code, enclosed in a single markdown block.",
    0.2
);

export const generateUnitTestsStream = (code: string, systemInstruction?: string) => streamContent(
    `Generate unit tests for this code:\n\n\`\`\`\n${code}\n\`\`\``,
    systemInstruction || "You are a software quality engineer specializing in writing comprehensive and clear unit tests using Vitest and React Testing Library.",
    0.6
);

export const migrateCodeStream = (code: string, from: string, to: string) => streamContent(
    `Translate this ${from} code to ${to}. Respond with only the translated code in a markdown block.\n\n\`\`\`\n${code}\n\`\`\``,
    `You are an expert polyglot programmer who specializes in migrating code between languages and frameworks.`,
    0.4
);

export const enhanceSnippetStream = (code: string) => streamContent(
    `Enhance this code snippet. Add comments, improve variable names, and refactor for clarity or performance if possible.\n\n\`\`\`\n${code}\n\`\`\``,
    "You are a senior software engineer who excels at improving code. Respond with only the enhanced code in a markdown block.",
    0.5
);

export const transferCodeStyleStream = (args: { code: string, styleGuide: string }) => streamContent(
    `Rewrite the following code to match the provided style guide.\n\nStyle Guide:\n${args.styleGuide}\n\nCode to rewrite:\n\`\`\`\n${args.code}\n\`\`\``,
    "You are an AI assistant that rewrites code to match a specific style guide. Respond with only the rewritten code in a markdown block.",
    0.3
);

export const refactorForReadability = (code: string) => streamContent(
    `Refactor the following code to improve its readability. Use clearer variable names, simplify logic, and add comments where necessary. Respond with only the refactored code in a markdown block.\n\n\`\`\`\n${code}\n\`\`\``,
    "You are an expert at refactoring code for readability."
);

export const refactorForPerformance = (code: string) => streamContent(
    `Refactor the following code to improve its performance. Use more efficient algorithms or language features where applicable. Respond with only the refactored code in a markdown block.\n\n\`\`\`\n${code}\n\`\`\``,
    "You are an expert at optimizing code for performance."
);

export const generateJsDoc = (code: string) => streamContent(
    `Add JSDoc comments to the following code. Document all functions, parameters, and return values. Respond with only the commented code in a markdown block.\n\n\`\`\`\n${code}\n\`\`\``,
    "You are an expert at writing comprehensive JSDoc documentation."
);

export const convertToFunctionalComponent = (code: string) => streamContent(
    `Convert the following class-based React component to a functional component using hooks. Respond with only the refactored code in a markdown block.\n\n\`\`\`\n${code}\n\`\`\``,
    "You are an expert React developer who refactors class components to functional components."
);

export const generateBugReproductionTestStream = (stackTrace: string, context: string) => streamContent(
    `Given the following stack trace and code context, generate a failing unit test using Vitest that reproduces the bug. The test should be named descriptively (e.g., "should throw error when user is null").\n\nStack Trace:\n${stackTrace}\n\nCode Context:\n${context}`,
    "You are an expert in software testing and debugging. You write minimal, failing tests to reproduce bugs.",
    0.6
);

export const insertSmartLogging = (code: string): Promise<string> => {
    const prompt = `Analyze the following code and insert helpful logging statements at key points to aid in debugging. Focus on function entries/exits, important variable states, and error paths. Respond with only the modified code in a markdown block.\n\nCode:\n\`\`\`\n${code}\n\`\`\``;
    const systemInstruction = "You are an expert software developer who adds strategic logging to code for better debugging.";
    return generateContent(prompt, systemInstruction);
};

export const addAriaAttributes = (html: string): Promise<string> => {
    const prompt = `Add the appropriate ARIA roles and attributes to the following HTML to improve its accessibility. Respond with only the modified HTML in a markdown block.\n\nHTML:\n\`\`\`html\n${html}\n\`\`\``;
    const systemInstruction = "You are a web accessibility expert who improves HTML by adding ARIA attributes.";
    return generateContent(prompt, systemInstruction);
};

export const analyzeForMemoryLeaksStream = (code: string) => {
    const prompt = `Analyze the following JavaScript/React code for potential memory leaks, such as unterminated intervals, event listeners without cleanup, or un-released object references. Provide a markdown report explaining each potential leak and how to fix it.\n\nCode:\n\`\`\`javascript\n${code}\n\`\`\``;
    const systemInstruction = "You are a senior software engineer specializing in performance and memory management.";
    return streamContent(prompt, systemInstruction);
};

export const analyzeReactComponentRendersStream = (code: string) => {
    const prompt = `Analyze the following React code for potential causes of unnecessary re-renders. Look for issues like passing new object/function references as props, or state updates that affect unrelated components. Provide a markdown report with explanations and solutions.\n\nCode:\n\`\`\`tsx\n${code}\n\`\`\``;
    const systemInstruction = "You are an expert in React performance optimization, specializing in minimizing re-renders.";
    return streamContent(prompt, systemInstruction);
};

export const analyzeGraphqlQueryStream = (query: string) => {
    const prompt = `Analyze the following GraphQL query for potential performance issues like N+1 problems, overly complex queries, or fetching too much data. Provide a markdown report with suggestions for optimization.\n\nQuery:\n\`\`\`graphql\n${query}\n\`\`\``;
    const systemInstruction = "You are an expert in GraphQL performance optimization.";
    return streamContent(prompt, systemInstruction);
};

export const generateCspFromDescription = (description: string) => {
    const prompt = `Generate a Content Security Policy (CSP) header string based on the following requirements: "${description}". Respond with only the CSP string itself, without any explanation.`;
    const systemInstruction = "You are a web security expert specializing in Content Security Policies. You only output valid CSP strings.";
    return streamContent(prompt, systemInstruction);
};

export const analyzeRegexForRedosStream = (regex: string) => {
    const prompt = `Analyze the following regular expression for potential Regular Expression Denial of Service (ReDoS) vulnerabilities. Explain if the regex is vulnerable and suggest a safer alternative if possible.\n\nRegex: \`${regex}\``;
    const systemInstruction = "You are a security researcher with expertise in Regular Expression Denial of Service vulnerabilities.";
    return streamContent(prompt, systemInstruction);
};

export const analyzePackageJsonStream = (pkgJson: string) => {
    const prompt = `Based on your training data up to your last update, analyze the dependencies in this package.json file for any well-known, high-severity vulnerabilities. Do not use live data. For each vulnerable package, list the package name, version, and a brief description of the vulnerability.\n\npackage.json:\n\`\`\`json\n${pkgJson}\n\`\`\``;
    const systemInstruction = "You are a security expert who identifies known vulnerabilities in software packages based on your training data.";
    return streamContent(prompt, systemInstruction);
};

export const explainCorsError = (origin: string, target: string, headers: Record<string, string>) => {
    const prompt = `Explain in simple terms why a hypothetical API request would likely fail due to a CORS error given the following scenario. Explain the Same-Origin Policy and what headers the server at the target would need to send to allow this request.\n\n- Request Origin: ${origin}\n- Request Target: ${target}\n- Request Headers: ${JSON.stringify(headers)}`;
    const systemInstruction = "You are an expert on web security, particularly CORS. You explain complex topics in simple, easy-to-understand terms.";
    return streamContent(prompt, systemInstruction);
};

export const generateClientFromApiSchema = (schema: string, language: string): Promise<GeneratedFile[]> => {
    const prompt = `Generate a client library for the following API schema in ${language}.\n\nSchema:\n\`\`\`json\n${schema}\n\`\`\``;
    const systemInstruction = `You are an expert at generating API client libraries from OpenAPI or GraphQL schemas. Respond with a JSON array of file objects.`;
    return generateJson(prompt, systemInstruction, filesSchema);
};

export const sqlToApiEndpoints = (schema: string, framework: 'express' | 'fastify'): Promise<GeneratedFile[]> => {
    const prompt = `Generate all necessary files for CRUD API endpoints using ${framework} for the following SQL schema. Include routes, controllers, and basic models.\n\nSQL Schema:\n\`\`\`sql\n${schema}\n\`\`\``;
    const systemInstruction = `You are an expert backend developer who creates structured and efficient APIs from database schemas. Respond with a JSON array of file objects.`;
    return generateJson(prompt, systemInstruction, filesSchema);
};

export const generateABTestWrapper = (variantA: string, variantB: string, service: string): Promise<string> => {
    const prompt = `Create a React component that wraps two variants for an A/B test using the "${service}" feature flagging service. The flag key should be 'new-signup-button-test'.\n\nVariant A (control):\n\`\`\`jsx\n${variantA}\n\`\`\`\n\nVariant B (treatment):\n\`\`\`jsx\n${variantB}\n\`\`\``;
    const systemInstruction = "You are an expert at implementing A/B tests in React using feature flagging services. Respond with only the complete component code in a markdown block.";
    return generateContent(prompt, systemInstruction);
};

export const extractStringsForI18n = (code: string): Promise<{ i18nJson: Record<string, string>, refactoredCode: string }> => {
    const prompt = `Analyze the following React component. Extract all user-facing strings into a key-value JSON object. Then, refactor the component to use a hypothetical 't' function for internationalization (e.g., t('welcomeHeader')).\n\nComponent:\n\`\`\`jsx\n${code}\n\`\`\``;
    const systemInstruction = "You are an expert in internationalization (i18n) for React applications. You respond with a single JSON object containing the i18n keys and the refactored code.";
    const schema = { type: Type.OBJECT, properties: { i18nJson: { type: Type.OBJECT, properties: {} }, refactoredCode: { type: Type.STRING } }, required: ["i18nJson", "refactoredCode"] };
    return generateJson(prompt, systemInstruction, schema);
};

export const generatePipelineCode = (description: string): Promise<string> => {
    const prompt = `Based on the following description of a workflow, generate a JavaScript function that orchestrates the described steps. Assume helper functions for each tool exist.\n\nDescription:\n${description}`;
    const systemInstruction = "You are an expert at generating JavaScript pipeline code from a high-level description. You respond with only the code in a markdown block.";
    return generateContent(prompt, systemInstruction, 0.3);
};

export const generateMermaidJs = (code: string): Promise<string> => {
    const prompt = `Create a Mermaid.js flowchart diagram that visually represents the logic of the following code. Respond with only the Mermaid code in a markdown block.\n\n\`\`\`\n${code}\n\`\`\``;
    const systemInstruction = "You are an expert at creating Mermaid.js diagrams from code. You only respond with the diagram syntax inside a 'mermaid' markdown block.";
    return generateContent(prompt, systemInstruction, 0.2);
};

export const generateChangelogFromLogStream = (log: string) => streamContent(
    `Analyze the following git log and generate a formatted changelog in Markdown. Categorize changes into Features, Fixes, and Other.\n\nLog:\n${log}`,
    "You are an expert at creating clear and concise changelogs from git logs."
);

export const generateTagsForCode = (code: string): Promise<{ tags: string[] }> => {
    const prompt = `Generate 3-5 relevant tags for this code snippet:\n\n\`\`\`\n${code}\n\`\`\``;
    const schema = { type: Type.OBJECT, properties: { tags: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["tags"] };
    return generateJson(prompt, "You are a code tagging expert. Respond only with a JSON object containing a 'tags' array.", schema);
};

export const generatePrSummaryStructured = (diff: string): Promise<StructuredPrSummary> => {
    const prompt = `Analyze this diff and generate a structured pull request summary including a title, a brief summary, and a bulleted list of changes.\n\n\`\`\`diff\n${diff}\n\`\`\``;
    const systemInstruction = "You are an expert at writing clear, concise pull request summaries from code diffs.";
    const schema = { type: Type.OBJECT, properties: { title: { type: Type.STRING }, summary: { type: Type.STRING }, changes: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["title", "summary", "changes"] };
    return generateJson(prompt, systemInstruction, schema);
};

export const generateTechnicalSpecFromDiff = (diff: string, summary: StructuredPrSummary): Promise<string> => {
    const prompt = `Based on the following pull request summary and code diff, generate a more detailed technical specification document. It should include sections for Background, Implementation Details, and Testing/Verification.

**PR Summary:**
Title: ${summary.title}
Summary: ${summary.summary}
Changes:
- ${summary.changes.join('\n- ')}

**Code Diff:**
\`\`\`diff
${diff}
\`\`\``;
    const systemInstruction = "You are a senior technical writer who creates detailed software specification documents from code changes.";
    return generateContent(prompt, systemInstruction, 0.6);
};

export const generateCommitMessageStream = (diff: string) => streamContent(
    `Generate a conventional commit message for this diff:\n\n\`\`\`diff\n${diff}\n\`\`\``,
    "You are an expert at writing conventional commit messages. Respond with only the commit message.",
    0.5
);

export const answerProjectQuestion = (question: string, projectFiles: FileNode) => streamContent(
    `Based on the following project file structure, answer the user's question.\n\nFile Structure:\n\`\`\`\n${fileTreeToString(projectFiles)}\n\`\`\`\n\nQuestion: ${question}`,
    "You are an AI assistant with full knowledge of the user's project codebase. You answer questions concisely and accurately."
);

export const generateNewFilesForProject = (prompt: string, projectFiles: FileNode): Promise<GeneratedFile[]> => {
    const systemInstruction = `You are a senior full-stack developer. Based on the user's prompt and the existing file structure, generate the necessary new files to implement the feature. Respond with only a JSON array of file objects.`;
    const fullPrompt = `Generate new files to implement the following feature request. Make sure file paths are logical within the existing project structure.\n\nRequest: "${prompt}"\n\nExisting File Structure:\n\`\`\`\n${fileTreeToString(projectFiles)}\n\`\`\``;
    return generateJson(fullPrompt, systemInstruction, filesSchema);
};

export const generateCodingChallengeStream = (topic: string | null) => streamContent(
    `Generate a unique, medium-difficulty coding challenge. ${topic ? `The topic should be about ${topic}.` : ''} Include a problem description, an example, and constraints.`,
    "You are a programming competition judge who creates interesting coding challenges.",
    0.8
);

export const analyzePerformanceTrace = (trace: any): Promise<string> => {
    const prompt = `Analyze the following performance trace data (either a runtime trace or bundle stats) and provide optimization suggestions in markdown format.\n\nData:\n\`\`\`json\n${JSON.stringify(trace, null, 2)}\n\`\`\``;
    const systemInstruction = "You are a web performance expert who provides actionable optimization advice based on trace data.";
    return generateContent(prompt, systemInstruction);
};

export const suggestA11yFix = (issue: any): Promise<string> => {
    const prompt = `Given the following accessibility issue reported by axe-core, suggest a code fix. Provide a brief explanation and then a code snippet.\n\nIssue:\n\`\`\`json\n${JSON.stringify(issue, null, 2)}\n\`\`\``;
    const systemInstruction = "You are a web accessibility expert who provides clear and correct code fixes for axe-core violations.";
    return generateContent(prompt, systemInstruction);
};

export const generateCiCdConfig = (platform: string, description: string): Promise<string> => {
    const prompt = `Generate a CI/CD configuration file for ${platform} that performs the following steps: ${description}. Respond with only the configuration file content in a markdown block.`;
    const systemInstruction = `You are a DevOps expert specializing in ${platform} CI/CD pipelines.`;
    return generateContent(prompt, systemInstruction);
};

export const generateTerraformConfig = (cloud: string, description: string, context: string): Promise<string> => {
    const prompt = `Generate a Terraform configuration for ${cloud} to provision the following infrastructure: "${description}". Additional context: ${context}. Respond with only the HCL code in a markdown block.`;
    const systemInstruction = `You are an expert in Infrastructure as Code using Terraform for ${cloud}.`;
    return generateContent(prompt, systemInstruction);
};

export const generateFeature = (prompt: string, framework: string, styling: string): Promise<GeneratedFile[]> => {
    const fullPrompt = `Generate all necessary code files for a new feature based on the following description.
- Framework: ${framework}
- Styling: ${styling}
- Description: "${prompt}"`;
    const systemInstruction = `You are an expert at generating complete, production-ready code for new application features. Respond with a JSON array of file objects.`;
    return generateJson(fullPrompt, systemInstruction, filesSchema);
};

export const generateFullStackFeature = (prompt: string, framework: string, styling: string): Promise<GeneratedFile[]> => {
    const fullPrompt = `Generate all necessary code files for a new FULL STACK feature. This includes a frontend component and a backend cloud function with Firestore integration.
- Framework: ${framework}
- Styling: ${styling}
- Backend: Google Cloud Functions (Node.js) & Firestore
- Description: "${prompt}"`;
    const systemInstruction = `You are an expert at generating complete, production-ready full-stack application features. Respond with a JSON array of file objects.`;
    return generateJson(fullPrompt, systemInstruction, filesSchema);
};

export const generateDockerfile = (framework: string) => streamContent(
    `Generate a production-ready, multi-stage Dockerfile for a ${framework} application.`,
    "You are a DevOps expert who writes optimized Dockerfiles. Respond with only the Dockerfile content in a markdown block."
);