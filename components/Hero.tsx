
import React, { useState } from 'react';
import { Target, Rocket, Command, BrainCircuit, Wand2 } from 'lucide-react';
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

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center bg-slate-950 overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">

      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-indigo-600/10 rounded-full blur-[120px] animate-blob mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[80vw] h-[80vw] bg-purple-600/10 rounded-full blur-[120px] animate-blob animation-delay-2000 mix-blend-screen"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,black_40%,transparent_100%)]"></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl px-6 flex flex-col items-center text-center">

        {/* Status Chip */}
        <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-indigo-300">System Online</span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-8 select-none drop-shadow-2xl">
          The Operating System <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-300 via-white to-purple-300">for Venture Building.</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed mb-16 px-4">
          LaunchPact AI transforms abstract ambition into execution-ready architecture.
          <span className="text-white"> Design, validate, and deploy</span> your next billion-dollar vision in seconds.
        </p>

        {/* Command Center Input */}
        <div className="w-full max-w-2xl relative group mb-20">
          {/* Glow Effect */}
          <div className={`absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-0 blur-xl transition-all duration-500 ${isFocused ? 'opacity-30' : 'group-hover:opacity-10'}`}></div>

          <div className={`
              relative bg-slate-900/90 backdrop-blur-2xl rounded-2xl border transition-all duration-300 ease-out p-2 flex flex-col
              ${isFocused ? 'border-indigo-500/50 shadow-2xl scale-[1.01]' : 'border-white/10 shadow-lg'}
            `}>
            <form onSubmit={handleSubmit} className="relative flex items-center">
              <div className={`pl-4 pr-3 transition-colors ${isFocused ? 'text-indigo-400' : 'text-slate-500'}`}>
                {isLoading ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Command size={20} />}
              </div>

              <input
                id="idea-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                disabled={isLoading || isEnhancing}
                placeholder="Describe your venture (e.g., 'AI-powered logistics for cold chain')..."
                className="flex-1 bg-transparent border-none outline-none text-lg font-medium text-white placeholder:text-slate-600 h-14 px-2"
                autoComplete="off"
              />

              <div className="flex items-center gap-2 pr-2">
                {input.length > 3 && !isLoading && (
                  <button
                    type="button"
                    onClick={handleEnhance}
                    disabled={isEnhancing}
                    className="p-2 text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                    title="Enhance Prompt"
                  >
                    {isEnhancing ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Wand2 size={18} />}
                  </button>
                )}

                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className={`
                      h-10 px-6 rounded-xl font-bold text-xs uppercase tracking-widest transition-all
                      ${input.trim()
                      ? 'bg-white text-slate-950 hover:bg-slate-200'
                      : 'bg-slate-800 text-slate-600 cursor-not-allowed'}
                    `}
                >
                  Forge
                </button>
              </div>
            </form>
          </div>

          {/* Contextual Hints */}
          <div className={`mt-4 flex flex-wrap justify-center gap-2 transition-all duration-500 ${isFocused || input ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
            {[
              "SaaS Platform for Legal Tech",
              "Marketplace for Vintage Audio",
              "Fintech App for Gen Z"
            ].map(hint => (
              <button
                key={hint}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); setInput(hint); }}
                className="text-[10px] font-medium uppercase tracking-wider text-slate-500 px-3 py-1.5 rounded-lg border border-white/5 hover:bg-white/5 hover:text-indigo-300 transition-colors"
              >
                {hint}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Footer Metrics */}
      <div className="absolute bottom-10 w-full flex justify-center gap-12 text-slate-500 opacity-60">
        <div className="flex items-center gap-3">
          <BrainCircuit size={16} />
          <span className="text-xs font-bold uppercase tracking-widest">Gemini 1.5 Pro</span>
        </div>
        <div className="w-px h-4 bg-white/10"></div>
        <div className="flex items-center gap-3">
          <Rocket size={16} />
          <span className="text-xs font-bold uppercase tracking-widest">v1.2.0 Stable</span>
        </div>
        <div className="w-px h-4 bg-white/10"></div>
        <div className="flex items-center gap-3">
          <Target size={16} />
          <span className="text-xs font-bold uppercase tracking-widest"> latency: 12ms</span>
        </div>
      </div>

    </div>
  );
};

export default Hero;
