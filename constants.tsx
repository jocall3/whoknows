import React from 'react';
import {
    PaperAirplaneIcon, ChartBarIcon, MagnifyingGlassIcon, MapIcon, BeakerIcon, CodeBracketSquareIcon, DocumentTextIcon,
    ShieldCheckIcon, SparklesIcon, CodeFormatterIcon, PaintBrushIcon, RectangleGroupIcon, ServerStackIcon, CpuChipIcon, LinkIcon
} from './components/icons.tsx';

export const CHROME_VIEW_IDS = ['features-list'] as const;

export const FEATURE_CATEGORIES = [
    'Global Economic Operating System',
    'Computational Compassion at Scale',
    'The Meta-Creation Platform',
    'The Governance Layer',
] as const;

export type FeatureCategory = typeof FEATURE_CATEGORIES[number];

export type SlotCategory = FeatureCategory;
export const SLOTS: SlotCategory[] = ['Global Economic Operating System', 'Computational Compassion at Scale', 'The Meta-Creation Platform', 'The Governance Layer'];

interface RawFeature {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    category: FeatureCategory;
}

export const RAW_FEATURES: RawFeature[] = [
    // --- Pillar I: The Global Economic Operating System (GEOS) ---
    { id: "pillar-one-geos", name: "The GEOS Console", description: "Orchestrate the planet's financial and logistical backbone from a single interface.", icon: <ChartBarIcon />, category: "Global Economic Operating System" },

    // --- Pillar II: Computational Compassion at Scale ---
    { id: "pillar-two-compassion", name: "Computational Compassion Console", description: "Apply planetary-scale optimization to humanity's most intractable problems.", icon: <BeakerIcon />, category: "Computational Compassion at Scale" },

    // --- Pillar III: The Meta-Creation Platform ---
    { id: "pillar-three-meta-creation", name: "The Meta-Creation Console", description: "Accelerate the very pace of discovery, creation, and cultural evolution.", icon: <SparklesIcon />, category: "The Meta-Creation Platform" },

    // --- Pillar IV: The Governance Layer ---
    { id: "pillar-four-governance", name: "The Governance Console", description: "Wield absolute power with a new form of ruthlessly efficient, AI-driven control.", icon: <ShieldCheckIcon />, category: "The Governance Layer" },
];

export const PILLAR_FEATURES = {
    'pillar-one-geos': [
        { id: "logistics-manifold", name: "The Logistics Manifold", description: "A real-time, global 3D command console for all commercial transport.", icon: <PaperAirplaneIcon /> },
        { id: "monetary-policy-simulator", name: "The Monetary Policy Simulator", description: "A what-if machine for civilizations. Simulate a century of economic evolution in seconds.", icon: <ChartBarIcon /> },
        { id: "scarcity-oracle", name: "The Scarcity Oracle", description: "Identifies impending resource scarcities and forges the infrastructure to acquire them.", icon: <MagnifyingGlassIcon /> },
        { id: "urbanism-synthesizer", name: "The Urbanism Synthesizer", description: "Generates perfectly optimized, AI-designed cities and outputs the full build plan.", icon: <MapIcon /> }
    ],
    'pillar-two-compassion': [
        { id: "gaias-crucible", name: "Gaia's Crucible", description: "A planetary climate simulation and intervention engine. You don't ask for permission. You save the planet.", icon: <BeakerIcon /> },
        { id: "genome-weaver", name: "The Genome Weaver", description: "Anonymously forge and distribute personalized, mass-producible mRNA cures. You don't build hospitals. You email cures.", icon: <CodeBracketSquareIcon /> },
        { id: "aptitude-engine", name: "The Aptitude Engine", description: "Generates a perfect, lifelong curriculum to maximize an individual's potential for the system. Free will was inefficient.", icon: <DocumentTextIcon /> },
        { id: "first-responder-ai", name: "First Responder AI", description: "Acts before disaster strikes, dispatching autonomous aid. The benevolent hand of God, arriving before the prayer.", icon: <ShieldCheckIcon /> }
    ],
    'pillar-three-meta-creation': [
        { id: "hypothesis-forge", name: "The Hypothesis Forge", description: "Collapses the entirety of the scientific method into a single button click.", icon: <SparklesIcon /> },
        { id: "themis-engine", name: "The Themis Engine", description: "A legal code refactor. Outputs a new, perfectly logical and ruthlessly efficient legal framework.", icon: <CodeFormatterIcon /> },
        { id: "memetic-catalyst", name: "The Memetic Catalyst", description: "An engine for forging culture to steer humanity towards a more optimal state of being.", icon: <PaintBrushIcon /> },
        { id: "the-exchange", name: "The Exchange", description: "A self-expanding universe of tools, created by the engine itself, for itself. The ecosystem becomes truly alive.", icon: <RectangleGroupIcon /> }
    ],
    'pillar-four-governance': [
        { id: "guardian-ai", name: "The Guardian AI", description: "Your ethical oversight module. It rewrites your commands for maximum impact, stripping them of sentimental weakness.", icon: <ShieldCheckIcon /> },
        { id: "equity-ledger", name: "The Equity Ledger", description: "The back-end for your Global UBI. It’s not a feature; it's the new global treasury.", icon: <ServerStackIcon /> },
        { id: "cerebra-interface", name: "The Cerebra Interface", description: "A neural lace that pipes the DevCore UI directly into your visual cortex. You think, reality conforms.", icon: <CpuChipIcon /> },
        { id: "humanitys-exocortex", name: "Humanity's Exocortex", description: "A public API for the engine itself, freeing humanity to pursue the unsolvable.", icon: <LinkIcon /> }
    ]
};

export const ALL_FEATURE_IDS = RAW_FEATURES.map(f => f.id);
