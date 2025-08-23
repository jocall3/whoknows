export interface FeatureTaxonomy {
    id: string;
    name: string;
    description: string;
    category: string;
    inputs: string;
}

export const FEATURE_TAXONOMY: FeatureTaxonomy[] = [
    {
        id: "ai-command-center",
        name: "AI Command Center",
        description: "The main entry point. Use natural language to navigate and control the entire toolkit. Can call other tools.",
        category: "Core",
        inputs: "A natural language prompt describing what the user wants to do. Examples: 'explain this code: ...', 'design a theme with space vibes'."
    },
    {
        id: "ai-code-explainer",
        name: "AI Code Explainer",
        description: "Accepts a code snippet and provides a detailed, structured analysis including summary, line-by-line breakdown, time/space complexity, and suggestions for improvement.",
        category: "AI Tools",
        inputs: "A string containing a code snippet."
    },
    {
        id: "theme-designer",
        name: "AI Theme Designer",
        description: "Generates a complete UI color theme, including accessibility scores, from a simple text description or an uploaded image.",
        category: "AI Tools",
        inputs: "A string describing the desired aesthetic (e.g., 'a calm, minimalist theme for a blog') or an image file."
    },
    {
        id: "regex-sandbox",
        name: "RegEx Sandbox",
        description: "Generates a regular expression from a natural language description. Also allows testing expressions against a string.",
        category: "Testing",
        inputs: "A string describing the pattern to match. Example: 'find all email addresses'."
    },
    {
        id: "ai-pull-request-assistant",
        name: "AI Pull Request Assistant",
        description: "Takes 'before' and 'after' code snippets, calculates the diff, generates a structured pull request summary (title, description, changes), and populates a full PR template.",
        category: "AI Tools",
        inputs: "Two strings: 'beforeCode' and 'afterCode'."
    },
     {
        id: "visual-git-tree",
        name: "AI Git Log Analyzer",
        description: "Intelligently parses a raw 'git log' output to create a categorized and well-formatted changelog, separating new features from bug fixes.",
        category: "Git",
        inputs: "A string containing the raw output of a 'git log' command."
    },
    {
        id: "cron-job-builder",
        name: "AI Cron Job Builder",
        description: "Generates a valid cron expression from a natural language description of a schedule.",
        category: "Deployment",
        inputs: "A string describing a schedule. Example: 'every weekday at 5pm'."
    },
    {
        id: "ai-code-migrator",
        name: "AI Code Migrator",
        description: "Translate code between languages & frameworks.",
        category: "AI Tools",
        inputs: "A string of code to convert, a string for the source language, and a string for the target language. e.g. 'migrate this SASS to CSS: ...'"
    },
    {
        id: "ai-commit-generator",
        name: "AI Commit Message Generator",
        description: "Generates a conventional commit message from a git diff.",
        category: "AI Tools",
        inputs: "A string containing a git diff."
    },
    {
        id: "worker-thread-debugger",
        name: "AI Concurrency Analyzer",
        description: "Analyzes JavaScript code for potential Web Worker concurrency issues like race conditions.",
        category: "Testing",
        inputs: "A string of JavaScript code to analyze for concurrency issues."
    },
    {
        id: "xbrl-converter",
        name: "XBRL Converter",
        description: "Converts a JSON object into a simplified XBRL-like XML format.",
        category: "Data",
        inputs: "A string containing valid JSON."
    }
];