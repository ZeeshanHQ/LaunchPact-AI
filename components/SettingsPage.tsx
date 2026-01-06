
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

    return (
        <div className="min-h-screen bg-[#06080f] p-8 md:p-12 lg:p-20 overflow-y-auto">
            <div className="max-w-5xl mx-auto pb-32">
                {/* Header */}
                <div className="space-y-4 mb-20">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                        <Settings size={12} /> System Admin
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black text-white leading-none tracking-tightest uppercase italic">
                        The Core.<br />
                    </h1>
                    <p className="text-slate-500 max-w-sm font-bold text-lg leading-relaxed">
                        Fine-tune your cognitive environment and foundry status.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Navigation */}
                    <div className="lg:col-span-4 space-y-2">
                        {[
                            { icon: User, label: 'Founder Identity', active: true },
                            { icon: Bell, label: 'Signal Protocols' },
                            { icon: Shield, label: 'Vault & Security' },
                            { icon: Cpu, label: 'AI Cognition' },
                            { icon: Globe, label: 'Sync & Region' },
                        ].map((item, i) => (
                            <button key={i} className={`w-full flex items-center gap-4 p-5 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest ${item.active ? 'bg-indigo-600 text-white shadow-2xl' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}>
                                <item.icon size={18} />
                                {item.label}
                            </button>
                        ))}

                        <div className="pt-8">
                            <button onClick={handleSignOut} className="w-full flex items-center gap-4 p-5 rounded-2xl text-red-500 hover:bg-red-500/5 transition-all font-black text-[10px] uppercase tracking-widest border border-transparent hover:border-red-500/20">
                                <LogOut size={18} />
                                Decommission Session
                            </button>
                        </div>
                    </div>

                    {/* Form Area */}
                    <div className="lg:col-span-8 space-y-12">
                        <section className="bg-white/5 border border-white/10 rounded-[3rem] p-10 space-y-10 group hover:border-indigo-500/30 transition-all duration-700">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black text-white tracking-tight uppercase italic">Architect Profile</h3>
                                <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 font-black">
                                    {profile?.full_name?.[0]}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Public Designation</label>
                                    <input
                                        type="text"
                                        defaultValue={profile?.full_name}
                                        className="w-full bg-[#0b0f1a] border border-white/10 rounded-[1.5rem] px-6 py-4 text-white text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-700"
                                        placeholder="Full Name"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Neural Link (Email)</label>
                                    <input
                                        type="email"
                                        defaultValue={profile?.email}
                                        className="w-full bg-[#0b0f1a] border border-white/10 rounded-[1.5rem] px-6 py-4 text-slate-500 text-sm font-bold cursor-not-allowed"
                                        disabled
                                    />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Registry ID: {profile?.id?.slice(0, 12)}...</p>
                                <button className="px-6 py-3 bg-white text-slate-950 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-white/5">
                                    Update Registry
                                </button>
                            </div>
                        </section>

                        <section className="bg-white/5 border border-white/10 rounded-[3rem] p-10 space-y-8">
                            <h3 className="text-xl font-black text-white tracking-tight uppercase italic">Intelligence Layer</h3>

                            <div className="flex items-center justify-between p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl group hover:border-indigo-500/30 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400">
                                        <Cpu size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-white text-sm uppercase italic">High-Stakes Mode</h4>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Enables critical, honest AI personality</p>
                                    </div>
                                </div>
                                <div className="w-12 h-6 bg-indigo-600 rounded-full relative cursor-pointer shadow-lg shadow-indigo-600/20">
                                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                                </div>
                            </div>

                            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-500">
                                        <Lock size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-400 text-sm uppercase italic">Encrypted Briefings</h4>
                                        <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">End-to-end mission encryption</p>
                                    </div>
                                </div>
                                <div className="w-12 h-6 bg-slate-800 rounded-full relative cursor-not-allowed">
                                    <div className="absolute left-1 top-1 w-4 h-4 bg-slate-600 rounded-full"></div>
                                </div>
                            </div>
                        </section>

                        <section className="bg-red-500/5 border border-red-500/10 rounded-[3rem] p-10">
                            <h3 className="text-xl font-black text-red-500 tracking-tight uppercase italic mb-2">Decommission Foundry</h3>
                            <p className="text-slate-500 text-sm font-medium mb-8">Permanently purge all strategic blueprints, team data, and mission telemetry. This action is irreversible.</p>
                            <button className="px-8 py-4 bg-red-500 group hover:bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-3 shadow-xl shadow-red-500/20">
                                <Shield size={16} className="group-hover:rotate-12 transition-transform" />
                                Initiate Core Purge
                            </button>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
