import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { BrainCircuit, Sparkles } from 'lucide-react';

const SolutionReveal: React.FC = () => {
    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start end", "end start"]
    });

    const scale = useTransform(scrollYProgress, [0.1, 0.4], [0.8, 1]);
    const opacity = useTransform(scrollYProgress, [0.1, 0.4], [0, 1]);
    const y = useTransform(scrollYProgress, [0.1, 0.5], [100, 0]);

    return (
        <div ref={targetRef} className="min-h-screen bg-slate-950 flex items-center justify-center relative py-32 overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 pointer-events-none"></div>

            <motion.div
                style={{ scale, opacity, y }}
                className="max-w-7xl mx-auto px-6 text-center relative z-10"
            >
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-400 mb-8 backdrop-blur-md"
                >
                    <Sparkles size={16} className="animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-widest">The Neural Bridge</span>
                </motion.div>

                <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-12">
                    Meet Your <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 animate-gradient-xy">
                        Intelligent Co-Founder.
                    </span>
                </h2>

                <div className="relative group mx-auto max-w-5xl rounded-3xl border border-white/10 bg-slate-900/50 backdrop-blur-xl overflow-hidden shadow-2xl shadow-indigo-500/10">
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                    {/* UI Mockup Representation */}
                    <div className="p-8 md:p-12 grid md:grid-cols-3 gap-8 text-left">
                        <div className="col-span-1 space-y-6">
                            <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                                <BrainCircuit size={24} />
                            </div>
                            <h3 className="text-2xl font-bold text-white">Contextual Intelligence</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Unlike standard chatbots, PromptNovaX retains your entire business context. It knows your goals, team, and limitations.
                            </p>
                            <div className="h-px w-full bg-slate-800"></div>
                            <div className="flex gap-4 text-xs font-mono text-slate-500">
                                <span>MEMORY: ACTIVE</span>
                                <span>CONTEXT: DEEP</span>
                            </div>
                        </div>

                        <div className="col-span-2 bg-slate-950 rounded-2xl border border-slate-800 p-6 relative overflow-hidden flex items-center justify-center">
                            {/* Abstract Visualization of AI Working */}
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                            <div className="relative z-10 text-center space-y-4">
                                <div className="inline-block p-4 rounded-full bg-slate-900 border border-slate-800 shadow-2xl relative">
                                    <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
                                    <Sparkles size={32} className="text-white relative z-10" />
                                </div>
                                <div className="space-y-2">
                                    <div className="h-2 w-32 bg-slate-800 rounded-full mx-auto animate-pulse"></div>
                                    <div className="h-2 w-24 bg-slate-800 rounded-full mx-auto animate-pulse animation-delay-200"></div>
                                </div>
                                <p className="text-sm font-medium text-slate-400">Analyzing Market Patterns...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SolutionReveal;
