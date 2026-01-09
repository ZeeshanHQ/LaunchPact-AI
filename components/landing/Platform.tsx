import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Zap, Shield, Database, Layout, ArrowRight, Gauge, Layers } from 'lucide-react';

const Platform: React.FC = () => {
    const modules = [
        {
            title: "Neural Forge v2.4",
            desc: "Advanced prompt processing using G-1.5 Pro with custom logic gates for product-market fit.",
            icon: <Cpu size={24} />,
            color: "text-indigo-400"
        },
        {
            title: "Market Swarm Intel",
            desc: "Autonomous agents that sweep real-time market data to validate your assumptions instantly.",
            icon: <Gauge size={24} />,
            color: "text-cyan-400"
        },
        {
            title: "Executive Architecture",
            desc: "Generate full-stack technical schemas tailored for high-scale enterprise environments.",
            icon: <Layers size={24} />,
            color: "text-purple-400"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-950 pt-32 pb-20 px-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-32 text-center"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/5 border border-indigo-500/10 text-indigo-400 mb-8">
                        <Shield size={14} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">System Capabilities</span>
                    </div>
                    <h1 className="text-6xl md:text-9xl font-black text-white tracking-tightest mb-8 leading-[0.8]">
                        The Venture <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 via-white to-purple-400">Core Engine.</span>
                    </h1>
                    <p className="text-slate-500 text-xl font-medium max-w-3xl mx-auto leading-relaxed">
                        Precision engineering meets autonomous intelligence. The LaunchPact AI platform is the underlying OS for the modern elite founder.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8 mb-40">
                    {modules.map((m, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-12 rounded-[3.5rem] bg-white/[0.02] border border-white/5 relative overflow-hidden group hover:bg-white/[0.04] transition-all duration-700"
                        >
                            <div className={`mb-10 ${m.color}`}>
                                {m.icon}
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-6 tracking-tight">
                                {m.title}
                            </h3>
                            <p className="text-slate-400 font-medium leading-relaxed mb-10">
                                {m.desc}
                            </p>
                            <div className="h-px w-full bg-white/5 mb-8" />
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                <Zap size={10} className="text-indigo-500" /> Latency: 42ms
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Deep Dive Section */}
                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                    >
                        <h2 className="text-4xl font-black text-white tracking-tighter mb-8 italic uppercase leading-none">
                            Architected for <br />
                            <span className="text-indigo-500">Global Scale.</span>
                        </h2>
                        <div className="space-y-6">
                            {[
                                "Military-grade data sovereignty and encryption.",
                                "Direct integration with global innovation clusters.",
                                "Predictive failure analysis for early-stage pivots.",
                                "Automated white-label reporting for board members."
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-start gap-4">
                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                    <p className="text-slate-400 font-medium leading-relaxed">{item}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <div className="aspect-square rounded-[4rem] bg-gradient-to-tr from-indigo-500/10 via-white/5 to-purple-500/10 border border-white/5 relative flex items-center justify-center p-12 overflow-hidden group">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
                        <Database size={200} className="text-indigo-500/20 group-hover:scale-110 transition-transform duration-1000" />
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 border-[1px] border-dashed border-white/10 rounded-full scale-75"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Platform;
