
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

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setProfile({
                    id: user.id,
                    email: user.email,
                    full_name: user.user_metadata?.full_name || 'Anonymous Founder',
                    created_at: user.created_at
                });
            }
            setLoading(false);
        };
        fetchProfile();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#06080f]">
                <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        );
    }

    const [activeTab, setActiveTab] = useState('profile');

    const tabs = [
        { id: 'profile', icon: User, label: 'Profile' },
        { id: 'notifications', icon: Bell, label: 'Notifications' },
        { id: 'security', icon: Shield, label: 'Account Security' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#06080f]">
                <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#06080f] p-6 md:p-12 xl:p-20 overflow-y-auto">
            <div className="max-w-6xl mx-auto pb-32">
                {/* Header */}
                <div className="space-y-4 mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                        <Settings size={12} /> User Settings
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white leading-none tracking-tightest uppercase italic">
                        Account.<br />
                    </h1>
                    <p className="text-slate-500 max-w-md font-bold text-sm leading-relaxed uppercase tracking-widest">
                        Manage your profile and account preferences.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Navigation Sidebar */}
                    <div className="lg:col-span-4 space-y-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-4 p-5 rounded-2xl transition-all duration-300 font-black text-[10px] uppercase tracking-widest border ${activeTab === tab.id
                                    ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-500/20 border-indigo-500 translate-x-1'
                                    : 'text-slate-500 hover:bg-white/5 hover:text-slate-300 border-transparent'
                                    }`}
                            >
                                <tab.icon size={18} className={activeTab === tab.id ? 'scale-110 transition-transform' : ''} />
                                {tab.label}
                            </button>
                        ))}

                        <div className="pt-8 opacity-40 hover:opacity-100 transition-opacity">
                            <button onClick={handleSignOut} className="w-full flex items-center gap-4 p-5 rounded-2xl text-red-500 hover:bg-red-500/5 transition-all font-black text-[10px] uppercase tracking-widest border border-transparent hover:border-red-500/20 group">
                                <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                                Decommission Session
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-8 space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
                        {activeTab === 'profile' && (
                            <section className="bg-[#0b0f1a]/50 border border-white/5 rounded-[3rem] p-8 md:p-12 space-y-10 backdrop-blur-sm group hover:border-indigo-500/30 transition-all duration-700">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-black text-white tracking-tight uppercase italic">User Profile</h3>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Update your personal information</p>
                                    </div>
                                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center text-white font-black text-2xl shadow-2xl border border-white/20">
                                        {profile?.full_name?.[0]}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Display Name</label>
                                        <input
                                            type="text"
                                            value={profile?.full_name}
                                            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                            className="w-full bg-[#06080f] border border-white/5 rounded-[1.5rem] px-6 py-4 text-white text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-700 shadow-inner"
                                            placeholder="Enter your name"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Email Address</label>
                                        <input
                                            type="email"
                                            value={profile?.email}
                                            className="w-full bg-[#06080f]/50 border border-white/5 rounded-[1.5rem] px-6 py-4 text-slate-600 text-sm font-bold cursor-not-allowed italic"
                                            disabled
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                                    <div className="flex flex-col">
                                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Account ID: {profile?.id?.slice(0, 18)}...</p>
                                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-1">Status: Active</p>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            const { error } = await supabase.auth.updateUser({
                                                data: { full_name: profile.full_name }
                                            });
                                            if (!error) alert('Profile updated successfully!');
                                        }}
                                        className="w-full sm:w-auto px-10 py-4 bg-white text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5 border border-white"
                                    >
                                        Save Profile
                                    </button>
                                </div>
                            </section>
                        )}

                        {activeTab === 'notifications' && (
                            <section className="bg-[#0b0f1a]/50 border border-white/5 rounded-[3rem] p-8 md:p-12 space-y-8 backdrop-blur-sm">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-white tracking-tight uppercase italic">Notification Settings</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">How the system communicates with you</p>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        { title: 'Project Updates', desc: 'Alerts when mission parameters change', active: true },
                                        { title: 'Team Comms', desc: 'Direct signals from specialized personnel', active: true },
                                        { title: 'AI Logic Briefs', desc: 'Insight reports from cognitive engines', active: false },
                                        { title: 'System Telemetry', desc: 'Detailed node performance metrics', active: false },
                                    ].map((proto, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-6 bg-[#06080f]/50 border border-white/5 rounded-3xl group hover:border-indigo-500/20 transition-all">
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
                            </section>
                        )}

                        {activeTab === 'security' && (
                            <section className="bg-[#0b0f1a]/50 border border-white/5 rounded-[3rem] p-8 md:p-12 space-y-8 backdrop-blur-sm">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-white tracking-tight uppercase italic">Security</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Account Protection & Access</p>
                                </div>

                                <div className="p-8 bg-red-500/5 border border-red-500/10 rounded-[2rem] space-y-6">
                                    <div>
                                        <h4 className="font-black text-red-500 text-sm uppercase italic">Decommission Protocol</h4>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 leading-relaxed">Permanently purge all strategic blueprints, team data, and mission telemetry. This action is irreversible.</p>
                                    </div>
                                    <button className="px-8 py-4 bg-red-500/10 border border-red-500/20 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-3 shadow-xl group">
                                        <Shield size={16} className="group-hover:rotate-12 transition-transform" />
                                        Initiate Core Purge
                                    </button>
                                </div>

                                <div className="p-8 bg-white/5 border border-white/5 rounded-[2rem] flex items-center justify-between opacity-50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-600">
                                            <Lock size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-400 text-sm uppercase italic">Quantum Encryption</h4>
                                            <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Available for Enterprise Nodes</p>
                                        </div>
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-700">Locked</span>
                                </div>
                            </section>
                        )}

                        {activeTab === 'ai' && (
                            <section className="bg-[#0b0f1a]/50 border border-white/5 rounded-[3rem] p-8 md:p-12 space-y-8 backdrop-blur-sm">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-white tracking-tight uppercase italic">AI Cognition</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tuning the neural response engine</p>
                                </div>

                                <div className="flex items-center justify-between p-8 bg-indigo-500/5 border border-indigo-500/10 rounded-[2rem] group hover:border-indigo-500/30 transition-all">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-inner">
                                            <Cpu size={28} className="animate-pulse" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-white text-md uppercase italic">High-Stakes Mode</h4>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Enables critical, brutally honest AI reasoning</p>
                                        </div>
                                    </div>
                                    <div className="w-14 h-7 bg-indigo-600 rounded-full relative cursor-pointer shadow-lg shadow-indigo-600/30">
                                        <div className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-md"></div>
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
