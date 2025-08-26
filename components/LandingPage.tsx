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
                           The Integrated Reality Engine
                        </h1>
                        <p className="mt-6 max-w-3xl mx-auto text-lg text-slate-400 fade-in-up" style={{ animationDelay: '0.3s' }}>
                           This is not an application. It is a foundational layer for a new kind of computational reality. It is an operating system for intent.
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
                        <h2 className="text-3xl font-bold text-center mb-8">Architectural Pillars of Innovation</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <PillarCard title="Pillar I: The Global Economic Operating System">
                                The Engine transitions from managing a bank to becoming the planet's financial backbone. It autonomically orchestrates global logistics, offers Central Banking as a Service (CBaaS), performs predictive resource allocation, and generates entire urban plans.
                            </PillarCard>
                            <PillarCard title="Pillar II: Computational Compassion at Scale">
                                The Engine's optimization is now applied to humanity's most intractable problems. It simulates Earth's climate to find solutions, forges personalized genomic medicine, generates dynamic AI curricula, and orchestrates automated disaster response.
                            </PillarCard>
                             <PillarCard title="Pillar III: The Meta-Creation Platform">
                                The Engine no longer just builds software; it accelerates the very pace of discovery. It offers the Scientific Method as a Service (SMaaS), generates optimized legal frameworks, and even forges synthetic cultural movements.
                            </PillarCard>
                             <PillarCard title="Pillar IV: The Governance Layer">
                                Absolute power requires a new form of control. This layer includes a real-time Ethical Oversight AI, a Global UBI ledger based on system surplus, and simulates a direct neural interface—the DevCore Reality Shell.
                            </PillarCard>
                        </div>
                    </section>
                     <section className="text-center py-16">
                        <h2 className="text-3xl font-bold mb-4">This system was not built to write code.</h2>
                        <p className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-sky-500">It was built to forge reality.</p>
                    </section>
                </div>
            </div>
        </div>
    );
};