import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Users, MessageCircle, ChevronRight } from 'lucide-react';

interface TeamChatItem {
    plan_id: string;
    product_name: string;
    role: string;
    member_count: number;
    last_message?: {
        content: string;
        sender_name: string;
        created_at: string;
    };
    unread_count: number;
}

interface TeamChatSidebarProps {
    selectedTeamId: string | null;
    onSelectTeam: (teamId: string) => void;
    className?: string;
}

const TeamChatSidebar: React.FC<TeamChatSidebarProps> = ({ selectedTeamId, onSelectTeam, className }) => {
    const [teams, setTeams] = useState<TeamChatItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        fetchUserTeams();

        const interval = setInterval(() => {
            fetchUserTeams();
        }, 5000); // Refresh every 5 seconds

        return () => clearInterval(interval);
    }, []);

    const fetchUserTeams = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            setCurrentUserId(user.id);

            // Fetch teams via API
            const response = await fetch(`/api/team/user-teams/${user.id}`);
            const data = await response.json();

            if (data.success) {
                // Fetch unread counts for each team
                const teamsWithUnread = await Promise.all(
                    data.teams.map(async (team: any) => {
                        const { data: unreadData } = await supabase.rpc('get_unread_count', {
                            p_plan_id: team.plan_id,
                            p_user_id: user.id
                        });

                        return {
                            ...team,
                            unread_count: unreadData || 0
                        };
                    })
                );

                setTeams(teamsWithUnread);
            }
        } catch (error) {
            console.error('Error fetching user teams:', error);
        } finally {
            setIsLoading(false);
        }
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

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    if (isLoading) {
        return (
            <div className={`bg-[#0b0f1a] border-r border-white/5 flex items-center justify-center ${className}`}>
                <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className={`bg-[#0b0f1a] border-r border-white/5 flex flex-col ${className}`}>
            {/* Header */}
            <div className="p-4 border-b border-white/5">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                        <MessageCircle size={20} className="text-indigo-400" />
                    </div>
                    <h2 className="text-lg font-black text-white uppercase italic tracking-tight">Team Chats</h2>
                </div>
                <p className="text-xs text-slate-500 font-medium">{teams.length} active teams</p>
            </div>

            {/* Team List */}
            <div className="flex-1 overflow-y-auto">
                {teams.length === 0 ? (
                    <div className="p-8 text-center">
                        <Users size={32} className="text-slate-600 mx-auto mb-3" />
                        <p className="text-sm text-slate-500 font-medium">No teams yet</p>
                        <p className="text-xs text-slate-600 mt-1">Join a team to start chatting</p>
                    </div>
                ) : (
                    <div className="space-y-1 p-2">
                        {teams.map((team) => (
                            <button
                                key={team.plan_id}
                                onClick={() => onSelectTeam(team.plan_id)}
                                className={`w-full p-3 rounded-xl text-left transition-all group ${selectedTeamId === team.plan_id
                                        ? 'bg-indigo-500/10 border border-indigo-500/30'
                                        : 'bg-white/[0.02] border border-transparent hover:bg-white/5 hover:border-white/10'
                                    }`}
                            >
                                {/* Team Header */}
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${selectedTeamId === team.plan_id
                                                ? 'bg-indigo-500 text-white'
                                                : 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white'
                                            }`}>
                                            {team.product_name?.[0] || 'T'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-bold text-white truncate">{team.product_name}</h3>
                                            <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${getRoleBadgeColor(team.role)}`}>
                                                {team.role.replace('-', ' ')}
                                            </div>
                                        </div>
                                    </div>
                                    {team.unread_count > 0 && (
                                        <div className="px-2 py-0.5 bg-indigo-500 text-white text-[10px] font-black rounded-full min-w-[20px] text-center">
                                            {team.unread_count > 99 ? '99+' : team.unread_count}
                                        </div>
                                    )}
                                </div>

                                {/* Last Message Preview */}
                                {team.last_message && (
                                    <div className="pl-12">
                                        <p className="text-xs text-slate-400 truncate font-medium">
                                            <span className="text-slate-500 font-bold">{team.last_message.sender_name}:</span>{' '}
                                            {team.last_message.content}
                                        </p>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-[10px] text-slate-600 font-bold">
                                                {formatTimestamp(team.last_message.created_at)}
                                            </span>
                                            <div className="flex items-center gap-1 text-slate-600">
                                                <Users size={10} />
                                                <span className="text-[9px] font-bold">{team.member_count}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeamChatSidebar;
