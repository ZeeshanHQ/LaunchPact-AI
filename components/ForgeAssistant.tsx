
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Sparkles, Zap, Target, Code2, Bot, ArrowUp, Trash2, BrainCircuit, Maximize2, Minimize2, History, Plus } from 'lucide-react';
import { chatWithAssistant } from '../services/geminiService';
import { ProductBlueprint, ChatMessage } from '../types';

interface ForgeAssistantProps {
   blueprint: ProductBlueprint | null;
   currentView: string;
   isFullPage?: boolean;
   isShifted?: boolean;
   isEmbedded?: boolean;
   onCloseFullPage?: () => void;
   onExpand?: () => void;
}

const FORGE_SUGGESTIONS = [
   { label: 'Tech Stack', icon: Code2, prompt: 'Suggest a scalable tech stack for this idea.' },
   { label: 'Marketing', icon: Target, prompt: 'How do I get my first 100 users?' },
   { label: 'Revenue', icon: Zap, prompt: 'What are good monetization models for this?' },
];

const FORGE_HISTORY_KEY = 'forge_chat_history_v1';

const ForgeAssistant: React.FC<ForgeAssistantProps> = ({
   blueprint,
   currentView,
   isFullPage = false,
   isShifted = false,
   isEmbedded = false,
   onCloseFullPage,
   onExpand
}) => {
   const [isOpen, setIsOpen] = useState(false);
   const [messages, setMessages] = useState<ChatMessage[]>([]);
   const [input, setInput] = useState('');
   const [isLoading, setIsLoading] = useState(false);
   const scrollRef = useRef<HTMLDivElement>(null);

   // Load History
   useEffect(() => {
      loadChatHistory();
   }, []);

   // Auto-scroll
   useEffect(() => {
      if (scrollRef.current) {
         scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
   }, [messages, isOpen, isFullPage]);

   const loadChatHistory = () => {
      try {
         const saved = localStorage.getItem(FORGE_HISTORY_KEY);
         if (saved) {
            setMessages(JSON.parse(saved));
         } else {
            const welcomeMsg: ChatMessage = {
               role: 'assistant',
               content: "LaunchPact Systems Online. I am your Venture Architect. How can I help you execute today?"
            };
            setMessages([welcomeMsg]);
         }
      } catch (e) {
         console.error("Failed to load history", e);
      }
   };

   const saveMessageToHistory = (msg: ChatMessage) => {
      try {
         const currentHistory = JSON.parse(localStorage.getItem(FORGE_HISTORY_KEY) || '[]');
         const updatedHistory = [...currentHistory, msg];
         localStorage.setItem(FORGE_HISTORY_KEY, JSON.stringify(updatedHistory));
      } catch (e) {
         console.error("Failed to save message", e);
      }
   };

   const clearChatHistory = () => {
      try {
         localStorage.removeItem(FORGE_HISTORY_KEY);
         const welcomeMsg: ChatMessage = {
            role: 'assistant',
            content: "Memory cleared. Starting fresh strategy session."
         };
         setMessages([welcomeMsg]);
      } catch (e) {
         console.error("Failed to clear history", e);
      }
   };

   const handleSend = async (text: string) => {
      const messageToSend = text.trim();
      if (!messageToSend || isLoading) return;

      const userMsg: ChatMessage = { role: 'user', content: messageToSend };
      setMessages(prev => [...prev, userMsg]);
      setInput('');
      setIsLoading(true);
      saveMessageToHistory(userMsg);

      try {
         let systemContext = `Current App View: ${currentView}. `;
         if (blueprint) {
            systemContext += `
        ACTIVE PROJECT: "${blueprint.productName}"
        CONTEXT: ${JSON.stringify(blueprint)}
        `;
         }

         const contextMessages = messages.map(m => ({ role: m.role, text: m.content }));
         const response = await chatWithAssistant(contextMessages, messageToSend, systemContext);

         const aiMsg: ChatMessage = { role: 'assistant', content: response.text || 'Processing complete.' };
         setMessages(prev => [...prev, aiMsg]);
         saveMessageToHistory(aiMsg);
      } catch (error) {
         setMessages(prev => [...prev, { role: 'assistant', content: "Connection interrupted. Retrying..." }]);
      } finally {
         setIsLoading(false);
      }
   };

   // --- FULL PAGE RENDER ---
   if (isFullPage) {
      return (
         <div className="fixed inset-0 z-[100] bg-white flex animate-in fade-in duration-300 font-sans">
            {/* Sidebar */}
            <div className="w-72 bg-slate-50 border-r border-slate-200 flex flex-col hidden md:flex">
               <div className="p-6 border-b border-slate-200 flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                     <Bot size={18} />
                  </div>
                  <span className="font-black text-slate-900 tracking-tight">LaunchPact AI Chat</span>
               </div>

               <div className="p-4">
                  <button onClick={clearChatHistory} className="w-full flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 text-sm font-bold hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-sm">
                     <Plus size={16} /> New Session
                  </button>
               </div>

               <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 px-2">Recent Context</p>
                  {blueprint && (
                     <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-bold text-indigo-700 flex items-center gap-2">
                        <BrainCircuit size={14} />
                        {blueprint.productName}
                     </div>
                  )}
               </div>

               <div className="p-4 border-t border-slate-200">
                  <button onClick={onCloseFullPage} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm font-bold transition-colors">
                     <Minimize2 size={16} /> Exit Full Screen
                  </button>
               </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col h-full relative">
               {/* Top Bar (Mobile Close) */}
               <div className="md:hidden p-4 border-b border-slate-100 flex justify-between items-center">
                  <span className="font-black text-slate-900">LaunchPact AI Strategy</span>
                  <button onClick={onCloseFullPage}><X size={24} /></button>
               </div>

               {/* Messages */}
               <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-6 scrollbar-hide" ref={scrollRef}>
                  <div className="max-w-3xl mx-auto space-y-8 pb-20">
                     {messages.map((m, i) => (
                        <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                           {m.role === 'assistant' && (
                              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-2">
                                 <Sparkles size={14} />
                              </div>
                           )}
                           <div className={`
                        max-w-[80%] p-5 rounded-2xl text-sm leading-relaxed shadow-sm
                        ${m.role === 'user' ? 'bg-slate-900 text-white rounded-br-none' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'}
                     `}>
                              {m.content}
                           </div>
                        </div>
                     ))}
                     {isLoading && (
                        <div className="flex gap-4">
                           <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-2"><Sparkles size={14} /></div>
                           <div className="bg-white border border-slate-100 px-6 py-4 rounded-2xl rounded-tl-none shadow-sm flex gap-2 items-center">
                              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75"></span>
                              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></span>
                           </div>
                        </div>
                     )}
                  </div>
               </div>

               {/* Input Area */}
               <div className="p-6 border-t border-slate-100 bg-white">
                  <div className="max-w-3xl mx-auto relative">
                     <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="relative">
                        <input
                           type="text"
                           className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-6 pr-14 py-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                           placeholder={`Ask LaunchPact AI about ${blueprint?.productName || 'your startup'}...`}
                           value={input}
                           onChange={(e) => setInput(e.target.value)}
                           autoFocus
                        />
                        <button
                           type="submit"
                           disabled={!input.trim() || isLoading}
                           className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all"
                        >
                           <ArrowUp size={18} />
                        </button>
                     </form>
                     <div className="text-center mt-3">
                        <p className="text-[10px] text-slate-400 font-medium">LaunchPact AI can make mistakes. Verify critical business data.</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      );
   }

   // --- EMBEDDED RENDER ---
   if (isEmbedded) {
      return (
         <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden font-sans">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-100 flex items-center bg-slate-50">
               <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-white mr-2 shadow-sm">
                  <Bot size={14} />
               </div>
               <span className="font-bold text-slate-900 text-sm">Co-Founder Chat</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/50" ref={scrollRef}>
               {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                     <div className={`
                        max-w-[90%] px-3 py-2 text-xs font-medium leading-relaxed shadow-sm
                        ${m.role === 'user' ? 'bg-slate-900 text-white rounded-[1rem] rounded-br-sm' : 'bg-slate-100 text-slate-700 rounded-[1rem] rounded-tl-sm'}
                     `}>
                        {m.content}
                     </div>
                  </div>
               ))}
               {isLoading && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 pl-2">
                     <Sparkles size={12} className="text-indigo-500 animate-spin" /> Thinking...
                  </div>
               )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-100 bg-slate-50/50">
               <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="relative">
                  <input
                     className="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 focus:border-indigo-400 rounded-lg text-xs focus:outline-none transition-all shadow-sm"
                     placeholder="Type message..."
                     value={input}
                     onChange={(e) => setInput(e.target.value)}
                  />
                  <button type="submit" disabled={!input.trim()} className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-indigo-600">
                     <ArrowUp size={14} />
                  </button>
               </form>
            </div>
         </div>
      );
   }

   // --- WIDGET RENDER ---
   return (
      <div className={`fixed bottom-6 z-[90] font-sans flex flex-col items-end pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isShifted ? 'right-[420px]' : 'right-6 md:right-8'
         } md:bottom-8`}>
         <div className={`
         pointer-events-auto
         w-[360px] md:w-[400px] max-w-[90vw] bg-white rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden transition-all duration-300 ease-out
         ${isOpen ? 'opacity-100 translate-y-0 scale-100 mb-4' : 'opacity-0 translate-y-4 scale-95 h-0 mb-0 pointer-events-none'}
      `}
            style={{ maxHeight: 'min(600px, 80vh)' }}
         >
            {isOpen && (
               <div className="flex flex-col h-full" style={{ height: 'min(600px, 80vh)' }}>
                  {/* Widget Header */}
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white/95 backdrop-blur z-10 sticky top-0">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                           <Bot size={16} />
                        </div>
                        <div>
                           <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">LaunchPact AI Strategy</h3>
                           <p className="text-[9px] font-bold text-emerald-500 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Online
                           </p>
                        </div>
                     </div>
                     <div className="flex items-center gap-1">
                        {onExpand && (
                           <button onClick={onExpand} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Full Screen">
                              <Maximize2 size={16} />
                           </button>
                        )}
                        <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                           <X size={18} />
                        </button>
                     </div>
                  </div>

                  {/* Widget Chat Area */}
                  <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50 scrollbar-hide">
                     {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                           <div className={`
                        max-w-[85%] px-4 py-3 text-xs font-medium leading-relaxed shadow-sm
                        ${m.role === 'user' ? 'bg-slate-900 text-white rounded-[1.2rem] rounded-br-sm' : 'bg-white border border-slate-100 text-slate-700 rounded-[1.2rem] rounded-tl-sm'}
                     `}>
                              {m.content}
                           </div>
                        </div>
                     ))}
                     {isLoading && (
                        <div className="flex justify-start">
                           <div className="bg-white px-3 py-2 rounded-[1rem] rounded-tl-sm shadow-sm border border-slate-100 flex gap-1">
                              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-75"></span>
                              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150"></span>
                           </div>
                        </div>
                     )}
                  </div>

                  {/* Widget Input */}
                  <div className="p-3 bg-white border-t border-slate-100">
                     <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-2">
                        {FORGE_SUGGESTIONS.map((s, idx) => (
                           <button key={idx} onClick={() => handleSend(s.prompt)} className="whitespace-nowrap px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-500 hover:text-indigo-600 hover:border-indigo-100 transition-colors">
                              {s.label}
                           </button>
                        ))}
                     </div>
                     <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="relative">
                        <input
                           className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-transparent hover:border-slate-200 focus:border-indigo-500/30 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
                           placeholder="Type message..."
                           value={input}
                           onChange={(e) => setInput(e.target.value)}
                        />
                        <button type="submit" disabled={!input.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-slate-900 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50">
                           <ArrowUp size={14} />
                        </button>
                     </form>
                  </div>
               </div>
            )}
         </div>

         {!isOpen && (
            <button
               onClick={() => setIsOpen(true)}
               className="pointer-events-auto group flex items-center gap-4 pl-6 pr-2 py-2 bg-slate-900/90 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] rounded-full hover:scale-105 active:scale-95 transition-all duration-500"
            >
               <div className="flex flex-col items-start pr-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 leading-none mb-1">Foundry AI</span>
                  <span className="text-xs font-black uppercase tracking-widest text-white hidden md:block">
                     LaunchPact
                  </span>
               </div>
               <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg group-hover:bg-indigo-500 transition-all relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Sparkles size={20} className="relative z-10 group-hover:rotate-12 transition-transform" />
               </div>
            </button>
         )}
      </div>
   );
};

export default ForgeAssistant;
