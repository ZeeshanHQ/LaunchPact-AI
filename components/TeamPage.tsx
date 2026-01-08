
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabase';
import { Users, Mail, Clock, CheckCircle2, AlertCircle, RefreshCw, Send, Shield, ChevronLeft, X, Tag, Rocket, ArrowRight, Activity, Target, Briefcase, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TeamMemberDetail {
    id: string;
    plan_id: string;
    name: string;
    email: string;
    role: string;
    expertise: string;
    has_approved: boolean;
    approval_required: boolean;
    invited_at: string;
    joined_at: string | null;
    invite_token: string;
    plans: {
        product_name: string;
    };
}

interface TeamPlan {
    id: string;
    product_name: string;
    blueprint: any;
    team_setup: any;
    status: string;
    created_at: string;
}

const TeamPage: React.FC = () => {
    const navigate = useNavigate();
    const [teamMembers, setTeamMembers] = useState<TeamMemberDetail[]>([]);
    const [teamProjects, setTeamProjects] = useState<TeamPlan[]>([]);
    const [activePlan, setActivePlan] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'accepted'>('all');
    const [showPendingModal, setShowPendingModal] = useState(false);
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        fetchTeamData();

        // Set up real-time polling (every 5 seconds)
        pollingIntervalRef.current = setInterval(() => {
            fetchTeamData(false); // false = don't show loading state
        }, 5000);

        // Cleanup on unmount
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, []);

    const fetchTeamData = async (showLoading: boolean = true) => {
        if (showLoading) setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch team members
            const response = await fetch(`/api/team/collective/${user.id}`);
            const data = await response.json();
            if (data.success) {
                setTeamMembers(data.members || []);
            }

            // Fetch team projects
            try {
                const plansRes = await fetch(`/api/plans/${user.id}`);
                const plansData = await plansRes.json();
                if (plansData.success) {
                    const projects = plansData.plans || [];
                    setTeamProjects(projects);
                    
                    // Set first active plan as active (or find locked one)
                    const lockedPlan = projects.find((p: TeamPlan) => p.status === 'locked');
                    if (lockedPlan) {
                        // Try to load active plan from localStorage
                        const savedPlan = localStorage.getItem(`forge_active_plan_${user.id}`);
                        if (savedPlan) {
                            try {
                                const parsed = JSON.parse(savedPlan);
                                if (parsed.id === lockedPlan.id) {
                                    setActivePlan(parsed);
                                }
                            } catch (e) {
                                console.error('Error parsing saved plan:', e);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching team projects:", error);
            }

            // Load active plan from localStorage
            try {
                const savedPlan = localStorage.getItem(`forge_active_plan_${user.id}`);
                if (savedPlan) {
                    const parsed = JSON.parse(savedPlan);
                    if (parsed.teamSetup?.setupType === 'team') {
                        setActivePlan(parsed);
                    }
                }
            } catch (error) {
                console.error("Error loading active plan:", error);
            }

        } catch (error) {
            console.error("Error fetching team:", error);
        } finally {
            if (showLoading) setIsLoading(false);
        }
    };

    const handleResendInvite = async (member: TeamMemberDetail) => {
        // Placeholder for resend logic - typically calls a backend endpoint
        alert(`Resending invitation to ${member.email}...`);
        // await fetch('/api/team/resend-invite', ...)
    };

    const filteredMembers = teamMembers.filter(m => {
        if (filter === 'all') return true;
        if (filter === 'pending') return !m.joined_at; // Assuming joined_at is set when they accept
        if (filter === 'accepted') return !!m.joined_at;
        return true;
    });

    return (
        <div className="flex-1 bg-[#06080f] text-slate-200 font-sans p-8 lg:p-12 animate-in fade-in duration-700">
            <div className="max-w-7xl mx-auto space-y-12">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg shadow-indigo-500/20">Operational Hub</span>
                            <span className="text-slate-600 text-[10px] font-black uppercase tracking-widest">Team Network • v2.0 Sync</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black uppercase italic text-white leading-none tracking-tightest">Collective</h1>
                        <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">Coordinate with specialized agents and human collaborators</p>
                    </div>

                    <button
                        onClick={() => fetchTeamData()}
                        className="inline-flex items-center gap-3 bg-white/5 border border-white/5 text-indigo-400 hover:bg-white/10 hover:text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all group"
                    >
                        <RefreshCw size={18} className={`${isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
                        Sync Telemetry
                    </button>
                </div>

                {/* Active Mission Section */}
                {activePlan && (
                    <div className="bg-gradient-to-br from-[#0f172a] to-[#1e1b4b] rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden group shadow-2xl">
                        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-600/10 blur-[100px] rounded-full group-hover:bg-indigo-600/20 transition-all duration-700" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="px-3 py-1 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-indigo-500/20">Active Mission</div>
                                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase tracking-widest">
                                    <Activity size={12} className="text-orange-500" /> Day {activePlan.currentDayNumber || 1}
                                </div>
                            </div>

                            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 italic uppercase tracking-tighter leading-none">{activePlan.blueprint?.productName || 'Active Project'}</h2>
                            <p className="text-slate-400 text-base max-w-xl mb-8 font-medium leading-relaxed">{activePlan.blueprint?.tagline || 'Team collaboration in progress'}</p>

                            <div className="flex flex-wrap gap-4 items-center">
                                <button
                                    onClick={() => navigate('/daily-tasks')}
                                    className="px-8 py-4 bg-white text-[#0f172a] rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-white/5 active:scale-95 flex items-center gap-2"
                                >
                                    Enter Bridge <ArrowRight size={18} />
                                </button>
                                <div className="flex items-center gap-2 px-4 py-4 rounded-2xl bg-white/5 border border-white/5">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest whitespace-nowrap">
                                        {Math.round(activePlan.currentProgress || 0)}% Synced
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Team Projects Section */}
                {teamProjects.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-sm font-black text-white uppercase italic tracking-widest flex items-center gap-3">
                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                                Team Ventures <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-slate-400">Cloud Sync</span>
                            </h3>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{teamProjects.length} Active</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {teamProjects.map((project) => (
                                <div
                                    key={project.id}
                                    onClick={() => navigate(`/planner/${project.id}`)}
                                    className="bg-[#0b0f1a] p-6 rounded-[2rem] border border-white/5 hover:border-indigo-500/30 hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-bl-[3rem] -mr-4 -mt-4 transition-transform group-hover:scale-150" />

                                    <div className="flex justify-between items-start mb-6 relative z-10">
                                        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-inner border border-white/5">
                                            <Briefcase size={22} />
                                        </div>
                                        <div className={`px-2.5 py-1 border rounded-lg text-[8px] font-black uppercase tracking-widest ${
                                            project.status === 'locked' 
                                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                                : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                        }`}>
                                            {project.status === 'locked' ? 'Locked' : 'Draft'}
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-black text-white mb-1 italic uppercase tracking-tighter group-hover:text-indigo-400 transition-colors line-clamp-1 relative z-10">{project.product_name}</h3>
                                    <p className="text-slate-500 text-[11px] font-medium leading-relaxed mb-6 line-clamp-2 relative z-10">{project.blueprint?.tagline || 'Team project'}</p>

                                    <div className="pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
                                        <div className="flex items-center gap-2">
                                            <Users size={12} className="text-indigo-500" />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                                                {project.team_setup?.members?.length || 0} Members
                                            </span>
                                        </div>
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-700 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all">
                                            <ArrowRight size={18} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Status Architecture */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div
                        onClick={() => setFilter('all')}
                        className={`group p-8 rounded-[3rem] border transition-all cursor-pointer relative overflow-hidden ${filter === 'all' ? 'bg-indigo-600 border-indigo-500 text-white shadow-2xl shadow-indigo-600/20' : 'bg-[#0b0f1a] border-white/5 hover:border-white/10'}`}
                    >
                        {filter === 'all' && <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 blur-3xl rounded-full" />}
                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <Users size={32} className={filter === 'all' ? 'text-white' : 'text-slate-400'} />
                            <span className="text-4xl font-black italic tracking-tighter">{teamMembers.length}</span>
                        </div>
                        <p className={`text-[10px] font-black uppercase tracking-widest relative z-10 ${filter === 'all' ? 'opacity-80' : 'text-slate-600'}`}>Total Protocol Count</p>
                    </div>

                    <div
                        onClick={() => setFilter('accepted')}
                        className={`group p-8 rounded-[3rem] border transition-all cursor-pointer relative overflow-hidden ${filter === 'accepted' ? 'bg-emerald-600 border-emerald-500 text-white shadow-2xl shadow-emerald-500/20' : 'bg-[#0b0f1a] border-white/5 hover:border-white/10'}`}
                    >
                        {filter === 'accepted' && <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 blur-3xl rounded-full" />}
                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <CheckCircle2 size={32} className={filter === 'accepted' ? 'text-white' : 'text-emerald-500'} />
                            <span className="text-4xl font-black italic tracking-tighter">{teamMembers.filter(m => m.joined_at).length}</span>
                        </div>
                        <p className={`text-[10px] font-black uppercase tracking-widest relative z-10 ${filter === 'accepted' ? 'opacity-80' : 'text-slate-600'}`}>Active Personnel</p>
                    </div>

                    <div
                        onClick={() => {
                            const pendingCount = teamMembers.filter(m => !m.joined_at).length;
                            if (pendingCount > 0) {
                                setShowPendingModal(true);
                            }
                            setFilter('pending');
                        }}
                        className={`group p-8 rounded-[3rem] border transition-all cursor-pointer relative overflow-hidden ${filter === 'pending' ? 'bg-amber-600 border-amber-500 text-white shadow-2xl shadow-amber-500/20' : 'bg-[#0b0f1a] border-white/5 hover:border-white/10'}`}
                    >
                        {filter === 'pending' && <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 blur-3xl rounded-full" />}
                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <Clock size={32} className={filter === 'pending' ? 'text-white' : 'text-amber-500'} />
                            <span className="text-4xl font-black italic tracking-tighter">{teamMembers.filter(m => !m.joined_at).length}</span>
                        </div>
                        <p className={`text-[10px] font-black uppercase tracking-widest relative z-10 ${filter === 'pending' ? 'opacity-80' : 'text-slate-600'}`}>Awaiting Uplink</p>
                        {teamMembers.filter(m => !m.joined_at).length > 0 && (
                            <p className={`text-[8px] font-medium uppercase tracking-widest relative z-10 mt-2 ${filter === 'pending' ? 'opacity-70' : 'text-slate-700'}`}>
                                Click to view details
                            </p>
                        )}
                    </div>
                </div>

                {/* Team Members Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-sm font-black text-white uppercase italic tracking-widest flex items-center gap-3">
                            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                            Personnel Network
                        </h3>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{teamMembers.length} Total</span>
                    </div>

                    {/* Team Spreadsheet */}
                    <div className="bg-[#0b0f1a] rounded-[3.5rem] border border-white/5 shadow-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.01]">
                                    <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Personnel / ID</th>
                                    <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Mandate</th>
                                    <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Specialization</th>
                                    <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Status</th>
                                    <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 text-right">Ops</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="p-24 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <RefreshCw size={32} className="text-indigo-500 animate-spin" />
                                                <span className="text-xs font-black uppercase tracking-widest text-slate-600 italic">Decrypting Personnel File...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredMembers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-24 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <Users size={32} className="text-slate-800" />
                                                <span className="text-xs font-black uppercase tracking-widest text-slate-700 italic">No Signal Detected in this Sector</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredMembers.map((member) => (
                                        <tr key={member.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="p-8">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-14 h-14 rounded-2xl bg-[#06080f] border border-white/5 flex items-center justify-center font-black text-white italic text-xl shadow-inner group-hover:border-indigo-500/50 transition-colors">
                                                        {member.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-white text-lg uppercase italic tracking-tighter">{member.name}</p>
                                                        <p className="text-xs font-medium text-slate-500 flex items-center gap-2 mt-1">
                                                            <Mail size={12} className="text-slate-700" /> {member.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-8">
                                                <span className="font-black text-slate-400 text-xs uppercase tracking-widest">{member.plans?.product_name || 'Classified Venture'}</span>
                                            </td>
                                            <td className="p-8">
                                                <div className="flex flex-col items-start gap-2">
                                                    <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest text-indigo-400">
                                                        {member.role}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{member.expertise}</span>
                                                </div>
                                            </td>
                                            <td className="p-8">
                                                {member.joined_at ? (
                                                    <span className="inline-flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Linked
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-2 text-amber-500 text-[10px] font-black uppercase tracking-widest bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/20">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Awaiting Sync
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-8 text-right">
                                                {!member.joined_at && (
                                                    <button
                                                        onClick={() => handleResendInvite(member)}
                                                        className="inline-flex items-center gap-3 bg-white text-slate-950 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all opacity-0 group-hover:opacity-100 shadow-xl"
                                                    >
                                                        <Send size={14} /> Re-Transmit
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    </div>
                </div>

                {/* Pending Invites Modal */}
                {showPendingModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowPendingModal(false)}>
                        <div className="bg-[#0b0f1a] rounded-[3rem] border border-white/10 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-8 border-b border-white/5">
                                <div>
                                    <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">Awaiting Uplink</h2>
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">
                                        {teamMembers.filter(m => !m.joined_at).length} Pending Invitation{teamMembers.filter(m => !m.joined_at).length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowPendingModal(false)}
                                    className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-y-auto p-8">
                                <div className="space-y-4">
                                    {teamMembers.filter(m => !m.joined_at).length === 0 ? (
                                        <div className="text-center py-12">
                                            <Clock size={48} className="text-slate-800 mx-auto mb-4" />
                                            <p className="text-sm font-black uppercase tracking-widest text-slate-700 italic">No Pending Invitations</p>
                                        </div>
                                    ) : (
                                        teamMembers.filter(m => !m.joined_at).map((member) => (
                                            <div key={member.id} className="bg-[#06080f] rounded-2xl border border-white/5 p-6 hover:border-white/10 transition-all">
                                                <div className="flex items-start justify-between gap-6">
                                                    <div className="flex items-start gap-4 flex-1">
                                                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-black text-white italic text-lg">
                                                            {member.name.charAt(0)}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <p className="font-black text-white text-lg uppercase italic tracking-tighter">{member.name}</p>
                                                                <span className="px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest text-indigo-400">
                                                                    {member.role}
                                                                </span>
                                                                {member.approval_required && (
                                                                    <span className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1">
                                                                        <Shield size={10} /> Approval Required
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <Mail size={14} className="text-slate-600" />
                                                                <p className="text-sm font-medium text-slate-400">{member.email}</p>
                                                            </div>
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <Tag size={14} className="text-slate-600" />
                                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{member.expertise}</p>
                                                            </div>
                                                            <div className="flex items-center gap-4 mt-4">
                                                                <span className="text-[9px] font-medium text-slate-600 uppercase tracking-widest">
                                                                    Project: <span className="text-indigo-400 font-bold">{member.plans?.product_name || 'Classified Venture'}</span>
                                                                </span>
                                                                <span className="text-[9px] font-medium text-slate-600 uppercase tracking-widest">
                                                                    Invited: <span className="text-slate-400">{new Date(member.invited_at).toLocaleDateString()}</span>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <button
                                                            onClick={() => handleResendInvite(member)}
                                                            className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                                                        >
                                                            <Send size={12} /> Re-Transmit
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeamPage;
