import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ArrowRight, TrendingUp, Lightbulb, Ship } from 'lucide-react';

const Insights: React.FC = () => {
    const stories = [
        {
            title: "Architecting for Scale: The Distributed DNA",
            desc: "How we simulated a failure-proof architecture for a FinTech unicorn in 45 seconds.",
            tag: "Architecture",
            icon: <Ship size={18} />
        },
        {
            title: "The Psychology of Market Dominance",
            desc: "Understanding how the Force AI swarms identify high-intent consumer patterns.",
            tag: "Market Intel",
            icon: <TrendingUp size={18} />
        },
        {
            title: "Beyond the MVP: Forge Your Empire",
            desc: "Why traditional validation is dead and how autonomous simulations are the new gold standard.",
            tag: "Strategy",
            icon: <Lightbulb size={18} />
        }
    ];

    return (
        <div className="min-h-screen bg-slate-950 pt-32 pb-20 px-6 relative overflow-hidden">
            {/* Background Layers */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none"></div>
            <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent hidden md:block" />

            <div className="max-w-7xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-24"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/5 border border-indigo-500/10 text-indigo-400 mb-6">
                        <BookOpen size={14} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Intellect Base</span>
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-6 leading-none">
                        Venture <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-white to-purple-400">Intelligence.</span>
                    </h1>
                    <p className="text-slate-500 text-xl font-medium max-w-2xl leading-relaxed">
                        Deep-dive methodologies and architectural thought pieces designed to give elite founders an unfair advantage.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8 mb-32">
                    {stories.map((s, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="group p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-indigo-500/20 transition-all duration-500 cursor-default"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-8">
                                {s.icon}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 block">
                                {s.tag}
                            </span>
                            <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-indigo-400 transition-colors">
                                {s.title}
                            </h3>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">
                                {s.desc}
                            </p>
                            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-400 group-hover:text-white transition-colors">
                                Analyze Research <ArrowRight size={14} />
                            </button>
                        </motion.div>
                    ))}
                </div>

                {/* Live Terminal Section Placeholder */}
                <div className="rounded-[3rem] bg-slate-900/40 border border-white/5 p-12 lg:p-20 relative overflow-hidden backdrop-blur-3xl group">
                    <div className="absolute top-0 right-0 p-12 opacity-5 text-white">
                        <BookOpen size={300} />
                    </div>
                    <div className="relative z-10 max-w-2xl">
                        <h2 className="text-4xl font-black text-white tracking-tighter mb-6 leading-tight">
                            Subscribe to the <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Foundry Newsletter.</span>
                        </h2>
                        <p className="text-slate-400 font-medium mb-10 leading-relaxed">
                            Every Sunday morning, we deliver the structural analysis of high-growth sectors straight to your console. No fluff. Just architectural data.
                        </p>
                        <form className="flex gap-3">
                            <input
                                type="email"
                                placeholder="Enter system identity (email)"
                                className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            />
                            <button className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20 active:scale-95">
                                Join Network
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Insights;
