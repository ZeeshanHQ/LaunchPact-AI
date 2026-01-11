
import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Chrome, ShieldCheck, Sparkles } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { useNotification } from '../NotificationProvider';
import { motion } from 'framer-motion';

interface LoginPageProps {
    onLogin: () => void;
    onGoSignup: () => void;
    onBack: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onGoSignup, onBack }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const { notify } = useNotification();

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            });
            if (error) throw error;
        } catch (error: any) {
            console.error("Google login error:", error);
            notify('Google Login Failed', error.message || 'Could not connect to Google.', 'error');
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agreed) {
            notify("Agreement Required", "Please agree to the Terms and Privacy Policy.", "info");
            return;
        }
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            notify('Welcome Back!', 'Login successful. Entering the Forge...', 'success');
            onLogin();
        } catch (error: any) {
            console.error("Login error:", error);
            notify('Login Failed', error.message || 'Invalid credentials.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 relative flex items-center justify-center p-4 overflow-hidden text-slate-200">
            {/* Background Elements */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-[120px] opacity-40"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
            </div>

            {/* Left Side: Brand Content (Premium) */}
            <div className="hidden lg:flex flex-col justify-between p-20 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/30 relative overflow-hidden text-white">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[120px]"></div>

                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4 cursor-pointer group" onClick={onBack}>
                        <img src="/logo_pro.png" alt="LaunchPact AI" className="h-12 w-auto group-hover:scale-110 transition-transform" />
                    </div>
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all bg-white/5 px-4 py-2 rounded-full border border-white/5 hover:border-indigo-500/30"
                    >
                        <span>← Protocol Exit</span>
                    </button>
                </div>

                <div className="relative z-10 space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md">
                        <ShieldCheck size={16} className="text-indigo-400" />
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-300">Founding Cohort Only</span>
                    </div>
                    <h1 className="text-6xl font-black text-white leading-[1] tracking-tightest">
                        Resume Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400">Architectural</span> <br />
                        <span className="text-white">Session</span>
                    </h1>
                    <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-md">
                        The LaunchPact AI protocol is online. Secure your position among the first 1,000 founders building the future.
                    </p>
                </div>

                <div className="relative z-10 flex flex-col gap-6 pt-12 border-t border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-indigo-500/20 transition-all">
                            <Sparkles size={24} className="text-indigo-400" />
                        </div>
                        <div>
                            <span className="block text-xl font-bold text-white">Join the Elite 1,000</span>
                            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Limited Founding Spots Available</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="flex flex-col justify-center p-8 md:p-20 bg-slate-900/40 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none"></div>
                <div className="w-full max-w-md mx-auto space-y-10 relative z-10">

                    <div className="text-center lg:text-left space-y-2">
                        <h2 className="text-3xl font-bold text-white tracking-tight">Access Protocol</h2>
                        <p className="text-slate-400">Authenticate to enter the workspace.</p>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-3 py-3.5 border border-slate-700 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-all text-slate-200 font-bold text-sm shadow-lg hover:shadow-indigo-500/10"
                        >
                            <Chrome size={20} />
                            <span>Continue with Google</span>
                        </button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-700"></div>
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                                <span className="bg-slate-900 px-4 text-slate-500">Or use credentials</span>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Identity (Email)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-4 flex items-center text-slate-500">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-700 rounded-xl py-3.5 pl-12 pr-4 text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                                    placeholder="founder@launchpact.ai"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Passkey</label>
                                <button type="button" className="text-[11px] text-indigo-400 hover:text-indigo-300">Forgot?</button>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-4 flex items-center text-slate-500">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-700 rounded-xl py-3.5 pl-12 pr-4 text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <input
                                id="terms"
                                type="checkbox"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                className="mt-1 w-4 h-4 bg-slate-800 border-slate-700 rounded text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
                            />
                            <label htmlFor="terms" className="text-xs text-slate-500 leading-relaxed">
                                I agree to the <span className="text-slate-300 cursor-pointer hover:underline">Terms</span> and <span className="text-slate-300 cursor-pointer hover:underline">Protocol</span>.
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-4 font-bold text-sm uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Initialize Session</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-500">
                        New here? <button onClick={onGoSignup} className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">Apply for access</button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
