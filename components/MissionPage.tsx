import React from 'react';
import { LockedPlan, UserStats } from '../types';
import { Rocket, Shield, Target, Zap, ArrowRight } from 'lucide-react';

interface MissionPageProps {
    plan: LockedPlan | null;
    userStats: UserStats;
}

const MissionPage: React.FC<MissionPageProps> = ({ plan, userStats }) => {
    if (!plan) {
        return (
            <div className="min-h-screen bg-[#06080f] flex flex-col items-center justify-center p-8">
                <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center text-slate-500 mb-8 animate-pulse">
                    <Rocket size={40} />
                </div>
                <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4 text-center">No Active Mission</h1>
                <p className="text-slate-500 text-center max-w-sm font-medium leading-relaxed">
                    You haven't locked a mission yet. Head to the generator or builder to architect your first venture.
                </p>
                <button
                    onClick={() => window.location.href = '/'}
                    className="mt-8 px-8 py-4 bg-white text-slate-950 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-105 transition-all"
                >
                    Initiate Protocol
                </button>
            </div>
        );
    }

    const phases = [
        { id: 'prep', name: 'Phase 1: Preparation', duration: 'Month 1', status: plan.currentProgress > 30 ? 'completed' : 'active' },
        { id: 'build', name: 'Phase 2: Core Engineering', duration: 'Month 2-3', status: plan.currentProgress > 60 ? 'completed' : plan.currentProgress > 30 ? 'active' : 'pending' },
        { id: 'launch', name: 'Phase 3: Market Entry', duration: 'Month 4', status: plan.currentProgress >= 100 ? 'completed' : plan.currentProgress > 60 ? 'active' : 'pending' },
    ];

    return (
        <div className="min-h-screen bg-[#06080f] p-8 md:p-12 xl:p-20 overflow-y-auto">
            <div className="max-w-6xl mx-auto space-y-16 pb-32">
                {/* Header */}
                <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                        <Shield size={12} /> Live Mission Telemetry
                    </div>
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12">
                        <div className="space-y-4">
                            <h1 className="text-6xl md:text-8xl font-black text-white leading-none tracking-tightest uppercase italic">
                                Active<br />
                                <span className="text-indigo-500">Mission.</span>
                            </h1>
                            <div className="flex items-center gap-3 text-slate-400 font-bold text-2xl uppercase italic tracking-tighter">
                                <Target size={28} className="text-indigo-500" />
                                {plan.blueprint.productName}
                            </div>
                        </div>

                        <div className="flex gap-6">
                            <div className="bg-white/5 border border-white/5 p-8 rounded-[3rem] text-center min-w-[200px] backdrop-blur-xl group hover:border-indigo-500/30 transition-all">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-4 flex items-center justify-center gap-2">
                                    <Zap size={14} className="text-yellow-400" /> Synchronization
                                </p>
                                <div className="text-5xl font-black text-white italic tracking-tighter">{Math.round(plan.currentProgress)}%</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Timeline Visualization */}
                <div className="bg-[#0b0f1a] border border-white/5 rounded-[4rem] p-12 space-y-12">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-white uppercase italic tracking-widest">Mission Roadmap</h3>
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Operational Sequence</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-[2.5rem] left-0 right-0 h-px bg-white/5 -z-10" />

                        {phases.map((phase) => (
                            <div key={phase.id} className="relative space-y-6 group">
                                <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-xl transition-all duration-500 border ${phase.status === 'completed'
                                    ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                                    : phase.status === 'active'
                                        ? 'bg-indigo-500 text-white shadow-2xl shadow-indigo-500/30 border-indigo-400 scale-110'
                                        : 'bg-white/5 border-white/10 text-slate-700'
                                    }`}>
                                    {phase.status === 'completed' ? <Zap fill="currentColor" /> : <Rocket size={24} />}
                                </div>

                                <div className="space-y-1">
                                    <h4 className={`text-xl font-black uppercase italic tracking-tight transition-colors ${phase.status === 'pending' ? 'text-slate-700' : 'text-white'}`}>
                                        {phase.name}
                                    </h4>
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{phase.duration} • {phase.status}</p>
                                </div>

                                {phase.status === 'active' && phase.id === 'prep' && (
                                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5 animate-in slide-in-from-bottom-4">
                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Priority Task</p>
                                        <p className="text-xs text-slate-400 leading-relaxed font-medium capitalize">
                                            Execute {plan.dailyTasks.find(t => !t.isCompleted)?.title || 'Next Protocol'} to advance synchronization.
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Detailed Briefing */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="bg-[#0b0f1a] border border-white/5 rounded-[3rem] p-10 space-y-6">
                        <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em]">Strategic Core</h3>
                        <p className="text-xl font-medium text-slate-300 leading-relaxed italic">
                            "{plan.blueprint.usp}"
                        </p>
                        <div className="pt-6 border-t border-white/5 flex gap-4">
                            <span className="px-3 py-1 rounded-lg bg-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest">Venture: {plan.blueprint.productName}</span>
                            <span className="px-3 py-1 rounded-lg bg-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest">Day: {plan.currentDayNumber}</span>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[3rem] p-10 flex flex-col justify-between group cursor-pointer transition-all hover:scale-[1.02] active:scale-95" onClick={() => window.location.href = '/daily-tasks'}>
                        <div className="space-y-2">
                            <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Enter Daily Operations</h3>
                            <p className="text-indigo-100 text-sm font-medium opacity-80 uppercase tracking-widest">Execute Day {plan.currentDayNumber} Protocol</p>
                        </div>
                        <div className="flex justify-end">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white group-hover:bg-white group-hover:text-indigo-600 transition-all">
                                <ArrowRight size={32} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MissionPage;
