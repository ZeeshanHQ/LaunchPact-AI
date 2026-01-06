
import React, { useState, useEffect } from 'react';
import { Project, Achievement, Template, UserStats, LockedPlan } from '../types';
import {
  FolderOpen,
  Plus,
  Clock,
  TrendingUp,
  Zap,
  Trophy,
  Search,
  ChevronRight,
  Sparkles,
  Layout,
  Smartphone,
  ShoppingBag,
  Globe,
  Settings,
  Lightbulb,
  Target,
  Rocket,
  ArrowRight,
  Calendar,
  Medal,
  Crown,
  Flame,
  BarChart3,
  Terminal,
  Activity,
  LogOut,
  User,
  Bell,
  Search as SearchIcon,
  PlusCircle,
  Briefcase,
  Layers,
  Cpu,
  Users
} from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, Cell, XAxis, Tooltip, PieChart, Pie, AreaChart, Area } from 'recharts';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';

interface DashboardProps {
  projects: Project[];
  userStats: UserStats;
  activePlan: LockedPlan | null;
  onSelectProject: (p: Project) => void;
  onNewProject: (prompt?: string) => void;
  onGoToJourney: () => void;
}

const ACHIEVEMENTS_LIST: Achievement[] = [
  { id: 'a1', title: 'First Spark', icon: '⚡', unlocked: false, description: 'Created your first project.' },
  { id: 'a2', title: 'Strategist', icon: '🎯', unlocked: false, description: 'Completed a full blueprint.' },
  { id: 'a3', title: 'Streak Master', icon: '🔥', unlocked: false, description: 'Login for 3 consecutive days.' },
  { id: 'a4', title: 'Builder', icon: '🚀', unlocked: false, description: 'Launch 5 projects.' },
];

const Dashboard: React.FC<DashboardProps> = ({ projects, userStats, activePlan, onSelectProject, onNewProject, onGoToJourney }) => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<{ id?: string; email: string; full_name?: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [teamProjects, setTeamProjects] = useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [myTeamChats, setMyTeamChats] = useState<any[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedChatPlan, setSelectedChatPlan] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserProfile({
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name
        });

        // Fetch Team Memberships via Proxy
        try {
          const mRes = await fetch(`/api/memberships/${user.id}`);
          const mData = await mRes.json();
          if (mData.success) {
            const memberships = mData.memberships;
            const pending = memberships.filter((m: any) => m.approval_required && !m.has_approved);
            setPendingApprovals(pending);
            const chats = memberships.map((m: any) => m.plans).filter((p: any) => p !== null);
            setMyTeamChats(chats);
          }
        } catch (error) {
          console.error("Error fetching memberships via proxy:", error);
        }

        // Fetch Team Projects (Created by me) via Proxy
        try {
          const plansRes = await fetch(`/api/plans/${user.id}`);
          const plansData = await plansRes.json();
          if (plansData.success) {
            setTeamProjects(plansData.plans);
          }
        } catch (error) {
          console.error("Error fetching plans via proxy:", error);
        }
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const level = Math.floor(userStats.xp / 500) + 1;
  const rankTitle = level > 10 ? 'Elite Visionary' : level > 5 ? 'Senior Strategist' : 'Founding Architect';
  const xpInLevel = userStats.xp % 500;
  const progressPercent = (xpInLevel / 500) * 100;

  const nextTask = activePlan?.dailyTasks.find(t => !t.isCompleted);

  const getNicheDistribution = () => {
    if (projects.length === 0) return [{ name: 'SaaS', value: 1, color: '#6366f1' }];
    const distribution: Record<string, number> = {};
    projects.forEach(p => {
      let cat = 'SaaS';
      const text = (p.blueprint?.productName + ' ' + p.rawIdea).toLowerCase();
      if (text.includes('app') || text.includes('mobile')) cat = 'Mobile';
      else if (text.includes('ai') || text.includes('gpt')) cat = 'AI';
      else if (text.includes('shop') || text.includes('commerce')) cat = 'E-com';
      distribution[cat] = (distribution[cat] || 0) + 1;
    });
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#10b981'];
    return Object.keys(distribution).map((key, i) => ({
      name: key, value: distribution[key], color: colors[i % colors.length]
    }));
  };

  const activityData = [
    { name: 'Mon', xp: 200 }, { name: 'Tue', xp: 450 }, { name: 'Wed', xp: 300 },
    { name: 'Thu', xp: 600 }, { name: 'Fri', xp: 800 }, { name: 'Sat', xp: 500 }, { name: 'Sun', xp: 700 },
  ];

  const filteredProjects = projects.filter(p =>
    p.blueprint?.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.blueprint?.tagline?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 pb-32 max-w-7xl mx-auto space-y-10">
      {/* Dashboard Title / Context */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter">Command Center</h1>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-white uppercase italic tracking-tight">{userProfile?.full_name || 'Anonymous Founder'}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-1">{rankTitle}</p>
          </div>
          <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-indigo-400 font-black shadow-lg">
            {userProfile?.full_name?.[0] || userProfile?.email?.[0]?.toUpperCase() || 'A'}
          </div>
        </div>
      </div>

      {/* --- ACTION CENTER --- */}
      {(pendingApprovals.length > 0) && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-[2rem] p-6 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-amber-500/30" />
          <div className="flex items-center gap-4 z-10">
            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 animate-pulse">
              <Bell size={24} />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Action Required</h3>
              <p className="text-slate-400 text-sm">You have {pendingApprovals.length} pending approvals awaiting your review.</p>
            </div>
          </div>
          <div className="flex gap-3 z-10">
            {pendingApprovals.map((item, i) => (
              <button
                key={i}
                onClick={() => navigate(`/team-review/${item.plan_id}`)}
                className="px-4 py-2 bg-amber-500 text-[#0b0f1a] rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
              >
                Review {item.plans?.product_name || 'Plan'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* --- TEAM MESSAGING HUB --- */}
      {(myTeamChats.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {myTeamChats.map((plan: any) => (
            <div key={plan.id} className="bg-[#0b0f1a] border border-white/5 p-4 rounded-2xl hover:border-indigo-500/30 transition-all cursor-pointer group" onClick={() => navigate(`/team-review/${plan.id}`)}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                  {plan.product_name?.[0]}
                </div>
                <h4 className="font-bold text-white text-sm truncate">{plan.product_name}</h4>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                <span>Team Chat</span>
                <span className="text-indigo-400 group-hover:translate-x-1 transition-transform">Open &rarr;</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- TOP BANNER --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {activePlan ? (
            <div className="bg-gradient-to-br from-[#0f172a] to-[#1e1b4b] rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden group shadow-2xl">
              <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-600/10 blur-[100px] rounded-full group-hover:bg-indigo-600/20 transition-all duration-700" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="px-3 py-1 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-indigo-500/20">Active Mission</div>
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase tracking-widest">
                    <Activity size={12} className="text-orange-500" /> Day {activePlan.currentDayNumber || 1}
                  </div>
                </div>

                <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 italic uppercase tracking-tighter leading-none">{activePlan.blueprint.productName}</h2>
                <p className="text-slate-400 text-base max-w-xl mb-8 font-medium leading-relaxed">{activePlan.blueprint.tagline}</p>

                <div className="flex flex-wrap gap-4 items-center">
                  <button
                    onClick={onGoToJourney}
                    className="px-8 py-4 bg-white text-[#0f172a] rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-white/5 active:scale-95 flex items-center gap-2"
                  >
                    Enter Bridge <ArrowRight size={18} />
                  </button>
                  <div className="flex items-center gap-2 px-4 py-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest whitespace-nowrap">
                      {Math.round(activePlan.currentProgress)}% Synced
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#0b0f1a] rounded-[2.5rem] p-12 border border-white/5 border-dashed flex flex-col items-center justify-center text-center group hover:border-indigo-500/30 transition-colors">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Target size={32} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
              </div>
              <h3 className="text-xl font-black text-white mb-2 uppercase italic">No Active Mandate</h3>
              <p className="text-slate-500 text-sm max-w-xs mb-8 font-medium italic">Generate a strategic blueprint and lock an execution sequence to initialize telemetry.</p>
              <button onClick={() => onNewProject()} className="px-6 py-3 bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">
                Initiate First Forge
              </button>
            </div>
          )}
        </div>

        {/* --- STATS CARD --- */}
        <div className="bg-[#0b0f1a] rounded-[2.5rem] p-8 border border-white/5 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5">
              <Crown size={24} className="text-yellow-500 shadow-sm" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-white italic tracking-tighter leading-none">{userStats.xp}</p>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Total Influence</p>
            </div>
          </div>

          <button onClick={() => navigate('/daily-tasks')} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group hover:bg-white/5 text-slate-400">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-white/5 group-hover:border-indigo-500/30 group-hover:bg-indigo-500/10 transition-all">
              <Rocket size={18} className="group-hover:text-indigo-400" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1 group-hover:text-white">Active Mission</p>
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">Current Protocol</p>
            </div>
          </button>

          <button onClick={() => navigate('/team')} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group hover:bg-white/5 text-slate-400">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-white/5 group-hover:border-indigo-500/30 group-hover:bg-indigo-500/10 transition-all">
              <Users size={18} className="group-hover:text-indigo-400" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1 group-hover:text-white">Team Collective</p>
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">Human & AI Assets</p>
            </div>
          </button>

          <button onClick={() => navigate('/settings')} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group hover:bg-white/5 text-slate-400">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-white/5 group-hover:border-indigo-500/30 group-hover:bg-indigo-500/10 transition-all">
              <Layers size={18} className="group-hover:text-indigo-400" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1 group-hover:text-white">Foundry Core</p>
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">System Configuration</p>
            </div>
          </button>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-end mb-3">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Rank Progress</span>
                <span className="text-xs font-bold text-white">Lvl {level}</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(79,70,229,0.3)]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-xl font-black text-white italic">{projects.length}</p>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Ventures</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-xl font-black text-orange-500 italic">{userStats.loginStreak}d</p>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Streak</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/5 flex gap-2">
            {ACHIEVEMENTS_LIST.slice(0, 4).map(a => (
              <div
                key={a.id}
                className={`flex-1 aspect-square rounded-xl flex items-center justify-center text-lg border transition-all hover:scale-110 active:scale-95 cursor-help ${userStats.unlockedAchievements.includes(a.id) ? 'bg-indigo-500/10 border-indigo-500/30 text-white' : 'bg-white/5 border-white/5 text-slate-700 opacity-40'}`}
                title={`${a.title}: ${a.description}`}
              >
                {a.icon}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- MAIN GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* --- PROJECTS LIST --- */}
        <div className="lg:col-span-8 space-y-10">

          {/* Team Ventures (Cloud) */}
          {teamProjects.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-black text-white uppercase italic tracking-widest flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                  Team Ventures <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-slate-400">Cloud Sync</span>
                </h3>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{teamProjects.length} Active</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {teamProjects.map(p => {
                  const isCreator = p.created_by === userProfile?.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => navigate(isCreator ? `/planner/${p.id}` : `/team-review/${p.id}`)}
                      className="bg-[#0b0f1a] p-6 rounded-[2rem] border border-orange-500/20 hover:border-orange-500/50 hover:shadow-2xl hover:shadow-orange-900/10 transition-all cursor-pointer group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/5 rounded-bl-[3rem] -mr-4 -mt-4 transition-transform group-hover:scale-150" />

                      <div className="flex justify-between items-start mb-6 relative z-10">
                        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-inner border border-white/5">
                          <Users size={22} />
                        </div>
                        <div className="flex gap-1.5">
                          <div className={`px-2.5 py-1 border rounded-lg text-[8px] font-black uppercase tracking-widest ${isCreator ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                            {isCreator ? 'Owner' : 'Member'}
                          </div>
                        </div>
                      </div>

                      <h3 className="text-lg font-black text-white mb-1 italic uppercase tracking-tighter group-hover:text-orange-400 transition-colors line-clamp-1 relative z-10">{p.product_name}</h3>
                      <p className="text-slate-500 text-[11px] font-medium leading-relaxed mb-6 line-clamp-2 relative z-10">{p.blueprint.tagline}</p>

                      <div className="pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                            {p.team_setup?.members?.length || 0} Members
                          </span>
                        </div>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-700 group-hover:text-orange-400 group-hover:translate-x-1 transition-all">
                          <ArrowRight size={18} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Local Projects */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-black text-white uppercase italic tracking-widest flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                Strategic Blueprint Repos
              </h3>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{filteredProjects.length} Records</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProjects.map(p => (
                <div
                  key={p.id}
                  onClick={() => onSelectProject(p)}
                  className="bg-[#0b0f1a] p-6 rounded-[2rem] border border-white/5 hover:border-indigo-500/30 hover:shadow-2xl transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner border border-white/5">
                      <Briefcase size={22} />
                    </div>
                    <div className="flex gap-1.5">
                      <div className="px-2.5 py-1 bg-white/[0.03] border border-white/5 rounded-lg text-[8px] font-black text-slate-500 uppercase tracking-widest">
                        ID-{p.id.slice(0, 3)}
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-black text-white mb-1 italic uppercase tracking-tighter group-hover:text-indigo-400 transition-colors line-clamp-1">{p.blueprint.productName}</h3>
                  <p className="text-slate-500 text-[11px] font-medium leading-relaxed mb-6 line-clamp-2">{p.blueprint.tagline}</p>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap size={12} className="text-indigo-500" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Operational</span>
                    </div>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-700 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all">
                      <ArrowRight size={18} />
                    </div>
                  </div>
                </div>
              ))}

              <div
                onClick={() => onNewProject()}
                className="bg-indigo-600/5 p-6 rounded-[2rem] border border-indigo-500/20 border-dashed hover:border-indigo-500 hover:bg-indigo-600/10 transition-all cursor-pointer flex flex-col items-center justify-center group"
              >
                <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                  <PlusCircle size={24} />
                </div>
                <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">Initialize New Module</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- SIDE ANALYTICS --- */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-[#0b0f1a] rounded-[2rem] p-6 border border-white/5">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-8 flex items-center gap-2">
              <BarChart3 size={14} className="text-indigo-500" /> Sector Saturation
            </h3>
            <div className="h-44 mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={getNicheDistribution()} innerRadius={50} outerRadius={70} paddingAngle={8} dataKey="value" stroke="none">
                    {getNicheDistribution().map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0b0f1a', border: 'none', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', fontSize: '10px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {getNicheDistribution().map(d => (
                <div key={d.name} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.name}</span>
                  </div>
                  <span className="text-xs font-black text-white">{d.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-indigo-600 p-8 rounded-[2rem] border border-white/10 shadow-2xl shadow-indigo-500/10 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-white/10 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-700" />
            <h3 className="text-[10px] font-black uppercase trackingwidest opacity-60 mb-2">Build Velocity</h3>
            <div className="flex items-end gap-3 mb-4">
              <span className="text-4xl font-black italic tracking-tighter leading-none">{Math.round((userStats.xp / 1000) * 10) / 10}</span>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">XP / Pulse</span>
            </div>
            <div className="h-12 flex items-end gap-1">
              {[4, 7, 3, 9, 5, 8, 12, 6, 10, 15].map((v, i) => (
                <div key={i} className="flex-1 bg-white/20 rounded-t-sm transition-all hover:bg-white group-hover:bg-white/40" style={{ height: `${v * 6}%` }} />
              ))}
            </div>
            <div className="text-[8px] font-bold text-center mt-4 opacity-50 uppercase tracking-widest flex items-center justify-center gap-2">
              <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
              Live Syncing Data Core
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
