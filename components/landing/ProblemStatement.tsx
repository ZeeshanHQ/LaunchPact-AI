import React from 'react';
import { AlertTriangle, XCircle, Anchor, ZapOff } from 'lucide-react';

const ProblemStatement: React.FC = () => {
    const problems = [
        {
            title: "Execution Chaos",
            desc: "Great ideas drown in a sea of disconnected tools and scattered notes. Without a neural blueprint, you are building in the dark.",
            icon: <ZapOff size={24} />,
            color: "group-hover:text-red-400 group-hover:bg-red-500/10",
            border: "hover:border-red-500/20"
        },
        {
            title: "Strategy Gap",
            desc: "Knowledge is cheap. Strategy is expensive. Most founders waste months building features nobody wants because they skipped the architecture phase.",
            icon: <XCircle size={24} />,
            color: "group-hover:text-amber-400 group-hover:bg-amber-500/10",
            border: "hover:border-amber-500/20"
        },
        {
            title: "Cognitive Overload",
            desc: "Managing CEO, CTO, and CMO roles simultaneously is a recipe for burnout. You need an intelligent architect, not just another chatbot.",
            icon: <Anchor size={24} />,
            color: "group-hover:text-indigo-400 group-hover:bg-indigo-500/10",
            border: "hover:border-indigo-500/20"
        }
    ];

    return (
        <div id="features" className="w-full bg-slate-950 py-32 lg:py-48 relative overflow-hidden">
            {/* Background Sophistication */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-slate-900/50 to-transparent z-0"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-32">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/5 border border-red-500/10 text-red-500 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8">
                        <AlertTriangle size={12} /> The Brutal Truth
                    </div>
                    <h3 className="text-5xl md:text-[6rem] font-black text-white tracking-tightest leading-[0.8] uppercase italic mb-8">
                        Why startups <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-b from-slate-700 to-slate-900">Die in Silence.</span>
                    </h3>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {problems.map((p, i) => (
                        <div key={i} className={`group p-10 rounded-[2.5rem] bg-white/[0.01] border border-white/5 transition-all duration-700 ${p.border} hover:bg-white/[0.03] hover:-translate-y-3`}>
                            <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 transition-all duration-500 mb-10 ${p.color}`}>
                                {p.icon}
                            </div>
                            <h4 className="text-2xl font-black text-white mb-6 uppercase tracking-tight">{p.title}</h4>
                            <p className="text-slate-500 leading-relaxed font-medium group-hover:text-slate-300 transition-colors">
                                {p.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProblemStatement;
