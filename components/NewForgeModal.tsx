import React, { useState } from 'react';
import { X, Command, Sparkles, Loader2 } from 'lucide-react';
import { useBlueprint } from './BlueprintContext';
import { enhanceUserPrompt } from '../services/geminiService';

interface NewForgeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewForgeModal: React.FC<NewForgeModalProps> = ({ isOpen, onClose }) => {
  const { onCreateBlueprint, isLoading } = useBlueprint();
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isEnhancing) return;
    const ideaToSubmit = input.trim();
    setInput('');
    await onCreateBlueprint(ideaToSubmit);
    onClose();
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
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl bg-[#0b0f1a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-slate-400 hover:text-white transition-all z-10"
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl mb-6">
              <Sparkles size={32} className="text-indigo-400" />
            </div>
            <h2 className="text-3xl font-black text-white mb-3 uppercase italic tracking-tight">
              New Forge
            </h2>
            <p className="text-slate-400 text-sm font-medium max-w-md mx-auto">
              Transform your idea into an execution-ready blueprint. Enter your vision below.
            </p>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              {/* Glow Effect */}
              <div className={`absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-0 blur-xl transition-all duration-500 ${isFocused ? 'opacity-30' : 'group-hover:opacity-10'}`}></div>

              <div className={`
                relative bg-slate-900/90 backdrop-blur-2xl rounded-2xl border transition-all duration-300 ease-out p-2 flex flex-col
                ${isFocused ? 'border-indigo-500/50 shadow-2xl scale-[1.01]' : 'border-white/10 shadow-lg'}
              `}>
                <div className="flex items-center gap-3 px-3">
                  <div className={`transition-colors ${isFocused ? 'text-indigo-400' : 'text-slate-500'}`}>
                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Command size={20} />}
                  </div>

                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Describe your product idea, vision, or startup concept..."
                    className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-slate-500 resize-none min-h-[120px] py-2"
                    disabled={isLoading || isEnhancing}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between px-3 pt-3 border-t border-white/5 gap-3">
                  <button
                    type="button"
                    onClick={handleEnhance}
                    disabled={!input.trim() || isEnhancing || isLoading}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest flex items-center gap-2"
                  >
                    {isEnhancing ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Enhancing...
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        Enhance Idea
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={isLoading}
                      className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!input.trim() || isLoading || isEnhancing}
                      className="px-6 py-2 bg-white text-slate-950 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-white/5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Forging...
                        </>
                      ) : (
                        'Create Blueprint'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>

          {/* Tips */}
          <div className="mt-6 p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-2">Pro Tip</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Be specific about your target market, problem, and solution. The more detail you provide, the better the blueprint will be.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewForgeModal;
