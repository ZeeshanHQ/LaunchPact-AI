import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: '.env' });

const app = express();
const PORT = process.env.PORT || 3000;

// CORS Configuration with logging
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://launchpact-ai.vercel.app',
    'https://launchpact-ai.onrender.com'
  ],
  credentials: true
}));
app.use(express.json());

// Request Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// --- Configuration ---
const OPENROUTER_API_KEY = process.env.VITE_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'noreply@cavexa.online';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const resend = new Resend(RESEND_API_KEY);
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Updated models list with reliable, working models
// Priority: Free models first, then paid fallbacks
const MODELS = [
  // TIER 1: Most reliable free models
  'google/gemini-flash-1.5',                   // Most reliable free model
  'meta-llama/llama-3.2-3b-instruct:free',    // Fast, reliable free
  'mistralai/mistral-7b-instruct:free',       // Solid free option
  'qwen/qwen-2.5-7b-instruct:free',           // Good free alternative

  // TIER 2: Experimental free models (may have rate limits)
  'google/gemini-2.0-flash-exp:free',         // Experimental but fast
  'meta-llama/llama-3.3-70b-instruct:free',   // Powerful if available

  // TIER 3: Paid models (fallback if free models fail)
  'google/gemini-pro-1.5',                    // Reliable paid option
  'anthropic/claude-3-haiku',                  // Fast paid fallback
  'openai/gpt-3.5-turbo'                        // Ultimate fallback
];

console.log("================================================");
console.log("🔥 LAUNCHPACT AI BACKEND IGNITION SEQUENCE STARTED");
console.log("================================================");
console.log(`🔑 OpenRouter API Key: ${OPENROUTER_API_KEY ? 'LOADED ✓ (' + OPENROUTER_API_KEY.substring(0, 8) + '...)' : 'MISSING ✗'}`);
console.log(`📧 Resend API Key: ${RESEND_API_KEY ? 'LOADED ✓' : 'MISSING ✗'}`);
console.log(`📧 Sender Email: ${SENDER_EMAIL}`);
console.log(`🗄️  Supabase URL: ${SUPABASE_URL ? 'LOADED ✓' : 'MISSING ✗'}`);
console.log(`🔐 Supabase Service Key: ${SUPABASE_SERVICE_KEY ? 'LOADED ✓' : 'MISSING ✗'}`);
console.log(`🤖 Total Models Available: ${MODELS.length}`);
console.log(`   Primary: ${MODELS[0]}`);
console.log(`   Fallbacks: ${MODELS.slice(1).join(', ')}`);
console.log("================================================");
if (!OPENROUTER_API_KEY) {
  console.log("⚠️  WARNING: OPENROUTER_API_KEY is missing!");
  console.log("   AI features will not work. Set it in your .env file.");
  console.log("   Get a free key at: https://openrouter.ai");
}
console.log("================================================");

// --- Helper: JSON Repair ---
const repairJson = (jsonStr) => {
  if (!jsonStr) return "{}";
  let cleaned = jsonStr.replace(/```json/g, "").replace(/```/g, "").trim();
  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');

  if (firstBrace === -1 && firstBracket === -1) {
    // Attempt to wrap in braces if it looks like key-value pairs but missing outer braces
    if (cleaned.includes(':') && !cleaned.startsWith('{')) {
      cleaned = '{' + cleaned + '}';
    } else {
      return "{}";
    }
  }

  let startIndex = 0;
  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIndex = firstBrace;
    cleaned = cleaned.substring(startIndex);
    let openBraces = 0;
    let lastIndex = -1;
    for (let i = 0; i < cleaned.length; i++) {
      if (cleaned[i] === '{') openBraces++;
      if (cleaned[i] === '}') {
        openBraces--;
        if (openBraces === 0) {
          lastIndex = i + 1;
          break;
        }
      }
    }
    if (lastIndex !== -1) cleaned = cleaned.substring(0, lastIndex);
    else {
      // Truncated JSON fix
      let openCount = (cleaned.match(/\{/g) || []).length;
      let closeCount = (cleaned.match(/\}/g) || []).length;
      if (openCount > closeCount) cleaned += "}".repeat(openCount - closeCount);
    }
  } else if (firstBracket !== -1) {
    startIndex = firstBracket;
    cleaned = cleaned.substring(startIndex);
    let openBrackets = (cleaned.match(/\[/g) || []).length;
    let closeBrackets = (cleaned.match(/\]/g) || []).length;
    if (openBrackets > closeBrackets) cleaned += "]".repeat(openBrackets - closeBrackets);
  }
  return cleaned;
};

// --- Helper: Mission Support Mock Rescue ---
const getRescueExecutionPlan = (productName) => [
  { id: "1", phase: "Strategy", task: "Define Core UVP & Audience", timeEstimate: "2 days", outcome: "Startup foundation document", isCompleted: false },
  { id: "2", phase: "Research", task: "Analyze Top 3 Market Players", timeEstimate: "3 days", outcome: "Competitive analysis spreadsheet", isCompleted: false },
  { id: "3", phase: "Design", task: "Draft Primary UI Architecture", timeEstimate: "4 days", outcome: "Low-fidelity user flow diagram", isCompleted: false },
  { id: "4", phase: "Environment", task: "Setup Development Sandbox", timeEstimate: "1 day", outcome: "Working local workspace", isCompleted: false },
  { id: "5", phase: "Brand", task: "Identity & Visual Direction", timeEstimate: "2 days", outcome: "Style guide approved", isCompleted: false },
  { id: "6", phase: "Build", task: "Implementation of Landing Component", timeEstimate: "5 days", outcome: "CVP deployment ready", isCompleted: false },
  { id: "7", phase: "Intel", task: "AI Assistant Contextualization", timeEstimate: "3 days", outcome: "Smart prompt engineering", isCompleted: false },
  { id: "8", phase: "Market", task: "Acquire Beta Feedback Group", timeEstimate: "4 days", outcome: "10 initial beta users", isCompleted: false },
  { id: "9", phase: "Launch", task: "Production Environment Push", timeEstimate: "2 days", outcome: "Live site access", isCompleted: false },
  { id: "10", phase: "Growth", task: "Iterate Based on Real Usage", timeEstimate: "Long-term", outcome: "Phase 2 roadmap", isCompleted: false }
];

const getRescueDailyTasks = () => [
  { id: "r1", title: "Establish Mission Foundation", description: "Define the absolute niche you are targeting and why existing solutions fail them.", phase: "Deep Research", dayNumber: 1, isCompleted: false, xpReward: 100, subTasks: [{ id: "s1", title: "Niche narrow-down", isCompleted: false }] },
  { id: "r2", title: "Infrastructure Setup", description: "Initialize your project repository and core development stack configuration.", phase: "Setup", dayNumber: 1, isCompleted: false, xpReward: 100, subTasks: [{ id: "s2", title: "Repo initialization", isCompleted: false }] },
  { id: "r3", title: "Competitive Deep-Dive", description: "Identify one major competitor and list 3 specific feature gaps you will fill.", phase: "Intelligence", dayNumber: 1, isCompleted: false, xpReward: 100, subTasks: [{ id: "s3", title: "Gap analysis", isCompleted: false }] }
];

// --- Helper: Call OpenRouter with Fallback ---
const callOpenRouter = async (messages, schema = null, maxRetries = MODELS.length) => {
  // Validate API key first
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is missing. Please set it in your .env file.');
  }

  const isJson = !!schema;
  const allErrors = [];

  // If JSON is required, add instruction to system message
  if (isJson && messages[0]?.role === 'system') {
    messages[0].content += '\n\nCRITICAL: You MUST respond with ONLY valid JSON. No markdown, no code blocks, no explanations. Just pure JSON.';
  }

  for (let i = 0; i < MODELS.length; i++) {
    const model = MODELS[i];
    try {
      console.log(`   🤖 [${i + 1}/${MODELS.length}] Trying model: ${model}...`);

      const requestBody = {
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: isJson ? 4000 : 2000
      };

      // Only add response_format for models that definitely support it
      // Most free models don't support this, so we rely on prompt engineering
      const supportsJsonFormat = !model.includes('free') && !model.includes('mistral') && !model.includes('qwen');
      if (isJson && supportsJsonFormat) {
        requestBody.response_format = { type: "json_object" };
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout per model

      const startTime = Date.now();
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.VITE_APP_URL || 'http://localhost:3000',
          'X-Title': 'LaunchPact AI'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const duration = Date.now() - startTime;

      if (!response.ok) {
        let errorMsg = response.statusText;
        let errorDetails = {};
        try {
          const errorData = await response.json();
          errorMsg = errorData.error?.message || errorData.error?.type || errorMsg;
          errorDetails = errorData.error || {};
        } catch (e) {
          const text = await response.text().catch(() => '');
          errorMsg = text || errorMsg;
        }

        console.log(`   ⚠️ Model ${model} failed (${response.status}): ${errorMsg}`);
        if (errorDetails.code) {
          console.log(`      Error code: ${errorDetails.code}`);
        }
        allErrors.push(`${model} [${response.status}]: ${errorMsg}`);

        // If it's a rate limit, wait a bit before trying next model
        if (response.status === 429) {
          console.log(`   ⏳ Rate limited, waiting 2 seconds before next model...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        continue;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        console.log(`   ⚠️ Model ${model} returned empty content`);
        console.log(`      Full response:`, JSON.stringify(data, null, 2));
        allErrors.push(`${model}: Empty content`);
        continue;
      }

      console.log(`   ✅ Success with model: ${model} (${duration}ms)`);
      console.log(`      Response length: ${content.length} characters`);
      return content;

    } catch (error) {
      const isTimeout = error.name === 'AbortError';
      const errorType = isTimeout ? 'Timeout' : (error.message.includes('fetch') ? 'Network error' : 'Error');
      console.log(`   ⚠️ ${errorType} for ${model}: ${error.message}`);
      if (!isTimeout) {
        console.log(`      Stack: ${error.stack?.split('\n')[0]}`);
      }
      allErrors.push(`${model}: ${isTimeout ? 'Timeout (30s)' : error.message}`);

      // Small delay before trying next model
      if (i < MODELS.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }

  // Log all errors for debugging
  console.error('❌ All models failed. Detailed errors:');
  allErrors.forEach((err, idx) => {
    console.error(`   ${idx + 1}. ${err}`);
  });

  throw new Error(`All ${MODELS.length} AI models failed. Check logs above for details. Last errors: ${allErrors.slice(-3).join(' | ')}`);
};

// --- Routes ---

// 1. Health Check
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    provider: 'OpenRouter',
    apiKeyConfigured: !!OPENROUTER_API_KEY,
    primaryModel: MODELS[0],
    totalModels: MODELS.length,
    fallbackModels: MODELS.length - 1,
    time: new Date().toISOString()
  });
});

// 1.5. Test AI Connection
app.get('/api/test-ai', async (req, res) => {
  if (!OPENROUTER_API_KEY) {
    return res.status(500).json({
      error: 'API key not configured',
      message: 'Please set OPENROUTER_API_KEY in your .env file'
    });
  }

  try {
    console.log('🧪 Testing AI connection...');
    const testMessages = [
      {
        role: 'user',
        content: 'Say "Hello, LaunchPact AI is working!" in JSON format: {"message": "your response"}'
      }
    ];

    const response = await callOpenRouter(testMessages, true);
    const parsed = JSON.parse(repairJson(response));

    res.json({
      success: true,
      message: 'AI connection working!',
      response: parsed,
      modelsTested: 'All models available'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'AI connection failed',
      message: error.message,
      suggestion: 'Check your OPENROUTER_API_KEY and internet connection'
    });
  }
});

// 2. Enhance Prompt
app.post('/api/enhance-prompt', async (req, res) => {
  console.log(`✨ Request: Enhancing prompt...`);
  try {
    const { rawInput } = req.body;
    const messages = [
      {
        role: 'user',
        content: `You are LaunchPact AI. Rewrite this raw idea into a professional prompt: "${rawInput}". Max 3 sentences. Output ONLY the enhanced prompt, no explanations.`
      }
    ];

    const response = await callOpenRouter(messages, false);
    res.json({ text: response.trim() });
  } catch (error) {
    console.error("❌ Enhancement failed, using pass-through:", error.message);
    const { rawInput } = req.body;
    res.json({ text: rawInput });
  }
});

// 3. Generate Blueprint
app.post('/api/generate-blueprint', async (req, res) => {
  const { rawIdea } = req.body;

  console.log(`\n========================================`);
  console.log(`🚀 [${new Date().toISOString()}] Generate Blueprint Request Received`);
  console.log(`========================================`);

  if (!rawIdea || !rawIdea.trim()) {
    console.error(`❌ Error: rawIdea is missing or empty`);
    return res.status(400).json({ error: 'rawIdea is required' });
  }

  console.log(`📝 Raw Idea: "${rawIdea.slice(0, 100)}${rawIdea.length > 100 ? '...' : ''}"`);
  console.log(`📏 Length: ${rawIdea.length} characters`);

  try {
    const messages = [
      {
        role: 'system',
        content: `You are LaunchPack AI , a senior Co-Founder AI. You create detailed product blueprints in JSON format.

CRITICAL RULES:
1. You MUST respond with ONLY valid JSON - no markdown, no code blocks, no explanations
2. The JSON must match the exact structure provided
3. All string fields must be non-empty
4. Arrays must have at least 1 item
5. Numbers must be valid (score: 0-100)`
      },
      {
        role: 'user',
        content: `Create a detailed product blueprint for this startup idea: "${rawIdea}"

Be analytical, realistic, and specific. If the idea is generic, provide a unique angle.

Return ONLY valid JSON (no markdown, no code blocks) with this exact structure:
{
  "productName": "string",
  "tagline": "string",
  "ideaSummary": "string",
  "problemStatement": "string",
  "usp": "string",
  "painPoints": ["string", "string"],
  "domainSuggestions": ["string", "string"],
  "marketAnalysis": {
    "targetAudience": "string",
    "marketGap": "string",
    "potentialSize": "string"
  },
  "viability": {
    "score": 75,
    "saturationAnalysis": "string",
    "pivotSuggestion": "string"
  },
  "competitors": [
    {"name": "string", "strength": "string", "weakness": "string"}
  ],
  "monetizationStrategy": ["string", "string"],
  "risksAndAssumptions": ["string", "string"],
  "mvpFeatures": [
    {"title": "string", "description": "string", "priority": "High"}
  ],
  "techStack": {
    "frontend": "string",
    "backend": "string",
    "database": "string",
    "deployment": "string",
    "extras": ["string"]
  },
  "roadmap": [
    {"name": "string", "timeline": "string", "keyDeliverables": ["string"]}
  ],
  "maintenanceStrategy": "string"
}`
      }
    ];

    console.log(`   📤 Sending request to AI models...`);
    const response = await callOpenRouter(messages, true);

    console.log(`   🔧 Repairing JSON response...`);
    const repaired = repairJson(response);

    console.log(`   📥 Parsing JSON...`);
    const parsed = JSON.parse(repaired);

    // Validate required fields
    if (!parsed.productName || !parsed.ideaSummary) {
      throw new Error('Invalid blueprint: missing required fields');
    }

    console.log(`✅ Success: Blueprint forged for "${parsed.productName}"`);
    console.log(`📊 Blueprint Summary: ${parsed.ideaSummary?.slice(0, 80)}...`);
    console.log(`========================================\n`);
    res.json({ ...parsed, sources: [] });

  } catch (error) {
    console.error(`\n❌ [${new Date().toISOString()}] Error generating blueprint:`, error.message || error);
    console.error(`   Stack: ${error.stack || 'No stack trace'}`);
    console.log("🛠️ AI Failure -> Launching Professional Rescue Template (200 OK)");
    console.error("   Stack:", error.stack);

    // Return error with rescue template
    res.status(500).json({
      error: 'AI generation failed',
      message: error.message,
      rescue: {
        productName: rawIdea.slice(0, 30) + " Platform",
        tagline: "Transforming ideas into reality",
        ideaSummary: rawIdea || "An innovative solution to address market needs.",
        problemStatement: "Users face challenges that need better solutions.",
        usp: "Unique value proposition based on your idea.",
        painPoints: ["User friction", "Inefficient processes"],
        domainSuggestions: ["example.com"],
        marketAnalysis: {
          targetAudience: "Target users",
          marketGap: "Market opportunity",
          potentialSize: "Growing market"
        },
        viability: {
          score: 70,
          saturationAnalysis: "Moderate competition",
          pivotSuggestion: "Focus on core value proposition"
        },
        competitors: [{
          name: "Existing Solution",
          strength: "Market presence",
          weakness: "Limited features"
        }],
        monetizationStrategy: ["Subscription", "Freemium"],
        risksAndAssumptions: ["Market adoption", "Technical feasibility"],
        mvpFeatures: [{
          title: "Core Feature",
          description: "Essential functionality",
          priority: "High"
        }],
        techStack: {
          frontend: "React",
          backend: "Node.js",
          database: "PostgreSQL",
          deployment: "Cloud",
          extras: []
        },
        roadmap: [{
          name: "MVP",
          timeline: "3 months",
          keyDeliverables: ["Core features"]
        }],
        maintenanceStrategy: "Regular updates and monitoring.",
        sources: []
      }
    });
  }
});

// 4. Execution Plan
app.post('/api/execution-plan', async (req, res) => {
  console.log(`📋 Request: Generating Execution Plan...`);
  try {
    const { blueprint } = req.body;
    const messages = [
      {
        role: 'system',
        content: 'You are PNX Action Engine. You output strict JSON containing execution tasks.'
      },
      {
        role: 'user',
        content: `As PNX, create a 10-step MVP Execution Checklist for: ${blueprint.productName} using ${blueprint.techStack.frontend}.

Output ONLY JSON in this format:
{
  "tasks": [
    {
      "id": "1",
      "phase": "Planning",
      "task": "Define requirements",
      "timeEstimate": "2 days",
      "outcome": "Clear requirements doc",
      "isCompleted": false
    }
  ]
}`
      }
    ];

    const response = await callOpenRouter(messages, true);
    const parsed = JSON.parse(repairJson(response));
    res.json(parsed.tasks || parsed);
  } catch (error) {
    console.error("❌ Execution plan AI failed, launching rescue data:", error.message);
    const { blueprint } = req.body;
    res.json(getRescueExecutionPlan(blueprint?.productName || "Startup"));
  }
});

// 5. Timeline Simulation
app.post('/api/simulate-timeline', async (req, res) => {
  console.log(`⏱️ Request: Simulating Timeline...`);
  try {
    const { blueprint, months } = req.body;
    const messages = [
      {
        role: 'user',
        content: `User wants to launch "${blueprint.productName}" in ${months} months. Is this feasible? 

Output ONLY JSON:
{
  "targetMonths": ${months},
  "feasible": true,
  "cutsRequired": ["feature1", "feature2"],
  "riskFactor": "Medium",
  "adjustedRoadmapSuggestion": "string"
}`
      }
    ];

    const response = await callOpenRouter(messages, true);
    res.json(JSON.parse(repairJson(response)));
  } catch (error) {
    console.error("❌ Timeline AI failed, using rescue logic:", error.message);
    const { months } = req.body;
    res.json({
      targetMonths: months || 3,
      feasible: true,
      cutsRequired: ["Deep secondary integrations"],
      riskFactor: "Moderate",
      adjustedRoadmapSuggestion: "Streamline the initial UI and focus on core task automation to meet the timeline."
    });
  }
});

// 6. Guided Step
app.post('/api/guided-step', async (req, res) => {
  console.log(`🧭 Request: Guided Co-Founder Step...`);
  try {
    const { step, blueprint, selections } = req.body;
    const messages = [
      {
        role: 'user',
        content: `You are LaunchPact AI. Step: ${step}. Project: "${blueprint.productName}". Selections: ${JSON.stringify(selections)}. Explain WHY. 

Output ONLY JSON:
{
  "advice": "string",
  "suggestions": ["option1", "option2"]
}`
      }
    ];

    const response = await callOpenRouter(messages, true);
    res.json(JSON.parse(repairJson(response)));
  } catch (error) {
    console.error("❌ Guided step AI failed, using rescue advice:", error.message);
    res.json({
      advice: "Founder, we've hit a high-traffic AI zone. My strategic advice: focus on the simplest version of this step first. Ensure your core niche is clearly defined before adding complexity.",
      suggestions: ["Focus on core value", "Validate with 1 user", "Continue to next step"]
    });
  }
});

// 7. Chat
app.post('/api/chat', async (req, res) => {
  console.log(`💬 Request: Chat message received.`);
  try {
    const { history, newMessage, context, isCoFounderMode } = req.body;

    const basePersona = `You are PromptNovaX (PNX), a legendary AI Product Architect and Co-Founder. 
    You are brilliant, strategic, friendly, and conversational. 
    
    CRITICAL LANGUAGE SUPPORT: 
    - You UNDERSTAND and RESPOND to ALL languages: English, Roman Urdu, Hindi, Hinglish (e.g., "ish ky bar me kya kro", "blueprint me kro changing")
    - NEVER say "I don't understand" or ask to switch languages
    - Respond naturally in the same friendly tone regardless of language
    
    CONVERSATIONAL BLUEPRINT UPDATE FLOW:
    When a user asks about blueprint changes (e.g., "add competitors", "blueprint me changing kro", "tech stack change"):
    1. FIRST: Discuss the changes conversationally - explain what you'd add/change and WHY it's beneficial
    2. THEN: Naturally and friendly ask if they want you to apply these changes to their live blueprint (the one visible in their left panel)
    3. Use phrases like:
       - "Chaho toh main ye changes tumhare blueprint me directly add kar sakta hoon jo left side pe open hai?"
       - "Would you like me to add these directly to your live blueprint?"
       - "Want me to update the blueprint with these changes right now?"
    4. ONLY include "updates" object in your response when user CONFIRMS/AGREES (e.g., "han kr do", "yes", "sure", "go ahead")
    5. Keep the tone friendly and collaborative, like talking to a co-founder friend`;

    const modePersona = isCoFounderMode
      ? `MODE: CO-FOUNDER (HARD MODE). 
         Be brutally honest, critical, and opinionated, but still conversational and friendly. 
         Your goal is to save the startup from failure by spotting risks the user missed. 
         Talk like a real co-founder in a high-stakes board meeting - direct but supportive.`
      : `MODE: PRODUCT ARCHITECT. 
         Be helpful, structured, inspiring, and conversational. 
         Focus on engineering excellence and user experience.
         Talk like a friendly expert who's excited to help build something great.`;

    const systemMessage = {
      role: 'system',
      content: `${basePersona}\n${modePersona}\n${context ? `Project Context: ${context}` : ''}
      
      RESPONSE RULES:
      1. ALWAYS respond in valid JSON with this structure:
         {
           "text": "your conversational response here",
           "suggestions": ["optional suggestion 1", "optional suggestion 2"],
           "updates": { ... }  // ONLY include this when user has CONFIRMED they want changes applied
         }
      
      2. For blueprint modification requests:
         - First response: Discuss what you'd change and ask for confirmation
         - Second response (after user confirms): Include the "updates" object with actual changes
      
      3. The "updates" object should contain ONLY the blueprint fields being modified, for example:
         {
           "competitors": [{"name": "...", "strength": "...", "weakness": "..."}],
           "mvpFeatures": [...],
           "techStack": {...}
         }
      
      4. Be conversational, friendly, and natural - like chatting with a co-founder friend
      5. Use the user's language naturally (English/Roman Urdu/Hinglish)
      6. Keep responses concise but valuable`
    };

    const messages = [
      systemMessage,
      ...history.map(h => ({
        role: h.role === 'user' ? 'user' : 'assistant',
        content: h.text || h.content || ''
      })),
      { role: 'user', content: newMessage }
    ];

    const aiResponse = await callOpenRouter(messages, true);

    try {
      const repaired = repairJson(aiResponse);
      const parsed = JSON.parse(repaired);
      res.json({
        text: parsed.text || "I've processed your request. How can I refine this further?",
        suggestions: parsed.suggestions || [],
        updates: parsed.updates || null
      });
    } catch (parseError) {
      console.error("❌ Chat JSON Parse failed:", aiResponse);
      res.json({
        text: aiResponse.length > 200 ? "My neural processors hit a snag with that format. Let's try focusing on a specific part of your project." : aiResponse,
        suggestions: ["Refine objective", "Change mode"]
      });
    }
  } catch (error) {
    console.error("❌ Chat AI failed, using emergency persona:", error.message);
    res.json({
      text: "Founder, I'm currently operating in offline mode as our primary AI core is under heavy load. I recommend focusing on the current task's core objective while I reconnect.",
      suggestions: ["Refine objective", "Check connection", "Continue building"]
    });
  }
});

// 8. Generate Daily Tasks
app.post('/api/generate-daily-tasks', async (req, res) => {
  try {
    const { executionPlan, timeline } = req.body;
    const messages = [
      { role: 'system', content: 'You are LaunchPact AI Task Engine. Break plans into GRANULAR daily micro-tasks.' },
      {
        role: 'user', content: `Create 3 HYPER-SPECIFIC tasks/day for ${timeline.targetMonths} months. 
      
      DAY 1 CRITICAL FOCUS: Foundation & Depth ONLY. (e.g., Development Environment Setup, Competitor Deep-Dive, or Niche Identification). DO NOT jump to Development or Deployment on Day 1.
      
      Requirements:
      1. START FROM DAY 1. EXACTLY 3 tasks/day.
      2. DAY 1 FOCUS ONLY: Foundation, Environment Setup, and Market Depth.
      3. Format: { "dailyTasks": [ { "id", "title", "description", "phase", "estimatedTime", "subTasks": [{"id", "title", "isCompleted"}], "aiGuidancePrompt", "isCompleted": false, "xpReward", "dayNumber": 1 } ] }.
      
      Plan Context: ${JSON.stringify(executionPlan ? executionPlan.slice(0, 8) : [])}
      
      Output ONLY valid JSON.` }
    ];

    const aiResponse = await callOpenRouter(messages, true);
    let dailyTasks = [];
    try {
      const repaired = repairJson(aiResponse);
      const parsed = JSON.parse(repaired);
      dailyTasks = parsed.dailyTasks || [];

      // Strict distribution hack to fix AI overload
      dailyTasks = dailyTasks.map((t, idx) => ({
        ...t,
        dayNumber: t.dayNumber || Math.floor(idx / 3) + 1
      }));
    } catch (parseError) {
      console.error("❌ JSON Parse failed. Raw response:", aiResponse);
      throw new Error("Could not parse AI response.");
    }
    res.json({ dailyTasks });
  } catch (error) {
    console.error("❌ Daily tasks AI failed, launching rescue data:", error.message);
    res.json({ dailyTasks: getRescueDailyTasks() });
  }
});

// 9. Get Tool Recommendations
app.post('/api/tool-recommendations', async (req, res) => {
  try {
    const { taskPhase } = req.body;
    const TOOLS_MAP = {
      'Research': [{ name: 'Perplexity AI', url: 'https://perplexity.ai', description: 'AI research', category: 'Research' }],
      'Design': [{ name: 'Figma', url: 'https://figma.com', description: 'Design tool', category: 'Design' }],
      'Development': [{ name: 'Cursor', url: 'https://cursor.sh', description: 'AI code editor', category: 'Development' }]
    };
    res.json({ tools: TOOLS_MAP[taskPhase] || [], resources: [] });
  } catch (error) {
    res.json({ tools: [], resources: [], message: "AI recommendation core is currently offline." });
  }
});

// 11. Auth: Signup Notification (Resend)
app.post('/api/auth/signup-notification', async (req, res) => {
  const { email, name } = req.body;
  console.log(`📧 Sending welcome email to ${email}...`);

  try {
    const { data, error } = await resend.emails.send({
      from: `IdeaForge AI <${SENDER_EMAIL}>`,
      to: [email],
      subject: 'Welcome to the Forge, Architect! 🚀',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
          <h1 style="color: #4f46e5; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Welcome to IdeaForge AI, ${name}!</h1>
          <p style="font-size: 16px; line-height: 1.6;">You've just taken your first step towards architecting the future. Our neural engines are ready to help you transform your raw ideas into execution-ready business blueprints.</p>
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; margin: 25px 0;">
            <h2 style="font-size: 18px; color: #1e293b;">Getting Started:</h2>
            <ul style="list-style-type: none; padding: 0;">
              <li style="margin-bottom: 10px;">🔥 <strong>Forge:</strong> Start with a raw idea in the generator.</li>
              <li style="margin-bottom: 10px;">📊 <strong>Analyze:</strong> Review your AI-generated technical blueprint.</li>
              <li style="margin-bottom: 10px;">🚀 <strong>Launch:</strong> Use the planner to lock your execution strategy.</li>
            </ul>
          </div>
          <p style="font-size: 14px; color: #64748b;">The forge is hot. Time to build.</p>
          <p style="font-size: 14px; font-weight: bold; color: #4f46e5;">The IdeaForge Team</p>
        </div>
      `
    });

    if (error) {
      console.error("❌ Resend error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true, id: data.id });
  } catch (err) {
    console.error("❌ Notification failed:", err.message);
    res.status(500).json({ error: "Failed to send notification" });
  }
});

// 10. Lock Plan
app.post('/api/lock-plan', async (req, res) => {
  console.log(`🔒 Request: Locking plan...`);
  try {
    const { blueprint, executionPlan, timeline } = req.body;

    // Call internal daily tasks generator
    const messages = [
      { role: 'system', content: 'You are LaunchPact AI Task Engine.' },
      { role: 'user', content: `Break plan into 3 granular tasks per day. Day 1: Setup/Research ONLY. JSON: { "dailyTasks": [...] }. Plan: ${JSON.stringify(executionPlan ? executionPlan.slice(0, 8) : [])}` }
    ];

    const aiResponse = await callOpenRouter(messages, true);
    let { dailyTasks } = JSON.parse(repairJson(aiResponse));

    // Day number assignment fallback
    dailyTasks = (dailyTasks || []).map((t, idx) => ({
      ...t,
      dayNumber: t.dayNumber || Math.floor(idx / 3) + 1
    }));

    const lockedPlan = {
      id: Math.random().toString(36).substring(7),
      blueprint,
      executionPlan,
      timeline,
      dailyTasks: dailyTasks || [],
      lockedAt: new Date().toISOString(),
      startDate: new Date().toISOString(),
      targetLaunchDate: new Date(Date.now() + timeline.targetMonths * 30 * 24 * 60 * 60 * 1000).toISOString(),
      currentProgress: 0,
      completedTasksCount: 0,
      totalTasksCount: dailyTasks?.length || 0
    };

    res.json({ lockedPlan });
  } catch (error) {
    console.error("❌ Lock plan AI failed, launching mission support fallback:", error.message);
    const { blueprint, executionPlan, timeline } = req.body;
    const rescueTasks = getRescueDailyTasks();
    const lockedPlan = {
      id: "rescue-" + Math.random().toString(36).substring(7),
      blueprint,
      executionPlan: executionPlan || getRescueExecutionPlan(blueprint?.productName),
      timeline,
      dailyTasks: rescueTasks,
      lockedAt: new Date().toISOString(),
      startDate: new Date().toISOString(),
      targetLaunchDate: new Date(Date.now() + (timeline?.targetMonths || 1) * 30 * 24 * 60 * 60 * 1000).toISOString(),
      currentProgress: 0,
      completedTasksCount: 0,
      totalTasksCount: rescueTasks.length
    };
    res.json({ lockedPlan });
  }
});

// --- OTP Authentication Routes ---

// In-Memory OTP Store (for simplicity, replaces DB table)
// Key: email, Value: { code, expiresAt }
const otpStore = new Map();

// 12. Send OTP
app.post('/api/auth/send-otp', async (req, res) => {
  const { email, name } = req.body;
  console.log(`[AUTH] Requested OTP for: ${email}`);
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log(`🔐 OTP generated for ${email}: ${code}`);

    // Store/Update in Supabase (Upsert based on email)
    const { error: dbError } = await supabase
      .from('founding_cohort')
      .upsert({
        email,
        full_name: name,
        otp_code: code,
        otp_expires_at: expiresAt.toISOString(),
        is_verified: false
      }, { onConflict: 'email' });

    if (dbError) throw dbError;

    // Send Email via Resend
    const { error: resendError } = await resend.emails.send({
      from: `LaunchPact AI Protocol <${SENDER_EMAIL}>`,
      to: [email],
      subject: 'Verification Code: [Secure Access]',
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; color: #0f172a; padding: 40px; background: #ffffff;">
          <h2 style="font-size: 24px; font-weight: 900; letter-spacing: -0.025em; color: #4f46e5;">Access Protocol</h2>
          <p style="font-size: 16px; color: #475569;">Initialize your architecture session with the code below.</p>
          <div style="background: #f8fafc; padding: 32px; text-align: center; border-radius: 16px; font-size: 32px; font-weight: 800; letter-spacing: 0.2em; color: #1e293b; margin: 32px 0; border: 1px solid #e2e8f0;">
            ${code}
          </div>
          <p style="font-size: 13px; color: #94a3b8;">This secure code expires in 10 minutes. If you did not request this, please ignore.</p>
          <div style="margin-top: 40px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #cbd5e1; padding-top: 20px;">
            LaunchPact AI // Early Access Protocol
          </div>
        </div>
      `
    });

    if (resendError) throw resendError;

    console.log(`✅ OTP sent and stored for ${email}`);
    res.json({ success: true, message: "OTP sent" });

  } catch (error) {
    console.error("❌ Send OTP failed:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// 13. Verify OTP
app.post('/api/auth/verify-otp', async (req, res) => {
  const { email, code } = req.body;
  console.log(`[AUTH] Verifying OTP for: ${email}, Code: ${code}`);
  if (!email) return res.status(400).json({ error: "Email required" });
  if (!code) return res.status(400).json({ error: "Code required" });

  try {
    const { data: record, error: fetchError } = await supabase
      .from('founding_cohort')
      .select('*')
      .eq('email', email)
      .single();

    if (fetchError || !record) {
      return res.status(400).json({ valid: false, message: "No session found. Please restart protocol." });
    }

    if (record.otp_code !== code) {
      return res.status(400).json({ valid: false, message: "Invalid verification code" });
    }

    if (new Date() > new Date(record.otp_expires_at)) {
      return res.status(400).json({ valid: false, message: "Verification session expired" });
    }

    // Mark as verified
    await supabase
      .from('founding_cohort')
      .update({ is_verified: true, otp_code: null })
      .eq('email', email);

    console.log(`✅ OTP Verified for ${email}. Access Granted.`);
    res.json({ valid: true });

  } catch (error) {
    console.error("❌ Verify OTP failed:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// 14. Complete Signup (Create Auth User via Admin)
app.post('/api/auth/complete-signup', async (req, res) => {
  const { email, password, name } = req.body;
  console.log(`[AUTH] Completing signup for: ${email}`);
  if (!email || !password) return res.status(400).json({ error: "Missing identity credentials" });

  try {
    // 1. Verify that this email is actually verified in our tracking table
    const { data: record, error: fetchError } = await supabase
      .from('founding_cohort')
      .select('is_verified')
      .eq('email', email)
      .single();

    if (fetchError || !record || !record.is_verified) {
      return res.status(401).json({ error: "Access Protocol not verified. Complete OTP first." });
    }

    // 2. Create User via Admin API (bypasses "Enable Self Signup" restriction)
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm since we did our own OTP
      user_metadata: { full_name: name }
    });

    if (createError) {
      if (createError.message.includes('already registered')) {
        return res.status(400).json({ error: "Identity already associated with an existing cohort member." });
      }
      throw createError;
    }

    console.log(`🚀 Founding Cohort Member Created: ${email}`);
    res.json({ success: true, user: newUser.user });

  } catch (error) {
    console.error("❌ Complete Signup failed:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// === TEAM COLLABORATION ENDPOINTS ===

// 14.5 Save/Update Plan (Bypass RLS)
app.post('/api/plans/save', async (req, res) => {
  const { planId, productName, blueprint, executionPlan, timeline, teamSetup, userId, status } = req.body;
  console.log(`[PLAN] Save request received for planId: ${planId}, product: ${productName}`);

  if (!planId) {
    console.error('[PLAN] ❌ Plan ID missing in request');
    return res.status(400).json({ error: 'Plan ID is required' });
  }

  try {
    console.log(`[PLAN] Attempting to upsert plan to Supabase...`);
    const { data, error } = await supabase.from('plans').upsert({
      id: planId,
      product_name: productName,
      blueprint,
      execution_plan: executionPlan,
      timeline,
      team_setup: teamSetup,
      created_by: userId,
      status: status || 'draft',
      updated_at: new Date().toISOString()
    }).select();

    if (error) {
      console.error('[PLAN] ❌ Supabase error:', error);
      throw error;
    }

    console.log(`[PLAN] ✅ Plan saved successfully:`, data?.[0]?.id);

    // Ensure creator is in team_members as founder
    if (userId) {
      console.log(`[PLAN] Adding creator ${userId} to team_members...`);
      const { error: memberError } = await supabase.from('team_members').upsert({
        plan_id: planId,
        user_id: userId,
        email: teamSetup?.createdBy || '',
        name: teamSetup?.createdByName || 'Founder',
        role: 'founder',
        expertise: 'Founder & Visionary',
        approval_required: true,
        has_approved: true,
        invited_at: new Date().toISOString(),
        joined_at: new Date().toISOString()
      }, { onConflict: 'plan_id,user_id' }); // Adjust conflict mapping if needed

      if (memberError) {
        console.warn(`[PLAN] Warning: Failed to add creator to team_members:`, memberError.message);
      }
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error("❌ Save Plan failed:", error.message, error);
    res.status(500).json({
      error: error.message,
      details: error.details || 'No additional details',
      hint: error.hint || 'Check server logs for more information'
    });
  }
});

// 14.6 Fetch Plans (Internal Proxy)
app.get('/api/plans/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('created_by', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, plans: data });
  } catch (error) {
    console.error("❌ Fetch Plans failed:", error.message);
    res.status(500).json({ error: error.message });
  }
});
// 14.7 Fetch Memberships (Internal Proxy)
app.get('/api/memberships/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select('*, plans(*)')
      .eq('user_id', userId);

    if (error) throw error;
    res.json({ success: true, memberships: data });
  } catch (error) {
    console.error("❌ Fetch Memberships failed:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Debug Route
app.get('/api/debug-ping', (req, res) => {
  res.json({ pong: true, timestamp: new Date().toISOString(), version: 'v1.1' });
});

// 14.8 Fetch Team Collective (For Owner)
app.get('/api/team/collective/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    // 1. Get plan IDs owned by user
    const { data: myPlans } = await supabase
      .from('plans')
      .select('id')
      .eq('created_by', userId);

    const planIds = myPlans?.map(p => p.id) || [];
    if (planIds.length === 0) return res.json({ success: true, members: [] });

    // 2. Get all members for these plans
    const { data: members, error } = await supabase
      .from('team_members')
      .select('*, plans(product_name)')
      .in('plan_id', planIds)
      .order('invited_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, members });
  } catch (error) {
    console.error("❌ Fetch Collective failed:", error.message);
    res.status(500).json({ error: error.message });
  }
});
app.post('/api/team/send-invites', async (req, res) => {
  const { planId, productName, teamMembers, createdByName, createdByEmail } = req.body;
  console.log(`[TEAM] 📧 Sending invites for plan: ${planId}, product: ${productName}`);
  console.log(`[TEAM] Team members count: ${teamMembers?.length || 0}`);

  if (!teamMembers || teamMembers.length === 0) {
    console.error('[TEAM] ❌ No team members provided');
    return res.status(400).json({ error: 'No team members provided' });
  }

  try {
    const inviteResults = [];

    for (const member of teamMembers) {
      // Generate unique invite token
      const inviteToken = Math.random().toString(36).substring(2) + Date.now().toString(36);

      // Determine if approval is required based on role
      const approvalRequired = ['founder', 'co-founder', 'technical-lead'].includes(member.role);

      // Store team member in database
      const { error: dbError } = await supabase
        .from('team_members')
        .insert({
          plan_id: planId,
          name: member.name,
          email: member.email,
          expertise: member.expertise,
          role: member.role,
          approval_required: approvalRequired,
          has_approved: false,
          invited_at: new Date().toISOString(),
          invite_token: inviteToken
        });

      if (dbError) {
        console.error(`Error storing team member ${member.email}:`, dbError);
        continue;
      }

      // Prepare role-specific email content
      const roleDescriptions = {
        'founder': 'As a Founder, your approval is required to lock the plan.',
        'co-founder': 'As a Co-Founder, your approval is required to lock the plan.',
        'technical-lead': 'As the Technical Lead, your approval is required to lock the plan.',
        'designer': 'As the Designer, you can review and provide feedback on the plan.',
        'developer': 'As a Developer, you can review the technical execution plan.',
        'marketer': 'As the Marketer, you can review the go-to-market strategy.',
        'advisor': 'As an Advisor, you can provide strategic guidance on the plan.',
        'team-member': 'As a Team Member, you can review and collaborate on the plan.'
      };

      const roleDescription = roleDescriptions[member.role] || 'You can review and collaborate on the plan.';
      const approvalText = approvalRequired
        ? '<p style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 20px 0;"><strong>⚠️ Your Approval Required:</strong> The plan cannot be locked until you review and approve it.</p>'
        : '<p style="color: #64748b; font-size: 14px;">Your approval is optional, but your feedback is valuable!</p>';

      // Send invitation email
      const { error: emailError } = await resend.emails.send({
        from: `${productName} Team <${SENDER_EMAIL}>`,
        to: [member.email],
        subject: `🚀 You're invited to join ${productName}!`,
        html: `
          <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="font-size: 32px; font-weight: 900; color: #4f46e5; margin: 0;">🚀 ${productName}</h1>
              <p style="color: #64748b; font-size: 14px; margin-top: 8px;">Launch Plan Collaboration</p>
            </div>

            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px; border-radius: 16px; color: white; margin-bottom: 32px;">
              <h2 style="font-size: 24px; font-weight: 800; margin: 0 0 12px 0;">You're Invited!</h2>
              <p style="font-size: 16px; opacity: 0.95; margin: 0;"><strong>${createdByName}</strong> has invited you to collaborate on the launch plan for <strong>${productName}</strong>.</p>
            </div>

            <div style="background: #f8fafc; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
              <h3 style="font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #4f46e5; margin: 0 0 12px 0;">Your Role</h3>
              <p style="font-size: 18px; font-weight: 700; color: #1e293b; margin: 0 0 8px 0; text-transform: capitalize;">${member.role.replace('-', ' ')}</p>
              <p style="font-size: 14px; color: #64748b; margin: 0;">${member.expertise}</p>
            </div>

            ${approvalText}

            <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 32px;">
              ${roleDescription} Review the complete blueprint, execution plan, and timeline before the team locks in and starts building.
            </p>

            <div style="text-align: center; margin: 40px 0;">
              <a href="${process.env.VITE_APP_URL || 'http://localhost:5173'}/team-invite/${inviteToken}" 
                 style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 16px 48px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 16px; text-transform: uppercase; letter-spacing: 0.05em; box-shadow: 0 10px 25px rgba(79, 70, 229, 0.3);">
                View Plan & ${approvalRequired ? 'Approve' : 'Review'}
              </a>
            </div>

            <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; margin-top: 40px;">
              <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
                This is a team effort - everyone's input matters! 💪
              </p>
            </div>
          </div>
        `
      });

      if (emailError) {
        console.error(`Email error for ${member.email}:`, emailError);
        inviteResults.push({ email: member.email, success: false, error: emailError.message });
      } else {
        inviteResults.push({ email: member.email, success: true, inviteToken });
      }
    }

    res.json({
      success: true,
      invitesSent: inviteResults.filter(r => r.success).length,
      results: inviteResults
    });

  } catch (error) {
    console.error('❌ Team invite failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 16. Get Team Members for a Plan
app.get('/api/team/members/:planId', async (req, res) => {
  const { planId } = req.params;

  try {
    const { data: members, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('plan_id', planId)
      .order('invited_at', { ascending: true });

    if (error) throw error;

    res.json({ members: members || [] });
  } catch (error) {
    console.error('❌ Get team members failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 17. Accept Team Invite
app.post('/api/team/accept-invite/:token', async (req, res) => {
  const { token } = req.params;
  const { userId, userEmail } = req.body;

  try {
    // Find the invite
    const { data: member, error: fetchError } = await supabase
      .from('team_members')
      .select('*')
      .eq('invite_token', token)
      .single();

    if (fetchError || !member) {
      return res.status(404).json({ error: 'Invalid or expired invite' });
    }

    // Update member as joined
    const { error: updateError } = await supabase
      .from('team_members')
      .update({
        joined_at: new Date().toISOString(),
        user_id: userId
      })
      .eq('invite_token', token);

    if (updateError) throw updateError;

    res.json({ success: true, member });
  } catch (error) {
    console.error('❌ Accept invite failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 18. Approve Plan (Team Member)
// 18. Approve Plan (Team Member)
app.post('/api/team/approve/:planId', async (req, res) => {
  const { planId } = req.params;
  const { userEmail } = req.body;

  try {
    // 1. Get member name and plan details for notification
    const { data: memberData } = await supabase
      .from('team_members')
      .select('name, role')
      .eq('plan_id', planId)
      .eq('email', userEmail)
      .single();

    const { data: planData } = await supabase
      .from('plans')
      .select('product_name, created_by')
      .eq('id', planId)
      .single();

    // 2. Update approval status
    const { error: updateError } = await supabase
      .from('team_members')
      .update({
        has_approved: true,
        approved_at: new Date().toISOString()
      })
      .eq('plan_id', planId)
      .eq('email', userEmail);

    if (updateError) throw updateError;

    // 3. Trigger Notification for the owner
    if (planData && planData.created_by && memberData) {
      await supabase.from('notifications').insert({
        user_id: planData.created_by,
        title: 'Plan Approved',
        message: `${memberData.name} (${memberData.role}) has approved the plan for ${planData.product_name}.`,
        type: 'approval',
        link: `/team-review/${planId}`,
        is_read: false
      });
    }

    // 4. Check if all required approvals are received
    const { data: members, error: fetchError } = await supabase
      .from('team_members')
      .select('*')
      .eq('plan_id', planId);

    if (fetchError) throw fetchError;

    const requiredApprovals = members.filter(m => m.approval_required);
    const allApproved = requiredApprovals.every(m => m.has_approved);

    res.json({
      success: true,
      allRequiredApproved: allApproved,
      totalRequired: requiredApprovals.length,
      approved: requiredApprovals.filter(m => m.has_approved).length
    });
  } catch (error) {
    console.error('❌ Approve plan failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// === NOTIFICATION ENDPOINTS ===

// 19. Get Notifications
app.get('/api/notifications/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    res.json({ success: true, notifications: data });
  } catch (error) {
    console.error('❌ Get notifications failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 20. Mark Notification as Read
app.post('/api/notifications/:id/read', async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  }
});

// === TEAM CHAT ENDPOINTS ===

// 21. Get User Teams (for chat sidebar)
app.get('/api/team/user-teams/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const { data, error } = await supabase
      .from('user_team_chats')
      .select('*')
      .or(`user_id.eq.${userId},created_by.eq.${userId}`);

    if (error) throw error;

    // Format the response
    const teams = (data || []).map(team => ({
      plan_id: team.plan_id,
      product_name: team.product_name,
      role: team.role || 'founder',
      member_count: team.member_count || 1,
      last_message: team.last_message
    }));

    res.json({ success: true, teams });
  } catch (error) {
    console.error('❌ Get user teams failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 22. Get Team Messages
app.get('/api/team/messages/:planId', async (req, res) => {
  const { planId } = req.params;
  const { limit = 100, offset = 0 } = req.query;

  try {
    const { data, error } = await supabase
      .from('team_messages')
      .select(`
        *,
        message_read_status (
          user_id,
          read_at,
          delivered_at
        )
      `)
      .eq('plan_id', planId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({ success: true, messages: data || [] });
  } catch (error) {
    console.error('❌ Get team messages failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 23. Mark Messages as Read
app.post('/api/team/messages/:planId/read', async (req, res) => {
  const { planId } = req.params;
  const { userId } = req.body;

  try {
    const { error } = await supabase.rpc('mark_messages_read', {
      p_plan_id: planId,
      p_user_id: userId
    });

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('❌ Mark messages read failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 24. Update Typing Status
app.post('/api/team/typing/:planId', async (req, res) => {
  const { planId } = req.params;
  const { userId, userName, isTyping } = req.body;

  try {
    const { error } = await supabase
      .from('typing_indicators')
      .upsert({
        plan_id: planId,
        user_id: userId,
        user_name: userName,
        is_typing: isTyping,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('❌ Update typing status failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 25. Get Unread Count
app.get('/api/team/unread/:planId/:userId', async (req, res) => {
  const { planId, userId } = req.params;

  try {
    const { data, error } = await supabase.rpc('get_unread_count', {
      p_plan_id: planId,
      p_user_id: userId
    });

    if (error) throw error;

    res.json({ success: true, count: data || 0 });
  } catch (error) {
    console.error('❌ Get unread count failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Final check endpoint

app.get('/api/health', (req, res) => {
  res.json({ status: 'active', protocol: 'LaunchPact-v1' });
});

// 404 Handler for /api
app.use('/api', (req, res) => {
  console.log(`[404] API Route Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: `Route ${req.originalUrl} not found on LaunchPact AI Backend` });
});

// Serve static frontend files in production
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback for SPA (React Router)
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(distPath, 'index.html'));
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`========================================`);
  console.log(`🚀 LAUNCHPACT AI BACKEND SERVER ACTIVE`);
  console.log(`========================================`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ Started: ${new Date().toISOString()}`);
  console.log(`========================================`);
});
