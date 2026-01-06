
import React, { useState, useEffect, useRef } from 'react';
import { ProductBlueprint, ChatMessage, LockedDecision } from '../types';
import { getGuidedCoFounderStep, chatWithAssistant } from '../services/geminiService';
import {
  ChevronRight, ChevronLeft, Layers, Code2,
  Palette, Milestone, ExternalLink, Bot, CheckCircle,
  Zap, ArrowRight, Cloud, Smartphone, Globe, Terminal,
  MessageSquare, Send, X, Lock, Check, Sparkles,
  HelpCircle, Award, Trophy, Crown, AlertTriangle
} from 'lucide-react';

interface GuidedBuilderProps {
  blueprint: ProductBlueprint;
  onExit: () => void;
  onUpdateProgress?: (selections: any, lockedDecision?: LockedDecision) => void;
}

const STEPS = [
  { id: 'features', title: 'MVP Feature Lock', icon: Layers, description: 'Confirming core value loop' },
  { id: 'stack', title: 'Tech Stack Choice', icon: Code2, description: 'Selecting your engineering kit' },
  { id: 'growth', title: 'Growth & Scale', icon: Globe, description: 'Marketing & Maintenance' },
];

const GuidedBuilder: React.FC<GuidedBuilderProps> = ({ blueprint, onExit, onUpdateProgress }) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<string>('');
  const [selections, setSelections] = useState<Record<string, any>>({});
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [dynamicSuggestions, setDynamicSuggestions] = useState<string[]>([]);

  // New: Decision Locking State
  const [lockedDecisions, setLockedDecisions] = useState<LockedDecision[]>([]);
  const [showLockAnimation, setShowLockAnimation] = useState(false);

  // Chat State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: `Hey! I'm LaunchPact AI, your co-founder. I'm here to help you make hard decisions for ${blueprint.productName}.` }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [isCoFounderMode, setIsCoFounderMode] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const currentStep = STEPS[currentStepIdx];

  const fetchStepContent = async () => {
    setLoading(true);
    try {
      const result = await getGuidedCoFounderStep(
        currentStep.title,
        blueprint,
        selections
      );
      setContent(result.advice || '');
      if (result.suggestions && result.suggestions.length > 0) {
        setDynamicSuggestions(result.suggestions);
      }
    } catch (err) {
      setContent('PNX connection issue. Retrying...');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStepContent();
  }, [currentStepIdx]);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  const handleChatSend = async (messageText: string) => {
    if (!messageText.trim() || chatLoading) return;

    const userMsg = { role: 'user' as const, content: messageText };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      const stepContext = `Current Module: ${currentStep.title}. Locked Decisions: ${JSON.stringify(lockedDecisions)}. Co-Founder Mode: ${isCoFounderMode}`;
      const resp = await chatWithAssistant(chatMessages as any, messageText, stepContext, isCoFounderMode);

      setChatMessages(prev => [...prev, { role: 'assistant', content: resp.text || "Thinking..." }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: "Connection lost." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleLockDecision = (category: 'Tech' | 'Feature' | 'Market', choice: string, reason: string) => {
    const newDecision: LockedDecision = {
      id: Math.random().toString(36),
      category,
      choice,
      reason,
      timestamp: new Date().toISOString()
    };

    setLockedDecisions(prev => [...prev, newDecision]);
    setSelections(prev => ({ ...prev, [currentStep.id]: choice }));

    setShowLockAnimation(true);
    setTimeout(() => setShowLockAnimation(false), 2000);

    if (onUpdateProgress) onUpdateProgress({ [currentStep.id]: choice }, newDecision);
  };

  const proceedToNext = () => {
    if (currentStepIdx < STEPS.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
      setCompletedSteps(prev => [...prev, currentStep.id]);
    } else {
      onExit();
    }
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-20 px-6 relative">
      {/* Lock Animation Overlay */}
      {showLockAnimation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-indigo-600/20 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl flex flex-col items-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white mb-4">
              <Lock size={32} />
            </div>
            <h3 className="text-xl font-black uppercase italic text-slate-900">Decision Locked</h3>
            <p className="text-slate-500 text-sm font-bold">LaunchPact AI will remember this choice.</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">

        {/* Sidebar Nav */}
        <div className="lg:w-80 space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
            {/* Locked Decisions List */}
            <div className="mb-8 border-b border-white/10 pb-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Locked Decisions</h4>
              {lockedDecisions.length === 0 ? (
                <p className="text-xs text-slate-600 italic">No decisions locked yet.</p>
              ) : (
                <ul className="space-y-3">
                  {lockedDecisions.map(d => (
                    <li key={d.id} className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                      <Lock size={10} />
                      {d.choice}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-4">
              {STEPS.map((step, idx) => {
                const isActive = idx === currentStepIdx;
                return (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStepIdx(idx)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left ${isActive ? 'bg-white/10 ring-1 ring-white/20' : 'hover:bg-white/5'
                      }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isActive ? 'bg-indigo-600 text-white' : 'bg-white/10 text-white'}`}>
                      <step.icon size={16} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{step.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button onClick={onExit} className="w-full py-4 text-xs font-bold text-slate-400 hover:text-slate-600">
            Save & Exit
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white rounded-[3.5rem] p-10 md:p-16 border border-slate-100 shadow-xl relative overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-black text-slate-900 uppercase italic">{currentStep.title}</h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">{currentStep.description}</p>
            </div>
            {loading && <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>}
          </div>

          <div className="prose prose-slate max-w-none mb-10">
            <div className="whitespace-pre-wrap text-slate-600 font-medium leading-relaxed">{content}</div>
          </div>

          {/* Step-Specific UI */}
          {currentStep.id === 'stack' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DecisionCard
                title="Supabase Stack"
                icon={Cloud}
                why="Best for rapid MVP. Auth + DB handled."
                risk="Complex relational queries later."
                locked={selections.stack === 'supabase'}
                onLock={() => handleLockDecision('Tech', 'Supabase', 'Rapid MVP Speed')}
              />
              <DecisionCard
                title="Firebase Stack"
                icon={Smartphone}
                why="Real-time syncing out of the box."
                risk="Vendor lock-in is high."
                locked={selections.stack === 'firebase'}
                onLock={() => handleLockDecision('Tech', 'Firebase', 'Real-time requirement')}
              />
            </div>
          )}

          <div className="mt-auto pt-10 flex justify-end">
            <button
              onClick={proceedToNext}
              className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2"
            >
              Next Step <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Co-Founder Chat - Compact Version */}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4">
        {chatOpen && (
          <div className="w-[340px] h-[400px] max-h-[50vh] bg-white rounded-[2rem] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 origin-bottom-right">
            {/* Header with Mode Toggle */}
            <div className={`p-4 ${isCoFounderMode ? 'bg-slate-900 text-white' : 'bg-indigo-600 text-white'} transition-colors`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Crown size={16} />
                  <span className="font-black text-xs uppercase tracking-widest">LaunchPact AI Chat</span>
                </div>
                <button onClick={() => setChatOpen(false)}><X size={16} /></button>
              </div>
              <div className="flex items-center justify-between bg-white/10 p-2 rounded-xl">
                <span className="text-[10px] font-bold uppercase ml-2">
                  {isCoFounderMode ? "🔥 Co-Founder Mode" : "🤖 Assistant Mode"}
                </span>
                <button
                  onClick={() => setIsCoFounderMode(!isCoFounderMode)}
                  className={`w-10 h-5 rounded-full relative transition-colors ${isCoFounderMode ? 'bg-orange-500' : 'bg-slate-400'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isCoFounderMode ? 'left-6' : 'left-1'}`}></div>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {chatMessages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-xs font-medium ${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 shadow-sm border border-slate-100'
                    }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="p-3 bg-white border-t border-slate-100">
              <form onSubmit={(e) => { e.preventDefault(); handleChatSend(chatInput); }} className="flex gap-2">
                <input
                  className="flex-1 bg-slate-50 px-4 py-2 rounded-xl text-xs focus:outline-none"
                  placeholder={isCoFounderMode ? "Ask for brutal advice..." : "Ask a question..."}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                />
                <button type="submit" className="p-2 bg-indigo-600 text-white rounded-xl"><Send size={16} /></button>
              </form>
            </div>
          </div>
        )}
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="bg-indigo-600 text-white p-4 rounded-full shadow-xl hover:scale-105 transition-transform"
        >
          {chatOpen ? <X size={24} /> : <MessageSquare size={24} />}
        </button>
      </div>
    </div>
  );
};

const DecisionCard = ({ title, icon: Icon, why, risk, locked, onLock }: any) => (
  <div className={`p-6 rounded-[2rem] border-2 transition-all ${locked ? 'border-green-500 bg-green-50' : 'border-slate-100 bg-white hover:border-indigo-200'}`}>
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-100 rounded-xl"><Icon size={20} /></div>
        <h4 className="font-black text-slate-900">{title}</h4>
      </div>
      {locked ? <Lock size={16} className="text-green-600" /> : (
        <button onClick={onLock} className="text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors">
          Lock Decision
        </button>
      )}
    </div>
    <div className="space-y-2">
      <div className="text-xs">
        <span className="font-bold text-green-600 uppercase text-[9px]">Why This:</span>
        <p className="text-slate-600">{why}</p>
      </div>
      <div className="text-xs">
        <span className="font-bold text-red-500 uppercase text-[9px]">Risk:</span>
        <p className="text-slate-600">{risk}</p>
      </div>
    </div>
  </div>
);

export default GuidedBuilder;
