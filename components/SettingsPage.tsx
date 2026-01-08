
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Settings,
    User,
    Bell,
    Shield,
    Cpu,
    Globe,
    Save,
    ArrowRight,
    LogOut,
    Eye,
    Lock
} from 'lucide-react';
import { supabase } from '../services/supabase';

const SettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    setProfile({
                        id: user.id,
                        email: user.email,
                        full_name: user.user_metadata?.full_name || 'Founder',
                        created_at: user.created_at
                    });
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    const handleSaveProfile = async () => {
        if (!profile) return;
        setIsSaving(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: { full_name: profile.full_name }
            });
            if (error) throw error;
            alert('Settings updated successfully');
        } catch (error: any) {
            alert('Error updating profile: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#06080f]">
                <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        );
    }

    const tabs = [
        { id: 'profile', icon: User, label: 'Profile' },
        { id: 'notifications', icon: Bell, label: 'Notifications' },
        { id: 'security', icon: Shield, label: 'Security' },
    ];

    return (
        <div className="min-h-screen bg-[#06080f] p-6 lg:p-12 xl:p-16 overflow-y-auto">
            <div className="max-w-5xl mx-auto space-y-12 pb-32">
                {/* Header */}
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                        <Settings size={12} /> Account Management
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white leading-none tracking-tightest uppercase italic">
                        Settings.
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    {/* Navigation Sidebar */}
                    <div className="space-y-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 font-black text-[10px] uppercase tracking-widest border ${activeTab === tab.id
                                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 border-indigo-500'
                                    : 'text-slate-500 hover:bg-white/5 hover:text-slate-300 border-transparent'
                                    }`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}

                        <div className="pt-8 opacity-60 hover:opacity-100 transition-opacity">
                            <button onClick={handleSignOut} className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-500 hover:bg-red-500/5 transition-all font-black text-[10px] uppercase tracking-widest border border-transparent hover:border-red-500/20">
                                <LogOut size={18} />
                                Logout
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-3">
                        <div className="bg-[#0b0f1a] border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
                            {activeTab === 'profile' && (
                                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center gap-6 pb-10 border-b border-white/5">
                                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center text-white font-black text-3xl shadow-2xl border border-white/20">
                                            {(profile?.full_name?.[0] || 'F').toUpperCase()}
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">Public Profile</h3>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Update your identification details</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Display Name</label>
                                            <input
                                                type="text"
                                                value={profile?.full_name || ''}
                                                onChange={(e) => setProfile((prev: any) => prev ? { ...prev, full_name: e.target.value } : null)}
                                                className="w-full bg-[#06080f] border border-white/10 rounded-2xl px-6 py-4 text-white text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                                placeholder="Enter your name"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Email Address</label>
                                            <input
                                                type="email"
                                                value={profile?.email || ''}
                                                className="w-full bg-[#06080f]/50 border border-white/5 rounded-2xl px-6 py-4 text-slate-600 text-sm font-bold cursor-not-allowed italic"
                                                disabled
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-10 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                                        <div className="flex flex-col">
                                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic opacity-50">Profile Linked: {new Date(profile?.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={isSaving}
                                            className="w-full sm:w-auto px-12 py-4 bg-white text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5 border border-white disabled:opacity-50"
                                        >
                                            {isSaving ? 'Updating...' : 'Save Settings'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'notifications' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">System Notifications</h3>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Manage how vectors and signals reach you</p>
                                    </div>

                                    <div className="space-y-4">
                                        {[
                                            { title: 'Project Updates', desc: 'Critical mission parameter updates', active: true },
                                            { title: 'AI Insights', desc: 'Daily cognitive analytical reports', active: false },
                                            { title: 'Security Alerts', desc: 'Node access and vault telemetry', active: true },
                                        ].map((proto, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-6 bg-[#06080f]/50 border border-white/5 rounded-[2rem] group hover:border-indigo-500/20 transition-all">
                                                <div>
                                                    <h4 className="font-black text-white text-sm uppercase italic tracking-wide">{proto.title}</h4>
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{proto.desc}</p>
                                                </div>
                                                <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-all duration-300 ${proto.active ? 'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.3)]' : 'bg-slate-800'}`}>
                                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${proto.active ? 'right-1' : 'left-1'}`}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">Security & Infrastructure</h3>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Manage your vault and node permissions</p>
                                    </div>

                                    <div className="p-8 bg-red-500/5 border border-red-500/10 rounded-[2rem] space-y-6">
                                        <div>
                                            <h4 className="font-black text-red-500 text-sm uppercase italic">Danger Zone</h4>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 leading-relaxed">Permanently purge your founder account and all associated blueprints. This is irreversible.</p>
                                        </div>
                                        <button className="px-8 py-4 bg-red-500/10 border border-red-500/20 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-3 group">
                                            <Shield size={16} className="group-hover:rotate-12 transition-transform" />
                                            Delete Account
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
