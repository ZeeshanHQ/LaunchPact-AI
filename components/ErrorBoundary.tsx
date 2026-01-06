
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
                    <div className="max-w-md w-full">
                        <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 text-red-500 shadow-lg shadow-red-500/10">
                            <AlertCircle size={40} />
                        </div>

                        <h1 className="text-3xl font-black text-white mb-4 uppercase italic tracking-tighter">
                            System <span className="text-red-500">Anomaly</span>
                        </h1>

                        <p className="text-slate-400 font-medium leading-relaxed mb-10">
                            LaunchPact AI encountered an unexpected interruption. Our intelligence core is stabilizing the environment.
                        </p>

                        <div className="flex flex-col gap-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                            >
                                <RefreshCw size={18} /> Reboot System
                            </button>

                            <button
                                onClick={() => window.location.href = '/'}
                                className="w-full py-4 bg-white/5 border border-white/10 text-slate-400 rounded-2xl font-bold uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                <Home size={18} /> Return Home
                            </button>
                        </div>

                        {process.env.NODE_ENV === 'development' && (
                            <div className="mt-12 p-4 bg-red-500/5 border border-red-500/10 rounded-xl text-left">
                                <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-2">Error Log</p>
                                <pre className="text-xs text-red-300 font-mono whitespace-pre-wrap overflow-auto max-h-40">
                                    {this.state.error?.toString()}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
