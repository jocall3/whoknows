

import React from 'react';

const PillarCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 backdrop-blur-sm transition-all duration-300 hover:bg-slate-800 hover:border-primary/50">
        <h3 className="text-xl font-bold text-primary mb-2">{title}</h3>
        <p className="text-slate-400 text-sm">{children}</p>
    </div>
);

export const LandingPage: React.FC<{ onLaunch: () => void }> = ({ onLaunch }) => {
    return (
        <div className="fixed inset-0 z-40 bg-slate-900/95 backdrop-blur-sm flex flex-col fade-in">
            <div className="h-full w-full overflow-y-auto no-scrollbar">
                <div 
                  className="min-h-screen flex flex-col items-center justify-center p-8 text-center relative"
                >
                    <div className="max-w-4xl animate-pop-in">
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-sky-500">
                            The Self-Forging Bank
                        </h1>
                        <h2 className="text-2xl md:text-3xl font-semibold text-slate-300 mt-2">& The Integrated Reality Engine</h2>
                        <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-400 fade-in-up" style={{ animationDelay: '0.3s' }}>
                            This is not a development toolkit. It is an autopoietic digital ecosystem architected to design, generate, secure, and become a hyper-scale financial institution on command.
                        </p>
                        <button 
                            onClick={onLaunch}
                            className="mt-8 px-8 py-4 bg-primary text-lg font-bold rounded-lg shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/50 shine-effect"
                        >
                            Launch Engine
                        </button>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-8 py-16 space-y-12">
                    <section>
                        <h2 className="text-3xl font-bold text-center mb-8">Simulation & Reality Paradigm</h2>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="bg-slate-800/30 p-6 rounded-lg border border-slate-700">
                                <h3 className="text-2xl font-bold text-green-400 mb-3">Simulation Mode (Default)</h3>
                                <p className="text-slate-400">A perfect, hermetically-sealed universe. All APIs are mocked, data is AI-generated, and the entire "bank" runs in a risk-free sandbox in your browser. This is the state where innovation is forged.</p>
                            </div>
                             <div className="bg-slate-800/30 p-6 rounded-lg border border-slate-700">
                                <h3 className="text-2xl font-bold text-red-400 mb-3">Live Mode (Developer-Activated)</h3>
                                <p className="text-slate-400">With a deliberate, developer-led transition, the engine re-routes its core services to real-world endpoints, transforming the high-fidelity simulation into a production-grade application.</p>
                            </div>
                        </div>
                    </section>
                    
                     <section>
                        <h2 className="text-3xl font-bold text-center mb-8">Architectural Pillars of Innovation</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <PillarCard title="1. The Autopoietic Feature Forge">
                                The system is self-creating. Describe a new financial tool in natural language, and the AI will generate the code, integrating it seamlessly into the ecosystem. The application literally builds itself.
                            </PillarCard>
                            <PillarCard title="2. The Cognitive Orchestration Engine">
                                The AI Command Center performs strategic inference, orchestrating complex, multi-domain logic across all tools and connected services as a single, cohesive cognitive unit.
                            </PillarCard>
                             <PillarCard title="3. The Zero-Knowledge Financial Vault">
                               Absolute security in Live Mode. Using native Web Crypto APIs, your credentials are encrypted with a password that only you know. Your browser becomes a cryptographic citadel.
                            </PillarCard>
                             <PillarCard title="4. Integrated Reality Simulator">
                                The system that enables the dual-mode paradigm. The mock server, database, and AI data generation create a rich, high-fidelity environment to test and showcase strategic capabilities without real-world risk.
                            </PillarCard>
                        </div>
                    </section>
                     <section className="text-center">
                        <h2 className="text-3xl font-bold mb-4">This system was not built to write code.</h2>
                        <p className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-sky-500">It was built to forge reality.</p>
                    </section>
                </div>
            </div>
        </div>
    );
};