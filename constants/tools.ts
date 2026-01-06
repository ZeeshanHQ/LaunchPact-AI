// Tool Recommendations Database
export const TOOLS_DATABASE = {
    'Research': [
        { name: 'Perplexity AI', url: 'https://perplexity.ai', description: 'AI-powered research engine', category: 'Research' },
        { name: 'ChatGPT', url: 'https://chat.openai.com', description: 'General AI assistant', category: 'Research' },
        { name: 'Claude', url: 'https://claude.ai', description: 'Advanced AI for analysis', category: 'Research' },
        { name: 'Google Gemini', url: 'https://gemini.google.com', description: 'Google\'s AI assistant', category: 'Research' }
    ],
    'Design': [
        { name: 'Figma', url: 'https://figma.com', description: 'Professional design tool', category: 'Design' },
        { name: 'Google AI Studio', url: 'https://aistudio.google.com', description: 'AI-powered prototyping', category: 'Design' },
        { name: 'Lovable', url: 'https://lovable.dev', description: 'AI web app builder', category: 'Design' },
        { name: 'v0.dev', url: 'https://v0.dev', description: 'Vercel AI UI generator', category: 'Design' },
        { name: 'Uizard', url: 'https://uizard.io', description: 'AI design tool', category: 'Design' }
    ],
    'Development': [
        { name: 'Cursor', url: 'https://cursor.sh', description: 'AI code editor', category: 'Development' },
        { name: 'Antigravity', url: 'https://antigravity.dev', description: 'Google\'s AI coding assistant', category: 'Development' },
        { name: 'Bolt.new', url: 'https://bolt.new', description: 'StackBlitz AI builder', category: 'Development' },
        { name: 'Replit', url: 'https://replit.com', description: 'Online IDE with AI', category: 'Development' },
        { name: 'GitHub Copilot', url: 'https://github.com/features/copilot', description: 'AI pair programmer', category: 'Development' }
    ],
    'Backend': [
        { name: 'Supabase', url: 'https://supabase.com', description: 'Open source Firebase alternative', category: 'Backend' },
        { name: 'Railway', url: 'https://railway.app', description: 'Deploy backend instantly', category: 'Backend' },
        { name: 'Vercel', url: 'https://vercel.com', description: 'Deploy full-stack apps', category: 'Backend' },
        { name: 'Render', url: 'https://render.com', description: 'Cloud hosting platform', category: 'Backend' }
    ],
    'Testing': [
        { name: 'Playwright', url: 'https://playwright.dev', description: 'E2E testing framework', category: 'Testing' },
        { name: 'Vitest', url: 'https://vitest.dev', description: 'Fast unit testing', category: 'Testing' },
        { name: 'Postman', url: 'https://postman.com', description: 'API testing tool', category: 'Testing' }
    ],
    'Marketing': [
        { name: 'Canva', url: 'https://canva.com', description: 'Design marketing materials', category: 'Marketing' },
        { name: 'Buffer', url: 'https://buffer.com', description: 'Social media scheduler', category: 'Marketing' },
        { name: 'Mailchimp', url: 'https://mailchimp.com', description: 'Email marketing', category: 'Marketing' },
        { name: 'Beehiiv', url: 'https://beehiiv.com', description: 'Newsletter platform', category: 'Marketing' }
    ],
    'Launch': [
        { name: 'Product Hunt', url: 'https://producthunt.com', description: 'Launch platform', category: 'Launch' },
        { name: 'Hacker News', url: 'https://news.ycombinator.com', description: 'Tech community', category: 'Launch' },
        { name: 'Reddit', url: 'https://reddit.com', description: 'Community platform', category: 'Launch' },
        { name: 'Twitter/X', url: 'https://twitter.com', description: 'Social announcement', category: 'Launch' },
        { name: 'LinkedIn', url: 'https://linkedin.com', description: 'Professional network', category: 'Launch' }
    ]
};

import { MilestoneBadge } from '../types';

// Milestone Badges Configuration
export const MILESTONE_BADGES: MilestoneBadge[] = [
    // Tier 1: Prototype (0-20%)
    { id: 'first-blueprint', title: 'First Blueprint', description: 'Created your first product blueprint', icon: '🎯', tier: 'Prototype', requiredProgress: 0 },
    { id: 'plan-locked', title: 'Plan Locked', description: 'Locked your execution plan', icon: '🔒', tier: 'Prototype', requiredProgress: 5 },
    { id: 'first-task', title: 'First Task', description: 'Completed your first daily task', icon: '⚡', tier: 'Prototype', requiredProgress: 10 },
    { id: 'week-one', title: 'Week One', description: 'Survived the first week', icon: '📅', tier: 'Prototype', requiredProgress: 15 },

    // Tier 2: MVP (20-50%)
    { id: 'designer', title: 'Designer', description: 'Completed all UI/UX tasks', icon: '🎨', tier: 'MVP', requiredProgress: 25 },
    { id: 'developer', title: 'Developer', description: 'Completed first development sprint', icon: '💻', tier: 'MVP', requiredProgress: 35 },
    { id: 'researcher', title: 'Researcher', description: 'Completed market research phase', icon: '🔍', tier: 'MVP', requiredProgress: 45 },

    // Tier 3: Beta (50-80%)
    { id: 'feature-complete', title: 'Feature Complete', description: 'All MVP features implemented', icon: '🚀', tier: 'Beta', requiredProgress: 55 },
    { id: 'tester', title: 'Tester', description: 'Completed testing phase', icon: '🧪', tier: 'Beta', requiredProgress: 65 },
    { id: 'deployed', title: 'Deployed', description: 'First deployment successful', icon: '📱', tier: 'Beta', requiredProgress: 75 },

    // Tier 4: Launch (80-95%)
    { id: 'pre-launch', title: 'Pre-Launch', description: 'Marketing materials ready', icon: '🌟', tier: 'Launch', requiredProgress: 85 },
    { id: 'launched', title: 'Launched', description: 'Product is live!', icon: '🎉', tier: 'Launch', requiredProgress: 90 },
    { id: 'first-users', title: 'First Users', description: 'Got your first 10 users', icon: '👥', tier: 'Launch', requiredProgress: 95 },

    // Tier 5: Growth (95-100%)
    { id: 'growing', title: 'Growing', description: 'Reached 100+ users', icon: '📈', tier: 'Growth', requiredProgress: 97 },
    { id: 'revenue', title: 'Revenue', description: 'First paying customer', icon: '💰', tier: 'Growth', requiredProgress: 99 },
    { id: 'founder', title: 'Founder', description: 'Completed the full journey', icon: '🏆', tier: 'Growth', requiredProgress: 100 }
];

export default { TOOLS_DATABASE, MILESTONE_BADGES };
