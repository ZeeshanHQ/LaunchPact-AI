import React from 'react';
import { Users, TrendingUp, Sparkles, Building2 } from 'lucide-react';

const SocialProof: React.FC = () => {
    // Instead of fake companies, we use "Archetypes" or "Industries" being built
    const activeBuilders = [
        { label: "FinTech Dispensers", icon: <Building2 size={16} /> },
        { label: "AI Health Agents", icon: <Sparkles size={16} /> },
        { label: "SaaS Marketplaces", icon: <TrendingUp size={16} /> },
        { label: "EdTech Platforms", icon: <Users size={16} /> },
        { label: "Green Energy DAO", icon: <Building2 size={16} /> },
        { label: "Autonomous Logistic", icon: <Sparkles size={16} /> },
        { label: "Consumer Social", icon: <Users size={16} /> },
        { label: "Legal Tech API", icon: <TrendingUp size={16} /> },
    ];

    return (
        <div className="w-full bg-slate-900 border-y border-slate-800 relative overflow-hidden py-10">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-12">

                {/* Left: The "Momentum" Statement */}
                <div className="md:w-1/3 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-4">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        <span className="text-xs font-bold uppercase tracking-widest">Early Access Protocol</span>
                    </div>
                    <h3 className="text-3xl font-black text-white tracking-tight mb-2">
                        Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">First 1,000</span>
                    </h3>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed">
                        The Neural Forge is currently architecting the next generation of billion-dollar startups. Secure your place in the founding cohort.
                    </p>
                </div>

                {/* Right: The Infinite Marquee */}
                <div className="md:w-2/3 w-full relative">
                    <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-slate-900 to-transparent z-10"></div>
                    <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-slate-900 to-transparent z-10"></div>

                    <div className="flex gap-6 overflow-hidden">
                        {/* Marquee Track 1 */}
                        <div className="flex gap-6 animate-marquee whitespace-nowrap">
                            {[...activeBuilders, ...activeBuilders].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-indigo-500/30 transition-all group backdrop-blur-sm">
                                    <div className="text-indigo-400 group-hover:text-indigo-300 transition-colors">
                                        {item.icon}
                                    </div>
                                    <span className="text-slate-300 font-bold text-sm tracking-wide group-hover:text-white transition-colors">{item.label}</span>
                                </div>
                            ))}
                        </div>
                        {/* Marquee Track 2 (Duplicate for smooth loop) */}
                        <div className="flex gap-6 animate-marquee whitespace-nowrap" aria-hidden="true">
                            {[...activeBuilders, ...activeBuilders].map((item, i) => (
                                <div key={`clone-${i}`} className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-indigo-500/30 transition-all group backdrop-blur-sm">
                                    <div className="text-indigo-400 group-hover:text-indigo-300 transition-colors">
                                        {item.icon}
                                    </div>
                                    <span className="text-slate-300 font-bold text-sm tracking-wide group-hover:text-white transition-colors">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-center md:justify-start gap-4">
                        <div className="h-1 flex-1 max-w-[200px] bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full w-[65%] bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                        </div>
                        <span className="text-xs font-mono text-slate-500">652 / 1000 SPOTS FILLED</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SocialProof;
