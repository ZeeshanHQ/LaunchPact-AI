
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Users, Mail, Clock, CheckCircle2, AlertCircle, RefreshCw, Send, Shield, ChevronLeft } from 'lucide-react';
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

const TeamPage: React.FC = () => {
    const navigate = useNavigate();
    const [teamMembers, setTeamMembers] = useState<TeamMemberDetail[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'accepted'>('all');

    useEffect(() => {
        fetchTeamData();
    }, []);

    const fetchTeamData = async () => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const response = await fetch(`/api/team/collective/${user.id}`);
            const data = await response.json();
            if (data.success) {
                setTeamMembers(data.members || []);
            }
        } catch (error) {
            console.error("Error fetching team:", error);
        } finally {
            setIsLoading(false);
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
                        onClick={fetchTeamData}
                        className="inline-flex items-center gap-3 bg-white/5 border border-white/5 text-indigo-400 hover:bg-white/10 hover:text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all group"
                    >
                        <RefreshCw size={18} className={`${isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
                        Sync Telemetry
                    </button>
                </div>

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
                        onClick={() => setFilter('pending')}
                        className={`group p-8 rounded-[3rem] border transition-all cursor-pointer relative overflow-hidden ${filter === 'pending' ? 'bg-amber-600 border-amber-500 text-white shadow-2xl shadow-amber-500/20' : 'bg-[#0b0f1a] border-white/5 hover:border-white/10'}`}
                    >
                        {filter === 'pending' && <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 blur-3xl rounded-full" />}
                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <Clock size={32} className={filter === 'pending' ? 'text-white' : 'text-amber-500'} />
                            <span className="text-4xl font-black italic tracking-tighter">{teamMembers.filter(m => !m.joined_at).length}</span>
                        </div>
                        <p className={`text-[10px] font-black uppercase tracking-widest relative z-10 ${filter === 'pending' ? 'opacity-80' : 'text-slate-600'}`}>Awaiting Uplink</p>
                    </div>
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
        </div>
    );
};

export default TeamPage;
