
export interface Feature {
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface Competitor {
  name: string;
  strength: string;
  weakness: string;
}

export interface TechStack {
  frontend: string;
  backend: string;
  database: string;
  deployment: string;
  extras: string[];
}

export interface RoadmapPhase {
  name: string;
  timeline: string;
  keyDeliverables: string[];
}

export interface ViabilityAnalysis {
  score: number; // 0 to 100
  saturationAnalysis: string;
  pivotSuggestion: string;
}

export interface LockedDecision {
  id: string;
  category: 'Tech' | 'Feature' | 'Market' | 'Strategy';
  choice: string;
  reason: string; // "Why This?"
  timestamp: string;
}

export interface ExecutionTask {
  id: string;
  phase: string;
  task: string;
  timeEstimate: string;
  outcome: string;
  isCompleted: boolean;
  assigneeId?: string;
  assigneeName?: string;
}

export interface TimelineSimulation {
  targetMonths: number;
  feasible: boolean;
  cutsRequired: string[];
  riskFactor: 'Low' | 'Medium' | 'High' | 'Critical';
  adjustedRoadmapSuggestion: string;
}

export interface ProductBlueprint {
  productName: string;
  tagline: string;
  ideaSummary: string;
  problemStatement: string;
  usp: string;
  painPoints: string[];
  domainSuggestions: string[];
  marketAnalysis: {
    targetAudience: string;
    marketGap: string;
    potentialSize: string;
  };
  viability: ViabilityAnalysis;
  competitors: Competitor[];
  monetizationStrategy: string[];
  risksAndAssumptions: string[];
  mvpFeatures: Feature[];
  techStack: TechStack;
  roadmap: RoadmapPhase[];
  maintenanceStrategy: string;
  sources?: string[];
}

export interface GuidedProgress {
  currentStepId: string;
  completedSteps: string[];
  selections: Record<string, any>;
}

export interface Feedback {
  isPositive: boolean;
  reason?: string;
  timestamp: string;
}

export interface Project {
  id: string;
  rawIdea: string;
  blueprint: ProductBlueprint;
  createdAt: string;
  niche: string;
  guidedProgress?: GuidedProgress;
  feedback?: Feedback;
  lockedDecisions: LockedDecision[]; // New: Decision Locking
  executionPlan?: ExecutionTask[]; // New: Checklist Engine
  timelineSimulation?: TimelineSimulation; // New: Timeline Sim
}

export interface Achievement {
  id: string;
  title: string;
  icon: string;
  unlocked: boolean;
  description: string;
}

export interface Template {
  id: string;
  title: string;
  description: string;
  icon: string;
  prompt: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface UserStats {
  loginStreak: number;
  lastLogin: string;
  xp: number;
  unlockedAchievements: string[];
  longestStreak?: number;
  streakMultiplier?: number;
  lastActiveDate?: string;
}

// === NEW: Daily Task System ===

export interface ToolRecommendation {
  name: string;
  url: string;
  description: string;
  category: string;
}

export interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface DailyTask {
  id: string;
  title: string;
  description: string;
  phase: 'Research' | 'Design' | 'Development' | 'Testing' | 'Marketing' | 'Launch';
  estimatedTime: string;
  recommendedTools: ToolRecommendation[];
  resources: { name: string; url: string }[];
  subTasks: SubTask[];
  aiGuidancePrompt: string;
  isCompleted: boolean;
  completedAt?: string;
  xpReward: number;
  dayNumber: number; // Day 1, Day 2, etc.
  assigneeId?: string;
  assigneeName?: string;
}

export interface MilestoneBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: 'Prototype' | 'MVP' | 'Beta' | 'Launch' | 'Growth';
  requiredProgress: number; // 0-100 percentage
  unlockedAt?: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  streakMultiplier: number; // 1.0, 1.5, 2.0, etc.
  freezesAvailable: number; // Streak freeze count
  freezeUsedThisWeek: boolean;
}

// === NEW: Team Collaboration System ===

export type TeamMemberRole =
  | 'founder'           // Creator of the plan, full control
  | 'co-founder'        // Equal decision-making power, approval required
  | 'technical-lead'    // Technical decisions, approval required
  | 'designer'          // Design decisions, approval optional
  | 'developer'         // Implementation, approval optional
  | 'marketer'          // Marketing decisions, approval optional
  | 'advisor'           // Consultant, approval optional
  | 'team-member';      // General member, approval optional

export interface TeamMember {
  id: string;
  user_id?: string; // Added for chat functionality
  name: string;
  email: string;
  expertise: string; // e.g., "Frontend Developer", "UI/UX Designer", "Growth Marketing"
  role: TeamMemberRole;
  approvalRequired: boolean; // Based on role - founder/co-founder/technical-lead require approval
  hasApproved: boolean;
  approvedAt?: string;
  invitedAt: string;
  joinedAt?: string;
  inviteToken?: string;
}

export interface TeamSetup {
  setupType: 'solo' | 'team';
  teamSize: number;
  members: TeamMember[];
  allRequiredApproved: boolean; // Only members with approvalRequired=true need to approve
  createdBy: string; // user ID/email of person who created the plan
  createdByName: string;
}

export interface LockedPlan {
  id: string;
  blueprint: ProductBlueprint;
  executionPlan: ExecutionTask[];
  timeline: TimelineSimulation;
  dailyTasks: DailyTask[];
  lockedAt: string;
  startDate: string;
  targetLaunchDate: string;
  currentProgress: number; // 0-100
  completedTasksCount: number;
  totalTasksCount: number;
  currentDayNumber?: number;
  teamSetup: TeamSetup; // NEW: Team collaboration data
  canLock: boolean; // true if solo OR all required approvals received
}

export interface JourneyState {
  stage: 'blueprint' | 'planning' | 'locked' | 'executing' | 'launched';
  hasLockedPlan: boolean;
  lockedPlan?: LockedPlan;
  currentDayNumber: number;
  todaysTasks: DailyTask[];
}
