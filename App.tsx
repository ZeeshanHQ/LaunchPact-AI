
import React, { useState, useEffect } from 'react';
import { ProductBlueprint, Project, UserStats, Feedback, LockedDecision, LockedPlan } from './types';
import { generateProductBlueprint } from './services/geminiService';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import BlueprintView from './components/BlueprintView';
import Dashboard from './components/Dashboard';
import SoloDashboard from './components/SoloDashboard';
import ForgeAssistant from './components/ForgeAssistant';
import GuidedBuilder from './components/GuidedBuilder';
import LaunchPlanner from './components/LaunchPlanner';
import DailyTaskEngine from './components/DailyTaskEngine';
import TeamInvitePage from './components/TeamInvitePage';
import { PricingPage, EnterprisePage, ResourcePage, LegalPage } from './components/FooterPages';
import { Sparkles, Globe, Twitter, Linkedin, Github, Mail, ArrowRight } from 'lucide-react';
import { NotificationProvider, useNotification } from './components/NotificationProvider';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';

import TeamReviewDashboard from './components/TeamReviewDashboard';
import ResumePlanner from './components/ResumePlanner';
import MissionPage from './components/MissionPage';
import TeamPage from './components/TeamPage';
import SettingsPage from './components/SettingsPage';
import DashboardLayout from './components/DashboardLayout';
import TeamChatHub from './components/TeamChatHub';
import { supabase } from './services/supabase';
import ErrorBoundary from './components/ErrorBoundary';

type ViewState =
  | 'landing'
  | 'blueprint'
  | 'dashboard'
  | 'project-details'
  | 'guided-mode'
  | 'planner'
  | 'daily-tasks'
  | 'pricing'
  | 'enterprise'
  | 'resources-blog'
  | 'resources-case-studies'
  | 'resources-guide'
  | 'resources-help'
  | 'legal-privacy'
  | 'legal-terms'
  | 'login'
  | 'signup'
  | 'full-chat';

const DEFAULT_STATS: UserStats = {
  loginStreak: 1,
  lastLogin: new Date().toISOString(),
  xp: 100,
  unlockedAchievements: []
};

const AppContent: React.FC = () => {
  const { notify } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [currentBlueprint, setCurrentBlueprint] = useState<ProductBlueprint | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [userStats, setUserStats] = useState<UserStats>(DEFAULT_STATS);
  const [activePlan, setActivePlan] = useState<LockedPlan | null>(null);
  const [isCoFounderOpen, setIsCoFounderOpen] = useState(false);

  // Auth listener and Data Loading
  useEffect(() => {
    let mounted = true;

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setIsLoggedIn(!!session);
        if (session) {
          // Load data for authenticated user
          loadUserData(session.user.id);
        }
        setIsAuthChecking(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session) {
        setIsLoggedIn(true);
        loadUserData(session.user.id);
      } else {
        // Only reset local state, do NOT call signOut() again
        resetState();
      }
      setIsAuthChecking(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Restore route state on refresh - ensure user stays on dashboard if they were there
  useEffect(() => {
    if (!isAuthChecking && isLoggedIn) {
      const currentPath = location.pathname;
      // If user is on dashboard route and data is loaded, ensure they stay there
      if (currentPath === '/dashboard') {
        // Data will be loaded by loadUserData, just ensure we're on the right route
        console.log('✅ Dashboard state restored on refresh');
      }
    }
  }, [isAuthChecking, isLoggedIn, location.pathname]);

  const loadUserData = (userId: string) => {
    try {
      const savedProjects = localStorage.getItem(`forge_projects_${userId}`);
      if (savedProjects) {
        const parsed = JSON.parse(savedProjects);
        setProjects(parsed);
        console.log(`✅ Loaded ${parsed.length} projects for user ${userId}`);
      } else {
        setProjects([]);
      }

      const savedStats = localStorage.getItem(`forge_user_stats_${userId}`);
      if (savedStats) {
        const parsed = JSON.parse(savedStats);
        checkLoginStreak(parsed);
      } else {
        setUserStats(DEFAULT_STATS);
      }

      const savedPlan = localStorage.getItem(`forge_active_plan_${userId}`);
      if (savedPlan) {
        const parsed = JSON.parse(savedPlan);
        setActivePlan(parsed);
        console.log(`✅ Loaded active plan for user ${userId}`);
      } else {
        setActivePlan(null);
      }

      const savedCurrentBlueprint = localStorage.getItem(`forge_current_blueprint_${userId}`);
      if (savedCurrentBlueprint) {
        const parsed = JSON.parse(savedCurrentBlueprint);
        setCurrentBlueprint(parsed);
        console.log(`✅ Loaded current blueprint for user ${userId}`);
      } else {
        setCurrentBlueprint(null);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      // Reset to defaults on error
      setProjects([]);
      setUserStats(DEFAULT_STATS);
      setActivePlan(null);
      setCurrentBlueprint(null);
    }
  };

  const resetState = () => {
    setIsLoggedIn(false);
    setProjects([]);
    setActivePlan(null);
    setUserStats(DEFAULT_STATS);
  };

  const handleUserLogout = async () => {
    await supabase.auth.signOut();
    resetState();
    navigate('/');
  };

  // Gamification Logic: Check Achievements & XP
  // Gamification Logic: Check Achievements & XP
  /*
  useEffect(() => {
    let newXP = userStats.xp;
    const newUnlocked = [...userStats.unlockedAchievements];
    let changed = false;

    // Achievement: First Spark (First Project)
    if (projects.length >= 1 && !newUnlocked.includes('a1')) {
      newUnlocked.push('a1');
      newXP += 150;
      changed = true;
      notify('First Spark Unlocked!', 'You forged your very first project idea. Keep going!', 'achievement');
    }

    // Achievement: Plan Locked
    if (activePlan && !newUnlocked.includes('a2')) {
      newUnlocked.push('a2');
      newXP += 500;
      changed = true;
      notify('Strategist Unlocked!', 'Your mission execution plan is now locked and active.', 'achievement');
    }

    // Achievement: Streak Master (3 Days)
    if (userStats.loginStreak >= 3 && !newUnlocked.includes('a3')) {
      newUnlocked.push('a3');
      newXP += 300;
      changed = true;
      notify('Streak Master Unlocked!', 'Triple heat! You have maintained a 3-day fire streak.', 'achievement');
    }

    if (changed) {
      const updated = { ...userStats, xp: newXP, unlockedAchievements: newUnlocked };
      setUserStats(updated);
      localStorage.setItem('forge_user_stats', JSON.stringify(updated));
    }
  }, [projects, userStats.loginStreak, activePlan, notify]);
  */

  const checkLoginStreak = (stats: UserStats) => {
    const last = new Date(stats.lastLogin);
    const today = new Date();
    const isSameDay = last.toDateString() === today.toDateString();

    if (isSameDay) {
      setUserStats(stats);
      return;
    }

    const diffTime = Math.abs(today.getTime() - last.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let newStreak = stats.loginStreak;
    if (diffDays <= 2) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }

    const updated = { ...stats, loginStreak: newStreak, lastLogin: today.toISOString() };
    setUserStats(updated);

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        localStorage.setItem(`forge_user_stats_${user.id}`, JSON.stringify(updated));
      }
    });
  };

  const handleViewChange = (newView: string) => {
    navigate(newView.startsWith('/') ? newView : `/${newView}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGenerate = async (idea: string) => {
    if (!idea || !idea.trim()) {
      notify('Input Required', 'Please enter a raw idea to generate a blueprint.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      console.log(`🚀 Starting blueprint generation for: "${idea.slice(0, 50)}..."`);
      const blueprint = await generateProductBlueprint(idea);
      console.log(`✅ Blueprint generated successfully: ${blueprint.productName}`);

      setCurrentBlueprint(blueprint);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        localStorage.setItem(`forge_current_blueprint_${user.id}`, JSON.stringify(blueprint));
      }

      setActiveProjectId(null);
      navigate('/blueprint');
      notify('Blueprint Forged!', `Successfully created blueprint for ${blueprint.productName}`, 'success');
    } catch (error: any) {
      console.error("❌ Forge failed:", error);
      const errorMessage = error.message || "Failed to generate blueprint. Please check your network and try again.";
      notify('Generation Failed', errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    navigate('/dashboard');
  };

  const handleSaveProject = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (currentBlueprint) {
      const existingIdx = projects.findIndex(p => p.id === activeProjectId);
      let updatedProjects = [...projects];

      if (existingIdx >= 0) {
        updatedProjects[existingIdx].blueprint = currentBlueprint;
      } else {
        const newProject: Project = {
          id: Math.random().toString(36).substr(2, 9),
          rawIdea: "Idea forged via LaunchPact AI",
          blueprint: currentBlueprint,
          createdAt: new Date().toISOString(),
          niche: "SaaS",
          guidedProgress: { currentStepId: 'features', completedSteps: [], selections: {} },
          lockedDecisions: []
        };
        updatedProjects = [newProject, ...projects];
        setActiveProjectId(newProject.id);

        const newXP = userStats.xp + 50;
        const updatedStats = { ...userStats, xp: newXP };
        setUserStats(updatedStats);
        localStorage.setItem(`forge_user_stats_${user.id}`, JSON.stringify(updatedStats));
      }

      setProjects(updatedProjects);
      localStorage.setItem(`forge_projects_${user.id}`, JSON.stringify(updatedProjects));
      navigate('/dashboard');
    }
  };

  const handleUpdateCurrentBlueprint = async (updated: ProductBlueprint) => {
    setCurrentBlueprint(updated);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      localStorage.setItem(`forge_current_blueprint_${user.id}`, JSON.stringify(updated));
    }
  };

  const handleSelectProject = (project: Project) => {
    setCurrentBlueprint(project.blueprint);
    setActiveProjectId(project.id);
    navigate('/project-details');
  };

  const handleLockPlan = async (plan: LockedPlan) => {
    setActivePlan(plan);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      localStorage.setItem(`forge_active_plan_${user.id}`, JSON.stringify(plan));
    }

    // Add to projects if not already there
    const newProject: Project = {
      id: plan.id,
      rawIdea: plan.blueprint.ideaSummary,
      blueprint: plan.blueprint,
      createdAt: plan.lockedAt,
      niche: "Startup",
      guidedProgress: { currentStepId: 'done', completedSteps: ['all'], selections: {} },
      lockedDecisions: [],
      mode: plan.teamSetup?.setupType === 'solo' ? 'solo' : 'team'
    };

    if (!projects.find(p => p.id === plan.id)) {
      const updated = [newProject, ...projects];
      setProjects(updated);
      if (user) {
        localStorage.setItem(`forge_projects_${user.id}`, JSON.stringify(updated));
      }
    }

    handleViewChange('daily-tasks');
  };

  const handleUpdateXP = async (amount: number) => {
    const updated = { ...userStats, xp: userStats.xp + amount };
    setUserStats(updated);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      localStorage.setItem(`forge_user_stats_${user.id}`, JSON.stringify(updated));
    }
  };

  const handleNewFromTemplate = (prompt?: string) => {
    if (prompt) {
      handleGenerate(prompt);
    } else {
      navigate('/');
    }
  };

  const handleFeedback = async (isPositive: boolean, reason?: string) => {
    if (!activeProjectId) return;

    const feedback: Feedback = {
      isPositive,
      reason,
      timestamp: new Date().toISOString()
    };

    const updated = projects.map(p => {
      if (p.id === activeProjectId) {
        return { ...p, feedback };
      }
      return p;
    });

    setProjects(updated);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      localStorage.setItem(`forge_projects_${user.id}`, JSON.stringify(updated));
    }
  };

  // Helper to check if current path matches any excluded paths
  const matchesPath = (path: string, excluded: string[]) => {
    return excluded.some(ex => path === ex || path.startsWith(ex + '/'));
  };

  const showNavbar = !matchesPath(location.pathname, ['/login', '/signup', '/blueprint', '/project-details', '/planner', '/daily-tasks', '/dashboard', '/team-review', '/settings', '/team', '/mission', '/team-chat']);
  const showChat = !matchesPath(location.pathname, ['/login', '/signup', '/blueprint', '/project-details', '/planner', '/daily-tasks']);
  const showFooter = !matchesPath(location.pathname, ['/login', '/signup', '/blueprint', '/project-details', '/planner', '/daily-tasks', '/dashboard', '/team-review', '/settings', '/team', '/mission', '/chat', '/team-chat']);

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#06080f] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col selection:bg-indigo-100 selection:text-indigo-600 bg-white">
      {showNavbar && (
        <Navbar
          isLoggedIn={isLoggedIn}
          onLogin={handleLogin}
          onGoHome={() => handleViewChange('/')}
          onGoDashboard={() => handleViewChange('/dashboard')}
          onNavigate={(page) => handleViewChange(page)}
          onLogout={handleUserLogout}
        />
      )}

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage onGenerate={handleGenerate} isLoading={isLoading} />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} onGoSignup={() => navigate('/signup')} onBack={() => navigate('/')} />} />
          <Route path="/signup" element={<SignupPage onSignup={handleLogin} onGoLogin={() => navigate('/login')} onBack={() => navigate('/')} />} />
          <Route path="/team-invite/:token" element={<TeamInvitePage />} />

          <Route path="/blueprint" element={
            isLoggedIn && currentBlueprint ? (
              <BlueprintView
                blueprint={currentBlueprint}
                onSave={handleSaveProject}
                isLoggedIn={isLoggedIn}
                onStartGuidedMode={() => navigate('/planner')}
                onUpdate={handleUpdateCurrentBlueprint}
                onFeedback={handleFeedback}
              />
            ) : <Navigate to="/" />
          } />

          <Route path="/project-details" element={
            isLoggedIn && currentBlueprint ? (
              <BlueprintView
                blueprint={currentBlueprint}
                onSave={handleSaveProject}
                isLoggedIn={isLoggedIn}
                onStartGuidedMode={() => navigate('/planner')}
                onUpdate={handleUpdateCurrentBlueprint}
                onFeedback={handleFeedback}
              />
            ) : <Navigate to="/" />
          } />

          <Route path="/planner" element={
            isLoggedIn && currentBlueprint ? (
              <LaunchPlanner
                blueprint={currentBlueprint}
                onLockPlan={handleLockPlan}
                onExit={() => navigate('/blueprint')}
              />
            ) : <Navigate to="/" />
          } />

          {/* Internal Dashboard Routes */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={
              isLoggedIn ? (
                activePlan?.teamSetup?.setupType === 'solo' ? (
                  <SoloDashboard
                    projects={projects}
                    userStats={userStats}
                    activePlan={activePlan}
                    onSelectProject={handleSelectProject}
                    onNewProject={handleNewFromTemplate}
                    onGoToJourney={() => navigate('/daily-tasks')}
                  />
                ) : (
                  <Dashboard
                    projects={projects}
                    userStats={userStats}
                    activePlan={activePlan}
                    onSelectProject={handleSelectProject}
                    onNewProject={handleNewFromTemplate}
                    onGoToJourney={() => navigate('/daily-tasks')}
                  />
                )
              ) : <Navigate to="/" />
            } />

            <Route path="/daily-tasks" element={
              isLoggedIn && activePlan ? (
                <DailyTaskEngine
                  plan={activePlan}
                  userStats={userStats}
                  onUpdateXP={handleUpdateXP}
                  onSidebarToggle={setIsCoFounderOpen}
                />
              ) : <Navigate to={isLoggedIn ? "/dashboard" : "/"} />
            } />

            <Route path="/mission" element={<MissionPage plan={activePlan} userStats={userStats} onUpdateXP={handleUpdateXP} />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/team-review/:planId" element={<TeamReviewDashboard />} />
            <Route path="/planner/:planId" element={<ResumePlanner />} />
            <Route path="/team-chat" element={<TeamChatHub />} />
            <Route path="/team-chat/:planId" element={<TeamChatHub />} />
          </Route>
        </Routes>
      </main>

      {showChat && (
        <ForgeAssistant
          blueprint={currentBlueprint}
          currentView={location.pathname === '/' ? 'landing' : location.pathname.substring(1)}
          isFullPage={location.pathname === '/chat'}
          isShifted={isCoFounderOpen && location.pathname === '/daily-tasks'}
          onExpand={() => navigate('/chat')}
          onCloseFullPage={() => navigate(-1)}
        />
      )}


      {showFooter && (
        <footer className="bg-[#0b0f19] text-slate-300 py-20 px-6 border-t border-slate-800">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">

              {/* Brand Column */}
              <div className="lg:col-span-4 space-y-6">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleViewChange('landing')}>
                  <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 p-2 rounded-xl">
                    <Sparkles size={20} className="text-white" />
                  </div>
                  <span className="font-bold text-2xl text-white tracking-tight">LaunchPact<span className="text-indigo-500"> AI</span></span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed max-w-sm font-medium">
                  The world's most advanced AI product architect. Transform raw thoughts into execution-ready business blueprints in seconds.
                </p>
                <div className="flex gap-4 pt-4">
                  <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all"><Twitter size={18} /></a>
                  <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all"><Github size={18} /></a>
                  <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all"><Linkedin size={18} /></a>
                </div>
              </div>

              {/* Links Columns */}
              <div className="lg:col-span-2 space-y-6">
                <h4 className="text-white font-bold text-sm uppercase tracking-widest">Platform</h4>
                <ul className="space-y-4 text-sm font-medium">
                  <li><button onClick={() => handleViewChange('/')} className="hover:text-white transition-colors">Generator</button></li>
                  <li><button onClick={() => handleViewChange('/dashboard')} className="hover:text-white transition-colors">Templates</button></li>
                  <li><button onClick={() => handleViewChange('/pricing')} className="hover:text-white transition-colors">Pricing</button></li>
                  <li><button onClick={() => handleViewChange('/enterprise')} className="hover:text-white transition-colors">Enterprise</button></li>
                </ul>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <h4 className="text-white font-bold text-sm uppercase tracking-widest">Resources</h4>
                <ul className="space-y-4 text-sm font-medium">
                  <li><button onClick={() => handleViewChange('/resources-blog')} className="hover:text-white transition-colors">Blog</button></li>
                  <li><button onClick={() => handleViewChange('/resources-case-studies')} className="hover:text-white transition-colors">Case Studies</button></li>
                  <li><button onClick={() => handleViewChange('/resources-guide')} className="hover:text-white transition-colors">Founder's Guide</button></li>
                  <li><button onClick={() => handleViewChange('/resources-help')} className="hover:text-white transition-colors">Help Center</button></li>
                </ul>
              </div>

              {/* Newsletter Column */}
              <div className="lg:col-span-4 space-y-6">
                <h4 className="text-white font-bold text-sm uppercase tracking-widest">Stay Ahead</h4>
                <p className="text-slate-400 text-sm">Get the latest AI product trends delivered to your inbox weekly.</p>
                <form className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                  />
                  <button className="bg-white text-slate-900 px-4 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors">
                    <ArrowRight size={18} />
                  </button>
                </form>
              </div>

            </div>

            <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <p>© 2024 LaunchPact AI Inc. All rights reserved.</p>
              <div className="flex gap-8">
                <button onClick={() => handleViewChange('/legal-privacy')} className="hover:text-white transition-colors">Privacy Policy</button>
                <button onClick={() => handleViewChange('/legal-terms')} className="hover:text-white transition-colors">Terms of Service</button>
                <button className="hover:text-white transition-colors">Cookie Settings</button>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

const App: React.FC = () => (
  <NotificationProvider>
    <Router>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </Router>
  </NotificationProvider>
);

export default App;
