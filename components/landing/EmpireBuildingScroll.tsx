import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Zap, Layers, Globe, ArrowRight, TrendingUp, ShieldCheck, Users } from 'lucide-react';

const EmpireBuildingScroll: React.FC = () => {
    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end end"]
    });

    // Horizontal Scroll Logic
    // As user scrolls vertically (0 -> 1), we translate the horizontal container leftwards (0% -> -200%)
    const x = useTransform(scrollYProgress, [0, 1], ["0%", "-75%"]);

    return (
        <section ref={targetRef} className="relative h-[300vh] bg-slate-950">
            {/* Sticky Container */}
            <div className="sticky top-0 h-screen flex items-center overflow-hidden">

                {/* Horizontal Track */}
                <motion.div style={{ x }} className="flex gap-20 pl-20 pr-40">

                    {/* SECTION 1: INTRO */}
                    <div className="w-[80vw] md:w-[60vw] flex-shrink-0 flex flex-col justify-center">
                        <h2 className="text-6xl md:text-8xl font-black text-white leading-tight mb-8">
                            How we <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">solve the chaos.</span>
                        </h2>
                        <p className="text-xl text-slate-400 max-w-lg leading-relaxed">
                            Building a startup usually looks like scattered docs, messy code, and endless delays.
                            We linearized the path to empire.
                            <br /><br />
                            <span className="text-white font-bold flex items-center gap-2">
                                <ArrowRight className="text-indigo-500" /> Scroll to explore
                            </span>
                        </p>
                    </div>

                    {/* SECTION 2: THE PROBLEM (Practical View) */}
                    <div className="w-[80vw] md:w-[70vw] flex-shrink-0 flex items-center gap-12 bg-slate-900/50 rounded-3xl p-12 border border-white/5">
                        <div className="flex-1 space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-400 rounded-full text-xs font-bold uppercase tracking-widest">
                                <TrendingUp size={14} /> The Pain Point
                            </div>
                            <h3 className="text-4xl font-bold text-white">Execution Paralysis</h3>
                            <p className="text-slate-400 text-lg">
                                Most founders get stuck in "Tutorial Hell" or "Planning Purgatory".
                                They have the vision but lack the unified toolchain to execute it.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3 text-slate-300">
                                    <div className="w-2 h-2 rounded-full bg-red-500" /> Disconnected tools
                                </li>
                                <li className="flex items-center gap-3 text-slate-300">
                                    <div className="w-2 h-2 rounded-full bg-red-500" /> High development costs
                                </li>
                                <li className="flex items-center gap-3 text-slate-300">
                                    <div className="w-2 h-2 rounded-full bg-red-500" /> No clear roadmap
                                </li>
                            </ul>
                        </div>
                        <div className="flex-1 h-[400px] bg-slate-800 rounded-xl relative overflow-hidden shadow-2xl group border border-white/5 mx-auto">
                            {/* Visual of "Chaos" */}
                            <div className="absolute inset-0 opacity-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                            <motion.div
                                animate={{ scale: [1, 1.05, 1], rotate: [0, 1, -1, 0] }}
                                transition={{ duration: 5, repeat: Infinity }}
                                className="absolute inset-0 flex items-center justify-center"
                            >
                                <div className="grid grid-cols-2 gap-4 opacity-50">
                                    <div className="w-32 h-20 bg-red-500/20 rounded-lg blur-sm"></div>
                                    <div className="w-24 h-24 bg-orange-500/20 rounded-full blur-sm"></div>
                                    <div className="w-28 h-28 bg-yellow-500/20 rounded-md blur-sm ml-8"></div>
                                </div>
                                <span className="absolute text-5xl font-black text-white/10 uppercase tracking-widest transform -rotate-12">Chaos</span>
                            </motion.div>
                        </div>
                    </div>

                    {/* SECTION 3: THE SOLUTION (Practical Work) */}
                    <div className="w-[80vw] md:w-[70vw] flex-shrink-0 flex items-center gap-12 bg-indigo-900/10 rounded-3xl p-12 border border-indigo-500/20 backdrop-blur-sm">
                        <div className="flex-1 space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-bold uppercase tracking-widest">
                                <ShieldCheck size={14} /> The Solution
                            </div>
                            <h3 className="text-4xl font-bold text-white">Autonomous Foundry</h3>
                            <p className="text-slate-300 text-lg">
                                We provide the entire C-Suite in a box. AI Architects, Engineers, and Marketers working 24/7 on your vision.
                            </p>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="p-4 bg-slate-900/80 rounded-lg border border-indigo-500/20">
                                    <Zap className="text-yellow-400 mb-2" />
                                    <div className="font-bold text-white">Instant Validation</div>
                                    <div className="text-xs text-slate-500">Market-fit checks in seconds</div>
                                </div>
                                <div className="p-4 bg-slate-900/80 rounded-lg border border-indigo-500/20">
                                    <Layers className="text-blue-400 mb-2" />
                                    <div className="font-bold text-white">Auto-Architecture</div>
                                    <div className="text-xs text-slate-500">Full stack specs generated</div>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 h-[400px] bg-slate-900 rounded-xl relative overflow-hidden shadow-2xl border border-indigo-500/30 flex items-center justify-center">
                            {/* Visual of "Order" */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.1)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                            <div className="relative z-10 w-64 p-4 bg-slate-800 rounded-lg border border-indigo-500/50 shadow-lg">
                                <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-2">
                                    <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center text-white"><Zap size={16} /></div>
                                    <div>
                                        <div className="text-xs text-slate-400">Project status</div>
                                        <div className="font-bold text-white text-sm">Building Empire</div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: "75%" }}
                                            transition={{ duration: 1.5 }}
                                            className="h-full bg-indigo-500"
                                        />
                                    </div>
                                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                                        <span>Deploying DB...</span>
                                        <span>75%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 4: THE VALUE (Empire) */}
                    <div className="w-[80vw] md:w-[60vw] flex-shrink-0 flex flex-col justify-center items-start">
                        <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-widest">
                            <Globe size={14} /> The Result
                        </div>
                        <h2 className="text-6xl md:text-7xl font-black text-white leading-tight mb-8">
                            Zero to <span className="text-emerald-400">Revenue.</span>
                        </h2>
                        <p className="text-xl text-slate-400 max-w-lg mb-8">
                            You focus on the vision. LaunchPact handles the code, the infrastructure, and the scale.
                        </p>
                        <button className="bg-white text-slate-900 px-8 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-emerald-400 hover:text-slate-900 transition-all shadow-xl">
                            Start Building Now
                        </button>
                    </div>

                </motion.div>
            </div>
        </section>
    );
};

export default EmpireBuildingScroll;
