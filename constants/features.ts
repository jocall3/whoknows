// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from 'react';
import type { FeatureCategory } from '../types.ts';
import {
    PaperAirplaneIcon, ChartBarIcon, MagnifyingGlassIcon, MapIcon, BeakerIcon, CodeBracketSquareIcon, DocumentTextIcon,
    ShieldCheckIcon, SparklesIcon, HammerIcon, PaintBrushIcon, RectangleGroupIcon, ServerStackIcon, CpuChipIcon, LinkIcon
} from '../components/icons/index.ts';

interface RawFeature {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: FeatureCategory;
}

export const RAW_FEATURES: RawFeature[] = [
    // --- Pillar I: The Global Economic Operating System (GEOS) ---
    { id: "pillar-one-geos", name: "The GEOS Console", description: "Orchestrate the planet's financial and logistical backbone from a single interface.", icon: React.createElement(ChartBarIcon), category: "Global Economic Operating System" },

    // --- Pillar II: Computational Compassion at Scale ---
    { id: "pillar-two-compassion", name: "Computational Compassion Console", description: "Apply planetary-scale optimization to humanity's most intractable problems.", icon: React.createElement(BeakerIcon), category: "Computational Compassion at Scale" },

    // --- Pillar III: The Meta-Creation Platform ---
    { id: "pillar-three-meta-creation", name: "The Meta-Creation Console", description: "Accelerate the very pace of discovery, creation, and cultural evolution.", icon: React.createElement(SparklesIcon), category: "The Meta-Creation Platform" },

    // --- Pillar IV: The Governance Layer ---
    { id: "pillar-four-governance", name: "The Governance Console", description: "Wield absolute power with a new form of ruthlessly efficient, AI-driven control.", icon: React.createElement(ShieldCheckIcon), category: "The Governance Layer" },
];

export const PILLAR_FEATURES: Record<string, RawFeature[]> = {
    'pillar-one-geos': [
        { id: "logistics-manifold", name: "The Logistics Manifold", description: "A real-time, global 3D command console for all commercial transport.", icon: React.createElement(PaperAirplaneIcon), category: "Global Economic Operating System" },
        { id: "monetary-policy-simulator", name: "The Monetary Policy Simulator", description: "A what-if machine for civilizations. Simulate a century of economic evolution in seconds.", icon: React.createElement(ChartBarIcon), category: "Global Economic Operating System" },
        { id: "scarcity-oracle", name: "The Scarcity Oracle", description: "Identifies impending resource scarcities and forges the infrastructure to acquire them.", icon: React.createElement(MagnifyingGlassIcon), category: "Global Economic Operating System" },
        { id: "urbanism-synthesizer", name: "The Urbanism Synthesizer", description: "Generates perfectly optimized, AI-designed cities and outputs the full build plan.", icon: React.createElement(MapIcon), category: "Global Economic Operating System" }
    ],
    'pillar-two-compassion': [
        { id: "gaias-crucible", name: "Gaia's Crucible", description: "A planetary climate simulation and intervention engine. You don't ask for permission. You save the planet.", icon: React.createElement(BeakerIcon), category: "Computational Compassion at Scale" },
        { id: "genome-weaver", name: "The Genome Weaver", description: "Anonymously forge and distribute personalized, mass-producible mRNA cures. You don't build hospitals. You email cures.", icon: React.createElement(CodeBracketSquareIcon), category: "Computational Compassion at Scale" },
        { id: "aptitude-engine", name: "The Aptitude Engine", description: "Generates a perfect, lifelong curriculum to maximize an individual's potential for the system. Free will was inefficient.", icon: React.createElement(DocumentTextIcon), category: "Computational Compassion at Scale" },
        { id: "first-responder-ai", name: "First Responder AI", description: "Acts before disaster strikes, dispatching autonomous aid. The benevolent hand of God, arriving before the prayer.", icon: React.createElement(ShieldCheckIcon), category: "Computational Compassion at Scale" }
    ],
    'pillar-three-meta-creation': [
        { id: "hypothesis-forge", name: "The Hypothesis Forge", description: "Collapses the entirety of the scientific method into a single button click.", icon: React.createElement(SparklesIcon), category: "The Meta-Creation Platform" },
        { id: "themis-engine", name: "The Themis Engine", description: "A legal code refactor. Outputs a new, perfectly logical and ruthlessly efficient legal framework.", icon: React.createElement(HammerIcon), category: "The Meta-Creation Platform" },
        { id: "memetic-catalyst", name: "The Memetic Catalyst", description: "An engine for forging culture to steer humanity towards a more optimal state of being.", icon: React.createElement(PaintBrushIcon), category: "The Meta-Creation Platform" },
        { id: "the-exchange", name: "The Exchange", description: "A self-expanding universe of tools, created by the engine itself, for itself. The ecosystem becomes truly alive.", icon: React.createElement(RectangleGroupIcon), category: "The Meta-Creation Platform" }
    ],
    'pillar-four-governance': [
        { id: "guardian-ai", name: "The Guardian AI", description: "A real-time Ethical Oversight module. Your conscience, codified and scaled.", icon: React.createElement(ShieldCheckIcon), category: "The Governance Layer" },
        { id: "equity-ledger", name: "The Equity Ledger", description: "A global UBI, drawn from the surplus of a perfectly optimized system. From each according to their ability, to each according to their need.", icon: React.createElement(ServerStackIcon), category: "The Governance Layer" },
        { id: "cerebra-interface", name: "The Cerebra Interface (Simulation)", description: "Simulate a direct neural connection to the Integrated Reality Engine. The DevCore Reality Shell.", icon: React.createElement(CpuChipIcon), category: "The Governance Layer" },
        { id: "humanitys-exocortex", name: "Humanity's Exocortex", description: "A shared, queryable knowledge graph of all human information, powering and powered by The Engine.", icon: React.createElement(LinkIcon), category: "The Governance Layer" }
    ],
};

export const ALL_FEATURE_IDS = [
    'pillar-one-geos',
    'pillar-two-compassion',
    'pillar-three-meta-creation',
    'pillar-four-governance',
    'ai-command-center',
    'project-explorer',
    'workspace-connector-hub',
    'ai-code-explainer',
    'ai-feature-builder',
    'regex-sandbox',
    'portable-snippet-vault',
    'css-grid-editor',
    'ai-commit-generator',
    'json-tree-navigator',
    'xbrl-converter',
    'ai-unit-test-generator',
    'prompt-craft-pad',
    'linter-formatter',
    'schema-designer',
    'pwa-manifest-editor',
    'markdown-slides-generator',
    'screenshot-to-component',
    'digital-whiteboard',
    'theme-designer',
    'svg-path-editor',
    'ai-style-transfer',
    'ai-coding-challenge',
    'typography-lab',
    'code-review-bot',
    'ai-pull-request-assistant',
    'changelog-generator',
    'cron-job-builder',
    'ai-code-migrator',
    'visual-git-tree',
    'worker-thread-debugger',
    'ai-image-generator',
    'async-call-tree-viewer',
    'audio-to-code',
    'code-diff-ghost',
    'code-spell-checker',
    'color-palette-generator',
    'logic-flow-builder',
    'meta-tag-editor',
    'network-visualizer',
    'responsive-tester',
    'sass-scss-compiler',
    'api-mock-generator',
    'env-manager',
    'performance-profiler',
    'a11y-auditor',
    'ci-cd-generator',
    'deployment-preview',
    'security-scanner',
    'terraform-generator',
    'ai-personality-forge',
    'weekly-digest-generator',
    'one-click-refactor',
    'bug-reproducer',
    'tech-debt-sonar',
    'iam-policy-generator',
    'iam-policy-visualizer',
    'gmail-addon-simulator',
    'api-client-generator',
    'sql-to-api-generator',
    'blameless-postmortem-generator',
    'data-anonymizer',
    'a/b-test-assistant',
    'i18n-helper',
    'token-usage-estimator',
    'financial-chart-generator',
    'compliance-report-helper',
    'ecommerce-component-generator',
    'api-endpoint-tester',
    'storyboard-generator',
    'user-persona-generator',
    'competitive-analysis-bot',
    'code-documentation-writer',
    'dependency-update-explainer',
    'ai-video-generator',
    'cloud-cost-estimator',
    'smart-logger',
    'accessibility-annotation',
    'wordpress-plugin-generator',
    'feature-forge',
    'custom-feature-runner',
    'dom-tree-analyzer',
    'memory-leak-detector',
    'graphql-query-profiler',
    'component-render-tracer',
    'seo-auditor',
    'data-transformer',
    'lorem-ipsum-generator',
    'uuid-generator',
    'base64-encoder-decoder',
    'url-inspector',
    'jwt-inspector',
    'csp-generator',
    'redos-scanner',
    'dependency-vulnerability-scanner',
    'cors-proxy-simulator',
    'image-placeholder-generator',
    'mock-user-data-generator',
    'feature-flag-simulator',
    'error-response-simulator',
    'webhook-event-simulator',
    'usedebounce-hook-generator',
    'uselocalstorage-hook-generator',
    'useeventlistener-hook-generator',
    'usefetch-hook-generator',
    'useform-hook-generator',
];