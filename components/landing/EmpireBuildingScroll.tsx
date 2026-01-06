
import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Zap, Layers, Globe, ArrowRight, BrainCircuit, LayoutTemplate } from 'lucide-react';

const EmpireBuildingScroll: React.FC = () => {
    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end end"]
    });

    return (
        <section ref={targetRef} className="relative h-[300vh] bg-slate-950">
            <div className="sticky top-0 flex h-screen items-center overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

                    {/* LEFT: Text Content */}
                    <div className="relative z-10 space-y-20">
                        <StepText
                            progress={scrollYProgress}
                            range={[0, 0.3]}
                            title="Everything starts with a Spark."
                            desc="Raw intuition. A fleeting thought. Most let it fade. You capture it."
                            badge="Phase 1: The Spark"
                        />
                        <StepText
                            progress={scrollYProgress}
                            range={[0.3, 0.6]}
                            title="Blueprint the Future."
                            desc="We turn that spark into a structural masterpiece. Architecture, database, features - locked."
                            badge="Phase 2: The Blueprint"
                        />
                        <StepText
                            progress={scrollYProgress}
                            range={[0.6, 1]}
                            title="Build Your Empire."
                            desc="From code to scale. Launch a professional AI SaaS that dominates the market."
                            badge="Phase 3: The Empire"
                        />
                    </div>

                    {/* RIGHT: Visual Transformation */}
                    <div className="relative h-[500px] w-full flex items-center justify-center perspective-1000">

                        {/* 1. Idea Card */}
                        <VisualCard
                            progress={scrollYProgress}
                            range={[0, 0.3]}
                            outRange={[0.3, 0.4]}
                            className="bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_0_50px_rgba(99,102,241,0.3)]"
                        >
                            <div className="flex flex-col items-center text-white">
                                <Zap size={64} className="mb-4 animate-pulse" />
                                <h3 className="text-2xl font-black uppercase tracking-widest">Raw Idea</h3>
                                <p className="text-white/80 text-sm mt-2">"A legal AI for startups..."</p>
                            </div>
                        </VisualCard>

                        {/* 2. Blueprint Schematic */}
                        <VisualCard
                            progress={scrollYProgress}
                            range={[0.3, 0.6]}
                            inRange={[0.2, 0.3]}
                            outRange={[0.6, 0.7]}
                            className="bg-slate-900 border border-indigo-500/50 shadow-[0_0_50px_rgba(99,102,241,0.15)] backdrop-blur-xl"
                        >
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                            <div className="relative z-10 flex flex-col items-center text-indigo-300">
                                <Layers size={64} className="mb-4" />
                                <h3 className="text-2xl font-black uppercase tracking-widest">Blueprint</h3>
                                <div className="flex gap-2 mt-4">
                                    <div className="h-2 w-16 bg-indigo-500/40 rounded-full"></div>
                                    <div className="h-2 w-8 bg-indigo-500/40 rounded-full"></div>
                                </div>
                                <div className="flex gap-2 mt-2">
                                    <div className="h-2 w-24 bg-indigo-500/40 rounded-full"></div>
                                </div>
                            </div>
                        </VisualCard>

                        {/* 3. Empire Dashboard */}
                        <VisualCard
                            progress={scrollYProgress}
                            range={[0.6, 1]}
                            inRange={[0.5, 0.6]}
                            className="bg-white text-slate-900 shadow-[0_0_80px_rgba(255,255,255,0.2)]"
                        >
                            <div className="flex flex-col items-center w-full max-w-xs">
                                <div className="flex items-center justify-between w-full mb-6 border-b border-slate-200 pb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded bg-indigo-600"></div>
                                        <span className="font-bold text-sm">EmpireOS</span>
                                    </div>
                                    <Globe size={16} className="text-slate-400" />
                                </div>
                                <div className="grid grid-cols-2 gap-3 w-full">
                                    <div className="bg-slate-100 p-3 rounded-lg">
                                        <span className="text-xs text-slate-500 font-bold block mb-1">REVENUE</span>
                                        <span className="text-lg font-black text-indigo-600">$10,420</span>
                                    </div>
                                    <div className="bg-slate-100 p-3 rounded-lg">
                                        <span className="text-xs text-slate-500 font-bold block mb-1">USERS</span>
                                        <span className="text-lg font-black text-indigo-600">8.5k</span>
                                    </div>
                                </div>
                                <ArrowRight className="mt-6 text-slate-400 animate-bounce" />
                            </div>
                        </VisualCard>

                    </div>
                </div>
            </div>
        </section>
    );
};

const StepText = ({ progress, range, title, desc, badge }: { progress: any, range: [number, number], title: string, desc: string, badge: string }) => {
    const opacity = useTransform(progress, [range[0] - 0.1, range[0], range[1], range[1] + 0.1], [0, 1, 1, 0]);
    const y = useTransform(progress, [range[0] - 0.1, range[0], range[1], range[1] + 0.1], [50, 0, 0, -50]);

    return (
        <motion.div style={{ opacity, y, position: 'absolute', top: '35%', left: 0, width: '100%' }}>
            <div className="inline-block px-3 py-1 mb-4 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest">
                {badge}
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6">
                {title}
            </h2>
            <p className="text-xl text-slate-400 max-w-md leading-relaxed">
                {desc}
            </p>
        </motion.div>
    );
};

const VisualCard = ({ children, progress, range, inRange, outRange, className }: any) => {
    // Default in/out ranges if not explicitly provided
    const enterStart = inRange ? inRange[0] : range[0] - 0.1;
    const enterEnd = inRange ? inRange[1] : range[0];
    const exitStart = outRange ? outRange[0] : range[1];
    const exitEnd = outRange ? outRange[1] : range[1] + 0.1;

    const opacity = useTransform(progress, [enterStart, enterEnd, exitStart, exitEnd], [0, 1, 1, 0]);
    const scale = useTransform(progress, [enterStart, enterEnd, exitStart, exitEnd], [0.8, 1, 1, 0.8]);
    const rotateX = useTransform(progress, [enterStart, enterEnd, exitStart, exitEnd], [45, 0, 0, -45]);
    const y = useTransform(progress, [enterStart, enterEnd, exitStart, exitEnd], [100, 0, 0, -100]);

    return (
        <motion.div
            style={{ opacity, scale, rotateX, y }}
            className={`absolute w-[350px] h-[450px] rounded-[2rem] flex items-center justify-center p-8 ${className}`}
        >
            {children}
        </motion.div>
    );
};

export default EmpireBuildingScroll;
