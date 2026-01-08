
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Layout,
    Activity,
    Users,
    Settings,
    LogOut,
    Cpu,
    ChevronLeft,
    ChevronRight,
    Target,
    Rocket,
    PlusCircle,
    Bell,
    Search,
    Menu,
    X,
    ThumbsUp,
    Zap,
    MessageSquare,
    ListTodo
} from 'lucide-react';
import { supabase } from '../services/supabase';
import { LockedPlan } from '../types';

interface DashboardLayoutProps {
    activePlan?: LockedPlan | null;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ activePlan }) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [userProfile, setUserProfile] = useState<{ id: string; email: string; full_name?: string } | null>(null);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchProfileAndNotifications = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserProfile({
                    id: user.id,
                    email: user.email || '',
                    full_name: user.user_metadata?.full_name
                });
                fetchNotifications(user.id);
            }
        };
        fetchProfileAndNotifications();

        // Poll notifications every 30 seconds
        const interval = setInterval(() => {
            if (userProfile?.id) fetchNotifications(userProfile.id);
        }, 30000);

        return () => clearInterval(interval);
    }, [userProfile?.id]);

    const fetchNotifications = async (userId: string) => {
        try {
            const response = await fetch(`/api/notifications/${userId}`);
            const data = await response.json();
            if (data.success) {
                setNotifications(data.notifications);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (error) {
            console.error('Failed to mark read:', error);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    const navItems = [
        { icon: Layout, label: 'Command Center', path: '/dashboard' },
        { icon: Activity, label: 'Active Mission', path: '/mission' },
        { icon: ListTodo, label: 'Daily Tasks', path: '/daily-tasks' },
        ...(activePlan?.teamSetup?.setupType === 'solo' ? [] : [
            { icon: Users, label: 'Team & Access', path: '/team' },
            { icon: MessageSquare, label: 'Team Chat', path: '/team-chat' },
        ]),
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="flex h-screen bg-[#06080f] text-slate-200 font-sans overflow-hidden">
            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 xl:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed inset-y-0 left-0 z-50 xl:static h-screen
          bg-[#0b0f1a]/80 backdrop-blur-2xl border-r border-white/5
          transition-all duration-500 ease-in-out
          ${isSidebarCollapsed ? 'w-24' : 'w-72'}
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'}
        `}
            >
                {/* Logo Section */}
                <div className="p-8 pb-10 flex items-center gap-4 group cursor-pointer overflow-hidden whitespace-nowrap" onClick={() => navigate('/')}>
                    <div className="relative flex-shrink-0">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
                        <div className="relative w-10 h-10 bg-slate-900 border border-white/10 rounded-xl flex items-center justify-center shadow-2xl">
                            <Cpu size={22} className="text-indigo-400 group-hover:scale-110 transition-transform duration-500" />
                        </div>
                    </div>
                    {!isSidebarCollapsed && (
                        <div className="flex flex-col transition-opacity duration-300">
                            <span className="font-black text-white tracking-tight uppercase italic text-lg leading-none">LaunchPact</span>
                            <span className="text-[10px] font-black tracking-[0.3em] text-indigo-500 uppercase leading-none mt-1">Foundry AI</span>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {!isSidebarCollapsed && (
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mb-6 px-4">Control Plane</p>
                    )}

                    {navItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => {
                                navigate(item.path);
                                setIsMobileMenuOpen(false);
                            }}
                            className={`
                w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group
                ${isActive(item.path)
                                    ? 'bg-indigo-500/10 text-white border border-indigo-500/20'
                                    : 'text-slate-500 hover:text-white hover:bg-white/5 border border-transparent'}
              `}
                            title={isSidebarCollapsed ? item.label : ''}
                        >
                            <item.icon
                                size={20}
                                className={`${isActive(item.path) ? 'text-indigo-400' : 'group-hover:text-indigo-400 group-hover:translate-x-1'} transition-all duration-300 flex-shrink-0`}
                            />
                            {!isSidebarCollapsed && (
                                <span className="font-black text-xs uppercase tracking-widest whitespace-nowrap">{item.label}</span>
                            )}
                            {isActive(item.path) && !isSidebarCollapsed && (
                                <div className="ml-auto w-1.5 h-1.5 bg-indigo-400 rounded-full shadow-[0_0_8px_rgba(129,140,248,0.5)]"></div>
                            )}
                        </button>
                    ))}


                </nav>

                {/* Collapse Toggle (Desktop) */}
                <button
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className="hidden xl:flex absolute bottom-8 right-0 translate-x-1/2 w-8 h-8 bg-[#0b0f1a] border border-white/10 rounded-full items-center justify-center text-slate-400 hover:text-white hover:border-indigo-500/50 transition-all z-50 shadow-2xl"
                >
                    {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>

                {/* Mobile Close Button */}
                <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="xl:hidden absolute top-8 right-4 text-slate-400 hover:text-white"
                >
                    <X size={24} />
                </button>

                {/* Bottom Banner */}
                {!isSidebarCollapsed && (
                    <div className="p-6 mt-auto">
                        <div className="p-6 bg-gradient-to-br from-indigo-600/10 to-transparent border border-white/5 rounded-[2rem] relative overflow-hidden group">
                            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500/5 blur-3xl rounded-full group-hover:bg-indigo-500/10 transition-all duration-700"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                                        <Target size={12} className="text-indigo-400" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Foundry Access</span>
                                </div>
                                <button
                                    onClick={() => navigate('/')}
                                    className="w-full py-3 bg-white text-slate-950 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-white/5"
                                >
                                    New Forge
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Header (Desktop & Mobile) */}
                <header className="flex items-center justify-between p-6 xl:px-12 bg-[#06080f]/50 backdrop-blur-md border-b border-white/5 sticky top-0 z-30">
                    <div className="flex items-center gap-6 flex-1">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="xl:hidden p-2 text-slate-400 hover:text-white"
                        >
                            <Menu size={24} />
                        </button>

                        <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/5 rounded-xl w-full max-w-md group focus-within:border-indigo-500/50 transition-all">
                            <Search size={18} className="text-slate-500 group-focus-within:text-indigo-400" />
                            <input
                                type="text"
                                placeholder="Search blueprints, tasks, team..."
                                className="bg-transparent border-none outline-none text-sm text-slate-300 w-full placeholder:text-slate-600"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Notification System */}
                        <div className="relative">
                            <button
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-slate-400 hover:text-white transition-all relative group"
                            >
                                <Bell size={20} className="group-hover:rotate-12 transition-transform" />
                                {notifications.some(n => !n.is_read) && (
                                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-[#06080f] animate-pulse"></span>
                                )}
                            </button>

                            {/* Notification Dropdown */}
                            {isNotificationsOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
                                    <div className="absolute right-0 mt-4 w-80 md:w-96 bg-[#0b0f1a] border border-white/10 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                            <h3 className="font-black text-xs uppercase tracking-widest text-white italic">Intelligence Feed</h3>
                                            <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-md">
                                                {notifications.filter(n => !n.is_read).length} New
                                            </span>
                                        </div>
                                        <div className="max-h-[400px] overflow-y-auto scrollbar-hide divide-y divide-white/5">
                                            {notifications.length === 0 ? (
                                                <div className="p-12 text-center">
                                                    <Bell size={32} className="mx-auto text-slate-800 mb-4 opacity-20" />
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic">No Active Signal</p>
                                                </div>
                                            ) : (
                                                notifications.map((n) => (
                                                    <div
                                                        key={n.id}
                                                        onClick={() => {
                                                            markAsRead(n.id);
                                                            if (n.link) navigate(n.link);
                                                            setIsNotificationsOpen(false);
                                                        }}
                                                        className={`p-5 hover:bg-white/[0.02] cursor-pointer transition-colors group relative ${!n.is_read ? 'bg-indigo-500/[0.02]' : 'opacity-60'}`}
                                                    >
                                                        {!n.is_read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />}
                                                        <div className="flex gap-4">
                                                            <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${n.type === 'approval' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'
                                                                }`}>
                                                                {n.type === 'approval' ? <ThumbsUp size={18} /> : <Zap size={18} />}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-black text-white uppercase italic tracking-tight mb-1">{n.title}</p>
                                                                <p className="text-[10px] font-medium text-slate-400 leading-relaxed mb-2 line-clamp-2">{n.message}</p>
                                                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-600">{new Date(n.created_at).toLocaleTimeString()}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        {notifications.length > 0 && (
                                            <button className="w-full p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white hover:bg-white/5 transition-all text-center border-t border-white/5">
                                                Archive Signals
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Profile Summary */}
                        <div className="hidden sm:flex items-center gap-4 pl-6 border-l border-white/5 group cursor-pointer" onClick={() => navigate('/settings')}>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-white uppercase italic tracking-tighter leading-none">{userProfile?.full_name || 'Founder'}</p>
                                <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest leading-none mt-1.5">Cohort One</p>
                            </div>
                            <div className="w-10 h-10 bg-white/5 border border-white/5 rounded-xl flex items-center justify-center shadow-lg group-hover:border-indigo-500/50 transition-all">
                                <span className="font-black text-xs text-indigo-400 uppercase italic">
                                    {(userProfile?.full_name?.[0] || userProfile?.email?.[0] || 'A').toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dynamic Content */}
                <main className="flex-1 overflow-y-auto scrollbar-hide">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
