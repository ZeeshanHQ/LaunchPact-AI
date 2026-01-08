
import React, { useState, useEffect, useRef } from 'react';
import { DailyTask, LockedPlan, MilestoneBadge, UserStats, ChatMessage, SubTask } from '../types';
import { TOOLS_DATABASE, MILESTONE_BADGES } from '../constants/tools';
import { chatWithAssistant } from '../services/geminiService';
import { useNotification } from './NotificationProvider';
import {
    CheckCircle2, Clock, Flame, Trophy, Zap, ExternalLink,
    ChevronRight, Star, Award, Crown, Target, Sparkles,
    MessageSquare, Calendar, TrendingUp, ChevronDown,
    Send, Loader2, Info, ArrowLeft, CheckSquare, Square, Rocket, Lock, RefreshCw
} from 'lucide-react';

interface DailyTaskEngineProps {
    plan: LockedPlan;
    userStats: UserStats;
    onUpdateXP: (amount: number) => void;
    onSidebarToggle?: (isOpen: boolean) => void;
}

const DailyTaskEngine: React.FC<DailyTaskEngineProps> = ({
    plan,
    userStats,
    onUpdateXP,
    onSidebarToggle
}) => {
    const { notify } = useNotification();
    const [selectedDay, setSelectedDay] = useState(1);
    const [unlockedBadges, setUnlockedBadges] = useState<MilestoneBadge[]>([]);
    const [showCelebration, setShowCelebration] = useState(false);
    const [localPlan, setLocalPlan] = useState<LockedPlan>(plan);
    const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'daily' | 'master'>('daily');

    // AI Guidance State
    const [activeGuidanceTask, setActiveGuidanceTask] = useState<DailyTask | null>(null);

    // Sync sidebar state to parent
    useEffect(() => {
        onSidebarToggle?.(!!activeGuidanceTask);
    }, [activeGuidanceTask, onSidebarToggle]);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // 1. Selection Logic: Default to the first incomplete day on load
    useEffect(() => {
        if (isInitialLoad) {
            const firstIncompleteTask = localPlan.dailyTasks.find(t => !t.isCompleted);
            if (firstIncompleteTask) {
                setSelectedDay(firstIncompleteTask.dayNumber);
            }
            setIsInitialLoad(false);
        }
    }, [isInitialLoad, localPlan.dailyTasks]);

    const todaysTasks = localPlan.dailyTasks.filter(t => t.dayNumber === selectedDay);
    const completedToday = todaysTasks.filter(t => t.isCompleted).length;
    const progressToday = todaysTasks.length > 0 ? (completedToday / todaysTasks.length) * 100 : 0;

    // Scroll chat to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, isTyping]);

    // Overall progress calculation
    const overallProgress = localPlan.currentProgress;

    // Badge logic
    const availableBadges = MILESTONE_BADGES.filter(b =>
        b.requiredProgress <= overallProgress &&
        !unlockedBadges.find(ub => ub.id === b.id)
    );

    // 2. Progression Lock Logic
    const isDayLocked = (day: number) => {
        if (day <= 1) return false;
        // Find tasks for all previous days
        const previousTasks = localPlan.dailyTasks.filter(t => t.dayNumber < day);
        if (previousTasks.length === 0) return true; // If no previous tasks exist (empty preceding flow), lock it
        return !previousTasks.every(t => t.isCompleted);
    };

    useEffect(() => {
        if (availableBadges.length > 0) {
            setUnlockedBadges(prev => {
                const existingIds = new Set(prev.map(b => b.id));
                const uniqueNewBadges = availableBadges.filter(b => !existingIds.has(b.id));

                if (uniqueNewBadges.length === 0) return prev;

                // ONLY show celebration if we already had some badges (not initial load)
                // OR if we are explicitly earnign them after mount.
                // Using badgesInitialized ref to track this.
                if (badgesInitialized.current) {
                    setShowCelebration(true);
                    setTimeout(() => setShowCelebration(false), 3000);
                }

                return [...prev, ...uniqueNewBadges];
            });
        }
    }, [overallProgress, availableBadges]);

    // Separate effect for notifications to avoid warning
    const badgesInitialized = useRef(false);

    useEffect(() => {
        // Mark as initialized once we've had a chance to load existing badges
        if (!badgesInitialized.current) {
            // Give it a tiny bit of time to sync the initial availableBadges
            const timer = setTimeout(() => {
                badgesInitialized.current = true;
            }, 500);
            return () => clearTimeout(timer);
        }

        const lastUnlocked = unlockedBadges[unlockedBadges.length - 1];
        if (lastUnlocked) {
            notify('Badge Unlocked!', lastUnlocked.title, 'achievement');
        }
    }, [unlockedBadges.length, notify]);

    // === Handlers ===

    const handleTaskToggle = (taskId: string) => {
        const updatedTasks = localPlan.dailyTasks.map(t => {
            if (t.id === taskId) {
                const isNowCompleted = !t.isCompleted;
                if (isNowCompleted) {
                    onUpdateXP(t.xpReward);
                    notify('Task Mastered!', `+${t.xpReward} XP: ${t.title}`, 'success');
                }
                // Also toggle all subtasks if completed
                const updatedSubTasks = t.subTasks?.map(st => ({ ...st, isCompleted: isNowCompleted })) || [];
                return { ...t, isCompleted: isNowCompleted, subTasks: updatedSubTasks };
            }
            return t;
        });

        savePlanUpdate(updatedTasks);
    };

    const handleSubTaskToggle = (taskId: string, subTaskId: string) => {
        const updatedTasks = localPlan.dailyTasks.map(t => {
            if (t.id === taskId) {
                const updatedSubTasks = t.subTasks?.map(st => {
                    if (st.id === subTaskId) {
                        const nextState = !st.isCompleted;
                        if (nextState) notify('Step Complete', st.title, 'info');
                        return { ...st, isCompleted: nextState };
                    }
                    return st;
                }) || [];

                // If all subtasks are complete, maybe auto-complete the main task?
                // For now, keep them independent but interactive
                return { ...t, subTasks: updatedSubTasks };
            }
            return t;
        });

        savePlanUpdate(updatedTasks);
    };

    const savePlanUpdate = (updatedTasks: DailyTask[]) => {
        if (!Array.isArray(updatedTasks)) {
            console.error('Invalid tasks array passed to savePlanUpdate:', updatedTasks);
            return;
        }
        const completedCount = updatedTasks.filter(t => t.isCompleted).length;
        const totalCount = updatedTasks.length || 1;
        const newProgress = (completedCount / totalCount) * 100;

        const updatedPlan = {
            ...localPlan,
            dailyTasks: updatedTasks,
            completedTasksCount: completedCount,
            currentProgress: newProgress
        };

        setLocalPlan(updatedPlan);
        localStorage.setItem('forge_active_plan', JSON.stringify(updatedPlan));
    };

    const startGuidance = (task?: DailyTask) => {
        if (task) {
            setActiveGuidanceTask(task);
            setChatHistory([
                { role: 'assistant', content: `Hey Founder! Let's tackle **${task.title}**. This is critical for our **${task.phase}** phase. \n\n${task.aiGuidancePrompt || "I'm ready to guide you. What's the first hurdle?"}` }
            ]);
        } else {
            // General guidance for the day
            setActiveGuidanceTask(todaysTasks[0] || null);
            setChatHistory([
                { role: 'assistant', content: `Founder, we're on Day ${selectedDay}. Our focus is **${todaysTasks[0]?.phase || 'Preparation'}**. We have ${todaysTasks.filter(t => !t.isCompleted).length} tasks remaining. Where do you want to start?` }
            ]);
        }
    };

    const handleSendMessage = async () => {
        if (!userInput.trim() || !activeGuidanceTask) return;

        const userMsg: ChatMessage = { role: 'user', content: userInput };
        setChatHistory(prev => [...prev, userMsg]);
        setUserInput('');
        setIsTyping(true);

        try {
            const context = `
                I am the user's Co-Founder & Mentor. I know everything about their product:
                Product: ${localPlan.blueprint.productName}
                Tagline: ${localPlan.blueprint.tagline}
                USP: ${localPlan.blueprint.usp}
                Mission Context: Day ${selectedDay} of a ${localPlan.timeline.targetMonths} month plan.
                Current Task: ${activeGuidanceTask.title}
                Task Goal: ${activeGuidanceTask.description}
                Specific Guidance: ${activeGuidanceTask.aiGuidancePrompt}

                User is currently working on this task. I should be motivational, expert-level, and remember that I am their internal Co-Founder. I must help them specifically with the sub-tasks or any confusion they have.
            `;
            const response = await chatWithAssistant(chatHistory, userInput, context, true);
            setChatHistory(prev => [...prev, { role: 'assistant', content: response.text }]);
        } catch (error) {
            setChatHistory(prev => [...prev, { role: 'assistant', content: "Sorry, I hit a snag. Can we try again?" }]);
        } finally {
            setIsTyping(false);
        }
    };

    const daysElapsed = Math.floor(
        (new Date().getTime() - new Date(localPlan.startDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    return (
        <div className="flex flex-col flex-1 bg-[#06080f] text-slate-200">

            {/* Celebration Overlay */}
            {showCelebration && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-500">
                    <div className="bg-[#0b0f1a] p-12 rounded-[4rem] shadow-2xl text-center animate-in zoom-in-95 max-w-md border border-white/10">
                        <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce shadow-xl shadow-indigo-500/20">
                            <Trophy size={48} className="text-white" />
                        </div>
                        <h3 className="text-4xl font-black uppercase italic text-white mb-2 tracking-tighter">Level Up!</h3>
                        <p className="text-indigo-400 font-bold text-xl mb-4">{availableBadges[availableBadges.length - 1]?.title}</p>
                        <p className="text-slate-400 text-sm">{availableBadges[availableBadges.length - 1]?.description}</p>
                    </div>
                </div>
            )}

            <div className={`flex-1 flex transition-all duration-500 ${activeGuidanceTask ? 'xl:pr-[400px]' : ''}`}>

                {/* Main Content Area */}
                <div className="flex-1 max-w-5xl mx-auto w-full p-8 lg:p-12">

                    {/* Header: Sequential & Pro */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-12">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg shadow-indigo-500/20">Mission Control</span>
                                <span className="text-slate-600 text-[10px] font-black uppercase tracking-widest">Active Link • Day {selectedDay}</span>
                            </div>
                            <h1 className="text-6xl md:text-8xl font-black uppercase italic text-white leading-none tracking-tightest">
                                {viewMode === 'daily' ? `Day ${selectedDay}` : 'Roster'}
                            </h1>

                            <div className="flex items-center gap-2 p-1.5 bg-white/5 border border-white/5 rounded-2xl w-fit backdrop-blur-sm">
                                <button
                                    onClick={() => setViewMode('daily')}
                                    className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${viewMode === 'daily' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-white'}`}
                                >
                                    Daily Operative
                                </button>
                                <button
                                    onClick={() => setViewMode('master')}
                                    className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${viewMode === 'master' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-white'}`}
                                >
                                    High-Level
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="bg-white/5 border border-white/5 p-6 rounded-[2.5rem] flex items-center gap-4 group hover:bg-white/10 transition-all">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${completedToday > 0 ? 'bg-orange-500/20 text-orange-500' : 'bg-slate-900 text-slate-600'}`}>
                                    <Flame size={24} fill={completedToday > 0 ? "currentColor" : "none"} />
                                </div>
                                <div className="pr-4">
                                    <div className="text-2xl font-black text-white italic">{userStats.loginStreak}</div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Streak</div>
                                </div>
                            </div>
                            <div className="bg-white/5 border border-white/5 p-6 rounded-[2.5rem] flex items-center gap-4 group hover:bg-white/10 transition-all">
                                <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400">
                                    <Zap size={24} fill="currentColor" />
                                </div>
                                <div className="pr-4">
                                    <div className="text-2xl font-black text-white italic">{userStats.xp}</div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">XP</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                        {/* LEFT: Stats & Progression */}
                        <div className="lg:col-span-4 space-y-8">

                            {/* Progress Card */}
                            <div className="bg-[#0b0f1a] p-8 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/5 blur-3xl rounded-full group-hover:scale-150 transition-all duration-700" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-8 flex items-center gap-2">
                                    <Target size={14} className="text-indigo-400" />
                                    Launch Sync
                                </h3>

                                <div className="relative w-40 h-40 mx-auto mb-8">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="80" cy="80" r="70" stroke="rgba(255,255,255,0.03)" strokeWidth="12" fill="none" />
                                        <circle
                                            cx="80" cy="80" r="70" stroke="url(#dashGrad)" strokeWidth="12" fill="none"
                                            strokeDasharray={`${2 * Math.PI * 70}`}
                                            strokeDashoffset={`${2 * Math.PI * 70 * (1 - overallProgress / 100)}`}
                                            strokeLinecap="round"
                                            className="transition-all duration-1000"
                                        />
                                        <defs>
                                            <linearGradient id="dashGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#6366f1" />
                                                <stop offset="100%" stopColor="#a855f7" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-4xl font-black text-white italic tracking-tighter">{Math.round(overallProgress)}%</span>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-1">Status</span>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-white/5">
                                    <div className="flex justify-between items-center text-indigo-400 font-black">
                                        <span className="text-[10px] uppercase tracking-widest">Phase</span>
                                        <span className="text-[10px] uppercase italic">{todaysTasks[0]?.phase || 'Prep'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Score</span>
                                        <span className="text-xs font-black text-white italic">{Math.round(overallProgress)} / 100</span>
                                    </div>
                                </div>
                            </div>

                            {/* Achievement Plate */}
                            <div className="bg-[#0b0f1a] p-8 rounded-[3rem] border border-white/5">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-6 flex items-center gap-2">
                                    <Award size={14} className="text-yellow-500" />
                                    Foundry Badges
                                </h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {unlockedBadges.slice(-9).map((b, idx) => (
                                        <div key={idx} className="aspect-square bg-white/5 rounded-2xl flex items-center justify-center text-2xl hover:bg-white/10 hover:scale-110 transition-all cursor-help border border-white/5" title={`${b.title}: ${b.description}`}>
                                            {b.icon}
                                        </div>
                                    ))}
                                    {unlockedBadges.length === 0 && <div className="col-span-3 py-10 text-center text-slate-700 font-black uppercase text-[10px] tracking-widest italic opacity-40">No Signal Detected</div>}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Daily Deck */}
                        <div className="lg:col-span-8 space-y-8">

                            {/* Timeline Slider */}
                            <div className="flex items-center gap-3 overflow-x-auto pb-6 -mx-2 px-2 scrollbar-hide">
                                {Array.from({ length: 30 }, (_, i) => i + 1).map(day => {
                                    const isActive = selectedDay === day;
                                    const isLocked = isDayLocked(day);
                                    const isPast = day < selectedDay && !isLocked;

                                    return (
                                        <button
                                            key={day}
                                            disabled={isLocked}
                                            onClick={() => setSelectedDay(day)}
                                            className={`shrink-0 w-24 px-4 py-8 rounded-[2.5rem] border transition-all flex flex-col items-center gap-2 ${isActive
                                                ? 'bg-indigo-500 border-indigo-400 text-white shadow-2xl shadow-indigo-500/20 -translate-y-2'
                                                : isLocked
                                                    ? 'bg-white/5 border-white/5 text-slate-800 opacity-30 cursor-not-allowed'
                                                    : 'bg-[#0b0f1a] border-white/5 text-slate-500 hover:border-white/10 hover:text-white'
                                                }`}
                                        >
                                            <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Day</span>
                                            <span className="text-3xl font-black italic">
                                                {isLocked ? <Lock size={18} /> : day}
                                            </span>
                                            {isPast && !isActive && <CheckCircle2 size={12} className="text-emerald-500" />}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Daily Operations */}
                            {viewMode === 'daily' ? (
                                <div className="space-y-6">
                                    {todaysTasks.length > 0 && (
                                        <div className="bg-gradient-to-br from-[#0f172a] to-[#1e1b4b] text-white p-10 rounded-[3.5rem] border border-white/5 relative overflow-hidden group mb-10 shadow-2xl">
                                            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform"><Sparkles size={120} /></div>
                                            <div className="relative z-10 space-y-6">
                                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                                                    Mentor Briefing Required
                                                </div>
                                                <h4 className="text-3xl font-black italic uppercase tracking-tighter">Strategic Deck: Day {selectedDay}</h4>
                                                <p className="text-slate-400 font-medium leading-relaxed max-w-2xl text-lg">
                                                    Current protocol: <span className="text-indigo-400 font-black">{todaysTasks[0]?.phase}</span>.
                                                    Execute {todaysTasks.length} surgical manoeuvres to advance the mandate.
                                                </p>
                                                <button
                                                    onClick={() => startGuidance()}
                                                    className="inline-flex items-center gap-3 bg-white text-slate-950 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-white/5 active:scale-95"
                                                >
                                                    <Sparkles size={18} /> Initiate Pro Guidance
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-6">
                                        {todaysTasks.length === 0 ? (
                                            <div className="bg-[#0b0f1a] p-24 rounded-[4rem] text-center border-2 border-dashed border-white/5 hover:border-indigo-500/20 transition-all group">
                                                <RefreshCw size={48} className="text-slate-800 mx-auto mb-6 group-hover:text-indigo-400 group-hover:rotate-180 transition-all duration-700" />
                                                <p className="text-slate-600 font-black uppercase tracking-widest text-xs italic">Operational gap detected • Sync mission telemetry</p>
                                            </div>
                                        ) : (
                                            todaysTasks.map(task => (
                                                <div key={task.id} className={`bg-[#0b0f1a] rounded-[3.5rem] border transition-all duration-700 overflow-hidden ${task.isCompleted ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-white/5 hover:border-white/10 shadow-2xl shadow-indigo-500/5'}`}>
                                                    <div className="p-10 flex gap-8">
                                                        <button
                                                            onClick={() => handleTaskToggle(task.id)}
                                                            className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all shrink-0 ${task.isCompleted ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-950 border-white/10 text-slate-700 hover:border-indigo-500'}`}
                                                        >
                                                            {task.isCompleted ? <CheckCircle2 size={32} /> : <div className="w-2 h-2 rounded-full bg-slate-700 group-hover:bg-indigo-500" />}
                                                        </button>

                                                        <div className="flex-1 space-y-6">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-4">
                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-lg">{task.phase}</span>
                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 flex items-center gap-1.5"><Clock size={12} /> {task.estimatedTime}</span>
                                                                </div>
                                                                <div className="text-[10px] font-black uppercase tracking-widest text-orange-500">+{task.xpReward} XP</div>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <h3 className={`text-3xl font-black text-white italic uppercase tracking-tight ${task.isCompleted ? 'line-through opacity-30 shadow-none' : ''}`}>{task.title}</h3>
                                                                <p className="text-slate-500 font-medium leading-relaxed text-sm">{task.description}</p>
                                                            </div>

                                                            {task.subTasks && task.subTasks.length > 0 && (
                                                                <div className="bg-slate-950/40 rounded-[2.5rem] p-8 space-y-4 border border-white/5">
                                                                    <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-700 mb-6">Execution Steps</h4>
                                                                    {task.subTasks.map(st => (
                                                                        <button
                                                                            key={st.id}
                                                                            onClick={() => handleSubTaskToggle(task.id, st.id)}
                                                                            className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white/5 transition-all text-left"
                                                                        >
                                                                            {st.isCompleted ? <CheckCircle2 size={18} className="text-emerald-500" /> : <div className="w-4 h-4 rounded-md border-2 border-slate-800" />}
                                                                            <span className={`text-xs font-bold ${st.isCompleted ? 'text-slate-600 line-through' : 'text-slate-400'}`}>{st.title}</span>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            <div className="flex gap-4 pt-4">
                                                                <button
                                                                    onClick={() => startGuidance(task)}
                                                                    className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all shadow-xl"
                                                                >
                                                                    Consult Mentor
                                                                </button>
                                                                <button
                                                                    onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                                                                    className="px-6 py-3 bg-white/5 border border-white/10 text-slate-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all"
                                                                >
                                                                    Intelligence {expandedTaskId === task.id ? '[-]' : '[+]'}
                                                                </button>
                                                            </div>

                                                            {expandedTaskId === task.id && (
                                                                <div className="pt-8 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-top-4">
                                                                    <div className="space-y-4">
                                                                        <h5 className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Toolkit</h5>
                                                                        {task.recommendedTools?.map((tool, i) => (
                                                                            <a key={i} href={tool.url} target="_blank" className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-indigo-500/30 transition-all">
                                                                                <div className="flex items-center gap-3">
                                                                                    <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center font-black text-indigo-400 text-xs">{tool.name[0]}</div>
                                                                                    <span className="text-xs font-black text-white">{tool.name}</span>
                                                                                </div>
                                                                                <ExternalLink size={14} className="text-slate-700" />
                                                                            </a>
                                                                        ))}
                                                                    </div>
                                                                    <div className="space-y-4">
                                                                        <h5 className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Resources</h5>
                                                                        {task.resources?.map((res, i) => (
                                                                            <a key={i} href={res.url} target="_blank" className="flex items-center gap-3 text-xs font-bold text-slate-500 hover:text-white transition-all p-2">
                                                                                <Info size={14} /> {res.name}
                                                                            </a>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6 pb-20">
                                    {Array.from({ length: 30 }).map((_, i) => {
                                        const dayNum = i + 1;
                                        const dayTasks = localPlan.dailyTasks.filter(t => t.dayNumber === dayNum);
                                        const isLocked = isDayLocked(dayNum);
                                        const isCompleted = dayTasks.length > 0 && dayTasks.every(t => t.isCompleted);

                                        return (
                                            <div key={dayNum} className={`p-8 rounded-[3rem] border transition-all ${isLocked ? 'bg-white/5 border-white/5 opacity-30 grayscale' : isCompleted ? 'bg-emerald-500/5 border-emerald-500/20 shadow-2xl shadow-emerald-500/5' : 'bg-[#0b0f1a] border-white/5 hover:border-white/10'}`}>
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                    <div className="flex items-center gap-6">
                                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black italic text-xl ${isLocked ? 'bg-slate-900 text-slate-800' : isCompleted ? 'bg-emerald-500 text-white' : 'bg-white text-slate-950'}`}>
                                                            {isLocked ? <Lock size={20} /> : dayNum}
                                                        </div>
                                                        <div>
                                                            <h4 className="text-xl font-black text-white uppercase italic tracking-tighter">Day {dayNum} Milestone</h4>
                                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                                                                {dayTasks.length} Ops • {isLocked ? 'Encrypted' : isCompleted ? 'Archive Success' : 'Live Channel'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {!isLocked && (
                                                        <div className="flex gap-2">
                                                            {dayTasks.map((t, tid) => (
                                                                <div key={tid} className={`w-8 h-8 rounded-lg border flex items-center justify-center ${t.isCompleted ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-500' : 'bg-white/5 border-white/10 text-slate-700'}`}>
                                                                    <Zap size={14} fill={t.isCompleted ? "currentColor" : "none"} />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* AI Guidance Sidebar (The Hand-Holder) */}
                <div className={`fixed top-0 right-0 bottom-0 w-full sm:w-[500px] bg-[#0b0f1a] border-l border-white/5 shadow-2xl transition-transform duration-700 z-[100] flex flex-col ${activeGuidanceTask ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="p-8 border-b border-white/5 flex items-center justify-between bg-slate-950/50 backdrop-blur-xl">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-600/30 relative">
                                <Sparkles size={24} className="text-white" />
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-[#0b0f1a] rounded-full animate-pulse"></div>
                            </div>
                            <div>
                                <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white italic">Co-Founder Admin</h4>
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Task Logic Engine</p>
                            </div>
                        </div>
                        <button onClick={() => setActiveGuidanceTask(null)} className="p-3 hover:bg-white/5 rounded-2xl transition-all text-slate-500 hover:text-white">
                            <ArrowLeft size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#0b0f1a] custom-scrollbar">
                        {chatHistory.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[90%] p-6 rounded-[2.5rem] text-sm leading-relaxed shadow-xl ${msg.role === 'user'
                                    ? 'bg-indigo-600 text-white rounded-tr-sm'
                                    : 'bg-white/5 text-slate-300 border border-white/5 rounded-tl-sm backdrop-blur-sm'
                                    }`}>
                                    {msg.content.split('\n').map((line, j) => (
                                        <p key={j} className={j > 0 ? 'mt-4' : ''}>{line}</p>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white/5 border border-white/5 p-6 rounded-[2.5rem] rounded-tl-sm">
                                    <Loader2 size={24} className="animate-spin text-indigo-400" />
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <div className="p-8 border-t border-white/5 bg-slate-950/50 backdrop-blur-xl">
                        <div className="relative group">
                            <input
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Consult on mission logic..."
                                className="w-full pl-8 pr-16 py-5 bg-[#0b0f1a] border border-white/5 focus:border-indigo-500/50 rounded-2xl text-sm font-bold text-white outline-none transition-all placeholder:text-slate-700 shadow-inner"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={isTyping || !userInput.trim()}
                                className="absolute right-2 top-2 w-12 h-12 bg-white text-slate-950 rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-20 shadow-xl"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                        <p className="text-[10px] font-black text-slate-600 uppercase text-center mt-6 tracking-widest opacity-40 italic">LaunchPact Intelligence Protocol Active</p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DailyTaskEngine;
