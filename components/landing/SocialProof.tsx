import React from 'react';
import { Users, TrendingUp, Sparkles, Building2, Globe, Cpu, Zap, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const SocialProof: React.FC = () => {
    const activeBuilders = [
        { label: "FinTech Dispensers", icon: <Building2 size={16} /> },
        { label: "AI Health Agents", icon: <Sparkles size={16} /> },
        { label: "SaaS Marketplaces", icon: <TrendingUp size={16} /> },
        { label: "EdTech Platforms", icon: <Users size={16} /> },
        { label: "Green Energy DAO", icon: <Globe size={16} /> },
        { label: "Autonomous Logistic", icon: <Cpu size={16} /> },
        { label: "Consumer Social", icon: <Zap size={16} /> },
        { label: "Legal Tech API", icon: <Shield size={16} /> },
    ];

    return (
        <div className="w-full bg-slate-950 border-y border-white/5 relative overflow-hidden py-16">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-16">

                {/* Left: The "Momentum" Statement */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="lg:w-1/3 text-center lg:text-left"
                >
                    <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-indigo-500/5 border border-indigo-500/10 text-indigo-400 mb-6">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Alpha Network</span>
                    </div>
                    <h3 className="text-4xl font-black text-white tracking-tighter mb-4 leading-tight">
                        Powering the <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-white to-purple-400">Next Wave.</span>
                    </h3>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-sm mx-auto lg:mx-0">
                        Join an elite cohort of founders using the Neural Forge to architect market-dominant ventures.
                    </p>
                </motion.div>

                {/* Right: The Infinite Marquee */}
                <div className="lg:w-2/3 w-full relative">
                    {/* Fade Overlays */}
                    <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-950 to-transparent z-10"></div>
                    <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-slate-950 to-transparent z-10"></div>

                    <div className="flex overflow-hidden group">
                        <motion.div
                            animate={{ x: [0, -1920] }}
                            transition={{
                                duration: 40,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="flex gap-8 whitespace-nowrap py-4"
                        >
                            {[...activeBuilders, ...activeBuilders, ...activeBuilders].map((item, i) => (
                                <div key={i} className="flex items-center gap-4 px-8 py-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-indigo-500/20 transition-all duration-500 group/item cursor-default">
                                    <div className="text-indigo-500 group-hover/item:scale-110 transition-transform duration-500">
                                        {item.icon}
                                    </div>
                                    <span className="text-slate-400 font-bold text-sm tracking-wide group-hover/item:text-white transition-colors">{item.label}</span>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 }}
                        className="mt-10 flex flex-col md:flex-row items-center justify-center lg:justify-start gap-6"
                    >
                        <div className="flex flex-col gap-2 w-full max-w-[240px]">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">
                                <span>Founding Licenses</span>
                                <span className="text-indigo-400">652 / 1000</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden border border-white/5">
                                <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: "65.2%" }}
                                    transition={{ duration: 1.5, delay: 0.8, ease: "circOut" }}
                                    className="h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                                ></motion.div>
                            </div>
                        </div>

                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center overflow-hidden ring-1 ring-white/10">
                                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="Founder" className="w-full h-full object-cover opacity-80" />
                                </div>
                            ))}
                            <div className="w-8 h-8 rounded-full border-2 border-slate-950 bg-indigo-600 flex items-center justify-center ring-1 ring-white/10">
                                <span className="text-[10px] font-bold text-white">+24</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default SocialProof;
