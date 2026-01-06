import React from 'react';
import { AlertTriangle, XCircle, Anchor, ZapOff } from 'lucide-react';

const ProblemStatement: React.FC = () => {
    return (
        <div className="w-full bg-slate-950 py-32 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-slate-900 to-slate-950 z-0"></div>
            <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-red-900/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-24">
                    <h2 className="text-sm font-black text-red-500 uppercase tracking-[0.3em] mb-6">The Brutal Truth</h2>
                    <h3 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.9]">
                        Why 90% of Startups <br />
                        <span className="text-slate-800 text-transparent bg-clip-text bg-gradient-to-b from-slate-700 to-slate-900">Die in Silence.</span>
                    </h3>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Card 1: The Chaos */}
                    <div className="group p-8 rounded-[2rem] bg-slate-900/50 border border-slate-800/50 hover:bg-red-950/20 hover:border-red-900/30 transition-all duration-500 hover:-translate-y-2">
                        <div className="w-14 h-14 rounded-2xl bg-slate-800/50 flex items-center justify-center text-slate-500 group-hover:text-red-400 group-hover:bg-red-900/20 transition-all mb-8">
                            <ZapOff size={28} />
                        </div>
                        <h4 className="text-2xl font-black text-slate-200 mb-4 group-hover:text-white">Execution Chaos</h4>
                        <p className="text-slate-500 leading-relaxed group-hover:text-slate-400">
                            Great ideas drown in a sea of disconnected tools, scattered notes, and lack of structure. Without a blueprint, you're building in the dark.
                        </p>
                    </div>

                    {/* Card 2: The Gap */}
                    <div className="group p-8 rounded-[2rem] bg-slate-900/50 border border-slate-800/50 hover:bg-orange-950/20 hover:border-orange-900/30 transition-all duration-500 hover:-translate-y-2">
                        <div className="w-14 h-14 rounded-2xl bg-slate-800/50 flex items-center justify-center text-slate-500 group-hover:text-orange-400 group-hover:bg-orange-900/20 transition-all mb-8">
                            <XCircle size={28} />
                        </div>
                        <h4 className="text-2xl font-black text-slate-200 mb-4 group-hover:text-white">The Strategy Gap</h4>
                        <p className="text-slate-500 leading-relaxed group-hover:text-slate-400">
                            Knowledge is cheap. Strategy is expensive. Most founders waste months building features nobody wants because they skipped the architecture phase.
                        </p>
                    </div>

                    {/* Card 3: The Burnout */}
                    <div className="group p-8 rounded-[2rem] bg-slate-900/50 border border-slate-800/50 hover:bg-indigo-950/20 hover:border-indigo-900/30 transition-all duration-500 hover:-translate-y-2">
                        <div className="w-14 h-14 rounded-2xl bg-slate-800/50 flex items-center justify-center text-slate-500 group-hover:text-indigo-400 group-hover:bg-indigo-900/20 transition-all mb-8">
                            <Anchor size={28} />
                        </div>
                        <h4 className="text-2xl font-black text-slate-200 mb-4 group-hover:text-white">Cognitive Overload</h4>
                        <p className="text-slate-500 leading-relaxed group-hover:text-slate-400">
                            Trying to be the CEO, CTO, and CMO simultaneously is a recipe for burnout. You need an intelligent partner, not just another chatbot.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProblemStatement;
