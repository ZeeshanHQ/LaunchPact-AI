
import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Chrome, User, Sparkles, BrainCircuit, Rocket } from 'lucide-react';
import { supabase as serverSupabase } from '../../services/supabase';
import { useNotification } from '../NotificationProvider';

interface SignupPageProps {
    onSignup: () => void;
    onGoLogin: () => void;
    onBack: () => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ onSignup, onGoLogin, onBack }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [agreed, setAgreed] = useState(false);

    const [step, setStep] = useState<'details' | 'otp'>('details');
    const [otpCode, setOtpCode] = useState('');

    const { notify } = useNotification();

    const handleGoogleSignup = async () => {
        setIsLoading(true);
        try {
            const { error } = await serverSupabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            });
            if (error) throw error;
        } catch (error: any) {
            console.error("Google signup error:", error);
            notify('Google Signup Failed', error.message || 'Could not connect to Google.', 'error');
            setIsLoading(false);
        }
    };

    const handleSendOtp = async () => {
        if (!formData.email || !formData.password || !formData.name) {
            notify('Missing Details', 'Please fill in all fields.', 'error');
            return;
        }
        if (!agreed) {
            notify('Protocol Agreement Required', 'Please agree to the terms to proceed.', 'error');
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, name: formData.name })
            });

            if (!res.ok) {
                const errorText = await res.text();
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch (e) {
                    throw new Error(`Failed to send code (${res.status}): ${errorText.slice(0, 100)}`);
                }
                throw new Error(errorData.error || 'Failed to send verification code');
            }

            const data = await res.json();
            notify('Verification Code Sent', 'Check your email for the code.', 'success');
            setStep('otp');
        } catch (err: any) {
            console.error("OTP Error:", err);
            notify('Could not send code', err.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyAndSignup = async () => {
        if (otpCode.length !== 6) return;
        setIsLoading(true);

        try {
            // 1. Verify OTP with Backend
            const verifyRes = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, code: otpCode })
            });

            if (!verifyRes.ok) {
                const errorText = await verifyRes.text();
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch (e) {
                    throw new Error(`Verification failed (${verifyRes.status}): ${errorText.slice(0, 100)}`);
                }
                throw new Error(errorData.message || errorData.error || 'Invalid Code');
            }

            const verifyData = await verifyRes.json();
            if (!verifyData.valid) throw new Error(verifyData.message || 'Invalid Code');

            // 2. Complete Signup via Backend Admin API
            const signupRes = await fetch('/api/auth/complete-signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    name: formData.name
                })
            });

            if (!signupRes.ok) {
                const errorText = await signupRes.text();
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch (e) {
                    throw new Error(`Signup failed (${signupRes.status}): ${errorText.slice(0, 100)}`);
                }

                const errorMessage = errorData.error || errorData.message || 'Failed to initialize cohort member';

                // If user already exists, we can just try to log them in
                if (errorMessage.toLowerCase().includes('already associated') || errorMessage.toLowerCase().includes('already registered')) {
                    notify('Identity Recognized', 'You are already a cohort member. Initializing session...', 'info');
                } else {
                    throw new Error(errorMessage);
                }
            }

            const signupData = await signupRes.json().catch(() => ({}));

            // 3. Log In to establish session (Always try this, even if signup step was skipped due to existing user)
            const { error: loginError } = await serverSupabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password
            });

            if (loginError) throw loginError;

            notify('Account Created!', 'Welcome to the LaunchPact AI founding cohort.', 'success');
            onSignup();
        } catch (error: any) {
            console.error("Signup error:", error);
            notify('Signup Failed', error.message || 'Could not verify protocol.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 relative flex items-center justify-center p-4 overflow-hidden text-slate-200">
            {/* Background Elements */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-[-15%] right-[-10%] w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-[140px] animate-pulse"></div>
                <div className="absolute bottom-[-15%] left-[-10%] w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[140px]"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
            </div>

            <div className="w-full max-w-[1200px] grid lg:grid-cols-2 gap-0 items-stretch bg-slate-900/50 backdrop-blur-2xl border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden min-h-[800px]">

                {/* Left Side: Signup Form */}
                <div className="flex flex-col justify-center p-8 md:p-16 lg:p-24 bg-slate-900/40 order-2 lg:order-1 relative">
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-transparent pointer-events-none"></div>
                    <div className="w-full max-w-md mx-auto space-y-8 relative z-10">

                        <div className="text-center lg:text-left space-y-2">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3 cursor-pointer" onClick={onBack}>
                                    <img src="/logo_pro.png" alt="LaunchPact AI" className="h-10 w-auto hover:scale-110 transition-transform" />
                                </div>
                                <button
                                    onClick={onBack}
                                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all bg-white/5 px-4 py-2 rounded-full border border-white/5 lg:hidden"
                                >
                                    <span>← Exit</span>
                                </button>
                            </div>
                            <h2 className="text-4xl font-black text-white tracking-tightest uppercase">Claim Your Seat</h2>
                            <p className="text-slate-400 font-medium">Initialize your founding protocol to begin.</p>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={handleGoogleSignup}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-3 py-3.5 border border-slate-700 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-all text-slate-200 font-bold text-sm shadow-lg hover:shadow-indigo-500/10"
                            >
                                <Chrome size={20} />
                                <span>Sign up with Google</span>
                            </button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-700"></div>
                                </div>
                                <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                                    <span className="bg-slate-900 px-4 text-slate-500">Or use email</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-5">
                            {step === 'details' ? (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-4 flex items-center text-slate-500">
                                                <User size={18} />
                                            </div>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full bg-slate-950/50 border border-slate-700 rounded-xl py-3.5 pl-12 pr-4 text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Work Email</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-4 flex items-center text-slate-500">
                                                <Mail size={18} />
                                            </div>
                                            <input
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full bg-slate-950/50 border border-slate-700 rounded-xl py-3.5 pl-12 pr-4 text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                                                placeholder="john@company.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Secure Password</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-4 flex items-center text-slate-500">
                                                <Lock size={18} />
                                            </div>
                                            <input
                                                type="password"
                                                required
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className="w-full bg-slate-950/50 border border-slate-700 rounded-xl py-3.5 pl-12 pr-4 text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <input
                                            id="terms-signup"
                                            type="checkbox"
                                            checked={agreed}
                                            onChange={(e) => setAgreed(e.target.checked)}
                                            className="mt-1 w-4 h-4 bg-slate-800 border-slate-700 rounded text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
                                        />
                                        <label htmlFor="terms-signup" className="text-xs text-slate-500 leading-relaxed">
                                            I agree to the Protocol, Terms of Service, and authorize LaunchPact AI processing.
                                        </label>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleSendOtp}
                                        disabled={isLoading}
                                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-4 font-bold text-sm uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
                                    >
                                        {isLoading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                <span>Request Access Code</span>
                                                <ArrowRight size={18} />
                                            </>
                                        )}
                                    </button>
                                </>
                            ) : (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="text-center space-y-2">
                                        <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 mx-auto mb-4 border border-indigo-500/20">
                                            <Mail size={32} />
                                        </div>
                                        <h3 className="text-xl font-bold text-white">Verify Identity</h3>
                                        <p className="text-sm text-slate-400">Enter the 6-digit secure code sent to <span className="text-indigo-400 font-bold">{formData.email}</span></p>
                                    </div>

                                    <input
                                        type="text"
                                        required
                                        maxLength={6}
                                        value={otpCode}
                                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                        placeholder="123456"
                                        className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-5 text-center text-2xl tracking-[0.5em] font-bold text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-700"
                                    />

                                    <button
                                        type="button"
                                        onClick={handleVerifyAndSignup}
                                        disabled={isLoading || otpCode.length !== 6}
                                        className="w-full bg-white text-slate-900 hover:bg-slate-200 rounded-xl py-4 font-bold text-sm uppercase tracking-widest transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? (
                                            <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                <span>Finalize & Enter</span>
                                                <Sparkles size={18} />
                                            </>
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setStep('details')}
                                        className="w-full text-xs font-bold text-slate-500 hover:text-slate-300 uppercase tracking-widest"
                                    >
                                        Back to details
                                    </button>
                                </div>
                            )}
                        </div>

                        <p className="text-center text-sm text-slate-500">
                            Already a founder? <button onClick={onGoLogin} className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">Log in</button>
                        </p>
                    </div>
                </div>

                {/* Right Side: Brand & Benefits */}
                <div className="hidden lg:flex flex-col justify-between p-20 bg-gradient-to-bl from-indigo-950 via-slate-950 to-slate-950 relative overflow-hidden text-white border-l border-white/5 order-1 lg:order-2">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] opacity-20"></div>
                    <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/10 blur-[140px] rounded-full"></div>

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

                    <div className="relative z-10 space-y-10 text-right">
                        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-xl ml-auto">
                            <Sparkles size={16} className="text-indigo-400" />
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-300">Admission Open</span>
                        </div>
                        <h1 className="text-7xl font-black text-white leading-[0.9] tracking-tightest">
                            Secure Your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-l from-indigo-400 via-violet-400 to-purple-400">Founding</span> <br />
                            Status
                        </h1>
                        <p className="text-2xl text-slate-400 font-medium leading-relaxed max-w-lg ml-auto">
                            Join the first <span className="text-white font-black">1,000 users</span> architecting the next generation of billion-dollar realities.
                        </p>
                    </div>

                    <div className="relative z-10 space-y-10 pt-12">
                        <div className="flex items-center justify-end gap-6 group">
                            <div className="text-right">
                                <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">Neural Architecture</h3>
                                <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black">Advanced AI Engine</p>
                            </div>
                            <div className="w-16 h-16 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 transition-all duration-500">
                                <BrainCircuit size={32} />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-6 group">
                            <div className="text-right">
                                <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">Outcome Protocol</h3>
                                <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black">Reality Verification</p>
                            </div>
                            <div className="w-16 h-16 rounded-2xl bg-purple-500/5 border border-purple-500/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/20 transition-all duration-500">
                                <Rocket size={32} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;

