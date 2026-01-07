import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import TeamChatSidebar from './TeamChatSidebar';
import TeamChatWindow from './TeamChatWindow';
import TeamMembersList from './TeamMembersList';
import { TeamMember } from '../types';
import { ArrowLeft, Users, X } from 'lucide-react';

const TeamChatHub: React.FC = () => {
    const { planId: urlPlanId } = useParams<{ planId?: string }>();
    const navigate = useNavigate();
    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(urlPlanId || null);
    const [selectedTeamName, setSelectedTeamName] = useState<string>('');
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
    const [showMembersList, setShowMembersList] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Check if mobile
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
            if (window.innerWidth < 1024) {
                setShowMembersList(false);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (urlPlanId) {
            setSelectedTeamId(urlPlanId);
        }
    }, [urlPlanId]);

    useEffect(() => {
        const fetchUserEmail = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setCurrentUserEmail(user.email || '');
            }
        };
        fetchUserEmail();
    }, []);

    useEffect(() => {
        if (selectedTeamId) {
            fetchTeamDetails();
        }
    }, [selectedTeamId]);

    const fetchTeamDetails = async () => {
        try {
            // Fetch team/plan details
            const { data: planData, error: planError } = await supabase
                .from('plans')
                .select('product_name, created_by, created_by_name')
                .eq('id', selectedTeamId)
                .single();

            if (planError) throw planError;

            setSelectedTeamName(planData?.product_name || 'Team Chat');

            // Fetch team members
            const { data: membersData, error: membersError } = await supabase
                .from('team_members')
                .select('*')
                .eq('plan_id', selectedTeamId);

            if (membersError) throw membersError;

            const allMembers: TeamMember[] = membersData || [];

            // Add creator if not in members
            if (planData && !allMembers.find(m => m.user_id === planData.created_by)) {
                allMembers.unshift({
                    id: planData.created_by,
                    name: planData.created_by_name || 'Creator',
                    email: '',
                    expertise: 'Founder',
                    role: 'founder',
                    approvalRequired: true,
                    hasApproved: true,
                    invitedAt: new Date().toISOString(),
                    user_id: planData.created_by
                } as any);
            }

            setTeamMembers(allMembers);
        } catch (error) {
            console.error('Error fetching team details:', error);
        }
    };

    const handleSelectTeam = (teamId: string) => {
        setSelectedTeamId(teamId);
        navigate(`/team-chat/${teamId}`);
    };

    return (
        <div className="h-screen bg-[#06080f] flex flex-col">
            {/* Top Navigation Bar */}
            <div className="h-16 bg-[#0b0f1a] border-b border-white/5 flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-lg font-black text-white uppercase italic tracking-tight">Team Communications</h1>
                </div>

                {selectedTeamId && !isMobile && (
                    <button
                        onClick={() => setShowMembersList(!showMembersList)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                    >
                        <Users size={18} />
                        <span className="text-sm font-bold">{showMembersList ? 'Hide' : 'Show'} Members</span>
                    </button>
                )}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar - Team List */}
                {(!isMobile || !selectedTeamId) && (
                    <TeamChatSidebar
                        selectedTeamId={selectedTeamId}
                        onSelectTeam={handleSelectTeam}
                        className="w-80 shrink-0"
                    />
                )}

                {/* Main Chat Window */}
                {selectedTeamId ? (
                    <>
                        <TeamChatWindow
                            planId={selectedTeamId}
                            teamName={selectedTeamName}
                            currentUserEmail={currentUserEmail}
                            teamMembers={teamMembers}
                            className="flex-1"
                        />

                        {/* Members List Panel */}
                        {showMembersList && !isMobile && (
                            <TeamMembersList
                                planId={selectedTeamId}
                                className="w-80 shrink-0"
                            />
                        )}
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-[#06080f]">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Users size={40} className="text-slate-600" />
                            </div>
                            <h2 className="text-2xl font-black text-white mb-2 uppercase italic">Select a Team</h2>
                            <p className="text-slate-500 text-sm font-medium">Choose a team from the sidebar to start chatting</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Members Panel Overlay */}
            {isMobile && selectedTeamId && showMembersList && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
                    <div className="bg-[#0b0f1a] w-full max-h-[80vh] rounded-t-3xl overflow-hidden">
                        <div className="p-4 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-lg font-black text-white">Team Members</h3>
                            <button
                                onClick={() => setShowMembersList(false)}
                                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="overflow-y-auto max-h-[calc(80vh-60px)]">
                            <TeamMembersList planId={selectedTeamId} className="w-full" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamChatHub;
