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
        delayChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 80,
        damping: 15
      }
    }
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center bg-slate-950 overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200 py-20 lg:py-0">

      {/* Executive Dark Background - Optimized for Performance */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Fine Grid Overlay using CSS instead of heavy SVG if possible, or keeping lightweight SVG */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_50%,black_60%,transparent_100%)]"></div>

        {/* Performance Optimized Glows - Using Radial Gradients instead of heavy blurs */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(99,102,241,0.08),transparent_50%)]"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.05),transparent_70%)]"></div>

        {/* Grainy Texture - Kept lightweight */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-5xl px-6 flex flex-col items-center text-center mt-8"
      >
        {/* Minimal Status Indicator */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/50 border border-white/5 backdrop-blur-md">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse"></div>
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400">System Online v2.4</span>
          </div>
        </motion.div>

        {/* Tier-1 Typography */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-7xl lg:text-8xl font-medium text-white leading-[1.1] tracking-tight mb-8"
        >
          Architect your <br />
          <span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-br from-indigo-300 via-white to-slate-200 pb-2">unrivaled empire.</span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed mb-12 tracking-wide antialiased"
        >
          Stop building in the dark. Deploy autonomous intelligence to validate,
          architect, and scale your next market-dominant venture.
        </motion.p>

        {/* Professional Command Console Input */}
        <motion.div
          variants={itemVariants}
          className="w-full max-w-2xl relative group"
        >
          {/* Subtle Focus Glow */}
          <div className={`absolute -inset-px rounded-xl bg-gradient-to-r from-indigo-500/30 to-purple-500/30 blur transition-opacity duration-700 ${isFocused ? 'opacity-100' : 'opacity-0'}`}></div>

          <div className={`
              relative bg-slate-900 rounded-xl border transition-all duration-300 ease-out p-1 flex items-center overflow-hidden
              ${isFocused ? 'border-indigo-500/30 shadow-2xl shadow-indigo-500/10' : 'border-white/10 shadow-xl'}
            `}>

            <div className="pl-4 pr-3 text-slate-500 border-r border-white/5 h-10 flex items-center justify-center">
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-slate-600 border-t-white rounded-full animate-spin" />
              ) : (
                <Command size={18} className={`transition-colors duration-300 ${isFocused ? 'text-indigo-400' : 'text-slate-600'}`} />
              )}
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex items-center">
              <input
                id="idea-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                disabled={isLoading || isEnhancing}
                placeholder="Describe your vision..."
                className="flex-1 bg-transparent border-none outline-none text-base md:text-lg font-medium text-white placeholder:text-slate-600 h-14 px-4 tracking-normal font-sans"
                autoComplete="off"
              />

              <div className="flex items-center gap-1 pr-1.5">
                <AnimatePresence>
                  {input.length > 3 && !isLoading && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      type="button"
                      onClick={handleEnhance}
                      disabled={isEnhancing}
                      className="p-2 text-indigo-400 hover:bg-white/5 rounded-lg transition-colors group/magic"
                      title="Enhance with AI"
                    >
                      <Wand2 size={16} className={`${isEnhancing ? 'animate-spin' : ''} group-hover/magic:text-indigo-300`} />
                    </motion.button>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className={`
                      h-10 px-5 rounded-lg font-bold text-[10px] uppercase tracking-[0.15em] transition-all duration-300 flex items-center gap-2
                      ${input.trim()
                      ? 'bg-white text-slate-950 hover:bg-indigo-50'
                      : 'bg-white/5 text-slate-600 cursor-not-allowed'}
                    `}
                >
                  <span>Forge</span>
                  <ArrowRight size={12} className={`transition-transform duration-300 ${input.trim() ? "translate-x-0" : "-translate-x-1 opacity-0"}`} />
                </button>
              </div>
            </form>
          </div>

          <AnimatePresence>
            {isFocused && !input && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute top-full left-0 right-0 mt-3 grid grid-cols-2 md:grid-cols-3 gap-2 px-1"
              >
                {[
                  "SaaS for vertical farming",
                  "AI legal assistant",
                  "Crypto payment gateway"
                ].map((hint) => (
                  <button
                    key={hint}
                    onMouseDown={(e) => { e.preventDefault(); setInput(hint); }}
                    className="text-xs font-medium text-left text-slate-500 px-3 py-2.5 rounded-lg bg-slate-900/50 border border-white/5 hover:bg-slate-800 hover:text-indigo-300 transition-colors truncate"
                  >
                    {hint}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Footer Metrics - Refined */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 w-full flex justify-center items-center gap-8 md:gap-16 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600 pointer-events-none select-none"
      >
        <div className="flex items-center gap-2">
          <BrainCircuit size={14} className="text-slate-700" />
          <span>G-1.5 Flash</span>
        </div>
        <div className="flex items-center gap-2">
          <Rocket size={14} className="text-slate-700" />
          <span>Turbo Latency</span>
        </div>
      </motion.div>

    </div>
  );
};

export default Hero;
