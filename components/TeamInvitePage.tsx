
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Users, CheckCircle2, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';

const TeamInvitePage: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying invitation...');
    const [inviteData, setInviteData] = useState<any>(null);

    useEffect(() => {
        handleInvite();
    }, [token]);

    const handleInvite = async () => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid invitation link.');
            return;
        }

        // 1. Check Auth
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            // detailed redirect to ensure they come back here after login
            // We can use query param 'redirect' or store in localStorage
            localStorage.setItem('pending_invite_token', token);
            navigate('/login?redirect=/team-invite/' + token);
            return;
        }

        try {
            const user = session.user;

            // 2. Accept Invite API
            const response = await fetch(`/api/team/accept-invite/${token}`, {
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
                throw new Error(data.error || 'Failed to accept invitation');
            }

            setInviteData(data.member);
            setStatus('success');
            setMessage('Invitation accepted successfully!');

            // Clear any pending token
            localStorage.removeItem('pending_invite_token');

        } catch (error: any) {
            console.error('Invite error:', error);
            setStatus('error');
            setMessage(error.message || 'An unexpected error occurred.');
        }
    };

    const handleContinue = () => {
        if (inviteData?.plan_id) {
            navigate(`/team-review/${inviteData.plan_id}`);
        } else {
            navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center">

                {status === 'loading' && (
                    <div className="py-12">
                        <Loader2 size={48} className="text-indigo-600 animate-spin mx-auto mb-6" />
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Verifying Invitation...</h2>
                        <p className="text-slate-500">Please wait while we secure your access.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="py-8">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase italic">Welcome to the Team!</h2>
                        <p className="text-slate-600 mb-8">
                            You have successfully joined the project as <span className="font-bold text-indigo-600">{inviteData?.role}</span>.
                        </p>
                        <button
                            onClick={handleContinue}
                            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                        >
                            Go to Workspace <ArrowRight size={18} />
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="py-8">
                        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle size={40} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Invitation Failed</h2>
                        <p className="text-slate-500 mb-8">{message}</p>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
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
