import React, { useState } from 'react';
import { Target, Rocket, Command, BrainCircuit, Wand2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { enhanceUserPrompt } from '../services/geminiService';

interface HeroProps {
  onGenerate: (idea: string) => void;
  isLoading: boolean;
}


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
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,black_40%,transparent_100%)]"></div>

        {/* Subtle Floating Dust Particles */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: Math.random() * 100 + "%", y: Math.random() * 100 + "%" }}
              animate={{
                y: [null, "-20px", "20px", "0px"],
                opacity: [0.1, 0.4, 0.1]
              }}
              transition={{
                duration: 5 + Math.random() * 5,
                repeat: Infinity,
                delay: Math.random() * 5
              }}
              className="absolute w-1 h-1 bg-white rounded-full blur-sm"
            />
          ))}
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-5xl px-6 flex flex-col items-center text-center"
      >

        {/* Status Chip */}
        <motion.div variants={itemVariants} className="mb-10">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-2xl">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-indigo-300">Foundry Protocol Active</span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={itemVariants}
          className="text-6xl md:text-8xl lg:text-9xl font-black text-white leading-[0.85] tracking-tighter mb-8 select-none"
        >
          Forge Your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 via-white to-purple-400 drop-shadow-[0_0_30px_rgba(99,102,241,0.3)]">Empire.</span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed mb-16 px-4"
        >
          The world's first <span className="text-white font-semibold">Autonomous Venture Architect</span>.
          Bridge the gap between raw vision and market dominance.
        </motion.p>

        {/* Command Center Input */}
        <motion.div
          variants={itemVariants}
          className="w-full max-w-2xl relative group mb-20 px-2"
        >
          {/* Layered Glows */}
          <div className={`absolute -inset-1 rounded-[2rem] bg-indigo-500/20 blur-2xl transition-opacity duration-1000 ${isFocused ? 'opacity-100' : 'opacity-0'}`}></div>
          <div className={`absolute -inset-0.5 rounded-[1.5rem] bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-20 blur-md transition-all duration-500 ${isFocused ? 'opacity-40 scale-105' : 'group-hover:opacity-30'}`}></div>

          <div className={`
              relative bg-slate-900/80 backdrop-blur-3xl rounded-2xl border transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] p-2 flex flex-col
              ${isFocused ? 'border-indigo-400/50 shadow-[0_0_50px_-12px_rgba(99,102,241,0.5)] scale-[1.02]' : 'border-white/10 shadow-2xl'}
            `}>
            <form onSubmit={handleSubmit} className="relative flex items-center">
              <div className={`pl-4 pr-3 transition-colors duration-500 ${isFocused ? 'text-indigo-400' : 'text-slate-500'}`}>
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full"
                  />
                ) : (
                  <Command size={22} className={isFocused ? "animate-pulse" : ""} />
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
                placeholder="Initialize your vision..."
                className="flex-1 bg-transparent border-none outline-none text-xl font-medium text-white placeholder:text-slate-700 h-16 px-2 tracking-tight"
                autoComplete="off"
              />

              <div className="flex items-center gap-3 pr-2">
                <AnimatePresence>
                  {input.length > 3 && !isLoading && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8, x: 10 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.8, x: 10 }}
                      type="button"
                      onClick={handleEnhance}
                      disabled={isEnhancing}
                      className="p-2.5 text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all border border-transparent hover:border-indigo-500/30"
                      title="AI Refinement"
                    >
                      {isEnhancing ? (
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Wand2 size={20} />
                      )}
                    </motion.button>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className={`
                      h-12 px-8 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all duration-500 flex items-center gap-2
                      ${input.trim()
                      ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:bg-indigo-500 hover:scale-[1.02]'
                      : 'bg-slate-800 text-slate-600 cursor-not-allowed'}
                    `}
                >
                  <span>Forge</span>
                  <ArrowRight size={14} className={`transition-transform duration-500 ${input.trim() ? "translate-x-0" : "-translate-x-4 opacity-0"}`} />
                </button>
              </div>
            </form>
          </div>

          {/* Contextual Hints - Refined */}
          <div className="mt-6">
            <AnimatePresence mode="wait">
              {isFocused && !input && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-wrap justify-center gap-3"
                >
                  {[
                    "Next-Gen EdTech for Developers",
                    "Decentralized Renewable Grid",
                    "AI Legal Assistant for Startups"
                  ].map((hint, idx) => (
                    <button
                      key={hint}
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); setInput(hint); }}
                      className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-4 py-2 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.08] hover:text-white hover:border-indigo-500/30 transition-all shadow-sm"
                    >
                      {hint}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

      </motion.div>

      {/* Footer Metrics - Glassified */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 w-full flex justify-center items-center gap-8 py-4 px-8"
      >
        <div className="flex items-center gap-2 text-slate-500">
          <BrainCircuit size={14} className="text-indigo-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.15em]">G-1.5 Optimized</span>
        </div>
        <div className="w-px h-3 bg-white/10"></div>
        <div className="flex items-center gap-2 text-slate-500">
          <Rocket size={14} className="text-purple-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.15em]">L-OS Engine v1.2</span>
        </div>
        <div className="w-px h-3 bg-white/10"></div>
        <div className="flex items-center gap-2 text-slate-500">
          <Target size={14} className="text-indigo-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.15em]">99.9% Uptime</span>
        </div>
      </motion.div>

    </div>
  );
};

export default Hero;
