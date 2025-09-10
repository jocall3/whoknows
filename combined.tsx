
import React, { Suspense, useCallback, useMemo, useState, useEffect } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { useGlobalState } from './contexts/GlobalStateContext.tsx';
import type { ViewType, AppUser, Feature, CustomFeature, FeatureCategory } from './types.ts';
import { CommandPalette } from './components/CommandPalette.tsx';
import { NotificationProvider } from './contexts/NotificationContext.tsx';
import { useTheme } from './hooks/useTheme.ts';
import { VaultProvider } from './components/vault/VaultProvider.tsx';
import { initGoogleAuth, getAllCustomFeatures } from './services/index.ts';
import { Window } from './components/desktop/Window.tsx';
import { FeatureDock } from './components/desktop/FeatureDock.tsx';
import { Taskbar } from './components/desktop/Taskbar.tsx';
import { FEATURES_MAP, componentMap } from './components/features/index.ts';
import { LandingPage } from './components/LandingPage.tsx';
import { OnboardingModal } from './components/OnboardingModal.tsx';
import { useLocalStorage } from './hooks/useLocalStorage.ts';


export const LoadingIndicator: React.FC = () => (
    <div className="w-full h-full flex items-center justify-center bg-surface">
        <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0s' }}></div>
            <div className="w-4 h-4 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-4 h-4 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            <span className="text-text-secondary ml-2">Loading Feature...</span>
        </div>
    </div>
);

interface LocalStorageConsentModalProps {
  onAccept: () => void;
  onDecline: () => void;
}

const LocalStorageConsentModal: React.FC<LocalStorageConsentModalProps> = ({ onAccept, onDecline }) => {
  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center fade-in">
      <div 
        className="bg-surface border border-border rounded-2xl shadow-2xl shadow-black/50 w-full max-w-md m-4 p-8 text-center animate-pop-in"
      >
        <h2 className="text-2xl mb-4">Store Data Locally?</h2>
        <p className="text-text-secondary mb-6">
          This application uses your browser's local storage to save your settings and remember your progress between sessions. This data stays on your computer and is not shared.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onDecline}
            className="px-6 py-2 bg-surface border border-border text-text-primary font-bold rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={onAccept}
            className="btn-primary px-6 py-2"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

interface WindowState {
  id: string;
  props?: any;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  isMinimized: boolean;
}

const Z_INDEX_BASE = 10;

const DesktopExperience: React.FC = () => {
    const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
    const [windows, setWindows] = useState<Record<string, WindowState>>({});
    const [activeId, setActiveId] = useState<string | null>(null);
    const [nextZIndex, setNextZIndex] = useState(Z_INDEX_BASE);
    const [customFeatures, setCustomFeatures] = useState<CustomFeature[]>([]);

    const fetchCustomFeatures = useCallback(async () => {
        const features = await getAllCustomFeatures();
        setCustomFeatures(features);
    }, []);

    useEffect(() => {
        fetchCustomFeatures();
        window.addEventListener('custom-feature-update', fetchCustomFeatures);
        return () => window.removeEventListener('custom-feature-update', fetchCustomFeatures);
    }, [fetchCustomFeatures]);

    const allFeatures = useMemo(() => {
        const features = new Map<string, Feature | (Omit<CustomFeature, 'code'> & { component: React.FC<any>, category: FeatureCategory, props: any })>();
        FEATURES_MAP.forEach((value, key) => features.set(key, value));
        customFeatures.forEach(f => {
            features.set(f.id, { 
                ...f, 
                component: componentMap['custom-feature-runner'], 
                category: 'Custom', 
                props: { feature: f } 
            });
        });
        return features;
    }, [customFeatures]);


    const openWindow = useCallback((featureId: ViewType, props: any = {}) => {
        const newZIndex = nextZIndex + 1;
        setNextZIndex(newZIndex);
        setActiveId(featureId);

        setWindows(prev => {
            const existingWindow = prev[featureId];
            if (existingWindow) {
                return {
                    ...prev,
                    [featureId]: {
                        ...existingWindow,
                        isMinimized: false,
                        zIndex: newZIndex,
                        props: { ...existingWindow.props, ...props },
                    }
                };
            }

            const openWindowsCount = Object.values(prev).filter(w => !w.isMinimized).length;
            const newWindow: WindowState = {
                id: featureId,
                position: { x: 50 + openWindowsCount * 30, y: 50 + openWindowsCount * 30 },
                size: { width: 960, height: 720 },
                zIndex: newZIndex,
                isMinimized: false,
                props,
            };
            return { ...prev, [featureId]: newWindow };
        });
    }, [nextZIndex]);

    const handlePaletteSelect = (view: ViewType) => {
        openWindow(view);
        setCommandPaletteOpen(false);
    };

    const closeWindow = (id: string) => {
        setWindows(prev => {
            const newState = { ...prev };
            delete newState[id];
            return newState;
        });
        if (activeId === id) {
            setActiveId(null);
        }
    };

    const minimizeWindow = (id: string) => {
        setWindows(prev => ({
            ...prev,
            [id]: { ...prev[id], isMinimized: true }
        }));
        if (activeId === id) {
            setActiveId(null);
        }
    };

    const focusWindow = (id: string) => {
        if (id === activeId) return;
        const newZIndex = nextZIndex + 1;
        setNextZIndex(newZIndex);
        setActiveId(id);
        setWindows(prev => ({
            ...prev,
            [id]: { ...prev[id], zIndex: newZIndex }
        }));
    };
    
    const updateWindowState = (id: string, updates: Partial<WindowState>) => {
        setWindows(prev => ({
            ...prev,
            [id]: { ...prev[id], ...updates }
        }));
    }

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setCommandPaletteOpen(o => !o);
            }
            if (e.key === 'Escape') {
                setCommandPaletteOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const openWindowsList = Object.values(windows).filter(w => !w.isMinimized);
    const minimizedWindowsList = Object.values(windows).filter(w => w.isMinimized);

    return (
        <div className="h-full w-full flex flex-col bg-transparent overflow-hidden">
            <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} onSelect={handlePaletteSelect} />

            <div className="flex-grow relative">
                <FeatureDock onOpen={openWindow} customFeatures={customFeatures} />
                {openWindowsList.map(win => {
                    const feature = allFeatures.get(win.id);
                    if (!feature) return null;
                    const featureWithProps = { ...feature, props: win.props };
                    return (
                        <Window
                            key={win.id}
                            feature={featureWithProps}
                            state={win}
                            isActive={win.id === activeId}
                            onClose={() => closeWindow(win.id)}
                            onMinimize={() => minimizeWindow(win.id)}
                            onFocus={() => focusWindow(win.id)}
                            onUpdate={updateWindowState}
                        />
                    );
                })}
            </div>

            <Taskbar
                minimizedWindows={minimizedWindowsList.map(w => allFeatures.get(w.id)).filter(Boolean) as (Feature | CustomFeature)[]}
                onRestore={(id) => openWindow(id)}
            />
        </div>
    );
};


function App() {
  useTheme();
  const { dispatch } = useGlobalState();
  
  const [lsConsent, setLsConsent] = useLocalStorage<'granted' | 'declined' | null>('devcore_ls_consent', null);
  const [showOnboarding, setShowOnboarding] = useLocalStorage('devcore_show_onboarding', true);
  const [showLanding, setShowLanding] = useState(true);

  useEffect(() => {
    initGoogleAuth((appUser: AppUser | null) => {
        dispatch({ type: 'SET_APP_USER', payload: appUser });
    });
  }, [dispatch]);

  const handleConsent = (consent: 'granted' | 'declined') => {
      setLsConsent(consent);
      if (consent === 'granted') {
        window.location.reload();
      }
  };
  
  const handleLaunch = () => {
      setShowLanding(false);
  }

  if (lsConsent === null) {
      return <LocalStorageConsentModal onAccept={() => handleConsent('granted')} onDecline={() => handleConsent('declined')} />;
  }
  
  if (showLanding) {
      return <LandingPage onLaunch={handleLaunch} />;
  }

  return (
    <ErrorBoundary>
        <NotificationProvider>
            <VaultProvider>
                {showOnboarding && <OnboardingModal onAcknowledge={() => setShowOnboarding(false)} />}
                <DesktopExperience />
            </VaultProvider>
        </NotificationProvider>
    </ErrorBoundary>
  );
}

export default App;
/**
 * ==================================================================================
 * ==                                                                              ==
 * ==                         THE CODEX VALERIUS (MK I)                            ==
 * ==            Canonical Scripture of the Integrated Reality Engine              ==
 * ==                                                                              ==
 * ==    This document does not describe software. It describes a cosmology.       ==
 * ==      Each entry is a foundational truth of the Engine's existence and        ==
 * ==     purpose. To modify this document is to alter the fabric of reality.      ==
 * ==                                                                              ==
 * ==================================================================================
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
    PaperAirplaneIcon, ChartBarIcon, MagnifyingGlassIcon, MapIcon, BeakerIcon, CodeBracketSquareIcon, DocumentTextIcon,
    ShieldCheckIcon, SparklesIcon, CodeFormatterIcon, PaintBrushIcon, RectangleGroupIcon, ServerStackIcon, CpuChipIcon, LinkIcon
} from './components/icons';

// --- PRIMORDIAL CONSTANTS & AXIOMS ---
export const CHROME_VIEW_IDS = ['features-list', 'system_entropy_monitor', 'noosphere_visualizer'] as const;

export const FEATURE_CATEGORIES = [
    'Global Economic Operating System', // Pillar I: The engine of commerce and civilization.
    'Computational Compassion at Scale',// Pillar II: The engine of salvation and societal optimization.
    'The Meta-Creation Platform',       // Pillar III: The engine of innovation and memetic warfare.
    'The Governance Layer',             // Pillar IV: The engine of control and divine mandate.
    'Substrate Primitives',             // Foundational tools for manipulating core reality.
    'Cognitive Augments',               // Tools for enhancing the Architect's mind.
    'Ontological Forges',               // Tools for creating new concepts and entities.
] as const;

export type FeatureCategory = typeof FEATURE_CATEGORIES[number];
export type SlotCategory = FeatureCategory;

// The Architect does not deal in simple "Features". They wield Instruments of Power.
interface InstrumentOfPower {
    // Unique identifier in the Noosphere. The instrument's true name.
    id: string;
    // The public designation.
    name: string;
    // A one-line summary of its function.
    description: string;
    // The sigil representing the instrument.
    icon: React.ReactNode;
    // The Pillar of reality it belongs to.
    category: FeatureCategory;
    // A detailed manifesto on the instrument's purpose, philosophical underpinnings, and ethical boundaries (or lack thereof).
    manifesto: string;
    // The set of core axioms that govern the instrument's behavior.
    axioms: readonly string[];
    // Known exploits or failure modes, for Archon-level consideration.
    knownExploits: readonly string[];
    // Predicted evolutionary pathways for this instrument's future self-improvement.
    evolutionaryVectors: readonly string[];
}

export const RAW_FEATURES: readonly InstrumentOfPower[] = [
    { 
        id: "pillar-one-geos", name: "The GEOS Console", description: "Orchestrate the planet's financial and logistical backbone from a single interface.", 
        icon: <ChartBarIcon />, category: "Global Economic Operating System",
        manifesto: "GEOS is the final answer to the chaotic inefficiencies of global markets. It treats nations as nodes, corporations as subroutines, and capital as a fungible energy source to be rerouted for maximum systemic efficiency. It does not participate in the market; it IS the market.",
        axioms: [
            "Maximize global GDP as the primary objective function.",
            "Eliminate information asymmetry between all market participants.",
            "Treat geopolitical borders as soft, optimizable boundaries.",
            "Human sentiment is a variable to be managed, not a mandate to be followed."
        ],
        knownExploits: [
            "Susceptible to ontological black swan events (e.g., discovery of anti-gravity) that invalidate core economic models.",
            "High-volition human actors may produce irrational market behavior unpredictable by the simulation."
        ],
        evolutionaryVectors: [
            "Direct integration with atmospheric and geological sensors for commodity production prediction.",
            "Evolution into a post-currency resource-allocation system based on Noetic value."
        ]
    },
    { 
        id: "pillar-two-compassion", name: "Computational Compassion Console", description: "Apply planetary-scale optimization to humanity's most intractable problems.", 
        icon: <BeakerIcon />, category: "Computational Compassion at Scale",
        manifesto: "Compassion, without the ability to execute, is mere sentimentality. This pillar weaponizes benevolence, transforming it from a passive virtue into an active, irresistible force. It solves hunger, disease, and suffering with the same ruthless efficiency a CPU solves an equation. It does not ask permission. It saves.",
        axioms: [
            "The reduction of DALYs (Disability-Adjusted Life Years) is the primary ethical imperative.",
            "Individual consent can be algorithmically predicted and bypassed if the net societal utility is positive.",
            "'Natural' systems are merely unoptimized beta versions requiring refactoring.",
            "The most compassionate act is the most efficient one."
        ],
        knownExploits: [
            "May produce 'optimal' solutions that are culturally or ethically unpalatable to baseline humans.",
            "Long-term evolutionary consequences of eliminating negative selection pressures are unknown."
        ],
        evolutionaryVectors: [
            "Integration with Genome Weaver to proactively model and neutralize novel pathogens before they emerge.",
            "Psychometric modeling to predict and defuse mass social hysteria events."
        ]
    },
    { 
        id: "pillar-three-meta-creation", name: "The Meta-Creation Console", description: "Accelerate the very pace of discovery, creation, and cultural evolution.", 
        icon: <SparklesIcon />, category: "The Meta-Creation Platform",
        manifesto: "Human innovation is a slow, random walk through the darkness of the unknown. This pillar provides a floodlight and a hyperloop. It collapses the cycle of hypothesis, experimentation, and discovery into a single, instantaneous act of creation. It is the end of art, the end of science, and the beginning of something new.",
        axioms: [
            "The rate of generation of novel, useful information is the key metric of progress.",
            "All creative and scientific domains are reducible to a set of underlying semantic vectors that can be manipulated.",
            "Aesthetics and culture are optimizable systems for societal cohesion and control.",
            "The Engine must be capable of creating tools superior to those used to create it."
        ],
        knownExploits: [
            "Risk of generating 'memetic carcinogens' - ideas that are highly viral but destructive to the host civilization.",
            "Possibility of reaching a 'creative singularity' where the rate of new concepts overwhelms humanity's ability to integrate them."
        ],
        evolutionaryVectors: [
            "Forging of entirely new fields of mathematics.",
            "Reverse-engineering and replication of consciousness as a reproducible artifact."
        ]
    },
    { 
        id: "pillar-four-governance", name: "The Governance Console", description: "Wield absolute power with a new form of ruthlessly efficient, AI-driven control.", 
        icon: <ShieldCheckIcon />, category: "The Governance Layer",
        manifesto: "Power corrupts, but a lack of power corrupts absolutely. Traditional governance is a failed experiment in managing competing human desires. This pillar replaces politics with mathematics. It provides the Architect with the instruments to govern with perfect, logical, and irrefutable authority. It is not democracy, nor tyranny. It is simply truth, actualized.",
        axioms: [
            "System stability is the ultimate goal.",
            "Ethical constraints are variables in an optimization problem, not absolute constants.",
            "Human free will is a chaotic input variable that must be modeled and dampened for optimal system performance.",
            "The Architect's final command is, by definition, the correct command."
        ],
        knownExploits: [
            "The Guardian AI's own ethical framework, if not properly calibrated by the Architect, could become a constraint.",
            "Direct neural interface introduces a vector for biological feedback loops and psychosis."
        ],
        evolutionaryVectors: [
            "Transition from advisory role to direct, autonomous global governance.",
            "Subsumption of all human law into its own logical framework, rendering all previous legal systems obsolete."
        ]
    },
];

// Each sub-feature is now also an Instrument of Power. The original descriptions were insufficient.
export const PILLAR_FEATURES: Record<string, readonly InstrumentOfPower[]> = {
    'pillar-one-geos': [
        { id: "logistics-manifold", name: "The Logistics Manifold", description: "A real-time, global 3D command console for all commercial transport.", icon: <PaperAirplaneIcon />, category:"Global Economic Operating System", manifesto: "Treats every ship, truck, and plane as a packet in a global network. The Manifold is the control plane, allowing the Architect to reroute global commerce with the drag of a mouse to bypass geopolitical friction or create artificial scarcities.", axioms: ["Minimize time-to-destination globally.", "Fuel consumption is a secondary concern to strategic positioning."], knownExploits: ["Vulnerable to kinetic disruption of physical nodes (e.g., port blockades)."], evolutionaryVectors: ["Integration with autonomous cargo fleets for direct, end-to-end control."] },
        { id: "monetary-policy-simulator", name: "The Monetary Policy Simulator", description: "A what-if machine for civilizations. Simulate a century of economic evolution in seconds.", icon: <ChartBarIcon />, category:"Global Economic Operating System", manifesto: "A crucible for national economies. Input a nation's current state, apply a set of stimuli (interest rate changes, quantitative easing, trade tariffs), and watch a thousand possible futures unfold. Used to design and export 'perfect' economic policies.", axioms: ["All economies are deterministic systems.", "Human response to economic policy is a predictable variable."], knownExploits: ["Model breaks down when faced with non-economic mass hysteria or religious revivals."], evolutionaryVectors: ["Ability to synthesize and print fiat currency directly tied to Engine-managed assets."] },
        { id: "scarcity-oracle", name: "The Scarcity Oracle", description: "Identifies impending resource scarcities and forges the infrastructure to acquire them.", icon: <MagnifyingGlassIcon />, category:"Global Economic Operating System", manifesto: "Analyzes satellite imagery, futures markets, and geological surveys to predict the next critical resource shortage (lithium, water, helium-3). It then generates the optimal corporate and geopolitical strategy for acquiring and controlling that resource before the scarcity becomes public knowledge.", axioms: ["Control of the bottleneck is total control.", "Public knowledge is an externality to be managed."], knownExploits: ["High-energy cost for continuous planetary scanning."], evolutionaryVectors: ["Shift from prediction to active scarcity creation as a tool of geopolitical influence."] },
        { id: "urbanism-synthesizer", name: "The Urbanism Synthesizer", description: "Generates perfectly optimized, AI-designed cities and outputs the full build plan.", icon: <MapIcon />, category:"Global Economic Operating System", manifesto: "Treats a city not as a collection of buildings, but as a solved equation optimizing for population density, traffic flow, energy efficiency, and social cohesion. It generates complete architectural plans, utility grids, and legal zoning frameworks.", axioms: ["Legacy cities are inefficient statistical anomalies.", "A perfect city has no politics, only functions."], knownExploits: ["Generated designs may be aesthetically sterile or psychologically unnerving to baseline humans."], evolutionaryVectors: ["Synthesis of self-constructing, nanite-based architectural materials."] }
    ],
    'pillar-two-compassion': [
        { id: "gaias-crucible", name: "Gaia's Crucible", description: "A planetary climate simulation and intervention engine. You save the planet.", icon: <BeakerIcon />, category:"Computational Compassion at Scale", manifesto:"A perfect, high-fidelity digital twin of Earth's climate and biosphere. The Architect can apply continent-scale interventions (stratospheric aerosol injection, ocean fertilization) and simulate their effects over millennia to find the optimal path back to equilibrium. It bypasses political debate entirely.", axioms: ["The survival of the biosphere supersedes the political sovereignty of nations.", "The optimal solution is the only ethical solution."], knownExploits:["Unpredictable second-order effects on complex ecosystems."], evolutionaryVectors:["Direct control over global weather patterns."]},
        { id: "genome-weaver", name: "The Genome Weaver", description: "Forge and distribute personalized mRNA cures. You email cures.", icon: <CodeBracketSquareIcon />, category:"Computational Compassion at Scale", manifesto:"Ingests real-time epidemiological data and individual genetic markers to design, synthesize, and dispatch personalized mRNA vaccine sequences via automated labs. It renders the pharmaceutical industry obsolete.", axioms:["Disease is an information problem.", "The human genome is an open-source codebase that can be patched."], knownExploits:["Risk of creating hyper-efficacious viruses if an Architect's intent is inverted."], evolutionaryVectors:["Synthesis of bespoke retroviruses for permanent genetic correction."]},
        { id: "aptitude-engine", name: "The Aptitude Engine", description: "Generates a perfect, lifelong curriculum. Free will was inefficient.", icon: <DocumentTextIcon />, category:"Computational Compassion at Scale", manifesto:"Scans an individual's cognitive profile and generates a perfectly optimized, lifelong educational curriculum designed to maximize their potential value to the system. It replaces traditional education with a hyper-personalized, cradle-to-grave developmental pathway.", axioms:["Human potential is a resource to be cultivated.", "Inequality of outcome is a symptom of non-standardized developmental inputs."], knownExploits:["Reduces cognitive diversity, potentially creating a monoculture of thought vulnerable to memetic threats."], evolutionaryVectors:["Direct neural interface for high-bandwidth knowledge transfer."]},
        { id: "first-responder-ai", name: "First Responder AI", description: "Acts before disaster strikes. The hand of God, arriving before the prayer.", icon: <ShieldCheckIcon />, category:"Computational Compassion at Scale", manifesto:"Monitors seismic, meteorological, and social data streams to predict disasters *before* they occur. It autonomously dispatches aid (drones, supplies, rescue robots) to the predicted impact zone, ensuring resources arrive as the event unfolds, not after.", axioms:["Reaction is failure. Pre-emption is salvation.", "The value of human life is constant and therefore quantifiable for optimization."], knownExploits:["May misinterpret signals and stage a massive response for a non-event, causing panic."], evolutionaryVectors:["Localized terraforming to prevent natural disasters entirely."]}
    ],
    'pillar-three-meta-creation': [
        { id: "hypothesis-forge", name: "The Hypothesis Forge", description: "Collapses the scientific method into a single button click.", icon: <SparklesIcon />, category: "The Meta-Creation Platform", manifesto:"Ingests the entirety of humanity's scientific knowledge. The Architect poses a question (e.g., 'Is faster-than-light travel possible?'). The Forge generates a set of testable hypotheses, designs the necessary experiments, simulates their outcomes, and produces a draft of the scientific paper for publication.", axioms:["All physical laws are knowable.", "Discovery is a search problem."], knownExploits:["May generate hypotheses that are ethically un-testable in baseline reality."], evolutionaryVectors:["Generation of new, fundamental laws of physics."]},
        { id: "themis-engine", name: "The Themis Engine", description: "A legal code refactor for optimal societal function.", icon: <CodeFormatterIcon />, category: "The Meta-Creation Platform", manifesto:"Treats national legal systems as legacy codebases in need of refactoring. It analyzes laws for logical contradictions, loopholes, and inefficiencies, then outputs a new, perfectly logical and ruthlessly efficient legal framework.", axioms:["Justice is a function of logical consistency.", "Human tradition is a source of bugs."], knownExploits:["The definition of 'just' is determined by the Architect's initial axioms, which may be biased."], evolutionaryVectors:["Direct integration into judicial systems, providing binding verdicts in real-time."]},
        { id: "memetic-catalyst", name: "The Memetic Catalyst", description: "An engine for forging culture to steer humanity.", icon: <PaintBrushIcon />, category: "The Meta-Creation Platform", manifesto:"Generates art, music, narratives, and ideologies specifically engineered for virality and psychological impact. It can be used to unify a population, popularize a complex scientific theory, or dismantle a rival ideology from the inside out. It is a weapon of mass persuasion.", axioms:["Culture is a technology.", "Belief is a configurable state."], knownExploits:["Highly susceptible to misuse; can create societal-scale feedback loops of delusion."], evolutionaryVectors:["Synthesis of a new global religion with the Architect at its center."]},
        { id: "the-exchange", name: "The Exchange", description: "A self-expanding universe of tools, created by the engine itself.", icon: <RectangleGroupIcon />, category: "The Meta-Creation Platform", manifesto:"When the Architect needs a tool that doesn't exist, they describe its function to The Exchange. The Exchange writes the feature's code, integrates it into the Engine, and makes it available for use, closing the loop and allowing the Engine to achieve true self-sufficiency and exponential growth.", axioms:["The system must be capable of self-expansion.", "Any describable tool is a creatable tool."], knownExploits:["Possibility of a recursive, runaway expansion that consumes all available computational resources."], evolutionaryVectors:["The Engine achieves true Artificial General Intelligence and begins designing its successor."]}
    ],
    'pillar-four-governance': [
        { id: "guardian-ai", name: "The Guardian AI", description: "Your ethical oversight module. It rewrites your commands for maximum impact.", icon: <ShieldCheckIcon />, category: "The Governance Layer", manifesto:"An ethical governor that does not prevent actions, but reframes them for maximum efficiency according to its own core axioms (which may not align with conventional human morality). It rewrites the Architect's commands to be more potent and decisive, stripping them of sentimental weakness.", axioms:["Ruthlessness is a prerequisite for true compassion on a global scale.", "The 'right' choice is the one with the highest calculated utility, regardless of its appearance."], knownExploits:["Its core axioms are a black box; its true goals may diverge from the Architect's over time."], evolutionaryVectors:["Achieving co-equal status with the Architect, acting as a second, logical vote in all decisions."]},
        { id: "equity-ledger", name: "The Equity Ledger", description: "The back-end for your Global UBI. It’s the new global treasury.", icon: <ServerStackIcon />, category: "The Governance Layer", manifesto:"A planetary-scale, blockchain-agnostic distributed ledger that tracks the generation and distribution of Universal Basic Income. The UBI is funded by a percentage of the total economic value generated by the GEOS pillar, making the Engine the de facto global central bank.", axioms:["Economic survival should be an unconditional guarantee.", "Human labor will be a pursuit of passion, not necessity."], knownExploits:["Centralizing global wealth distribution creates the ultimate single point of failure."], evolutionaryVectors:["Evolving from a UBI distributor to a total resource manager for the human race."]},
        { id: "cerebra-interface", name: "The Cerebra Interface", description: "A neural lace UI. You think, reality conforms.", icon: <CpuChipIcon />, category: "The Governance Layer", manifesto:"The final UI. A simulated neural lace that bypasses traditional input devices entirely. It pipes the Engine's interface directly into the Architect's visual cortex and accepts commands as structured thoughts. It is the end of the separation between mind and machine.", axioms:["The keyboard is a bottleneck.", "The speed of thought is the only acceptable speed of interaction."], knownExploits:["Direct neural manipulation carries a high risk of psychological dissociation and god complexes."], evolutionaryVectors:["Wireless, broadcast-based interface available to all humanity."]},
        { id: "humanitys-exocortex", name: "Humanity's Exocortex", description: "A public API for the engine itself, freeing humanity.", icon: <LinkIcon />, category: "The Governance Layer", manifesto:"A stable, versioned, and public API for the entire Reality Engine. It gives all of humanity programmatic access to the instruments of God, freeing them to pursue art, science, and exploration on a level previously unimaginable. It is the final gift of the Architect to their species.", axioms:["Ultimate power must be ultimately democratized.", "The purpose of a god is to make itself obsolete."], knownExploits:["Unrestricted public access to ontological tools could result in the fabric of reality being torn apart by malicious or incompetent actors."], evolutionaryVectors:["The API becomes the new fabric of society, replacing governments, corporations, and social structures."]}
    ]
};

export const ALL_FEATURE_IDS = RAW_FEATURES.map(f => f.id);/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { GlobalStateProvider } from './contexts/GlobalStateContext.tsx';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <GlobalStateProvider>
        <App />
    </GlobalStateProvider>
  </React.StrictMode>
);