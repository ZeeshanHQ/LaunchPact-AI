import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Lightbulb, FileCode2, Rocket, ArrowRight } from 'lucide-react';

const steps = [
    {
        id: 1,
        title: "Ideation",
        subtitle: "From Chaos to Clarity",
        description: "You have a vague spark. We turn it into a blazing vision. Our neural engine interrogates your raw thoughts, filling gaps and identifying blind spots.",
        icon: <Lightbulb size={32} />,
        color: "from-amber-400 to-orange-500",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20"
    },
    {
        id: 2,
        title: "Blueprint",
        subtitle: "From Concept to Architecture",
        description: "We don't just 'generate text'. We architect business logic. Data models, user flows, and tech stacks are compiled into an execution-ready Master Blueprint.",
        icon: <FileCode2 size={32} />,
        color: "from-indigo-400 to-cyan-500",
        bg: "bg-indigo-500/10",
        border: "border-indigo-500/20"
    },
    {
        id: 3,
        title: "Execution",
        subtitle: "From Plan to Reality",
        description: "Launch with confidence. Get a day-by-day execution plan, marketing strategies, and investor-perfect pitch decks tailored to your specific niche.",
        icon: <Rocket size={32} />,
        color: "from-emerald-400 to-green-500",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20"
    }
];

const HowItWorks: React.FC = () => {
    return (
        <div className="bg-slate-950 py-32 relative">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-20">
                    <span className="text-xs font-black text-indigo-500 uppercase tracking-widest">The Process</span>
                    <h2 className="text-5xl font-black text-white mt-4 tracking-tight">From Thought to Empire.</h2>
                </div>

                <div className="grid lg:grid-cols-2 gap-16 relative">
                    {/* Left Column (Sticky Content) */}
                    <div className="hidden lg:block">
                        <div className="sticky top-32 space-y-12">
                            {steps.map((step, index) => (
                                <motion.div
                                    key={step.id}
                                    initial={{ opacity: 0.3, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ margin: "-10% 0px -50% 0px" }}
                                    transition={{ duration: 0.5 }}
                                    className="relative pl-8 border-l-2 border-slate-800"
                                >
                                    <div className={`absolute left-[-17px] top-0 w-8 h-8 rounded-full bg-slate-900 border-2 ${step.border} flex items-center justify-center text-slate-500`}>
                                        <span className="text-xs font-bold">{step.id}</span>
                                    </div>
                                    <h3 className="text-3xl font-black text-white mb-2">{step.title}</h3>
                                    <h4 className="text-lg font-bold text-slate-500 uppercase tracking-widest mb-4">{step.subtitle}</h4>
                                    <p className="text-slate-400 leading-relaxed max-w-md">
                                        {step.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column (Cards) */}
                    <div className="space-y-32 lg:space-y-64 pt-10">
                        {steps.map((step) => (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                viewport={{ margin: "-20% 0px" }}
                                transition={{ duration: 0.6 }}
                                className={`rounded-[3rem] p-10 border ${step.border} ${step.bg} aspect-square flex flex-col items-center justify-center text-center relative overflow-hidden group`}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-10 transition-opacity duration-700`}></div>
                                <div className="w-24 h-24 rounded-3xl bg-slate-900/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white mb-8 shadow-2xl relative z-10 group-hover:scale-110 transition-transform duration-500">
                                    {step.icon}
                                </div>
                                <h3 className="text-4xl font-black text-white mb-4 relative z-10">{step.title}</h3>
                                <div className="relative z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-4 group-hover:translate-y-0">
                                    <button className="flex items-center gap-2 text-white font-bold text-sm uppercase tracking-widest hover:gap-4 transition-all">
                                        Explore Phase <ArrowRight size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HowItWorks;
