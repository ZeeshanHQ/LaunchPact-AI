import React, { useState, useRef, useEffect } from 'react';
import { ExecutionTask, ChatMessage } from '../types';
import { chatWithAssistant } from '../services/geminiService';
import { Send, X, Bot, User, Sparkles, RefreshCw, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ExecutionChatProps {
    currentPlan: ExecutionTask[];
    productName: string;
    onUpdatePlan: (newPlan: ExecutionTask[]) => void;
    onClose: () => void;
}

const ExecutionChat: React.FC<ExecutionChatProps> = ({ currentPlan, productName, onUpdatePlan, onClose }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'assistant', content: `Hi! I can help you refine your execution plan for **${productName}**. You can ask me to add tasks, remove steps, or adjust timelines. What would you like to change?` }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: ChatMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            // Prepare context
            const planContext = JSON.stringify(currentPlan.map(t => ({ phase: t.phase, task: t.task, time: t.timeEstimate })));

            const systemPrompt = `
                You are a specialized Project Manager AI helping to refine an execution plan for a product called "${productName}".
                
                CURRENT PLAN:
                ${planContext}

                USER REQUEST: "${input}"

                INSTRUCTIONS:
                1. Discuss the changes conversationally first.
                2. If the user wants to modify the plan (add/remove/edit tasks), you MUST return a valid JSON object in a SPECIFIC FORMAT inside your response.
                3. The JSON object should have a key "updatedPlan" containing the FULL updated array of tasks.
                4. Each task object must have: phase, task, timeEstimate, outcome (infer if missing).
                5. Do NOT change IDs of existing tasks if possible, but you can generate new IDs for new tasks.
                
                RESPONSE FORMAT:
                Your normal conversational response here...
                
                \`\`\`json
                {
                    "updatedPlan": [
                        { "phase": "...", "task": "...", "timeEstimate": "...", "outcome": "..." },
                        ...
                    ]
                }
                \`\`\`
                
                If no changes are needed, just reply conversationally.
                Keep responses concise and helpful.
            `;

            const response = await chatWithAssistant([...messages, userMsg], systemPrompt);

            // Parse for JSON updates
            const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
            let content = response;

            if (jsonMatch) {
                try {
                    const jsonStr = jsonMatch[1];
                    const data = JSON.parse(jsonStr);

                    if (data.updatedPlan && Array.isArray(data.updatedPlan)) {
                        // Map updates to preserve structure
                        const updatedPlan: ExecutionTask[] = data.updatedPlan.map((t: any, i: number) => ({
                            id: t.id || currentPlan[i]?.id || Math.random().toString(36).substr(2, 9),
                            phase: t.phase || 'General',
                            task: t.task || 'New Task',
                            timeEstimate: t.timeEstimate || '1 day',
                            outcome: t.outcome || 'Task completed',
                            isCompleted: false
                        }));

                        onUpdatePlan(updatedPlan);
                        content = response.replace(/```json[\s\S]*?```/, '').trim();
                        // Add a little system notice
                        content += `\n\n✅ *I've updated the plan accordingly.*`;
                    }
                } catch (e) {
                    console.error("Failed to parse plan updates", e);
                }
            }

            setMessages(prev => [...prev, { role: 'assistant', content }]);

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I had trouble processing that request." }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed inset-y-0 left-0 w-96 bg-white shadow-2xl border-r border-slate-100 flex flex-col z-50 animate-in slide-in-from-left duration-300">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <div className="flex items-center gap-2">
                    <Bot size={20} />
                    <h3 className="font-bold">Plan Assistant</h3>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                    <X size={18} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-purple-100 text-purple-600'
                            }`}>
                            {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                        </div>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user'
                            ? 'bg-indigo-600 text-white rounded-tr-none'
                            : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'
                            }`}>
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                            <RefreshCw size={14} className="animate-spin" />
                        </div>
                        <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef}></div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-100 bg-white">
                <div className="flex gap-2 relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask to change tasks or timelines..."
                        className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isTyping}
                        className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                        {isTyping ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    </button>
                </div>
                <p className="text-[10px] text-center text-slate-400 mt-2">
                    AI can modify your plan directly. Try "Add a marketing step"
                </p>
            </div>
        </div>
    );
};

export default ExecutionChat;
