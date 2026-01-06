
import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, Info, Trophy, X, AlertCircle } from 'lucide-react';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'success' | 'info' | 'achievement' | 'error';
}

interface NotificationContextType {
    notify: (title: string, message: string, type?: Notification['type']) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const notify = useCallback((title: string, message: string, type: Notification['type'] = 'info') => {
        const id = Math.random().toString(36).substring(7);
        setNotifications(prev => [...prev, { id, title, message, type }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000);
    }, []);

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
        <NotificationContext.Provider value={{ notify }}>
            {children}
            <div className="fixed bottom-8 right-8 z-[9999] flex flex-col gap-4 max-w-md w-full">
                {notifications.map(n => (
                    <div
                        key={n.id}
                        className={`
                            p-6 rounded-[2.5rem] shadow-2xl border backdrop-blur-md animate-in slide-in-from-right-10 duration-500 flex items-start gap-4
                            ${n.type === 'success' ? 'bg-green-600/90 border-green-400 text-white shadow-green-500/20' : ''}
                            ${n.type === 'achievement' ? 'bg-indigo-600/90 border-indigo-400 text-white shadow-indigo-500/20' : ''}
                            ${n.type === 'error' ? 'bg-red-600/90 border-red-400 text-white shadow-red-500/20' : ''}
                            ${n.type === 'info' ? 'bg-white/90 border-slate-200 text-slate-800 shadow-slate-200/50' : ''}
                        `}
                    >
                        <div className={`
                            w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg
                            ${n.type === 'success' ? 'bg-white/20' : ''}
                            ${n.type === 'achievement' ? 'bg-white/20' : ''}
                            ${n.type === 'error' ? 'bg-white/20' : ''}
                            ${n.type === 'info' ? 'bg-indigo-50 text-indigo-600' : ''}
                        `}>
                            {n.type === 'success' && <CheckCircle2 size={24} />}
                            {n.type === 'achievement' && <Trophy size={24} />}
                            {n.type === 'error' && <AlertCircle size={24} />}
                            {n.type === 'info' && <Info size={24} />}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-black uppercase tracking-widest text-[10px] mb-1 opacity-60">
                                {n.type === 'achievement' ? 'Achievement Unlocked' : n.type}
                            </h4>
                            <h3 className="font-black text-lg leading-tight">{n.title}</h3>
                            <p className="text-xs font-medium opacity-80 mt-1">{n.message}</p>
                        </div>
                        <button onClick={() => removeNotification(n.id)} className="opacity-40 hover:opacity-100 transition-opacity p-2">
                            <X size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotification must be used within NotificationProvider');
    return context;
};
