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
    <div className="relative w-full h-[100dvh] flex flex-col items-center justify-center bg-slate-950 overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">

      {/* Executive Dark Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Fine Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,black_70%,transparent_100%)]"></div>

        {/* Soft Ambient Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[140px] opacity-60"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px]"></div>

        {/* Grainy Texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-5xl px-6 flex flex-col items-center text-center"
      >
        {/* Minimal Status Indicator */}
        <motion.div variants={itemVariants} className="mb-10">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-indigo-500/[0.03] border border-white/5 backdrop-blur-3xl">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] animate-pulse"></div>
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-indigo-400 opacity-80">System Ready: Neural v2.4</span>
          </div>
        </motion.div>

        {/* Sophisticated Typography */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.05] tracking-tightest mb-8 uppercase italic"
        >
          Architect your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 via-indigo-100 to-white drop-shadow-sm">unrivaled empire.</span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed mb-16 tracking-tight opacity-90"
        >
          Stop building in the dark. Deploy autonomous intelligence to validate,
          architect, and scale your next market-dominant venture.
        </motion.p>

        {/* Sleek Command Input (Spotlight-style) */}
        <motion.div
          variants={itemVariants}
          className="w-full max-w-2xl relative group"
        >
          <div className={`absolute -inset-[1px] rounded-[1.25rem] bg-indigo-500/20 blur-[2px] transition-opacity duration-1000 ${isFocused ? 'opacity-100' : 'opacity-0'}`}></div>
          <div className={`
              relative bg-slate-900/60 backdrop-blur-2xl rounded-[1.25rem] border transition-all duration-500 ease-out p-1.5 flex items-center
              ${isFocused ? 'border-white/20 shadow-[0_0_50px_-12px_rgba(99,102,241,0.3)]' : 'border-white/10 shadow-lg'}
            `}>

            <div className="pl-4 pr-3 text-slate-500">
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
              ) : (
                <Command size={20} className={`transition-colors duration-500 ${isFocused ? 'text-indigo-400' : 'text-slate-600'}`} />
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
                placeholder="Initialize vision..."
                className="flex-1 bg-transparent border-none outline-none text-lg md:text-xl font-medium text-white placeholder:text-slate-700 h-14 px-2 tracking-tight"
                autoComplete="off"
              />

              <div className="flex items-center gap-2 pr-2">
                <AnimatePresence>
                  {input.length > 3 && !isLoading && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9, x: 10 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9, x: 10 }}
                      type="button"
                      onClick={handleEnhance}
                      disabled={isEnhancing}
                      className="p-2.5 text-indigo-400 hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/5"
                    >
                      {isEnhancing ? (
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Wand2 size={18} />
                      )}
                    </motion.button>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className={`
                      h-11 px-6 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] transition-all duration-500 flex items-center gap-2
                      ${input.trim()
                      ? 'bg-white text-slate-900 hover:bg-white/90 shadow-xl shadow-white/5 active:scale-95'
                      : 'bg-white/5 text-slate-600 cursor-not-allowed'}
                    `}
                >
                  <span>Forge</span>
                  <ArrowRight size={14} className={`transition-transform duration-500 ${input.trim() ? "translate-x-0" : "-translate-x-2 opacity-0"}`} />
                </button>
              </div>
            </form>
          </div>

          <AnimatePresence>
            {isFocused && !input && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute top-full left-0 right-0 mt-4 flex justify-center gap-3"
              >
                {[
                  "Hyper-Local EdTech",
                  "Decentralized Energy",
                  "Supply Chain AI"
                ].map((hint) => (
                  <button
                    key={hint}
                    onMouseDown={(e) => { e.preventDefault(); setInput(hint); }}
                    className="text-[9px] font-bold uppercase tracking-widest text-slate-500 px-4 py-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:text-white transition-all backdrop-blur-xl"
                  >
                    {hint}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Subtle Footer Metrics */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-12 w-full flex justify-center items-center gap-12 text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 pointer-events-none"
      >
        <div className="flex items-center gap-2">
          <BrainCircuit size={12} className="text-indigo-500/70" />
          <span>G-1.5 Engine</span>
        </div>
        <div className="w-px h-3 bg-white/10" />
        <div className="flex items-center gap-2">
          <Rocket size={12} className="text-indigo-500/70" />
          <span>Validated v2.4</span>
        </div>
        <div className="w-px h-3 bg-white/10" />
        <div className="flex items-center gap-2">
          <Target size={12} className="text-indigo-500/70" />
          <span>8ms Latency</span>
        </div>
      </motion.div>

    </div>
  );
};

export default Hero;
