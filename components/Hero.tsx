import React, { useState } from 'react';
import { Target, Rocket, Command, BrainCircuit, Wand2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { enhanceUserPrompt } from '../services/geminiService';

interface HeroProps {
  onGenerate: (idea: string) => void;
  isLoading: boolean;
}


const TerminalConsole: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([
    "[SYSTEM] Initializing Neural Forge v2.4...",
    "[STATUS] Node: 0x9f22... Connected",
    "[FEED] Analyzing global market swarms...",
  ]);

  React.useEffect(() => {
    const feed = [
      "[SYSTEM] Optimization pass complete",
      "[ALERT] New venture blueprint in US-EAST-1",
      "[INFO] Scaling architecture: Distributed",
      "[SYSTEM] Neural weights synchronized",
      "[FEED] High-intent user pattern detected",
      "[STATUS] Uptime: 99.998%",
    ];
    let i = 0;
    const interval = setInterval(() => {
      setLogs(prev => [...prev.slice(-4), feed[i % feed.length]]);
      i++;
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hidden lg:flex flex-col w-64 h-48 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-xl overflow-hidden shadow-2xl absolute right-12 top-1/2 -translate-y-1/2 select-none group hover:border-indigo-500/20 transition-all duration-700">
      <div className="px-3 py-1.5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500/20" />
          <div className="w-2 h-2 rounded-full bg-amber-500/20" />
          <div className="w-2 h-2 rounded-full bg-emerald-500/20" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Feed</span>
      </div>
      <div className="p-3 font-mono text-[10px] space-y-2.5">
        {logs.map((log, i) => (
          <motion.div
            key={`${log}-${i}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`transition-colors ${log.includes('[ALERT]') ? 'text-amber-400' : log.includes('[ERROR]') ? 'text-red-400' : 'text-slate-400'}`}
          >
            <span className="opacity-30 mr-2">{'>'}</span>
            {log}
          </motion.div>
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-950/80 to-transparent pointer-events-none" />
    </div>
  );
};

const Hero: React.FC<HeroProps> = ({ onGenerate, isLoading }) => {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isEnhancing) return;
    const ideaToSubmit = input.trim();
    setInput('');
    onGenerate(ideaToSubmit);
  };

  const handleEnhance = async () => {
    if (!input.trim() || isEnhancing) return;

    setIsEnhancing(true);
    try {
      const enhanced = await enhanceUserPrompt(input);
      setInput(enhanced);
    } catch (e) {
      console.error("Enhancement failed", e);
    } finally {
      setIsEnhancing(false);
      const inputEl = document.getElementById('idea-input');
      inputEl?.focus();
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 20
      }
    }
  };

  return (
    <div className="relative w-full h-[100dvh] flex flex-col items-center justify-center bg-slate-950 overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">

      {/* Decorative Command Lines */}
      <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-indigo-500/10 to-transparent pointer-events-none hidden md:block" />
      <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-purple-500/10 to-transparent pointer-events-none hidden md:block" />

      {/* Background Ambience - Enhanced Layers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden text-slate-800">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 5, 0],
            translateY: [0, 50, 0]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-[-30%] left-[-15%] w-[100vw] h-[100vw] bg-indigo-600/10 rounded-full blur-[160px] mix-blend-screen"
        ></motion.div>
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [0, -5, 0],
            translateX: [0, -50, 0]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-[-30%] right-[-15%] w-[100vw] h-[100vw] bg-purple-600/10 rounded-full blur-[160px] mix-blend-screen"
        ></motion.div>

        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,black_40%,transparent_100%)]"></div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-7xl px-6 flex flex-col items-center text-center"
      >

        {/* Status Chip */}
        <motion.div variants={itemVariants} className="mb-10 lg:mb-14">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-2xl">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-[10px] uppercase font-black tracking-[0.3em] text-indigo-300">Command Center Online</span>
          </div>
        </motion.div>

        {/* Headline - Deep Content */}
        <motion.h1
          variants={itemVariants}
          className="text-6xl md:text-8xl lg:text-[10rem] font-black text-white leading-[0.8] tracking-tightest mb-10 select-none px-4"
        >
          Architect Your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 via-white to-purple-400 drop-shadow-[0_0_50px_rgba(99,102,241,0.4)]">Dominance.</span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-lg md:text-2xl text-slate-400 max-w-4xl mx-auto font-medium leading-[1.4] mb-20 px-4 tracking-tight"
        >
          Stop building in the dark. LaunchPact AI is the
          <span className="text-white font-bold"> Neural Infrastructure </span>
          designed to transform raw ambition into market-dominant ventures.
          <span className="hidden md:inline"> Architect, validate, and scale with the intelligence of a thousand elites.</span>
        </motion.p>

        {/* Force Input Area */}
        <motion.div
          variants={itemVariants}
          className="w-full max-w-3xl relative group mb-24 px-2"
        >
          {/* Layered Advanced Glows */}
          <div className={`absolute -inset-2 rounded-[2.5rem] bg-indigo-500/10 blur-3xl transition-opacity duration-1000 ${isFocused ? 'opacity-100' : 'opacity-0'}`}></div>
          <div className={`absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 opacity-20 blur-xl transition-all duration-700 ${isFocused ? 'opacity-50 scale-105' : 'group-hover:opacity-30'}`}></div>

          <div className={`
              relative bg-slate-900/90 backdrop-blur-3xl rounded-[1.5rem] border transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] p-3 flex flex-col
              ${isFocused ? 'border-indigo-400/40 shadow-[0_0_80px_-20px_rgba(99,102,241,0.6)] scale-[1.03]' : 'border-white/5 shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)]'}
            `}>
            <form onSubmit={handleSubmit} className="relative flex items-center">
              <div className={`pl-5 pr-4 transition-colors duration-700 ${isFocused ? 'text-indigo-400' : 'text-slate-600'}`}>
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full"
                  />
                ) : (
                  <Command size={24} className={isFocused ? "animate-pulse" : ""} />
                )}
              </div>

              <input
                id="idea-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && input.trim() && !isLoading && !isEnhancing) {
                    e.preventDefault();
                    handleSubmit(e as any);
                  }
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                disabled={isLoading || isEnhancing}
                placeholder="Initialize Neural Forge..."
                className="flex-1 bg-transparent border-none outline-none text-xl md:text-2xl font-bold text-white placeholder:text-slate-800 h-20 px-2 tracking-tightest"
                autoComplete="off"
              />

              <div className="flex items-center gap-4 pr-3">
                <AnimatePresence>
                  {input.length > 3 && !isLoading && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8, x: 20 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.8, x: 20 }}
                      type="button"
                      onClick={handleEnhance}
                      disabled={isEnhancing}
                      className="p-3 text-cyan-400 hover:bg-cyan-500/10 rounded-2xl transition-all border border-transparent hover:border-cyan-500/30 group/wand"
                      title="Neural Refinement"
                    >
                      {isEnhancing ? (
                        <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Wand2 size={22} className="group-hover/wand:rotate-12 transition-transform" />
                      )}
                    </motion.button>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className={`
                      h-14 px-10 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all duration-700 flex items-center gap-3
                      ${input.trim()
                      ? 'bg-indigo-600 text-white shadow-[0_0_30px_rgba(79,70,229,0.5)] hover:bg-indigo-500 hover:scale-[1.05] active:scale-95'
                      : 'bg-white/[0.02] text-slate-700 cursor-not-allowed'}
                    `}
                >
                  <span className="hidden md:block">Forge Mission</span>
                  <span className="md:hidden">Forge</span>
                </button>
              </div>
            </form>
          </div>

          <AnimatePresence>
            {isFocused && !input && (
              <motion.div
                initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
                className="mt-8 flex flex-wrap justify-center gap-4"
              >
                {[
                  "Hyper-Local EdTech Ecosystem",
                  "Decentralized Energy Grid for DAOs",
                  "Predictive Supply Chain OS"
                ].map((hint, idx) => (
                  <button
                    key={hint}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); setInput(hint); }}
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-5 py-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.08] hover:text-indigo-300 hover:border-indigo-500/30 transition-all shadow-xl backdrop-blur-md"
                  >
                    {hint}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Terminal Widget */}
        <TerminalConsole />

      </motion.div>

      {/* Extreme Bottom Metrics */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 2, duration: 1.5 }}
        className="absolute bottom-10 w-full flex justify-center items-center gap-10 py-4 px-8 pointer-events-none"
      >
        {[
          { icon: <BrainCircuit size={16} />, label: "G-1.5 Optimized" },
          { icon: <Rocket size={16} />, label: "Secure Protocol v2.4" },
          { icon: <Target size={16} />, label: "Neural Latency: 8ms" }
        ].map((metric, i) => (
          <React.Fragment key={i}>
            <div className="flex items-center gap-3 text-slate-500">
              <span className="text-indigo-400 opacity-60">{metric.icon}</span>
              <span className="text-[10px] font-black uppercase tracking-[0.25em]">{metric.label}</span>
            </div>
            {i < 2 && <div className="w-px h-4 bg-white/5" />}
          </React.Fragment>
        ))}
      </motion.div>

    </div>
  );
};

export default Hero;
