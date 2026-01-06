
import React, { useState } from 'react';
import { Sparkles, ArrowRight, Zap, Target, Layers, Rocket, Command, Search, CheckCircle2, Download, BrainCircuit, Mic, Wand2, Crown } from 'lucide-react';
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
    onGenerate(input);
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

  const SUGGESTION_PROMPTS = [
    { label: 'SaaS Platform', icon: '🚀', prompt: 'Architect a B2B SaaS platform for automated legal workflows.' },
    { label: 'Marketplace', icon: '🛍️', prompt: 'Design a niche marketplace for freelance videographers.' },
    { label: 'Mobile App', icon: '📱', prompt: 'Blueprint a gamified wellness app for ADHD focus.' },
  ];

  return (
    <div className="relative pt-16 pb-20 px-6 flex flex-col items-center justify-center min-h-[85vh] overflow-hidden bg-slate-950 selection:bg-indigo-500/30 selection:text-indigo-200">

      {/* Premium Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Animated Mesh Gradients - Dark Mode */}
        <div className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-indigo-500/10 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-purple-500/10 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent opacity-50"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
      </div>

      <div className="max-w-7xl mx-auto w-full flex flex-col items-center text-center relative z-10">

        {/* Status Badge - Refined */}
        <div className="animate-in fade-in slide-in-from-top-4 duration-1000 delay-100 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/40 border border-white/10 backdrop-blur-md shadow-2xl">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">System Status: <span className="text-white">Optimal</span></span>
          </div>
        </div>

        {/* Headline Section - Professional Level */}
        <div className="space-y-6 max-w-5xl mb-12">
          <h1 className="text-7xl md:text-9xl lg:text-[11rem] font-black text-white leading-[0.8] tracking-tighter text-center select-none">
            <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/50">
              Architect<br />
              <span className="text-indigo-500">Tomorrow.</span>
            </span>
          </h1>

          <p className="text-lg md:text-2xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed tracking-tight px-4 pt-6">
            LaunchPact AI is the definitive engine for <span className="text-white">high-stakes venture architecture</span>.
            Turn complex visions into execution-ready protocols.
          </p>
        </div>

        {/* Smart Chat Bar - Professional Refinement */}
        <div className="w-full max-w-3xl relative group perspective-1000 mb-20">
          <div className={`
            absolute -inset-2 rounded-[3rem] bg-indigo-500/20 opacity-0 blur-3xl transition-all duration-1000
            ${isFocused ? 'opacity-40 scale-[1.02]' : 'group-hover:opacity-10'}
          `}></div>

          <div className={`
            relative bg-[#0b0f1a]/80 backdrop-blur-3xl rounded-[2.5rem] transition-all duration-500 ease-out flex flex-col p-2
            ${isFocused
              ? 'shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] translate-y-[-4px] border border-white/20'
              : 'shadow-2xl border border-white/10'}
          `}>
            <form onSubmit={handleSubmit} className="relative">
              <div className="relative flex flex-col md:flex-row items-center gap-2 px-4 py-2">
                <div className="flex-1 relative flex items-center h-14 md:h-20 w-full pl-2">
                  <div className={`mr-4 transition-all duration-500 ${isFocused ? 'text-indigo-400' : 'text-slate-600'}`}>
                    {isLoading ? (
                      <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Command size={24} />
                    )}
                  </div>
                  <input
                    id="idea-input"
                    type="text"
                    placeholder="Enter venture vision (e.g. AI logistics nexus)..."
                    className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-xl md:text-2xl font-bold text-white placeholder:text-slate-700 h-full pr-12"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    disabled={isLoading || isEnhancing}
                    autoComplete="off"
                  />

                  {input.length > 5 && !isLoading && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 pr-2">
                      <button
                        type="button"
                        onClick={handleEnhance}
                        disabled={isEnhancing}
                        className="p-3 rounded-2xl bg-white/5 text-indigo-400 hover:bg-white/10 hover:scale-110 transition-all border border-white/10"
                        title="Polish Architecture"
                      >
                        {isEnhancing ? (
                          <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Wand2 size={20} />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <div className="w-full md:w-auto flex gap-2">
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading || isEnhancing}
                    className={`
                      flex-1 md:flex-none h-14 md:h-20 px-10 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3
                      ${input.trim()
                        ? 'bg-white text-slate-950 shadow-2xl hover:scale-[1.02] active:scale-[0.98]'
                        : 'bg-slate-800/50 text-slate-600 cursor-not-allowed border border-white/5'}
                    `}
                  >
                    Forge
                  </button>
                </div>
              </div>

              {/* Suggestions Chips - Professional Level */}
              <div className={`
                 px-8 overflow-hidden transition-all duration-500 ease-out
                 ${isFocused && !input ? 'max-h-32 opacity-100 pb-8 pt-2' : 'max-h-0 opacity-0'}
              `}>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mb-4 text-left">Sector Blueprints</p>
                <div className="flex gap-3 overflow-hidden">
                  {[
                    { label: 'DeFi Protocol', prompt: 'Architect a cross-chain liquidity aggregator for institutional DeFi.' },
                    { label: 'Neural OS', prompt: 'Blueprint a high-fidelity brain-computer interface operating system.' },
                    { label: 'Bio-Sync', prompt: 'Design a real-time molecular diagnostics platform for remote clinics.' },
                  ].map((tag) => (
                    <button
                      type="button"
                      key={tag.label}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setInput(tag.prompt);
                        document.getElementById('idea-input')?.focus();
                      }}
                      className="whitespace-nowrap px-5 py-3 rounded-2xl bg-white/5 border border-white/5 text-[11px] font-bold text-slate-500 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Intelligence Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full pt-12 max-w-5xl">
          {[
            { icon: Target, label: "Precision", desc: "Solidify architectural choices with elite AI consensus." },
            { icon: BrainCircuit, label: "Insight", desc: "Combat hallucinations with deep feasibility protocols." },
            { icon: Rocket, label: "Velocity", desc: "Turn raw thought into execution-ready assets instantly." }
          ].map((f, i) => (
            <div key={i} className="flex flex-col items-center text-center space-y-4 group">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-600 group-hover:text-indigo-400 group-hover:border-indigo-500/20 group-hover:bg-indigo-500/5 transition-all duration-500">
                <f.icon size={24} />
              </div>
              <div>
                <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white mb-2">{f.label}</h4>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Hero;
