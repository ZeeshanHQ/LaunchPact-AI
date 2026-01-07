import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { User, Crown, Shield, Zap, Circle } from 'lucide-react';
import { TeamMember } from '../types';

interface TeamMembersListProps {
    planId: string;
    className?: string;
}

const TeamMembersList: React.FC<TeamMembersListProps> = ({ planId, className }) => {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        fetchTeamMembers();
    }, [planId]);

    const fetchTeamMembers = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            setCurrentUserId(user.id);

            // Fetch team members
            const { data, error } = await supabase
                .from('team_members')
                .select('*')
                .eq('plan_id', planId);

            if (error) throw error;

            // Also fetch the plan creator
            const { data: planData } = await supabase
                .from('plans')
                .select('created_by, created_by_name')
                .eq('id', planId)
                .single();

            const mappedMembers: TeamMember[] = (data || []).map(m => ({
                id: m.id,
                user_id: m.user_id,
                name: m.name,
                email: m.email,
                expertise: m.expertise,
                role: m.role,
                approvalRequired: m.approval_required,
                hasApproved: m.has_approved,
                approvedAt: m.approved_at,
                invitedAt: m.invited_at
            }));

            const allMembers: TeamMember[] = mappedMembers;

            // Add creator if not already in members
            if (planData && !allMembers.find(m => m.user_id === planData.created_by)) {
                allMembers.unshift({
                    id: planData.created_by,
                    name: planData.created_by_name || 'Creator',
                    email: '',
                    expertise: 'Founder & Architect',
                    role: 'founder',
                    approvalRequired: true,
                    hasApproved: true,
                    invitedAt: new Date().toISOString(),
                    user_id: planData.created_by
                });
            }

            setMembers(allMembers);
        } catch (error) {
            console.error('Error fetching team members:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getRoleIcon = (role: string) => {
        const icons: Record<string, any> = {
            'founder': Crown,
            'co-founder': Shield,
            'technical-lead': Zap,
            'designer': User,
            'developer': User,
            'marketer': User,
            'advisor': User,
            'team-member': User
        };
        const Icon = icons[role] || User;
        return <Icon size={14} />;
    };

    const getRoleBadgeColor = (role: string) => {
        const colors: Record<string, string> = {
            'founder': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            'co-founder': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
            'technical-lead': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            'designer': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
            'developer': 'bg-green-500/10 text-green-400 border-green-500/20',
            'marketer': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
            'advisor': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
            'team-member': 'bg-slate-500/10 text-slate-400 border-slate-500/20'
        };
        return colors[role] || colors['team-member'];
    };

    if (isLoading) {
        return (
            <div className={`bg-[#0b0f1a] border-l border-white/5 flex items-center justify-center ${className}`}>
                <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className={`bg-[#0b0f1a] border-l border-white/5 flex flex-col ${className}`}>
            {/* Header */}
            <div className="p-4 border-b border-white/5">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <User size={16} className="text-indigo-400" />
                    Team Members
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">{members.length} members</p>
            </div>

            {/* Members List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {members.map((member) => {
                    const isCurrentUser = member.user_id === currentUserId || member.email === currentUserId;

                    return (
                        <div
                            key={member.id}
                            className={`p-3 rounded-xl border transition-all ${isCurrentUser
                                ? 'bg-indigo-500/5 border-indigo-500/20'
                                : 'bg-white/[0.02] border-white/5 hover:bg-white/5'
                                }`}
                        >
                            {/* Member Header */}
                            <div className="flex items-start gap-3 mb-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 shadow-lg ${isCurrentUser
                                    ? 'bg-indigo-500 text-white'
                                    : 'bg-gradient-to-br from-[#1a1f2e] to-[#0b0f1a] text-slate-400 border border-white/5'
                                    }`}>
                                    {member.name?.[0] || member.email?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-[11px] font-black text-white truncate uppercase tracking-tight">
                                            {member.name || 'Anonymous User'}
                                        </h4>
                                        {isCurrentUser && (
                                            <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">You</span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-bold truncate uppercase tracking-widest mt-0.5">{member.expertise || 'Specialist'}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                {/* Role Badge */}
                                <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${getRoleBadgeColor(member.role)}`}>
                                    {getRoleIcon(member.role)}
                                    {member.role.replace('-', ' ')}
                                </div>

                                {/* Join Status */}
                                {member.user_id ? (
                                    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md text-[9px] font-black uppercase tracking-widest">
                                        <Circle size={8} className="fill-emerald-500" />
                                        Linked
                                    </div>
                                ) : (
                                    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md text-[9px] font-black uppercase tracking-widest">
                                        <Circle size={8} className="animate-pulse" />
                                        Invited
                                    </div>
                                )}
                            </div>

                            {/* Approval Status */}
                            {member.approvalRequired && (
                                <div className="mt-3 pt-3 border-t border-white/5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Decision Status</span>
                                        <div className="flex items-center gap-1.5">
                                            <span className={`text-[9px] font-black uppercase tracking-widest ${member.hasApproved ? 'text-emerald-400' : 'text-amber-400'
                                                }`}>
                                                {member.hasApproved ? 'Verified' : 'Awaiting Review'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div className={`h-full transition-all duration-1000 ${member.hasApproved ? 'w-full bg-emerald-500' : 'w-1/3 bg-amber-500'}`} />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TeamMembersList;
