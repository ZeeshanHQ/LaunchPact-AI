
import React, { useState, useEffect, useRef } from 'react';
import { ProductBlueprint, Feature, Competitor, ExecutionTask, TimelineSimulation, ChatMessage } from '../types';
import { generateExecutionPlan, simulateTimeline, chatWithAssistant } from '../services/geminiService';
import { supabase } from '../services/supabase';
import {
   CheckCircle2, Target, Users, BarChart3, Layers, Code2, Milestone,
   BookmarkPlus, Info, Globe, Zap, ShieldAlert, ArrowRight, Sparkles,
   ExternalLink, Search, Rocket, Pencil, Trash2, Plus, X, Save, AlertTriangle,
   DollarSign, Brain, ThumbsUp, ThumbsDown, ListTodo, CalendarClock, FileText, Crown, Clock, Download, ChevronDown, FileJson, FileType, Printer,
   MessageSquare, Send, Bot, BrainCircuit, Maximize2, Minimize2, ArrowUp, Copy, Check, ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BlueprintViewProps {
   blueprint: ProductBlueprint;
   onSave: () => void;
   isLoggedIn: boolean;
   onStartGuidedMode: () => void;
   onUpdate?: (updatedBlueprint: ProductBlueprint) => void;
   onFeedback?: (isPositive: boolean, reason?: string) => void;
}

const BlueprintView: React.FC<BlueprintViewProps> = ({ blueprint, onSave, isLoggedIn, onStartGuidedMode, onUpdate, onFeedback }) => {
   // UI & Layout State
   const [activeTab, setActiveTab] = useState<'strategy' | 'execution' | 'timeline'>('strategy');
   const [draft, setDraft] = useState<ProductBlueprint>(blueprint);
   const [isEditing, setIsEditing] = useState<string | null>(null);
   const [isSidebarOpen, setIsSidebarOpen] = useState(true);

   // AI Assistant State
   const [messages, setMessages] = useState<ChatMessage[]>([]);
   const [input, setInput] = useState('');
   const [isChatLoading, setIsChatLoading] = useState(false);
   const [userName, setUserName] = useState<string>('Founder');
   const chatScrollRef = useRef<HTMLDivElement>(null);

   // Execution & Timeline State
   const [executionTasks, setExecutionTasks] = useState<ExecutionTask[]>([]);
   const [isLoadingTasks, setIsLoadingTasks] = useState(false);
   const [simMonths, setSimMonths] = useState(3);
   const [simResult, setSimResult] = useState<TimelineSimulation | null>(null);
   const [isSimulating, setIsSimulating] = useState(false);

   // Export UI State
   const [showExportMenu, setShowExportMenu] = useState(false);
   const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);
   const [proposedUpdate, setProposedUpdate] = useState<Partial<ProductBlueprint> | null>(null);

   const navigate = useNavigate();

   useEffect(() => {
      setDraft(blueprint);
   }, [blueprint]);

   useEffect(() => {
      const fetchProfile = async () => {
         const { data: { user } } = await supabase.auth.getUser();
         if (user) {
            const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Founder';
            setUserName(name);
            setMessages([{
               role: 'assistant',
               content: `Greetings, **${name}**. I am your Blueprint Architect. I've analyzed your vision for **${blueprint.productName}**. How would you like to refine the strategy or technical execution?`
            }]);
         }
      };
      fetchProfile();
   }, []);

   useEffect(() => {
      if (chatScrollRef.current) {
         chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
   }, [messages]);

   const handleUpdate = (updates: Partial<ProductBlueprint>) => {
      const newDraft = { ...draft, ...updates };
      setDraft(newDraft);
      if (onUpdate) onUpdate(newDraft);
   };

   const loadExecutionPlan = async () => {
      setActiveTab('execution');
      if (executionTasks.length === 0) {
         setIsLoadingTasks(true);
         try {
            const tasks = await generateExecutionPlan(draft);
            setExecutionTasks(Array.isArray(tasks) ? tasks : []);
         } catch (e) {
            console.error(e);
            setExecutionTasks([]);
         }
         finally { setIsLoadingTasks(false); }
      }
   };

   const runSimulation = async () => {
      setIsSimulating(true);
      try {
         const res = await simulateTimeline(draft, simMonths);
         setSimResult(res);
      } catch (e) { console.error(e); }
      finally { setIsSimulating(false); }
   };

   const handleExport = (format: 'json' | 'md' | 'print') => {
      setShowExportMenu(false);
      if (format === 'print') {
         // Temporarily hide sidebar for print
         const wasSidebarOpen = isSidebarOpen;
         if (wasSidebarOpen) setIsSidebarOpen(false);

         setTimeout(() => {
            window.print();
            if (wasSidebarOpen) setIsSidebarOpen(true);
         }, 500);
         return;
      }

      let content = '';
      let mimeType = '';
      let extension = '';

      if (format === 'json') {
         content = JSON.stringify(draft, null, 2);
         mimeType = 'application/json';
         extension = 'json';
      } else if (format === 'md') {
         content = `# ${draft.productName}\n${draft.tagline}\n\n## Executive Summary\n${draft.ideaSummary}\n\n## Core Problem\n${draft.problemStatement}\n\n## USP\n${draft.usp}\n\n## MVP Features\n${draft.mvpFeatures.map(f => `- ${f.title}: ${f.description}`).join('\n')}\n\n## Tech Stack\nFrontend: ${draft.techStack.frontend}\nBackend: ${draft.techStack.backend}\n`;
         mimeType = 'text/markdown';
         extension = 'md';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${draft.productName.replace(/\s+/g, '_')}_blueprint.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
   };

   const handleSendMessage = async (text?: string) => {
      const msgText = text || input.trim();
      if (!msgText || isChatLoading) return;

      const userMsg: ChatMessage = { role: 'user', content: msgText };
      setMessages(prev => [...prev, userMsg]);
      setInput('');
      setIsChatLoading(true);

      try {
         const systemContext = `
            ROLE: Specialized Blueprint Architect AI - Conversational and Friendly.
            USER NAME: ${userName}
            TARGET PROJECT: "${draft.productName}"
            FULL BLUEPRINT DATA: ${JSON.stringify(draft)}
            
            INSTRUCTIONS: 
            1. Be professional, strategic, technical, AND conversational/friendly.
            2. Address the user as ${userName}.
            3. When user asks about blueprint modifications (add/change/update):
               - FIRST: Discuss what you'd change and WHY it's beneficial (be conversational)
               - THEN: Ask if they want you to apply it to their live blueprint (left panel)
               - Use friendly phrases like "Chaho toh main ye changes directly apply kar doon?" or "Want me to add these to your blueprint?"
            4. ONLY include "updates" object when user CONFIRMS (e.g., "han", "yes", "kr do", "sure", "go ahead")
            5. The "updates" object should contain ONLY the keys that changed (e.g. { "competitors": [...], "usp": "..." }).
            6. Ensure the "updates" object is a valid JSON field in your response: {"text": "...", "suggestions": [...], "updates": { ... }}
            7. Keep responses concise, valuable, and friendly - like talking to a co-founder friend.
         `;

         const history = messages.map(m => ({ role: m.role, content: m.content }));
         const response = await chatWithAssistant(history, msgText, systemContext);

         // Handle direct text and potential updates from the new server format
         setMessages(prev => [...prev, {
            role: 'assistant',
            content: response.text || "I've processed your strategic input."
         }]);

         if (response.updates) {
            setProposedUpdate(response.updates);
         }
      } catch (err) {
         setMessages(prev => [...prev, { role: 'assistant', content: "Neural link interrupted. Please verify connectivity." }]);
      } finally {
         setIsChatLoading(false);
      }
   };

   const SUGGESTED_QUESTIONS = [
      `How can we improve the USP?`,
      `Analyze the competitor weaknesses.`,
      `Refine the Tech Stack for SCALE.`,
      `Suggest 3 additional MVP features.`
   ];

   const removeItem = (key: any, index: number) => {
      const list = [...(draft[key as keyof ProductBlueprint] as any[])];
      list.splice(index, 1);
      handleUpdate({ [key]: list });
   };

   const handleCopyMessage = (text: string, id: number) => {
      navigator.clipboard.writeText(text);
      setCopiedMessageId(id);
      setTimeout(() => setCopiedMessageId(null), 2000);
   };

   return (
      <div className="min-h-screen bg-[#F8FAFC] flex font-sans overflow-hidden print:bg-white print:block print:overflow-visible">
         {/* LEFT CONTENT AREA */}
         <div className={`flex-1 transition-all duration-500 overflow-y-auto h-screen scrollbar-hide print:h-auto print:overflow-visible print:p-0 ${isSidebarOpen ? 'mr-[400px]' : 'mr-0'} print:mr-0`}>
            <div className="max-w-5xl mx-auto px-6 py-12 space-y-12 animate-fade-in pb-40 print:pb-0 print:py-0 print:max-w-full">

               {/* 0. Back Navigation */}
               <div className="print:hidden">
                  <button
                     onClick={() => navigate('/dashboard')}
                     className="px-4 py-2 text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-2 font-bold text-xs uppercase tracking-widest"
                  >
                     <ChevronLeft size={16} /> Dashboard
                  </button>
               </div>

               {/* 1. Integrated Premium Header */}
               <div className="relative group mb-16">
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative bg-white p-10 rounded-[2rem] border border-slate-100 shadow-xl flex flex-col lg:flex-row justify-between items-start gap-8">
                     <div className="space-y-4 max-w-2xl">
                        <div className="flex items-center gap-2 mb-2">
                           <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-indigo-100">Foundry Output_v1.0</span>
                           <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{new Date().toLocaleDateString()}</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase italic leading-[0.9]">{draft.productName}</h1>
                        <p className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">{draft.tagline}</p>
                     </div>
                     <div className="flex flex-wrap gap-3">
                        <div className="relative">
                           <button
                              onClick={() => setShowExportMenu(!showExportMenu)}
                              className="px-6 py-4 bg-white border border-slate-200 rounded-xl font-black text-xs uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2"
                           >
                              <Download size={16} /> Export <ChevronDown size={14} />
                           </button>
                           {showExportMenu && (
                              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2">
                                 <button onClick={() => handleExport('json')} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2"><FileJson size={14} /> JSON Data</button>
                                 <button onClick={() => handleExport('md')} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2"><FileType size={14} /> Markdown</button>
                                 <button onClick={() => handleExport('print')} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2"><Printer size={14} /> Print / PDF</button>
                              </div>
                           )}
                        </div>
                        <button onClick={onSave} className="px-8 py-4 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2">
                           <BookmarkPlus size={16} /> Save Repository
                        </button>
                        {!isSidebarOpen && (
                           <button onClick={() => setIsSidebarOpen(true)} className="p-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                              <BrainCircuit size={20} />
                           </button>
                        )}
                     </div>
                  </div>
               </div>

               {/* Sequential Journey Header */}
               <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 border border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full"></div>
                  <div className="flex items-center gap-6 relative z-10">
                     <div className="bg-indigo-600 p-4 rounded-2xl shadow-lg shadow-indigo-500/20">
                        <Sparkles size={28} />
                     </div>
                     <div>
                        <h3 className="font-black uppercase italic text-xl tracking-tight">Phase 01: Strategic Core</h3>
                        <p className="text-slate-400 text-sm font-medium">Validation of foundational vision and market positioning.</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-6 relative z-10">
                     <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Architecture Sync</p>
                        <span className="text-2xl font-black italic tracking-tighter">33%</span>
                     </div>
                     <div className="h-2 w-32 bg-white/10 rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-indigo-500 w-1/3 shadow-[0_0_10px_rgba(79,70,229,0.5)]"></div>
                     </div>
                  </div>
               </div>

               <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Reality Check Engine */}
                  {draft.viability && (
                     <div className={`p-10 rounded-[2.5rem] border-l-8 ${draft.viability.score < 60 ? 'bg-red-50 border-red-500' : 'bg-indigo-50 border-indigo-500'} shadow-sm flex flex-col md:flex-row gap-8 items-start relative overflow-hidden`}>
                        <div className="absolute top-0 right-0 p-8 opacity-5"><Target size={120} /></div>
                        <div className={`p-5 rounded-2xl shrink-0 ${draft.viability.score < 60 ? 'bg-red-200 text-red-700' : 'bg-indigo-200 text-indigo-700'} shadow-inner`}>
                           <Target size={40} />
                        </div>
                        <div className="space-y-4 flex-1 relative z-10">
                           <div className="flex items-center gap-4 mb-1">
                              <span className="font-black uppercase tracking-[0.2em] text-[10px] text-slate-500 bg-white/50 px-3 py-1 rounded-full border border-slate-200">LaunchPact AI Reality Engine</span>
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase text-white shadow-sm ${draft.viability.score < 60 ? 'bg-red-500' : 'bg-emerald-500'}`}>Integrity: {draft.viability.score}%</span>
                           </div>
                           <p className="text-slate-900 font-bold text-xl leading-relaxed italic">"{draft.viability.saturationAnalysis}"</p>
                           {draft.viability.pivotSuggestion && (
                              <div className="mt-6 bg-white/80 backdrop-blur p-6 rounded-2xl border border-slate-200/50 shadow-sm group">
                                 <span className="text-[10px] font-black uppercase text-indigo-600 tracking-[0.2em] block mb-2 flex items-center gap-2">
                                    <Zap size={12} /> Recommended Strategic Pivot
                                 </span>
                                 <p className="text-slate-700 font-medium italic group-hover:text-slate-950 transition-colors">"{draft.viability.pivotSuggestion}"</p>
                              </div>
                           )}
                        </div>
                     </div>
                  )}

                  {/* Core Concept */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                           <FileText size={14} className="text-indigo-500" /> Executive Summary
                        </h3>
                        <p className="text-slate-700 text-lg font-medium leading-relaxed">{draft.ideaSummary}</p>
                     </div>
                     <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden hover:shadow-md transition-shadow group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><ShieldAlert size={120} /></div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400 mb-6 flex items-center gap-2">
                           <ShieldAlert size={14} /> Core Problem Statement
                        </h3>
                        <p className="text-slate-700 text-lg font-medium leading-relaxed relative z-10">{draft.problemStatement}</p>
                     </div>
                  </div>

                  {/* Unique Value & Domain */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     <div className="lg:col-span-2 bg-gradient-to-br from-[#06080F] to-[#1E1B4B] rounded-[2.5rem] p-12 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-indigo-500/10 blur-[100px] rounded-full group-hover:bg-indigo-500/20 transition-all duration-700"></div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-8 flex items-center gap-2">
                           <Sparkles size={14} className="text-indigo-400" /> Strategic Uniqueness (USP)
                        </h3>
                        <p className="text-4xl font-black leading-[1.1] relative z-10 tracking-tight italic">"{draft.usp}"</p>
                     </div>

                     <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm flex flex-col">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-2">
                           <Globe size={14} className="text-indigo-500" /> Identity / Domain Sync
                        </h3>
                        <ul className="space-y-4 flex-1">
                           {(draft.domainSuggestions || []).slice(0, 3).map((domain, i) => (
                              <li key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors group">
                                 <span className="font-bold text-slate-700 tracking-tight group-hover:text-indigo-600">{domain}</span>
                                 <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">Verified</span>
                              </li>
                           ))}
                        </ul>
                     </div>
                  </div>

                  {/* Market & Competitors */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                           <div className="flex items-center gap-3">
                              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600"><Users size={20} /></div>
                              <h3 className="text-xl font-black uppercase italic text-slate-900">Market Intelligence</h3>
                           </div>
                           <BarChart3 size={20} className="text-slate-200" />
                        </div>
                        <div className="space-y-4">
                           <div className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Primary Target Segment</span>
                              <p className="font-bold text-slate-800 text-lg leading-snug">{draft.marketAnalysis.targetAudience}</p>
                           </div>
                           <div className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Total Addressable Market (TAM)</span>
                              <p className="font-black text-indigo-600 text-2xl tracking-tighter italic">{draft.marketAnalysis.potentialSize}</p>
                           </div>
                        </div>
                     </div>

                     <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                           <div className="flex items-center gap-3">
                              <div className="p-3 bg-red-50 rounded-xl text-red-500"><Target size={20} /></div>
                              <h3 className="text-xl font-black uppercase italic text-slate-900">Competitive Landscape</h3>
                           </div>
                           <ShieldAlert size={20} className="text-slate-200" />
                        </div>
                        <div className="space-y-4">
                           {draft.competitors.map((c, i) => (
                              <div key={i} className="flex flex-col p-5 border border-slate-100 rounded-2xl hover:border-red-200 transition-all hover:bg-red-50/10 group">
                                 <div className="flex justify-between items-center mb-2">
                                    <span className="font-black text-slate-900 uppercase italic tracking-tight">{c.name}</span>
                                    <span className="px-3 py-1 bg-slate-100 text-[9px] font-black text-slate-500 rounded-full group-hover:bg-red-100 group-hover:text-red-600">Competitor_Sync</span>
                                 </div>
                                 <p className="text-xs text-slate-600 leading-relaxed font-medium"><span className="font-black text-red-500 uppercase tracking-widest mr-2">Exploitable Weakness:</span> {c.weakness}</p>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>

                  {/* Tech Stack & MVP */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                     <div className="lg:col-span-4 bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-xl">
                        <h3 className="text-xl font-black uppercase italic text-slate-900 mb-10 flex items-center gap-3">
                           <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200"><Code2 size={20} /></div>
                           Core Tech Stack
                        </h3>
                        <div className="space-y-8">
                           <div className="group">
                              <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] block mb-2">Front-End UI/UX</span>
                              <p className="text-lg font-black text-slate-800 group-hover:text-indigo-600 transition-colors uppercase italic tracking-tighter">{draft.techStack.frontend}</p>
                              <div className="h-0.5 w-0 bg-indigo-600 group-hover:w-full transition-all duration-500"></div>
                           </div>
                           <div className="group">
                              <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] block mb-2">Back-End / Logic</span>
                              <p className="text-lg font-black text-slate-800 group-hover:text-indigo-600 transition-colors uppercase italic tracking-tighter">{draft.techStack.backend}</p>
                              <div className="h-0.5 w-0 bg-indigo-600 group-hover:w-full transition-all duration-500"></div>
                           </div>
                           <div className="group">
                              <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] block mb-2">Data persistence</span>
                              <p className="text-lg font-black text-slate-800 group-hover:text-indigo-600 transition-colors uppercase italic tracking-tighter">{draft.techStack.database}</p>
                              <div className="h-0.5 w-0 bg-indigo-600 group-hover:w-full transition-all duration-500"></div>
                           </div>
                        </div>
                     </div>

                     <div className="lg:col-span-8 bg-[#0B0F1A] p-12 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-700/5 blur-[120px] rounded-full"></div>
                        <div className="flex justify-between items-center mb-10 relative z-10">
                           <h3 className="text-xl font-black uppercase italic flex items-center gap-3">
                              <div className="p-3 bg-white/5 rounded-xl border border-white/10"><Layers size={20} className="text-indigo-400" /></div>
                              MVP Feature Architecture
                           </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                           {draft.mvpFeatures.map((f, i) => (
                              <div key={i} className="p-6 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/[0.08] hover:border-white/10 transition-all group">
                                 <div className="flex justify-between items-start mb-3">
                                    <h4 className="font-black text-lg italic tracking-tight group-hover:text-indigo-400 transition-colors">{f.title}</h4>
                                    <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-full border ${f.priority === 'High' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-slate-500/20 text-slate-400 border-white/5'}`}>{f.priority} PRIORITY</span>
                                 </div>
                                 <p className="text-sm text-slate-400 leading-relaxed font-medium">{f.description}</p>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>

                  {/* FINAL CTA: Launch Builder */}
                  <div className="pt-20 pb-10 text-center space-y-10 relative">
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-32 bg-indigo-600/5 blur-[100px] -z-10"></div>
                     <div className="max-w-3xl mx-auto space-y-6">
                        <h2 className="text-5xl md:text-6xl font-black uppercase italic text-slate-900 leading-tight tracking-tighter">Initiate Execution Protocol?</h2>
                        <p className="text-slate-500 text-xl font-medium max-w-2xl mx-auto leading-relaxed">The architecture is set. Proceed to the Launch Builder to synchronize your execution timeline and lock the founding mission sequence.</p>
                     </div>

                     <button
                        onClick={() => {
                           if (!isLoggedIn) {
                              // Save current path to return after login
                              localStorage.setItem('returnAfterLogin', '/planner');
                              navigate('/login');
                           } else {
                              onStartGuidedMode();
                           }
                        }}
                        className="group relative inline-flex items-center gap-6 bg-indigo-600 text-white px-16 py-8 rounded-[2.5rem] font-black text-2xl uppercase tracking-tighter hover:bg-indigo-700 transition-all shadow-[0_20px_50px_rgba(79,70,229,0.3)] hover:scale-[1.02] active:scale-95 overflow-hidden italic"
                     >
                        <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                        <Rocket size={40} className="group-hover:rotate-12 transition-transform" />
                        {!isLoggedIn ? 'Login to Deploy' : 'Deploy Venture'}
                        <ArrowRight size={32} className="group-hover:translate-x-3 transition-transform" />
                     </button>
                  </div>
               </div>
            </div>
         </div>

         {/* RIGHT AI SIDEBAR */}
         <aside
            className={`
               fixed top-0 right-0 h-screen w-[400px] bg-white border-l border-slate-200 shadow-2xl flex flex-col z-50
               transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
               ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
            `}
         >
            {/* Sidebar Header */}
            <div className="px-6 py-6 border-b border-slate-100 flex items-center justify-between bg-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -z-10"></div>
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 border-2 border-indigo-500/20">
                     <Brain size={24} />
                  </div>
                  <div>
                     <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">Architect AI</h3>
                     <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Analyzing Context
                     </p>
                  </div>
               </div>
               <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-300 hover:text-slate-900 border border-transparent hover:border-slate-100"
               >
                  <X size={20} />
               </button>
            </div>

            {/* Chat Messages */}
            <div
               ref={chatScrollRef}
               className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FDFDFF] scroll-smooth"
            >
               {messages.map((m, i) => (
                  <div key={i} className={`flex gap-3 group/msg ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                     <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-1 shadow-md border ${m.role === 'assistant' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-white'}`}>
                        {m.role === 'assistant' ? <Bot size={18} /> : <span className="text-[11px] font-black uppercase italic">{userName[0]}</span>}
                     </div>
                     <div className="relative max-w-[85%]">
                        <div className={`
                           p-5 rounded-[1.5rem] shadow-sm
                           ${m.role === 'user' ? 'bg-white border border-slate-200 text-slate-700 rounded-tr-none' : 'bg-indigo-50 border border-indigo-100 text-slate-800 rounded-tl-none'}
                        `}>
                           {m.content.split('\n').map((line, idx) => (
                              <p key={idx} className={`text-xs font-medium leading-relaxed ${idx > 0 ? 'mt-2' : ''}`}>{line}</p>
                           ))}
                        </div>

                        {/* Copy Button */}
                        <button
                           onClick={() => handleCopyMessage(m.content, i)}
                           className="absolute -bottom-6 left-2 opacity-0 group-hover/msg:opacity-100 transition-opacity p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-indigo-600 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest"
                        >
                           {copiedMessageId === i ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                           {copiedMessageId === i ? 'Copied' : 'Copy'}
                        </button>
                     </div>
                  </div>
               ))}


               {proposedUpdate && (
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 p-6 rounded-[2rem] space-y-4 animate-in fade-in zoom-in duration-300 shadow-lg">
                     <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-500 rounded-xl text-white shadow-lg shadow-emerald-200 animate-pulse">
                           <Sparkles size={18} />
                        </div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-emerald-700">✨ Ready to Update Blueprint</h4>
                     </div>

                     <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-emerald-100">
                        <p className="text-xs font-bold text-emerald-900 leading-relaxed mb-3">
                           Perfect! I've prepared the changes we discussed. These will be applied directly to your live blueprint (visible in the left panel).
                        </p>

                        {/* Preview of changes */}
                        <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100">
                           <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2">📋 What's Changing:</p>
                           <div className="space-y-1.5">
                              {Object.keys(proposedUpdate).map((key, idx) => (
                                 <div key={idx} className="flex items-center gap-2 text-[11px]">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                    <span className="font-bold text-emerald-800 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                    <span className="text-emerald-600">→</span>
                                    <span className="text-emerald-700 font-medium">Updated</span>
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>

                     <div className="flex gap-3">
                        <button
                           onClick={() => {
                              handleUpdate(proposedUpdate);
                              setProposedUpdate(null);
                              setMessages(prev => [...prev, {
                                 role: 'assistant',
                                 content: `🎉 Done! Your blueprint has been updated successfully. The changes are now live in your left panel. Anything else you'd like to refine, ${userName}?`
                              }]);
                           }}
                           className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-200 active:scale-95 flex items-center justify-center gap-2"
                        >
                           <Check size={16} />
                           Apply Changes Now
                        </button>
                        <button
                           onClick={() => {
                              setProposedUpdate(null);
                              setMessages(prev => [...prev, {
                                 role: 'assistant',
                                 content: "No problem! Let me know if you'd like to discuss any other changes or refinements."
                              }]);
                           }}
                           className="px-5 py-3.5 bg-white border-2 border-emerald-200 text-emerald-700 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-50 transition-all active:scale-95 flex items-center gap-2"
                        >
                           <X size={16} />
                           Not Now
                        </button>
                     </div>
                  </div>
               )}


               {isChatLoading && (
                  <div className="flex gap-3">
                     <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-lg shadow-indigo-100"><Bot size={18} /></div>
                     <div className="bg-indigo-50 border border-indigo-100 px-5 py-4 rounded-[1.5rem] rounded-tl-none flex gap-1.5 items-center">
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-75"></span>
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150"></span>
                     </div>
                  </div>
               )}
            </div>

            {/* Suggestions & Input */}
            <div className="p-8 border-t border-slate-100 bg-white">
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">Strategic Inquiry Options:</span>
               <div className="flex gap-2 overflow-x-auto pb-6 scrollbar-hide">
                  {SUGGESTED_QUESTIONS.map((q, idx) => (
                     <button
                        key={idx}
                        onClick={() => handleSendMessage(q)}
                        className="whitespace-nowrap px-5 py-2.5 bg-indigo-50 hover:bg-indigo-600 border border-indigo-100 hover:border-indigo-600 rounded-2xl text-[10px] font-black text-indigo-700 hover:text-white transition-all active:scale-95 shadow-sm"
                     >
                        {q}
                     </button>
                  ))}
               </div>
               <form
                  onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                  className="relative group pb-4"
               >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur opacity-0 group-focus-within:opacity-15 transition duration-500"></div>
                  <div className="relative">
                     <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 group-hover:border-slate-300 focus:border-indigo-500 focus:bg-white rounded-2xl pl-6 pr-14 py-5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-inner"
                        placeholder="Type strategic inquiry..."
                     />
                     <button
                        type="submit"
                        disabled={!input.trim() || isChatLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-slate-900 text-white rounded-xl hover:bg-indigo-600 transition-all disabled:opacity-30 shadow-xl active:scale-90"
                     >
                        <ArrowUp size={20} />
                     </button>
                  </div>
               </form>
               <div className="flex items-center justify-center gap-4 pt-2">
                  <div className="h-px bg-slate-100 flex-1"></div>
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">LaunchPact AI Intelligence</p>
                  <div className="h-px bg-slate-100 flex-1"></div>
               </div>
            </div>
         </aside>
      </div>
   );
};

export default BlueprintView;
