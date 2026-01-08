
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Users, CheckCircle2, AlertTriangle, ArrowRight, Loader2, X, Clock, Mail } from 'lucide-react';

const TeamInvitePage: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'ready' | 'processing' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying invitation...');
    const [inviteData, setInviteData] = useState<any>(null);
    const [actionType, setActionType] = useState<'accept' | 'ignore' | 'later' | null>(null);

    useEffect(() => {
        if (token) {
            fetchInviteDetails();
        }
    }, [token]);

    // Check for pending invite token after login
    useEffect(() => {
        const pendingToken = localStorage.getItem('pending_invite_token');
        if (pendingToken && token && pendingToken === token) {
            localStorage.removeItem('pending_invite_token');
            fetchInviteDetails();
        }
    }, []);

    const fetchInviteDetails = async () => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid invitation link.');
            return;
        }

        // 1. Check Auth
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            localStorage.setItem('pending_invite_token', token);
            navigate('/login?redirect=/team-invite/' + token);
            return;
        }

        try {
            // 2. Fetch Invite Details (without accepting)
            const response = await fetch(`/api/team/invite/${token}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch invitation');
            }

            // Check if already accepted
            if (data.member?.joined_at) {
                setStatus('success');
                setMessage('You have already accepted this invitation!');
                setInviteData(data.member);
                return;
            }

            setInviteData(data.member);
            setStatus('ready');
            setMessage('');

        } catch (error: any) {
            console.error('Invite error:', error);
            setStatus('error');
            setMessage(error.message || 'An unexpected error occurred.');
        }
    };

    const handleAction = async (action: 'accept' | 'ignore' | 'later') => {
        if (!token || !inviteData) return;

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            navigate('/login');
            return;
        }

        setActionType(action);
        setStatus('processing');

        try {
            const user = session.user;
            let endpoint = '';
            let successMessage = '';

            switch (action) {
                case 'accept':
                    endpoint = `/api/team/accept-invite/${token}`;
                    successMessage = 'Invitation accepted successfully!';
                    break;
                case 'ignore':
                    endpoint = `/api/team/ignore-invite/${token}`;
                    successMessage = 'Invitation ignored.';
                    break;
                case 'later':
                    endpoint = `/api/team/accept-later/${token}`;
                    successMessage = 'Invitation saved for later!';
                    break;
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: user.id,
                    userEmail: user.email
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `Failed to ${action} invitation`);
            }

            setStatus('success');
            setMessage(successMessage);

            // Clear any pending token
            localStorage.removeItem('pending_invite_token');

            // Redirect based on action
            if (action === 'accept') {
                // Redirect to team dashboard after 1 second
                setTimeout(() => {
                    navigate('/team');
                }, 1000);
            } else if (action === 'ignore') {
                // Redirect to dashboard after 1.5 seconds
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1500);
            } else {
                // Accept later - redirect to dashboard
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1500);
            }

        } catch (error: any) {
            console.error('Action error:', error);
            setStatus('error');
            setMessage(error.message || `Failed to ${action} invitation`);
            setActionType(null);
        }
    };

    const handleContinue = () => {
        if (actionType === 'accept') {
            navigate('/team');
        } else {
            navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-[#06080f] flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-[#0b0f1a] rounded-[3rem] border border-white/5 shadow-2xl p-8 md:p-12">
                {status === 'loading' && (
                    <div className="py-12 text-center">
                        <Loader2 size={48} className="text-indigo-500 animate-spin mx-auto mb-6" />
                        <h2 className="text-2xl font-black text-white mb-2 uppercase italic">Verifying Invitation</h2>
                        <p className="text-slate-500 font-medium">Please wait while we secure your access...</p>
                    </div>
                )}

                {status === 'ready' && inviteData && (
                    <div className="space-y-8">
                        {/* Header */}
                        <div className="text-center space-y-4 pb-8 border-b border-white/5">
                            <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                                <Users size={40} className="text-white" />
                            </div>
                            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Team Invitation</h1>
                            <p className="text-slate-400 font-medium">You've been invited to collaborate on a project</p>
                        </div>

                        {/* Invitation Details */}
                        <div className="bg-[#06080f] rounded-2xl border border-white/5 p-8 space-y-6">
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2">Project Name</h3>
                                <p className="text-2xl font-black text-white uppercase italic">{inviteData.plans?.product_name || 'Classified Venture'}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2">Your Role</h3>
                                    <div className="flex items-center gap-3">
                                        <span className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-sm font-black uppercase tracking-widest text-indigo-400">
                                            {inviteData.role?.replace('-', ' ') || 'Team Member'}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2">Specialization</h3>
                                    <p className="text-sm font-bold text-slate-300 uppercase">{inviteData.expertise || 'General'}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2">Invited By</h3>
                                <div className="flex items-center gap-3">
                                    <Mail size={16} className="text-slate-600" />
                                    <p className="text-sm font-medium text-slate-400">{inviteData.email}</p>
                                </div>
                            </div>

                            {inviteData.approval_required && (
                                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                                    <p className="text-xs font-black uppercase tracking-widest text-amber-400">
                                        ⚠️ Your Approval Required
                                    </p>
                                    <p className="text-sm text-slate-400 mt-2">This plan cannot be locked until you review and approve it.</p>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-4">
                            <button
                                onClick={() => handleAction('accept')}
                                className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/20"
                            >
                                <CheckCircle2 size={20} /> Accept Invitation
                            </button>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => handleAction('later')}
                                    className="py-4 bg-white/5 border border-white/10 text-slate-300 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                                >
                                    <Clock size={16} /> Accept Later
                                </button>

                                <button
                                    onClick={() => handleAction('ignore')}
                                    className="py-4 bg-white/5 border border-white/10 text-slate-400 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white/10 hover:text-slate-300 transition-all flex items-center justify-center gap-2"
                                >
                                    <X size={16} /> Ignore
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {status === 'processing' && (
                    <div className="py-12 text-center">
                        <Loader2 size={48} className="text-indigo-500 animate-spin mx-auto mb-6" />
                        <h2 className="text-xl font-black text-white mb-2 uppercase italic">
                            {actionType === 'accept' && 'Accepting Invitation...'}
                            {actionType === 'ignore' && 'Ignoring Invitation...'}
                            {actionType === 'later' && 'Saving for Later...'}
                        </h2>
                        <p className="text-slate-500 font-medium">Please wait...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="py-8 text-center">
                        <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                            <CheckCircle2 size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-2 uppercase italic">
                            {actionType === 'accept' && 'Welcome to the Team!'}
                            {actionType === 'ignore' && 'Invitation Ignored'}
                            {actionType === 'later' && 'Saved for Later!'}
                        </h2>
                        <p className="text-slate-400 mb-8 font-medium">{message}</p>
                        {actionType === 'accept' && inviteData && (
                            <p className="text-slate-500 text-sm mb-8">
                                You joined as <span className="font-bold text-indigo-400">{inviteData.role?.replace('-', ' ')}</span>
                            </p>
                        )}
                        <button
                            onClick={handleContinue}
                            className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 mx-auto"
                        >
                            Continue <ArrowRight size={18} />
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="py-8 text-center">
                        <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                            <AlertTriangle size={40} />
                        </div>
                        <h2 className="text-xl font-black text-white mb-2 uppercase italic">Invitation Error</h2>
                        <p className="text-slate-400 mb-8 font-medium">{message}</p>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="px-6 py-3 bg-white/5 border border-white/10 text-slate-300 rounded-xl font-bold hover:bg-white/10 transition-all"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeamInvitePage;