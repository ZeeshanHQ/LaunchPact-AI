import React, { useState, useEffect } from 'react';
import { ProductBlueprint, ExecutionTask, TimelineSimulation, LockedPlan, DailyTask, TeamMember, TeamSetup as TeamSetupType } from '../types';
import { generateExecutionPlan, simulateTimeline } from '../services/geminiService';
import { supabase } from '../services/supabase';
import TeamSetup from './TeamSetup';
import ExecutionChat from './ExecutionChat';
import ForgeAssistant from './ForgeAssistant';
import {
    Rocket, CheckCircle2, Clock, AlertTriangle, Lock, Sparkles,
    ArrowRight, ArrowLeft, Zap, Target, Calendar, ListChecks, Users, MessageSquare, RefreshCw
} from 'lucide-react';

interface LaunchPlannerProps {
    blueprint: ProductBlueprint;
    initialState?: {
        id: string;
        executionPlan: ExecutionTask[];
        timeline: TimelineSimulation;
        teamSetup: TeamSetupType;
    };
    onLockPlan: (lockedPlan: LockedPlan) => void;
    onExit: () => void;
}

const LaunchPlanner: React.FC<LaunchPlannerProps> = ({ blueprint, initialState, onLockPlan, onExit }) => {
    const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(initialState ? 4 : 1);
    const [isLoading, setIsLoading] = useState(!initialState);
    const [planId] = useState(initialState?.id || localStorage.getItem('launch_planner_draft_id') || Math.random().toString(36).substring(7));

    // Initialize with props or localStorage if available
    const [executionPlan, setExecutionPlan] = useState<ExecutionTask[]>(() => {
        if (initialState) return initialState.executionPlan;
        const saved = localStorage.getItem('launch_planner_execution');
        return saved ? JSON.parse(saved) : [];
    });
    const [timeline, setTimeline] = useState<TimelineSimulation | null>(() => {
        if (initialState) return initialState.timeline;
        const saved = localStorage.getItem('launch_planner_timeline');
        return saved ? JSON.parse(saved) : null;
    });
    const [teamSetup, setTeamSetup] = useState<TeamSetupType>(() => {
        if (initialState) return initialState.teamSetup;
        const saved = localStorage.getItem('launch_planner_team');
        return saved ? JSON.parse(saved) : {
            setupType: 'solo',
            teamSize: 1,
            members: [],
            allRequiredApproved: true,
            createdBy: '',
            createdByName: ''
        };
    });

    // Persistence Effect
    useEffect(() => {
        if (!initialState) {
            localStorage.setItem('launch_planner_step', currentStep.toString());
            localStorage.setItem('launch_planner_execution', JSON.stringify(executionPlan));
            localStorage.setItem('launch_planner_timeline', JSON.stringify(timeline));
            localStorage.setItem('launch_planner_team', JSON.stringify(teamSetup));
            localStorage.setItem('launch_planner_draft_id', planId);
        }
    }, [currentStep, executionPlan, timeline, teamSetup, planId, initialState]);

    // Restore step on mount if not initial state
    useEffect(() => {
        if (!initialState) {
            const savedStep = localStorage.getItem('launch_planner_step');
            if (savedStep) setCurrentStep(parseInt(savedStep) as any);
        }
    }, []);

    const [isCoFounderOpen, setIsCoFounderOpen] = useState(false);
    const [simMonths, setSimMonths] = useState(3);

    // Team Setup State
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Team Approval Status Logic
    const [teamStatus, setTeamStatus] = useState<TeamMember[]>(initialState?.teamSetup.members || []);
    const [currentUserEmail, setCurrentUserEmail] = useState<string>('');

    // Initial load effect
    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.email) setCurrentUserEmail(user.email);
        };
        checkUser();

        if (!initialState) {
            loadExecutionPlan();
        } else {
            // If resuming, fetch team status from DB immediately
            fetchTeamStatus();
        }
    }, [initialState]);

    const loadExecutionPlan = async () => {
        setIsLoading(true);
        try {
            const tasks = await generateExecutionPlan(blueprint);
            setExecutionPlan(Array.isArray(tasks) ? tasks : []);
        } catch (error) {
            console.error('Failed to load execution plan:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Run timeline simulation
    const runSimulation = async () => {
        setIsLoading(true);
        try {
            const result = await simulateTimeline(blueprint, simMonths);
            setTimeline(result);
        } catch (error) {
            console.error('Timeline simulation failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Step 3: Handle Team Setup
    const handleTeamSetupComplete = async (setupType: 'solo' | 'team', members: TeamMember[]) => {
        const { data: { user } } = await supabase.auth.getUser();
        const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Founder';
        const userEmail = user?.email || '';

        const setup: TeamSetupType = {
            setupType,
            teamSize: setupType === 'solo' ? 1 : members.length + 1,
            members: setupType === 'solo' ? [] : members,
            allRequiredApproved: setupType === 'solo',
            createdBy: userEmail,
            createdByName: userName
        };

        setTeamSetup(setup);

        // SOLO MODE: Continue to Lock Step
        if (setupType === 'solo') {
            setCurrentStep(4);
            return;
        }

        // TEAM MODE: Save plan, Send Invites, and Redirect to Dashboard
        try {
            console.log('[TEAM SETUP] Starting team setup process...');
            console.log('[TEAM SETUP] Plan ID:', planId);
            console.log('[TEAM SETUP] Team members:', members.length);

            // 1. Save Plan to DB (via Backend Proxy to bypass RLS)
            console.log('[TEAM SETUP] Calling /api/plans/save...');
            const saveResponse = await fetch('/api/plans/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planId,
                    productName: blueprint.productName,
                    blueprint,
                    executionPlan,
                    timeline,
                    teamSetup: setup,
                    userId: user?.id,
                    status: 'draft'
                })
            });

            console.log('[TEAM SETUP] Save response status:', saveResponse.status);

            if (!saveResponse.ok) {
                const errorData = await saveResponse.json().catch(() => ({ error: 'Unknown error' }));
                console.error('[TEAM SETUP] Save failed:', errorData);
                throw new Error(`Failed to save plan: ${errorData.error || saveResponse.statusText} (${saveResponse.status})`);
            }

            const saveData = await saveResponse.json();
            console.log('[TEAM SETUP] ✅ Plan saved successfully:', saveData);

            // 2. Send Invites via API
            if (members.length > 0) {
                console.log('[TEAM SETUP] Sending team invitations...');
                const inviteResponse = await fetch('/api/team/send-invites', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        planId,
                        productName: blueprint.productName,
                        teamMembers: members,
                        createdByName: userName,
                        createdByEmail: userEmail
                    })
                });

                if (!inviteResponse.ok) {
                    const errorData = await inviteResponse.json().catch(() => ({ error: 'Unknown error' }));
                    console.error('[TEAM SETUP] Invite failed:', errorData);
                    // Don't throw here, just log - invites can be resent later
                    alert(`Warning: Plan saved but invitations failed to send: ${errorData.error}`);
                } else {
                    const inviteData = await inviteResponse.json();
                    console.log('[TEAM SETUP] ✅ Invitations sent:', inviteData);
                }
            }

            // 3. Clear local storage before redirect
            console.log('[TEAM SETUP] Clearing local storage...');
            localStorage.removeItem('launch_planner_step');
            localStorage.removeItem('launch_planner_execution');
            localStorage.removeItem('launch_planner_timeline');
            localStorage.removeItem('launch_planner_team');
            localStorage.removeItem('launch_planner_draft_id');

            // 4. Redirect to Dashboard
            console.log('[TEAM SETUP] ✅ Redirecting to team management...');
            window.location.href = '/team';

        } catch (error: any) {
            console.error('[TEAM SETUP] ❌ Failed to process team setup:', error);
            const errorMessage = error.message || 'Unknown error occurred';
            alert(`Failed to save team setup:\n\n${errorMessage}\n\nPlease check:\n1. Is the backend server running on port 3000?\n2. Check browser console for details\n3. Try again or contact support`);
        }
    };

    // Step 4: Lock plan and generate daily tasks
    const handleLockPlan = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/generate-daily-tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    executionPlan,
                    timeline: timeline || { targetMonths: simMonths, feasible: true, cutsRequired: [], riskFactor: 'Medium', adjustedRoadmapSuggestion: '' }
                })
            });

            const { dailyTasks } = await response.json();

            const lockedPlan: LockedPlan = {
                id: planId,
                blueprint,
                executionPlan,
                timeline: timeline || { targetMonths: simMonths, feasible: true, cutsRequired: [], riskFactor: 'Medium', adjustedRoadmapSuggestion: '' },
                dailyTasks: dailyTasks || [],
                lockedAt: new Date().toISOString(),
                startDate: new Date().toISOString(),
                targetLaunchDate: new Date(Date.now() + simMonths * 30 * 24 * 60 * 60 * 1000).toISOString(),
                currentProgress: 0,
                completedTasksCount: 0,
                totalTasksCount: dailyTasks?.length || 0,
                teamSetup: teamSetup!,
                canLock: teamSetup?.setupType === 'solo' || teamSetup?.allRequiredApproved || false,
                mode: teamSetup?.setupType || 'solo'
            };

            onLockPlan(lockedPlan);

            // Clear local storage on lock
            localStorage.removeItem('launch_planner_step');
            localStorage.removeItem('launch_planner_execution');
            localStorage.removeItem('launch_planner_timeline');
            localStorage.removeItem('launch_planner_team');
            localStorage.removeItem('launch_planner_draft_id');
        } catch (error) {
            console.error('Failed to lock plan:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const canProceed = () => {
        if (currentStep === 1) return executionPlan.length > 0;
        if (currentStep === 2) return timeline !== null;
        if (currentStep === 3) return teamSetup !== null;
        return true;
    };


    useEffect(() => {
        if (currentStep === 4 && teamSetup?.setupType === 'team') {
            fetchTeamStatus();
            // Poll for updates
            const interval = setInterval(fetchTeamStatus, 5000);
            return () => clearInterval(interval);
        }
    }, [currentStep, teamSetup]);

    const fetchTeamStatus = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.email) setCurrentUserEmail(user.email);

            const response = await fetch(`/api/team/members/${planId}`);
            const data = await response.json();
            if (data.members) {
                const mappedMembers: TeamMember[] = data.members.map((m: any) => ({
                    id: m.id,
                    name: m.name,
                    email: m.email,
                    expertise: m.expertise,
                    role: m.role,
                    approvalRequired: m.approval_required,
                    hasApproved: m.has_approved,
                    approvedAt: m.approved_at,
                    invitedAt: m.invited_at,
                    joinedAt: m.joined_at
                }));
                setTeamStatus(mappedMembers);
            }
        } catch (error) {
            console.error('Failed to fetch team status', error);
        }
    };

    const handleApprovePlan = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user?.email) return;

            await fetch(`/api/team/approve/${planId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userEmail: user.email })
            });
            fetchTeamStatus();
        } catch (error) {
            console.error('Failed to approve plan', error);
        }
    };

    const isFullyApproved = teamSetup?.setupType === 'solo' ||
        (teamStatus.filter(m => m.approvalRequired).every(m => m.hasApproved));

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 pt-24 pb-20 px-6">
            <div className="max-w-7xl mx-auto flex gap-6 items-start">

                {/* Left Sidebar: Team & AI Chat */}
                {/* Left Sidebar removed as per request */}

                <div className="flex-1">

                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-lg shadow-indigo-100 mb-6">
                            <Rocket className="text-indigo-600" size={24} />
                            <h1 className="text-2xl font-black uppercase italic text-slate-900">Launch Planner</h1>
                        </div>
                        <p className="text-slate-600 font-medium text-lg">Finalize your execution strategy before locking in</p>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-center gap-4 mb-12">
                        {[1, 2, 3, 4].map((step) => (
                            <div key={step} className="flex items-center gap-4">
                                <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all ${currentStep === step
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                    : currentStep > step
                                        ? 'bg-green-500 text-white'
                                        : 'bg-white text-slate-400 border border-slate-200'
                                    }`}>
                                    {currentStep > step ? (
                                        <CheckCircle2 size={20} />
                                    ) : (
                                        <span className="font-black text-lg">{step}</span>
                                    )}
                                    <span className="font-bold text-sm uppercase tracking-wider">
                                        {step === 1 ? 'Execution' : step === 2 ? 'Timeline' : step === 3 ? 'Team' : 'Lock'}
                                    </span>
                                </div>
                                {step < 4 && (
                                    <ArrowRight size={20} className="text-slate-300" />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Step Content */}
                    <div className="bg-white rounded-[3rem] p-12 shadow-2xl border border-slate-100 min-h-[500px]">

                        {/* Step 1: Execution Plan */}
                        {currentStep === 1 && (
                            <div className="space-y-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-4 bg-indigo-50 rounded-2xl">
                                            <ListChecks className="text-indigo-600" size={32} />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black uppercase italic text-slate-900">Review Execution Plan</h2>
                                            <p className="text-slate-500 font-medium mt-1">Your 10-step MVP action checklist</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={loadExecutionPlan}
                                        className="flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 transition-colors"
                                    >
                                        <Zap size={14} className="fill-indigo-600" /> Regenerate
                                    </button>
                                </div>

                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center h-64 space-y-4">
                                        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Generating action plan...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4 relative pb-20">
                                        {executionPlan.map((task, i) => (
                                            <div key={i} className="flex items-start gap-5 p-6 rounded-[1.5rem] border border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all bg-slate-50/50">
                                                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-sm shrink-0">
                                                    {i + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">{task.phase}</span>
                                                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-100">
                                                            <Clock size={12} /> {task.timeEstimate}
                                                        </span>
                                                    </div>
                                                    <h4 className="text-lg font-bold text-slate-900 mb-1">{task.task}</h4>
                                                    <p className="text-sm text-slate-500">Outcome: <span className="text-slate-700 font-semibold">{task.outcome}</span></p>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Floating Chat Integration */}
                                        <button
                                            onClick={() => setIsChatOpen(!isChatOpen)}
                                            className="fixed bottom-10 right-10 p-5 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all z-[100] group flex items-center gap-2 border-[4px] border-white/20"
                                            title="Modify plan with AI"
                                        >
                                            <Sparkles size={24} className={isChatOpen ? 'rotate-90' : ''} />
                                            <span className="font-black uppercase tracking-wider text-xs hidden group-hover:block transition-all">Modify Plan</span>
                                        </button>

                                        {isChatOpen && (
                                            <ExecutionChat
                                                productName={blueprint.productName}
                                                currentPlan={executionPlan}
                                                onUpdatePlan={setExecutionPlan}
                                                onClose={() => setIsChatOpen(false)}
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 2: Timeline */}
                        {currentStep === 2 && (
                            <div className="space-y-8">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="p-4 bg-orange-50 rounded-2xl">
                                        <Calendar className="text-orange-600" size={32} />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black uppercase italic text-slate-900">Set Your Timeline</h2>
                                        <p className="text-slate-500 font-medium mt-1">How fast can you launch?</p>
                                    </div>
                                </div>

                                {!timeline ? (
                                    <div className="max-w-xl mx-auto space-y-8">
                                        <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-4">Target Months to Launch</label>
                                            <div className="flex items-center justify-center gap-4">
                                                <button onClick={() => setSimMonths(Math.max(1, simMonths - 1))} className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100">-</button>
                                                <span className="text-6xl font-black text-indigo-600 w-32 text-center">{simMonths}</span>
                                                <button onClick={() => setSimMonths(simMonths + 1)} className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100">+</button>
                                            </div>
                                        </div>

                                        <button
                                            onClick={runSimulation}
                                            disabled={isLoading}
                                            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl disabled:opacity-50"
                                        >
                                            {isLoading ? 'Simulating Reality...' : 'Run Simulation'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className={`p-8 rounded-[2rem] text-white flex items-center gap-6 ${timeline.feasible ? 'bg-green-500 shadow-green-200' : 'bg-red-500 shadow-red-200'} shadow-2xl`}>
                                            <div className="bg-white/20 p-4 rounded-2xl">
                                                {timeline.feasible ? <CheckCircle2 size={40} /> : <AlertTriangle size={40} />}
                                            </div>
                                            <div>
                                                <h4 className="text-3xl font-black uppercase italic mb-1">{timeline.feasible ? 'Feasible Timeline' : 'High Risk Alert'}</h4>
                                                <p className="font-bold opacity-90 text-lg">Risk Factor: {timeline.riskFactor}</p>
                                            </div>
                                        </div>

                                        {!timeline.feasible && timeline.cutsRequired.length > 0 && (
                                            <div className="bg-red-50 p-8 rounded-[2rem] border border-red-100">
                                                <h5 className="font-black text-red-600 uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                                                    <AlertTriangle size={14} /> Required Scope Cuts
                                                </h5>
                                                <ul className="space-y-3">
                                                    {timeline.cutsRequired.map((cut, i) => (
                                                        <li key={i} className="flex items-center gap-3 text-red-800 font-bold bg-white p-3 rounded-xl border border-red-100">
                                                            <div className="w-2 h-2 bg-red-500 rounded-full"></div> {cut}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                                            <h5 className="font-black text-slate-500 uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                                                <Target size={14} /> Adjusted Roadmap
                                            </h5>
                                            <p className="text-slate-700 font-medium leading-relaxed">{timeline.adjustedRoadmapSuggestion}</p>
                                        </div>

                                        <button
                                            onClick={() => setTimeline(null)}
                                            className="text-slate-400 font-bold hover:text-slate-900 uppercase text-xs tracking-widest flex items-center gap-2 mx-auto"
                                        >
                                            Reset Simulation
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 3: Team Setup */}
                        {currentStep === 3 && (
                            <TeamSetup
                                productName={blueprint.productName}
                                onComplete={handleTeamSetupComplete}
                                onBack={() => setCurrentStep(2)}
                            />
                        )}

                        {/* Step 4: Lock & Confirm (Team Enabled) */}
                        {currentStep === 4 && (
                            <div className="space-y-8 text-center max-w-2xl mx-auto">
                                <div className="p-4 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl inline-block">
                                    <Lock className="text-indigo-600" size={64} />
                                </div>

                                <div>
                                    <h2 className="text-4xl font-black uppercase italic text-slate-900 mb-4">
                                        {isFullyApproved ? "Ready to Lock?" : "Approvals Pending"}
                                    </h2>
                                    <p className="text-slate-600 font-medium text-lg leading-relaxed">
                                        {teamSetup?.setupType === 'team'
                                            ? "Review team approvals before locking the execution plan."
                                            : "Once locked, LaunchPact AI will generate your personalized daily task system."}
                                    </p>
                                </div>

                                {/* Team Approval Dashboard */}
                                {teamSetup?.setupType === 'team' && (
                                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden text-left">
                                        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                                            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-widest">Team Approvals</h3>
                                            <button onClick={fetchTeamStatus} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                                                <RefreshCw size={14} className="text-slate-500" />
                                            </button>
                                        </div>
                                        <div className="divide-y divide-slate-100">
                                            {teamStatus.map((member, i) => (
                                                <div key={i} className="p-4 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${member.hasApproved ? 'bg-green-100 text-green-700' :
                                                            member.approvalRequired ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'
                                                            }`}>
                                                            {member.hasApproved ? <CheckCircle2 size={16} /> : member.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900">{member.name}</p>
                                                            <p className="text-xs text-slate-500 uppercase tracking-wider">{member.role}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {member.approvalRequired && (
                                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${member.hasApproved ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                                                                }`}>
                                                                {member.hasApproved ? 'Approved' : 'Required'}
                                                            </span>
                                                        )}
                                                        {member.email === currentUserEmail && !member.hasApproved && (
                                                            <button
                                                                onClick={handleApprovePlan}
                                                                className="text-xs font-bold bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                                                            >
                                                                Approve
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 text-left space-y-4">
                                    <h3 className="font-black text-slate-900 uppercase text-sm tracking-widest mb-4">Plan Summary</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500 font-medium">Total Tasks:</span>
                                            <span className="font-black text-slate-900">{executionPlan.length} steps</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500 font-medium">Target Timeline:</span>
                                            <span className="font-black text-slate-900">{simMonths} months</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleLockPlan}
                                    disabled={isLoading || !isFullyApproved}
                                    className="w-full py-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-black text-xl uppercase tracking-widest hover:shadow-2xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Locking Plan...
                                        </>
                                    ) : !isFullyApproved ? (
                                        <>
                                            <Lock size={24} />
                                            Waiting for Approvals...
                                        </>
                                    ) : (
                                        <>
                                            <Lock size={24} />
                                            Lock My Plan & Start Building
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between items-center mt-8">
                        <button
                            onClick={() => currentStep === 1 ? onExit() : setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3 | 4)}
                            className="flex items-center gap-2 px-6 py-3 text-slate-600 hover:text-slate-900 font-bold transition-colors"
                        >
                            <ArrowLeft size={20} />
                            {currentStep === 1 ? 'Back to Blueprint' : 'Previous Step'}
                        </button>

                        {currentStep < 4 && (
                            <button
                                onClick={() => setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3 | 4)}
                                disabled={!canProceed()}
                                className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next Step
                                <ArrowRight size={20} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LaunchPlanner;
