import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { ProductBlueprint, ExecutionTask, TimelineSimulation, TeamMember, TeamSetup } from '../types';
import {
    Clock, CheckCircle2, AlertTriangle, Users, Rocket, Lock,
    ArrowLeft, Calendar, ListChecks, ThumbsUp, BarChart2, MessageSquare, Sparkles
} from 'lucide-react';
import Confetti from 'react-confetti';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import TeamChat from './TeamChat';

const TeamReviewDashboard: React.FC = () => {
    const { planId } = useParams<{ planId: string }>();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [planData, setPlanData] = useState<{
        productName: string;
        blueprint: ProductBlueprint;
        executionPlan: ExecutionTask[];
        timeline: TimelineSimulation;
        teamSetup: TeamSetup;
    } | null>(null);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [hasApproved, setHasApproved] = useState(false);
    const [approvalRequired, setApprovalRequired] = useState(false);

    useEffect(() => {
        loadPlanData();
        checkUser();

        const interval = setInterval(loadTeamStatus, 5000);
        return () => clearInterval(interval);
    }, [planId]);

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
    };

    const loadPlanData = async () => {
        try {
            // Fetch plan
            const { data: plan, error } = await supabase
                .from('plans')
                .select('*')
                .eq('id', planId)
                .single();

            if (error) throw error;
            if (plan) {
                setPlanData({
                    productName: plan.product_name,
                    blueprint: plan.blueprint,
                    executionPlan: plan.execution_plan,
                    timeline: plan.timeline,
                    teamSetup: plan.team_setup
                });
            }

            loadTeamStatus();
        } catch (error) {
            console.error('Failed to load plan:', error);
            // Handle error (e.g., redirect or show message)
        } finally {
            setIsLoading(false);
        }
    };

    const loadTeamStatus = async () => {
        if (!planId) return;
        try {
            const response = await fetch(`/api/team/members/${planId}`);
            const data = await response.json();
            if (data.members) {
                // Map snake_case to camelCase
                const mappedMembers: TeamMember[] = data.members.map((m: any) => ({
                    id: m.id,
                    name: m.name,
                    email: m.email,
                    expertise: m.expertise,
                    role: m.role,
                    approvalRequired: m.approval_required,
                    hasApproved: m.has_approved,
                    approvedAt: m.approved_at,
                    invitedAt: m.invited_at,
                    joinedAt: m.joined_at
                }));

                setTeamMembers(mappedMembers);

                // key: update local user status
                if (currentUser) {
                    const me = mappedMembers.find((m: any) => m.email === currentUser.email);
                    if (me) {
                        setHasApproved(me.hasApproved);
                        setApprovalRequired(me.approvalRequired);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to load team status', error);
        }
    };

    const handleApprove = async () => {
        if (!currentUser) return;
        try {
            const response = await fetch(`/api/team/approve/${planId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userEmail: currentUser.email })
            });

            if (response.ok) {
                setHasApproved(true);
                loadTeamStatus(); // refresh list
            }
        } catch (error) {
            console.error('Approval failed:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!planData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-800">Plan Not Found</h1>
                    <button onClick={() => navigate('/dashboard')} className="mt-4 text-indigo-600 font-bold hover:underline">
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const handleAssignTask = async (index: number, assigneeId: string) => {
        if (!planData) return;
        const newPlan = [...planData.executionPlan];
        const assignee = teamMembers.find(m => m.id === assigneeId);

        newPlan[index] = {
            ...newPlan[index],
            assigneeId: assigneeId || undefined,
            assigneeName: assignee ? assignee.name : undefined
        };

        const { error } = await supabase
            .from('plans')
            .update({ execution_plan: newPlan })
            .eq('id', planId);

        if (!error) {
            setPlanData({ ...planData, executionPlan: newPlan });
        }
    };

    const handleAutoAssign = async () => {
        if (!planData || !teamMembers.length) return;

        const updatedPlan = planData.executionPlan.map(task => {
            if (task.assigneeId) return task; // Skip already assigned

            let roleToMatch: string[] = [];
            const phase = task.phase.toLowerCase();
            const desc = task.task.toLowerCase();

            if (phase.includes('development') || desc.includes('code') || desc.includes('api')) roleToMatch = ['developer', 'technical-lead'];
            else if (phase.includes('design') || desc.includes('ui') || desc.includes('ux')) roleToMatch = ['designer'];
            else if (phase.includes('marketing') || desc.includes('social') || desc.includes('content')) roleToMatch = ['marketer'];

            const match = teamMembers.find(m =>
                roleToMatch.includes(m.role) ||
                roleToMatch.some(r => m.expertise.toLowerCase().includes(r))
            );

            if (match) {
                return { ...task, assigneeId: match.id, assigneeName: match.name };
            }
            return task;
        });

        const { error } = await supabase
            .from('plans')
            .update({ execution_plan: updatedPlan })
            .eq('id', planId);

        if (!error) {
            setPlanData({ ...planData, executionPlan: updatedPlan });
        }
    };

    const { executionPlan, timeline, blueprint } = planData;

    const getWorkloadData = () => {
        const workload: Record<string, number> = {};
        const unassigned = 'Unassigned';
        workload[unassigned] = 0;

        teamMembers.forEach(m => workload[m.name] = 0);

        executionPlan.forEach(task => {
            const assignee = task.assigneeName || unassigned;
            // Parse estimate roughly (e.g. "2 days" -> 2, "1 week" -> 5)
            let hours = 0;
            const est = task.timeEstimate.toLowerCase();
            if (est.includes('day')) hours = parseInt(est) * 8;
            else if (est.includes('week')) hours = parseInt(est) * 40;
            else if (est.includes('hour')) hours = parseInt(est);
            else hours = 4; // default conservative

            workload[assignee] = (workload[assignee] || 0) + hours;
        });

        // Convert to array
        return Object.keys(workload).map(name => ({
            name,
            hours: workload[name],
            color: name === unassigned ? '#94a3b8' : '#4f46e5'
        })).filter(d => d.hours > 0);
    };

    return (
        <div className="min-h-full bg-transparent p-6 md:p-12">
            {/* Header / Sub-nav */}
            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/5">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                            <Rocket className="text-indigo-400" size={20} />
                        </div>
                        <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">
                            {planData.productName}
                        </h1>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">
                        <span>Internal Protocol: TEAM_REVIEW</span>
                        <span className="w-1 h-1 bg-slate-800 rounded-full" />
                        <span>COHORT ONE ACCESS</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {approvalRequired ? (
                        hasApproved ? (
                            <div className="flex items-center gap-3 px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl font-black text-xs uppercase tracking-widest italic shadow-2xl shadow-emerald-500/10">
                                <CheckCircle2 size={16} /> Signal Verified
                            </div>
                        ) : (
                            <button
                                onClick={handleApprove}
                                className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:shadow-2xl hover:shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                <ThumbsUp size={18} className="group-hover:rotate-12 transition-transform" />
                                Broadcast Approval
                            </button>
                        )
                    ) : (
                        <div className="px-6 py-3 bg-white/5 border border-white/5 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest italic">
                            Observer Access Only
                        </div>
                    )}
                </div>
            </div>

            <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Tabs/Sections */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Blueprint Summary */}
                    <section className="bg-[#0b0f1a]/50 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/5 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Sparkles size={120} className="text-white" />
                        </div>
                        <div className="relative">
                            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400 mb-6 flex items-center gap-3">
                                <span className="w-8 h-[1px] bg-indigo-500/50" />
                                CORE ARCHITECTURE
                            </h2>
                            <p className="text-xl font-bold text-slate-200 leading-relaxed italic mb-10">
                                "{blueprint.ideaSummary}"
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {blueprint.mvpFeatures.map((f, i) => (
                                    <div key={i} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-start gap-4 hover:border-indigo-500/30 transition-colors">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-black text-[10px]">
                                            0{i + 1}
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-white uppercase italic mb-1">{f.title}</p>
                                            <p className="text-[10px] text-slate-500 leading-relaxed">{f.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Timeline & Risk */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <section className="bg-[#0b0f1a]/50 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/5 shadow-2xl">
                            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-orange-400 mb-8 flex items-center gap-3">
                                <Calendar size={14} />
                                DEPLOYMENT WINDOW
                            </h2>
                            <div className="flex flex-col items-center justify-center py-4">
                                <span className="text-7xl font-black text-white italic tracking-tighter mb-2">
                                    {timeline.targetMonths}
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">Standard Months</span>
                            </div>
                        </section>

                        <section className="bg-[#0b0f1a]/50 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/5 shadow-2xl">
                            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-red-400 mb-8 flex items-center gap-3">
                                <AlertTriangle size={14} />
                                FRAGILITY RATING
                            </h2>
                            <div className="flex flex-col items-center justify-center py-4 text-center">
                                <span className={`text-5xl font-black italic tracking-tighter mb-4 ${timeline.riskFactor === 'High' ? 'text-red-500' :
                                        timeline.riskFactor === 'Medium' ? 'text-orange-400' : 'text-emerald-400'
                                    }`}>
                                    {timeline.riskFactor.toUpperCase()}
                                </span>
                                <div className="p-2 bg-white/5 rounded-lg border border-white/5 inline-block mx-auto">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-4">AI Variance: +/- 15%</p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Execution Plan */}
                    <section className="bg-[#0b0f1a]/50 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/5 shadow-2xl">
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400 flex items-center gap-3">
                                <ListChecks size={14} />
                                STRATEGIC PHASES
                            </h2>
                            <button
                                onClick={handleAutoAssign}
                                className="flex items-center gap-2 px-6 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500/20 transition-all"
                            >
                                <Sparkles size={12} /> Sync Assignments
                            </button>
                        </div>
                        <div className="space-y-4">
                            {executionPlan.map((task, i) => (
                                <div key={i} className="flex flex-col md:flex-row md:items-center gap-6 p-6 rounded-3xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] hover:border-white/10 transition-all group">
                                    <div className="flex items-center gap-6 flex-1">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-black italic group-hover:scale-110 transition-transform">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="text-[10px] font-black uppercase text-indigo-500 tracking-wider bg-indigo-500/5 px-2 py-0.5 rounded-md underline decoration-indigo-500/30 underline-offset-4">{task.phase}</span>
                                                <span className="text-[10px] font-bold text-slate-600">• {task.timeEstimate}</span>
                                            </div>
                                            <h4 className="font-black text-white italic text-lg leading-tight uppercase tracking-tight">{task.task}</h4>
                                        </div>
                                    </div>

                                    <div className="md:w-64">
                                        <select
                                            className="w-full text-[10px] font-black uppercase tracking-widest bg-[#06080f] border border-white/5 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-indigo-500/30 text-slate-400 appearance-none cursor-pointer"
                                            value={task.assigneeId || ''}
                                            onChange={(e) => handleAssignTask(i, e.target.value)}
                                        >
                                            <option value="">DELEGATE TASK</option>
                                            {teamMembers.map(m => (
                                                <option key={m.id} value={m.id}>{m.name.toUpperCase()}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Sidebar: Team & Stats */}
                <div className="space-y-8">
                    {/* Approvals Widget */}
                    <div className="bg-[#0b0f1a]/80 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-white/5 shadow-2xl">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400 mb-8 flex items-center gap-3">
                            <Users size={14} />
                            STAKEHOLDERS
                        </h3>

                        <div className="space-y-6">
                            {teamMembers.map((member, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black italic border transition-all duration-500 ${member.hasApproved
                                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/10'
                                                : 'bg-white/5 border-white/5 text-slate-600'
                                            }`}>
                                            {member.hasApproved ? <CheckCircle2 size={24} /> : member.name[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-black text-white uppercase italic tracking-tight">{member.name}</p>
                                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{member.role.replace('-', ' ')}</p>
                                        </div>
                                    </div>
                                    {member.approvalRequired && !member.hasApproved && (
                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-orange-500 bg-orange-500/5 px-2 py-1 rounded-md border border-orange-500/10">
                                            REQUIRED
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 pt-8 border-t border-white/5">
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest mb-4">
                                <span className="text-slate-600">CONSENSUS REACHED</span>
                                <span className="text-indigo-400">
                                    {Math.round((teamMembers.filter(m => m.hasApproved).length / teamMembers.length) * 100)}%
                                </span>
                            </div>
                            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                                <div
                                    className="bg-indigo-500 h-full rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                                    style={{ width: `${(teamMembers.filter(m => m.hasApproved).length / teamMembers.length) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Team Chat Widget */}
                    <div className="h-[600px] bg-[#0b0f1a]/80 backdrop-blur-2xl rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden">
                        <TeamChat
                            planId={planId!}
                            currentUserEmail={currentUser?.email || ''}
                            teamMembers={teamMembers}
                            className="h-full border-none shadow-none bg-transparent"
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TeamReviewDashboard;
