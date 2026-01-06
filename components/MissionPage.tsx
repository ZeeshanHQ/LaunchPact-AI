
import React, { useState, useEffect } from 'react';
import { LockedPlan, UserStats } from '../types';
import DailyTaskEngine from './DailyTaskEngine';
import { Rocket, Shield, Target, Zap } from 'lucide-react';

interface MissionPageProps {
    plan: LockedPlan | null;
    userStats: UserStats;
    onUpdateXP: (amount: number) => void;
}

const MissionPage: React.FC<MissionPageProps> = ({ plan, userStats, onUpdateXP }) => {
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

    return (
        <div className="min-h-screen bg-[#06080f]">
            {/* Mission Hero */}
            <div className="relative pt-12 pb-20 px-8 max-w-7xl mx-auto overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full -z-10" />

                <div className="flex flex-col md:flex-row justify-between items-end gap-12 relative z-10">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                            <Shield size={12} /> Mission Critical
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black text-white leading-none tracking-tightest uppercase italic">
                            Mission<br />
                            <span className="text-indigo-500">Control.</span>
                        </h1>
                        <p className="text-slate-400 font-bold text-xl flex items-center gap-3">
                            <Target size={24} className="text-indigo-500" />
                            {plan.blueprint.productName}
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-white/5 border border-white/10 p-6 rounded-[2.5rem] backdrop-blur-xl">
                            <div className="flex items-center gap-3 mb-2">
                                <Zap size={18} className="text-yellow-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Launch Velocity</span>
                            </div>
                            <div className="text-3xl font-black text-white italic">{Math.round(plan.currentProgress)}%</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Injected DailyTaskEngine */}
            <div className="bg-[#0b0f1a] rounded-t-[4rem] min-h-screen shadow-2xl mt-12 border-t border-white/5">
                <DailyTaskEngine
                    plan={plan}
                    userStats={userStats}
                    onUpdateXP={onUpdateXP}
                />
            </div>
        </div>
    );
};

export default MissionPage;
