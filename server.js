import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env and .env.local
// .env.local is often used for local secrets and should be loaded if it exists
import fs from 'fs';
const envPaths = [
  path.join(__dirname, '.env'),
  path.join(__dirname, '.env.local'),
  path.join(__dirname, '..', '.env'),
  path.join(__dirname, '..', '.env.local')
];

envPaths.forEach(envPath => {
  if (fs.existsSync(envPath)) {
    console.log(`📄 Loading environment variables from: ${envPath}`);
    dotenv.config({ path: envPath });
  }
});

const app = express();
const PORT = process.env.PORT || 3000;

// CORS Configuration with logging
// Allow all Vercel deployments (with and without www, any subdomain)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://launchpact-ai.vercel.app',
  'https://www.launchpact-ai.vercel.app',
  'https://launchpact-ai.onrender.com',
  // Allow any vercel.app subdomain for preview deployments
  /^https:\/\/.*\.vercel\.app$/
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, or server-to-server)
    if (!origin) return callback(null, true);

    // Check if origin matches allowed list
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return origin === allowed;
      } else if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return false;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS blocked origin: ${origin}`);
      callback(null, true); // Allow all origins in production for now (adjust if needed)
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());

// Request Logging Middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const origin = req.headers.origin || 'N/A';
  console.log(`[${timestamp}] ${req.method} ${req.url} | Origin: ${origin}`);
  next();
});

// --- Configuration ---
// Priority: Environment variables first, then fallback to empty string
// We check multiple possible names that people often use
let rawKey = (
  process.env.OPENROUTER_API_KEY ||
  process.env.VITE_OPENROUTER_API_KEY ||
  process.env.OPEN_ROUTER_API_KEY ||
  ''
).trim();

// ULTRA-ROBUST SANITIZATION: Remove any quotes, extra spaces, or hidden characters
// This fixes common copy-paste issues in Render/Vercel dashboards
const OPENROUTER_API_KEY = rawKey.replace(/['"\s]/g, '');

const RESEND_API_KEY = (process.env.RESEND_API_KEY || '').trim().replace(/['"\s]/g, '');
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'noreply@cavexa.online';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Safe initialization - only create clients if keys are available
let resend = null;
let supabase = null;

if (RESEND_API_KEY) {
  resend = new Resend(RESEND_API_KEY);
} else {
  console.warn('⚠️  RESEND_API_KEY is missing. Email functionality will be disabled.');
}

if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
} else {
  console.warn('⚠️  Supabase credentials missing. Database functionality will be limited.');
}

// Updated models list with verified, working FREE models from OpenRouter
// Priority: Auto-select free models first, then specific reliable free models
// All models here are verified free models that work on OpenRouter
const MODELS = [
  // TIER 1: Auto-select best free model (always try this first)
  'openrouter/auto:free',                      // Automatically selects the best free model available

  // TIER 2: Verified High-Performance Free Models
  'mistralai/mixtral-8x7b-instruct:free',      // Smart and fast open model by Mistral
  'mistralai/mistral-7b-instruct:free',        // Lighter, faster version (32K context)
  'meta-llama/llama-3-8b-instruct:free',       // Meta's small and powerful model
  'deepseek/deepseek-chat-v3.1:free',          // DeepSeek's flagship model (64K context)
  'openchat/openchat-3.5-0106:free',           // Fine-tuned chat model, helpful and fast
  'qwen/qwen3-coder:free',                     // Qwen's code-specific model (262K context)
  'nousresearch/nous-capybara-7b:free',        // Conversational model with good memory
  'gryphe/mythomax-l2-13b:free',               // Balanced between creativity and logic

  // TIER 3: Additional Free Models as Last Resort
  'z-ai/glm-4.5-air:free',                     // Lightweight GLM model (131K context)
  'moonshotai/kimi-k2:free',                   // MoonshotAI's model (33K context)

  // TIER 4: Emergency Paid Fallbacks (only if all free models completely fail)
  // Note: These may incur costs, but they're reliable as absolute last resort
  'anthropic/claude-3-haiku',
  'openai/gpt-3.5-turbo'
];

console.log("\n================================================");
console.log("🔥 LAUNCHPACT AI BACKEND IGNITION SEQUENCE");
console.log("================================================");
console.log("\n📊 CONFIGURATION STATUS:");
console.log("------------------------------------------------");
console.log(`🔑 OpenRouter API Key: ${OPENROUTER_API_KEY ? '✓ LOADED (' + OPENROUTER_API_KEY.substring(0, 8) + '...' + OPENROUTER_API_KEY.slice(-4) + ')' : '✗ MISSING'}`);
if (OPENROUTER_API_KEY) {
  console.log(`   Key Length: ${OPENROUTER_API_KEY.length} characters`);
}
console.log(`📧 Resend API Key: ${RESEND_API_KEY ? '✓ LOADED' : '✗ MISSING (Email disabled)'}`);
console.log(`📧 Sender Email: ${SENDER_EMAIL}`);
console.log(`🗄️  Supabase URL: ${SUPABASE_URL ? '✓ LOADED' : '✗ MISSING'}`);
console.log(`🔐 Supabase Service Key: ${SUPABASE_SERVICE_KEY ? '✓ LOADED' : '✗ MISSING'}`);
console.log(`\n🤖 AI MODELS CONFIGURATION:`);
console.log(`   Total Models: ${MODELS.length}`);
console.log(`   Primary Model: ${MODELS[0]}`);
console.log(`   Free Fallbacks: ${MODELS.slice(1, 9).length}`);
console.log("\n================================================");

if (!OPENROUTER_API_KEY) {
  console.log("\n⚠️  CRITICAL WARNING: OPENROUTER_API_KEY MISSING!");
  console.log("   → AI features will NOT work");
  console.log("   → Set OPENROUTER_API_KEY in your .env file");
  console.log("   → Get a free key: https://openrouter.ai/keys");
  console.log("================================================\n");
} else {
  console.log("\n✅ All critical services initialized successfully!");
  console.log("================================================\n");
}

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
    console.error('❌ [ERROR] OPENROUTER_API_KEY is missing!');
    throw new Error('OPENROUTER_API_KEY is missing. Please set it in your .env file.');
  }

  const isJson = !!schema;
  const allErrors = [];
  const timestamp = new Date().toISOString();
  const requestId = Math.random().toString(36).substring(2, 9).toUpperCase();

  console.log(`\n═══════════════════════════════════════════════════════════════`);
  console.log(`📡 [${timestamp}] [REQUEST-${requestId}] OPENROUTER API CALL INITIATED`);
  console.log(`═══════════════════════════════════════════════════════════════`);
  console.log(`   Request ID: ${requestId}`);
  console.log(`   Request Type: ${isJson ? 'JSON Response Required' : 'Text Response'}`);
  console.log(`   Total Models Available: ${MODELS.length}`);
  console.log(`   API Key Status: ${OPENROUTER_API_KEY ? '✓ LOADED' : '✗ MISSING'}`);

  // DIAGNOSTIC SIGNATURE: Show exact fingerprint without full key
  if (OPENROUTER_API_KEY) {
    const keyLen = OPENROUTER_API_KEY.length;
    const signature = `${OPENROUTER_API_KEY.substring(0, 8)}...${OPENROUTER_API_KEY.slice(-6)}`;
    const startsCorrect = OPENROUTER_API_KEY.startsWith('sk-or-v1-');
    console.log(`   🔍 KEY DIAGNOSTICS (DEBUG_VER_4_FORCE_DEPLOY):`);
    console.log(`      Signature: ${signature}`);
    console.log(`      Length: ${keyLen} chars`);
    console.log(`      Format Valid (sk-or-v1-): ${startsCorrect ? '✅ YES' : '❌ NO'}`);

    // HEX DIAGNOSTICS: Check for hidden/invisible characters at the start
    const first5Hex = Array.from(OPENROUTER_API_KEY.substring(0, 5)).map(c => c.charCodeAt(0).toString(16)).join(' ');
    console.log(`      First 5 chars (Hex): ${first5Hex}`);

    if (keyLen < 30) console.log(`      ⚠️ WARNING: Key length seems too short!`);
  }

  console.log(`   Models to Try: `);
  MODELS.forEach((m, idx) => {
    const tier = idx === 0 ? 'TIER-1 (Auto)' : idx < 9 ? 'TIER-2 (Free)' : idx < 11 ? 'TIER-3 (Free)' : 'TIER-4 (Paid)';
    console.log(`      ${idx + 1}.[${tier}] ${m}`);
  });
  console.log(`═══════════════════════════════════════════════════════════════\n`);

  // If JSON is required, enhance the system message
  if (isJson) {
    // Find or create system message
    let systemMsg = messages.find(m => m.role === 'system');
    if (!systemMsg) {
      systemMsg = { role: 'system', content: '' };
      messages.unshift(systemMsg);
    }
    systemMsg.content += '\n\n⚠️ CRITICAL JSON OUTPUT REQUIREMENT ⚠️\nYou MUST respond with ONLY valid JSON. No markdown code blocks, no explanations, no text outside JSON. Just pure, valid JSON that can be parsed directly. If you include any markdown formatting like ```json or```, your response will FAIL.';
  }

  let successfulModel = null;
  let successfulResponse = null;

  for (let i = 0; i < MODELS.length; i++) {
    const model = MODELS[i];
    const attemptStart = Date.now();
    const attemptNum = i + 1;

    try {
      console.log(`\n   ┌─────────────────────────────────────────────────────────`);
      console.log(`   │ 🤖[${attemptNum} / ${MODELS.length}] ATTEMPTING MODEL: ${model} `);
      console.log(`   │    Request ID: ${requestId} `);
      console.log(`   │    Timestamp: ${new Date().toISOString()} `);
      console.log(`   │    Tier: ${i === 0 ? 'TIER-1 (Auto-select)' : i < 9 ? 'TIER-2 (Free)' : i < 11 ? 'TIER-3 (Free)' : 'TIER-4 (Paid Fallback)'} `);
      console.log(`   └─────────────────────────────────────────────────────────`);

      const requestBody = {
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: isJson ? 4000 : 2000
      };

      // Only add response_format for paid models that support it
      // Free models typically don't support this, so we rely on prompt engineering
      const supportsJsonFormat = !model.includes('free') && !model.includes('auto');
      if (isJson && supportsJsonFormat) {
        requestBody.response_format = { type: "json_object" };
        console.log(`   │ ✓ Using JSON response format(model supports it)`);
      } else if (isJson) {
        console.log(`   │ ℹ Using prompt - based JSON generation(free model)`);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 50000); // 50s timeout per model

      const startTime = Date.now();
      console.log(`   │ 📤 Sending HTTP POST to OpenRouter API...`);

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'Referer': process.env.VITE_APP_URL || 'https://launchpact-ai.vercel.app',
          'X-Title': 'LaunchPact AI'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const duration = Date.now() - startTime;
      const statusEmoji = response.ok ? '✅' : '❌';
      console.log(`   │ ${statusEmoji} Response received: ${duration} ms | Status: ${response.status} ${response.statusText} `);

      if (!response.ok) {
        let errorMsg = response.statusText;
        let errorDetails = {};
        let errorCode = null;

        try {
          const errorData = await response.json();
          errorMsg = errorData.error?.message || errorData.error?.type || errorMsg;
          errorCode = errorData.error?.code;
          errorDetails = errorData.error || {};
          console.log(`   │    Error Type: ${errorDetails.type || 'Unknown'} `);
          console.log(`   │    Error Code: ${errorCode || 'N/A'} `);
          console.log(`   │    Error Message: ${errorMsg.substring(0, 150)}${errorMsg.length > 150 ? '...' : ''} `);
        } catch (e) {
          const text = await response.text().catch(() => '');
          errorMsg = text || errorMsg;
          console.log(`   │    Error Response: ${text.substring(0, 200)}${text.length > 200 ? '...' : ''} `);
        }

        console.log(`   │ ⚠️  MODEL FAILED: ${model} `);
        console.log(`   │    Reason: ${response.status} - ${errorMsg.substring(0, 100)} `);
        allErrors.push({
          model,
          status: response.status,
          error: errorMsg,
          code: errorCode,
          duration: Date.now() - attemptStart
        });

        // If it's a rate limit, wait longer before trying next model
        if (response.status === 429) {
          const waitTime = 5000; // 5 seconds for rate limits
          console.log(`   │ ⏳ Rate limited(429).Waiting ${waitTime}ms before next model...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else if (response.status >= 500) {
          // Server errors - wait a bit but not too long
          const waitTime = 2000;
          console.log(`   │ ⏳ Server error(${response.status}).Waiting ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else {
          // Client errors (400, 401, 403) - try next model immediately
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        continue;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      const modelUsed = data.model || model; // OpenRouter may return the actual model used
      const tokensUsed = data.usage?.total_tokens || 'N/A';

      if (!content || content.trim().length === 0) {
        console.log(`   │ ⚠️  MODEL RETURNED EMPTY CONTENT`);
        console.log(`   │    Response structure: `, JSON.stringify({
          hasChoices: !!data.choices,
          choicesLength: data.choices?.length || 0,
          hasMessage: !!data.choices?.[0]?.message,
          hasContent: !!content
        }, null, 2));
        allErrors.push({
          model,
          status: 200,
          error: 'Empty content in response',
          duration: Date.now() - attemptStart
        });
        continue;
      }

      const totalDuration = Date.now() - attemptStart;
      successfulModel = modelUsed;
      successfulResponse = content;

      console.log(`   │`);
      console.log(`   │ ✅✅✅ SUCCESS! MODEL WORKED: ${modelUsed} ✅✅✅`);
      console.log(`   │`);
      console.log(`   │    Total Time: ${totalDuration} ms`);
      console.log(`   │    Tokens Used: ${tokensUsed} `);
      console.log(`   │    Response Length: ${content.length} characters`);
      console.log(`   │    Preview: ${content.substring(0, 120).replace(/\n/g, ' ')}...`);
      console.log(`   │`);
      console.log(`   └─────────────────────────────────────────────────────────`);
      console.log(`\n═══════════════════════════════════════════════════════════════`);
      console.log(`✅[${new Date().toISOString()}][REQUEST - ${requestId}]SUCCESS`);
      console.log(`   Successful Model: ${modelUsed} `);
      console.log(`   Attempt Number: ${attemptNum}/${MODELS.length}`);
      console.log(`   Total Duration: ${totalDuration}ms`);
      console.log(`═══════════════════════════════════════════════════════════════\n`);

      return content;

    } catch (error) {
      const isTimeout = error.name === 'AbortError';
      const isNetwork = error.message.includes('fetch') || error.message.includes('network');
      const errorType = isTimeout ? 'TIMEOUT' : isNetwork ? 'NETWORK_ERROR' : 'EXCEPTION';
      const attemptDuration = Date.now() - attemptStart;

      console.log(`   │`);
      console.log(`   │ ❌❌❌ ${errorType}: MODEL FAILED ❌❌❌`);
      console.log(`   │    Model: ${model}`);
      console.log(`   │    Duration: ${attemptDuration}ms`);
      console.log(`   │    Error: ${error.message.substring(0, 150)}${error.message.length > 150 ? '...' : ''}`);
      if (!isTimeout && error.stack && errorType === 'EXCEPTION') {
        console.log(`   │    Stack (first line): ${error.stack.split('\n')[1]?.trim() || 'N/A'}`);
      }
      console.log(`   │`);

      allErrors.push({
        model,
        status: errorType,
        error: error.message,
        duration: attemptDuration
      });

      // Small delay before trying next model (longer for timeouts)
      if (i < MODELS.length - 1) {
        const delay = isTimeout ? 2000 : (isNetwork ? 1500 : 500);
        console.log(`   │ ⏳ Waiting ${delay}ms before trying next model...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      console.log(`   └─────────────────────────────────────────────────────────`);
    }
  }

  // All models failed - log comprehensive error report
  console.log(`\n`);
  console.log(`═══════════════════════════════════════════════════════════════`);
  console.log(`❌❌❌ [${new Date().toISOString()}] [REQUEST-${requestId}] ALL MODELS FAILED ❌❌❌`);
  console.log(`═══════════════════════════════════════════════════════════════`);
  console.log(`   Request ID: ${requestId}`);
  console.log(`   Total Models Attempted: ${MODELS.length}`);
  console.log(`   Request Type: ${isJson ? 'JSON' : 'Text'}`);
  console.log(`\n   DETAILED FAILURE LOG:`);
  console.log(`   ───────────────────────────────────────────────────────────`);
  allErrors.forEach((err, idx) => {
    console.log(`   ${idx + 1}. Model: ${err.model}`);
    console.log(`      Status: ${err.status} | Duration: ${err.duration}ms`);
    console.log(`      Error: ${err.error.substring(0, 200)}${err.error.length > 200 ? '...' : ''}`);
    if (err.code) console.log(`      Code: ${err.code}`);
    console.log(``);
  });
  console.log(`   ───────────────────────────────────────────────────────────`);
  console.log(`\n   TROUBLESHOOTING SUGGESTIONS:`);
  console.log(`   1. Check OpenRouter API key is valid`);
  console.log(`   2. Check internet connection`);
  console.log(`   3. Check OpenRouter status page: https://openrouter.ai/status`);
  console.log(`   4. Verify API key has sufficient credits/quota`);
  console.log(`   5. Check if all free models are temporarily unavailable`);
  console.log(`\n   This detailed log will be visible in Render backend logs.`);
  console.log(`═══════════════════════════════════════════════════════════════\n`);

  throw new Error(`All ${MODELS.length} AI models failed. Request ID: ${requestId}. Check Render logs for detailed failure analysis. Last 3 errors: ${allErrors.slice(-3).map(e => `${e.model} (${e.status})`).join(' | ')}`);
};

// --- Routes ---

// 0. Debug Auth Endpoint (TEMPORARY - FOR DIAGNOSTICS)
app.get('/api/debug-auth', async (req, res) => {
  const keyLen = OPENROUTER_API_KEY ? OPENROUTER_API_KEY.length : 0;
  const signature = OPENROUTER_API_KEY ? `${OPENROUTER_API_KEY.substring(0, 8)}...${OPENROUTER_API_KEY.slice(-6)}` : 'MISSING';
  const first5Hex = OPENROUTER_API_KEY ? Array.from(OPENROUTER_API_KEY.substring(0, 5)).map(c => c.charCodeAt(0).toString(16)).join(' ') : 'N/A';

  // LIVE VERIFICATION: Try to actually use the key
  let verificationResult = 'NOT_ATTEMPTED';
  let verificationStatus = 0;

  try {
    if (OPENROUTER_API_KEY) {
      const verifyResponse = await fetch('https://openrouter.ai/api/v1/auth/key', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`
        }
      });
      verificationStatus = verifyResponse.status;
      const data = await verifyResponse.json();
      verificationResult = data;
    }
  } catch (error) {
    verificationResult = { error: error.message };
  }

  res.json({
    appVersion: 'DEBUG_VER_6_LIVE_KEY_TEST',
    timestamp: new Date().toISOString(),
    authStatus: {
      isLoaded: !!OPENROUTER_API_KEY,
      length: keyLen,
      signature: signature,
      formatValid: OPENROUTER_API_KEY ? OPENROUTER_API_KEY.startsWith('sk-or-v1-') : false,
      first5Hex: first5Hex
    },
    liveVerification: {
      endpoint: 'https://openrouter.ai/api/v1/auth/key',
      httpStatus: verificationStatus,
      response: verificationResult
    },
    headerPreview: {
      authorization: OPENROUTER_API_KEY ? `Bearer ${OPENROUTER_API_KEY.substring(0, 5)}...` : 'Missing',
      referer: process.env.VITE_APP_URL || 'https://launchpact-ai.vercel.app'
    },
    environment: {
      nodeEnv: process.env.NODE_ENV,
      renderServiceId: process.env.RENDER_SERVICE_ID || 'Not on Render?'
    }
  });
});

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
  console.log(`\n✨ [${new Date().toISOString()}] Request: Enhancing prompt...`);
  try {
    const { rawInput } = req.body;

    if (!rawInput || !rawInput.trim()) {
      console.log(`   ⚠️  Empty input, returning as-is`);
      return res.json({ text: rawInput || '' });
    }

    console.log(`   Input length: ${rawInput.length} characters`);

    const messages = [
      {
        role: 'user',
        content: `You are LaunchPact AI. Rewrite this raw idea into a professional prompt: "${rawInput}". Max 3 sentences. Output ONLY the enhanced prompt, no explanations, no markdown.`
      }
    ];

    console.log(`   📤 Sending to AI models...`);
    const response = await callOpenRouter(messages, false);
    const enhanced = response.trim();

    console.log(`   ✅ Enhancement successful (${enhanced.length} chars)`);
    res.json({ text: enhanced });
  } catch (error) {
    console.error(`   ❌ Enhancement failed, using pass-through: ${error.message}`);
    const { rawInput = '' } = req.body;
    res.json({ text: rawInput.trim() || 'Please provide a product idea to enhance.' });
  }
});

// 3. Generate Blueprint
app.post('/api/generate-blueprint', async (req, res) => {
  const { rawIdea } = req.body;
  const requestId = Math.random().toString(36).substring(2, 9).toUpperCase();
  const timestamp = new Date().toISOString();
  const startTime = Date.now();

  console.log(`\n═══════════════════════════════════════════════════════════════`);
  console.log(`🚀 [${timestamp}] [BLUEPRINT-${requestId}] GENERATE BLUEPRINT REQUEST RECEIVED`);
  console.log(`═══════════════════════════════════════════════════════════════`);
  console.log(`   Request ID: ${requestId}`);
  console.log(`   Origin: ${req.headers.origin || 'N/A'}`);
  console.log(`   User-Agent: ${req.headers['user-agent']?.substring(0, 60) || 'N/A'}...`);
  console.log(`   IP: ${req.ip || req.socket.remoteAddress || 'N/A'}`);
  console.log(`   API Key Status: ${OPENROUTER_API_KEY ? '✓ CONFIGURED' : '✗ MISSING'}`);
  if (OPENROUTER_API_KEY) {
    console.log(`   API Key Preview: ${OPENROUTER_API_KEY.substring(0, 12)}...${OPENROUTER_API_KEY.slice(-8)}`);
    console.log(`   API Key Length: ${OPENROUTER_API_KEY.length} characters`);
  }
  console.log(`═══════════════════════════════════════════════════════════════`);

  // Validate API key first
  if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY.trim().length === 0) {
    console.error(`\n❌ [${requestId}] CRITICAL ERROR: OPENROUTER_API_KEY is missing!`);
    console.error(`   This means AI functionality is disabled.`);
    console.error(`   Please set OPENROUTER_API_KEY in Render environment variables.`);
    console.error(`   Get your free key at: https://openrouter.ai/keys`);
    console.error(`═══════════════════════════════════════════════════════════════\n`);

    return res.status(500).json({
      error: 'AI service not configured',
      message: 'OPENROUTER_API_KEY is missing. Please configure it in the backend environment variables.',
      rescue: {
        productName: (rawIdea || 'Your Idea').slice(0, 30) + " Platform",
        tagline: "AI service configuration required",
        ideaSummary: rawIdea || "An innovative solution to address market needs.",
        problemStatement: "Backend AI service needs OPENROUTER_API_KEY environment variable to be set.",
        usp: "Once configured, this will generate detailed blueprints using AI models.",
        painPoints: ["Configuration required", "API key missing"],
        domainSuggestions: ["example.com"],
        marketAnalysis: {
          targetAudience: "Target users",
          marketGap: "Market opportunity",
          potentialSize: "Growing market"
        },
        viability: {
          score: 70,
          saturationAnalysis: "Configuration pending",
          pivotSuggestion: "Configure OPENROUTER_API_KEY in Render dashboard"
        },
        competitors: [{
          name: "Existing Solution",
          strength: "Market presence",
          weakness: "Limited features"
        }],
        monetizationStrategy: ["Subscription", "Freemium"],
        risksAndAssumptions: ["Configuration required", "API key needed"],
        mvpFeatures: [{
          title: "AI Configuration",
          description: "Set OPENROUTER_API_KEY in Render environment variables",
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
          name: "Configuration",
          timeline: "Immediate",
          keyDeliverables: ["Set API key", "Redeploy"]
        }],
        maintenanceStrategy: "Configure OPENROUTER_API_KEY at https://openrouter.ai/keys",
        sources: []
      }
    });
  }

  if (!rawIdea || !rawIdea.trim()) {
    console.error(`❌ [${requestId}] Error: rawIdea is missing or empty`);
    return res.status(400).json({ error: 'rawIdea is required' });
  }

  console.log(`📝 [${requestId}] Raw Idea: "${rawIdea.slice(0, 100)}${rawIdea.length > 100 ? '...' : ''}"`);
  console.log(`📏 [${requestId}] Length: ${rawIdea.length} characters`);

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

    console.log(`📤 [${requestId}] Sending request to AI models...`);
    const response = await callOpenRouter(messages, true);

    console.log(`🔧 [${requestId}] Repairing JSON response...`);
    const repaired = repairJson(response);
    console.log(`   Repaired length: ${repaired.length} characters`);

    console.log(`📥 [${requestId}] Parsing JSON...`);
    const parsed = JSON.parse(repaired);

    // Validate required fields
    if (!parsed.productName || !parsed.ideaSummary) {
      console.error(`❌ [${requestId}] Invalid blueprint: missing required fields`);
      console.error(`   Parsed keys: ${Object.keys(parsed).join(', ')}`);
      throw new Error('Invalid blueprint: missing required fields');
    }

    const totalTime = Date.now() - startTime;
    console.log(`\n✅✅✅ [${requestId}] SUCCESS: BLUEPRINT FORGED ✅✅✅`);
    console.log(`   Product Name: "${parsed.productName || 'Unknown'}"`);
    console.log(`   Blueprint Summary: ${parsed.ideaSummary?.slice(0, 80) || 'N/A'}...`);
    console.log(`   Viability Score: ${parsed.viability?.score || 'N/A'}`);
    console.log(`   Total Processing Time: ${totalTime}ms`);
    console.log(`═══════════════════════════════════════════════════════════════\n`);
    res.json({ ...parsed, sources: [] });

  } catch (error) {
    const errorTimestamp = new Date().toISOString();
    const totalTime = Date.now() - startTime;
    console.error(`\n❌❌❌ [${errorTimestamp}] [${requestId}] ERROR GENERATING BLUEPRINT ❌❌❌`);
    console.error(`   Error Type: ${error.name || 'Unknown'}`);
    console.error(`   Error Message: ${error.message || String(error)}`);
    console.error(`   Processing Time: ${totalTime}ms`);
    if (error.stack) {
      console.error(`   Stack Trace (first 5 lines):`);
      console.error(error.stack.split('\n').slice(0, 5).join('\n'));
    }
    console.error(`═══════════════════════════════════════════════════════════════`);
    console.log(`🛠️ [${requestId}] AI Failure -> Launching Professional Rescue Template`);
    console.log(`═══════════════════════════════════════════════════════════════\n`);

    // Return error with rescue template (200 OK so frontend can use rescue data)
    res.status(500).json({
      error: 'AI generation failed',
      message: error.message,
      requestId,
      timestamp: errorTimestamp,
      processingTime: totalTime,
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
  console.log(`\n📋 [${new Date().toISOString()}] Request: Generating Execution Plan...`);
  try {
    const { blueprint = {} } = req.body;

    console.log(`   Project: ${blueprint?.productName || 'Unknown'}`);
    console.log(`   Tech Stack: ${blueprint?.techStack?.frontend || 'Not specified'}`);

    const messages = [
      {
        role: 'system',
        content: 'You are PNX Action Engine. Output ONLY valid JSON. No markdown, no code blocks. Just pure JSON with execution tasks.'
      },
      {
        role: 'user',
        content: `As PNX, create a 10-step MVP Execution Checklist for: ${blueprint?.productName || 'the startup'} using ${blueprint?.techStack?.frontend || 'modern web technologies'}.
        
Output ONLY JSON in this format (no markdown, no code blocks):
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

    console.log(`   📤 Sending to AI models...`);
    const response = await callOpenRouter(messages, true);
    const repaired = repairJson(response);
    const parsed = JSON.parse(repaired);

    const tasks = parsed.tasks || parsed;
    console.log(`   ✅ Execution plan generated: ${Array.isArray(tasks) ? tasks.length : 'N/A'} tasks`);
    res.json(tasks);
  } catch (error) {
    console.error(`   ❌ Execution plan AI failed, launching rescue data: ${error.message}`);
    const { blueprint = {} } = req.body;
    const rescuePlan = getRescueExecutionPlan(blueprint?.productName || "Startup");
    console.log(`   ✅ Using rescue execution plan: ${rescuePlan.length} tasks`);
    res.json(rescuePlan);
  }
});

// 5. Timeline Simulation
app.post('/api/simulate-timeline', async (req, res) => {
  console.log(`\n⏱️ [${new Date().toISOString()}] Request: Simulating Timeline...`);
  try {
    const { blueprint = {}, months = 3 } = req.body;

    console.log(`   Project: ${blueprint?.productName || 'Unknown'}`);
    console.log(`   Target Months: ${months}`);

    const messages = [
      {
        role: 'system',
        content: 'You are LaunchPact AI Timeline Analyst. Output ONLY valid JSON. No markdown, no code blocks. Just pure JSON.'
      },
      {
        role: 'user',
        content: `User wants to launch "${blueprint?.productName || 'the startup'}" in ${months} months. Is this feasible? 
        
Output ONLY JSON (no markdown, no code blocks):
{
  "targetMonths": ${months},
  "feasible": true,
  "cutsRequired": ["feature1", "feature2"],
  "riskFactor": "Medium",
  "adjustedRoadmapSuggestion": "string"
}`
      }
    ];

    console.log(`   📤 Sending to AI models...`);
    const response = await callOpenRouter(messages, true);
    const repaired = repairJson(response);
    const parsed = JSON.parse(repaired);

    console.log(`   ✅ Timeline simulation successful`);
    console.log(`   Feasible: ${parsed.feasible}`);
    console.log(`   Risk: ${parsed.riskFactor}`);
    res.json(parsed);
  } catch (error) {
    console.error(`   ❌ Timeline AI failed, using rescue logic: ${error.message}`);
    const { months = 3 } = req.body;
    const rescueResponse = {
      targetMonths: months,
      feasible: months >= 2, // Generally feasible if 2+ months
      cutsRequired: ["Deep secondary integrations", "Advanced analytics"],
      riskFactor: months < 3 ? "High" : months < 6 ? "Moderate" : "Low",
      adjustedRoadmapSuggestion: "Streamline the initial UI and focus on core task automation to meet the timeline. Prioritize MVP features over nice-to-haves."
    };
    console.log(`   ✅ Using rescue timeline: ${rescueResponse.feasible ? 'Feasible' : 'Not Feasible'}`);
    res.json(rescueResponse);
  }
});

// 6. Guided Step
app.post('/api/guided-step', async (req, res) => {
  console.log(`\n🧭 [${new Date().toISOString()}] Request: Guided Co-Founder Step...`);
  try {
    const { step = '', blueprint = {}, selections = {} } = req.body;

    console.log(`   Step: ${step}`);
    console.log(`   Project: ${blueprint?.productName || 'Unknown'}`);

    const messages = [
      {
        role: 'system',
        content: 'You are LaunchPact AI Guide. Output ONLY valid JSON. No markdown, no code blocks. Just pure JSON.'
      },
      {
        role: 'user',
        content: `You are LaunchPact AI. Step: ${step}. Project: "${blueprint?.productName || 'Startup'}". Selections: ${JSON.stringify(selections)}. Explain WHY. 
        
Output ONLY JSON (no markdown, no code blocks):
{
  "advice": "string",
  "suggestions": ["option1", "option2"]
}`
      }
    ];

    console.log(`   📤 Sending to AI models...`);
    const response = await callOpenRouter(messages, true);
    const repaired = repairJson(response);
    const parsed = JSON.parse(repaired);

    console.log(`   ✅ Guided step response successful`);
    res.json(parsed);
  } catch (error) {
    console.error(`   ❌ Guided step AI failed, using rescue advice: ${error.message}`);
    const { step = '' } = req.body;

    // Context-aware fallback advice
    let advice = "Founder, we've hit a high-traffic AI zone. My strategic advice: focus on the simplest version of this step first. Ensure your core niche is clearly defined before adding complexity.";
    let suggestions = ["Focus on core value", "Validate with 1 user", "Continue to next step"];

    if (step.toLowerCase().includes('tech') || step.toLowerCase().includes('stack')) {
      advice = "For technical decisions, start with the most proven, well-documented stack. Don't over-engineer - choose what works and iterate.";
      suggestions = ["Choose proven stack", "Document decisions", "Keep it simple"];
    } else if (step.toLowerCase().includes('market') || step.toLowerCase().includes('audience')) {
      advice = "Define your target audience narrowly first. It's better to serve 100 people perfectly than 10,000 poorly. Focus on their core pain point.";
      suggestions = ["Narrow audience", "Identify core pain", "Validate need"];
    }

    res.json({ advice, suggestions });
  }
});

// 7. Chat
app.post('/api/chat', async (req, res) => {
  const chatRequestId = Math.random().toString(36).substring(2, 9).toUpperCase();
  const timestamp = new Date().toISOString();
  const startTime = Date.now();

  console.log(`\n═══════════════════════════════════════════════════════════════`);
  console.log(`💬 [${timestamp}] [CHAT-${chatRequestId}] CHAT REQUEST RECEIVED`);
  console.log(`═══════════════════════════════════════════════════════════════`);
  console.log(`   Request ID: ${chatRequestId}`);
  console.log(`   Origin: ${req.headers.origin || 'N/A'}`);
  console.log(`   IP: ${req.ip || req.socket.remoteAddress || 'N/A'}`);
  console.log(`   API Key Status: ${OPENROUTER_API_KEY ? '✓ CONFIGURED' : '✗ MISSING'}`);
  if (OPENROUTER_API_KEY) {
    console.log(`   API Key Preview: ${OPENROUTER_API_KEY.substring(0, 12)}...${OPENROUTER_API_KEY.slice(-8)}`);
  }
  console.log(`═══════════════════════════════════════════════════════════════`);

  try {
    const { history = [], newMessage = '', context = '', isCoFounderMode = false } = req.body;

    // Validate API key first
    if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY.trim().length === 0) {
      console.error(`\n❌ [${chatRequestId}] CRITICAL ERROR: OPENROUTER_API_KEY is missing!`);
      console.error(`   AI chat functionality is disabled.`);
      console.error(`   Please set OPENROUTER_API_KEY in Render environment variables.`);
      console.error(`═══════════════════════════════════════════════════════════════\n`);

      return res.json({
        text: "I'm currently experiencing configuration issues. The AI service needs to be configured with an API key. Please contact support or check the backend configuration.",
        suggestions: ["Check backend configuration", "Retry later", "Check API key setup"],
        updates: null
      });
    }

    if (!newMessage || !newMessage.trim()) {
      console.log(`   ⚠️  Empty message received`);
      return res.json({
        text: "I'm here! What would you like to discuss about your project?",
        suggestions: ["Tell me about your idea", "Help with blueprint", "Execution advice"],
        updates: null
      });
    }

    console.log(`   Message Length: ${newMessage.length} characters`);
    console.log(`   Message Preview: "${newMessage.substring(0, 100)}${newMessage.length > 100 ? '...' : ''}"`);
    console.log(`   History Length: ${history.length} messages`);
    console.log(`   Co-Founder Mode: ${isCoFounderMode ? 'Yes' : 'No'}`);
    console.log(`   Has Context: ${context ? 'Yes (' + context.length + ' chars)' : 'No'}`);

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
      1. ALWAYS respond in valid JSON with this EXACT structure (no markdown, no code blocks):
         {
           "text": "your conversational response here",
           "suggestions": ["optional suggestion 1", "optional suggestion 2"],
           "updates": { ... }  // ONLY include this when user has CONFIRMED they want changes applied
         }
      
      2. CRITICAL: Output ONLY valid JSON. No markdown, no code blocks, no explanations. Just pure JSON.
      
      3. For blueprint modification requests:
         - First response: Discuss what you'd change and ask for confirmation
         - Second response (after user confirms): Include the "updates" object with actual changes
      
      4. The "updates" object should contain ONLY the blueprint fields being modified, for example:
         {
           "competitors": [{"name": "...", "strength": "...", "weakness": "..."}],
           "mvpFeatures": [...],
           "techStack": {...}
         }
      
      5. Be conversational, friendly, and natural - like chatting with a co-founder friend
      6. Use the user's language naturally (English/Roman Urdu/Hinglish)
      7. Keep responses concise but valuable (2-4 sentences for "text" field)`
    };

    const messages = [
      systemMessage,
      ...history.map(h => ({
        role: h.role === 'user' ? 'user' : 'assistant',
        content: h.text || h.content || ''
      })),
      { role: 'user', content: newMessage }
    ];

    console.log(`   📤 [${chatRequestId}] Sending to AI models (with fallback)...`);
    const aiResponse = await callOpenRouter(messages, true);

    try {
      const repaired = repairJson(aiResponse);
      const parsed = JSON.parse(repaired);
      const totalTime = Date.now() - startTime;

      console.log(`\n✅ [${chatRequestId}] Chat response parsed successfully`);
      console.log(`   Response text length: ${parsed.text?.length || 0} characters`);
      console.log(`   Suggestions count: ${parsed.suggestions?.length || 0}`);
      console.log(`   Has updates: ${!!parsed.updates}`);
      console.log(`   Total Processing Time: ${totalTime}ms`);
      console.log(`═══════════════════════════════════════════════════════════════\n`);

      res.json({
        text: parsed.text || "I've processed your request. How can I refine this further?",
        suggestions: parsed.suggestions || [],
        updates: parsed.updates || null
      });
    } catch (parseError) {
      console.error(`   ⚠️  JSON Parse failed, attempting recovery...`);
      console.error(`   Parse error: ${parseError.message}`);
      console.error(`   Raw response preview: ${aiResponse.substring(0, 300)}...`);

      // Try to extract text from malformed response
      let extractedText = aiResponse;

      // Try to find JSON in the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const extracted = JSON.parse(repairJson(jsonMatch[0]));
          extractedText = extracted.text || extractedText;
        } catch (e) {
          // If still can't parse, use the raw text
        }
      }

      // If response is too long, truncate it
      if (extractedText.length > 500) {
        extractedText = extractedText.substring(0, 500) + "...";
      }

      console.log(`   ✅ Using recovered response`);
      res.json({
        text: extractedText || "I understand what you're asking. Let me help you think through this step by step. What specific aspect would you like to focus on?",
        suggestions: ["Refine the question", "Change mode", "Continue building"],
        updates: null
      });
    }
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`\n❌❌❌ [${chatRequestId}] CHAT ENDPOINT ERROR ❌❌❌`);
    console.error(`   Request ID: ${chatRequestId}`);
    console.error(`   Error Type: ${error.name || 'Unknown'}`);
    console.error(`   Error Message: ${error.message || String(error)}`);
    console.error(`   Processing Time: ${totalTime}ms`);
    if (error.stack) {
      console.error(`   Stack Trace (first 5 lines):`);
      console.error(error.stack.split('\n').slice(0, 5).join('\n'));
    }
    console.error(`═══════════════════════════════════════════════════════════════`);
    console.log(`🔄 [${chatRequestId}] Using intelligent fallback response...`);
    console.log(`═══════════════════════════════════════════════════════════════\n`);

    // Intelligent fallback based on message content
    const { newMessage = '', isCoFounderMode = false } = req.body || {};
    const messageLower = newMessage.toLowerCase();

    let fallbackText = "Founder, I'm experiencing temporary connection issues with my AI models. ";
    let fallbackSuggestions = ["Retry", "Check connection", "Continue building"];

    if (messageLower.includes('blueprint') || messageLower.includes('plan')) {
      fallbackText += "For blueprint-related questions, I recommend reviewing your existing blueprint in the left panel. You can make manual adjustments there while I reconnect.";
      fallbackSuggestions = ["Review blueprint", "Manual edits", "Try again"];
    } else if (messageLower.includes('execution') || messageLower.includes('task')) {
      fallbackText += "For execution planning, focus on the current task at hand. Break it down into smaller steps and tackle them one by one.";
      fallbackSuggestions = ["Focus on current task", "Break it down", "Try again"];
    } else if (messageLower.includes('tech') || messageLower.includes('stack')) {
      fallbackText += "For technical questions, I'd suggest researching the specific technology stack you're considering. Check documentation and community forums for the latest best practices.";
      fallbackSuggestions = ["Research tech stack", "Check documentation", "Try again"];
    } else {
      fallbackText += "I recommend focusing on the core objective of your current step while I reconnect. What specific challenge are you facing right now?";
      fallbackSuggestions = ["Refine objective", "Continue building", "Try again"];
    }

    res.json({
      text: fallbackText,
      suggestions: fallbackSuggestions,
      updates: null
    });
  }
});

// 8. Generate Daily Tasks
app.post('/api/generate-daily-tasks', async (req, res) => {
  console.log(`\n📅 [${new Date().toISOString()}] Request: Generate Daily Tasks...`);
  try {
    const { executionPlan = [], timeline = {} } = req.body;
    const targetMonths = timeline?.targetMonths || 3;

    console.log(`   Target Months: ${targetMonths}`);
    console.log(`   Execution Plan Steps: ${executionPlan?.length || 0}`);

    const messages = [
      {
        role: 'system',
        content: 'You are LaunchPact AI Task Engine. Break plans into GRANULAR daily micro-tasks. Output ONLY valid JSON. No markdown, no code blocks. Just pure JSON.'
      },
      {
        role: 'user',
        content: `Create 3 HYPER-SPECIFIC tasks/day for ${targetMonths} months. 
      
      DAY 1 CRITICAL FOCUS: Foundation & Depth ONLY. (e.g., Development Environment Setup, Competitor Deep-Dive, or Niche Identification). DO NOT jump to Development or Deployment on Day 1.
      
      Requirements:
      1. START FROM DAY 1. EXACTLY 3 tasks/day.
      2. DAY 1 FOCUS ONLY: Foundation, Environment Setup, and Market Depth.
      3. Format: { "dailyTasks": [ { "id", "title", "description", "phase", "estimatedTime", "subTasks": [{"id", "title", "isCompleted"}], "aiGuidancePrompt", "isCompleted": false, "xpReward", "dayNumber": 1 } ] }.
      
      Plan Context: ${JSON.stringify(executionPlan ? executionPlan.slice(0, 8) : [])}
      
      Output ONLY valid JSON (no markdown, no code blocks).`
      }
    ];

    console.log(`   📤 Sending to AI models...`);
    const aiResponse = await callOpenRouter(messages, true);
    let dailyTasks = [];

    try {
      const repaired = repairJson(aiResponse);
      const parsed = JSON.parse(repaired);
      dailyTasks = parsed.dailyTasks || parsed || [];

      // Ensure all tasks have required fields and proper day numbers
      dailyTasks = dailyTasks.map((t, idx) => ({
        id: t.id || `task-${idx + 1}`,
        title: t.title || 'Task',
        description: t.description || '',
        phase: t.phase || 'Planning',
        estimatedTime: t.estimatedTime || '1 day',
        subTasks: t.subTasks || [],
        aiGuidancePrompt: t.aiGuidancePrompt || '',
        isCompleted: t.isCompleted || false,
        xpReward: t.xpReward || 100,
        dayNumber: t.dayNumber || Math.floor(idx / 3) + 1
      }));

      console.log(`   ✅ Daily tasks generated: ${dailyTasks.length} tasks`);
      console.log(`   Days covered: ${Math.max(...dailyTasks.map(t => t.dayNumber || 1))} days`);
    } catch (parseError) {
      console.error(`   ⚠️  JSON Parse failed, using rescue data`);
      console.error(`   Parse error: ${parseError.message}`);
      console.error(`   Raw response preview: ${aiResponse.substring(0, 300)}...`);
      throw new Error("Could not parse AI response.");
    }

    res.json({ dailyTasks });
  } catch (error) {
    console.error(`   ❌ Daily tasks AI failed, launching rescue data: ${error.message}`);
    const rescueTasks = getRescueDailyTasks();
    console.log(`   ✅ Using rescue daily tasks: ${rescueTasks.length} tasks`);
    res.json({ dailyTasks: rescueTasks });
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

  // Check if resend client is available
  if (!resend) {
    console.warn('⚠️  Resend client not initialized. Skipping email.');
    return res.json({ success: true, message: 'Signup successful (email disabled)' });
  }

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
  console.log(`\n🔒 [${new Date().toISOString()}] Request: Locking plan...`);
  try {
    const { blueprint = {}, executionPlan = [], timeline = {} } = req.body;

    console.log(`   Project: ${blueprint?.productName || 'Unknown'}`);
    console.log(`   Execution Plan Steps: ${executionPlan?.length || 0}`);
    console.log(`   Timeline: ${timeline?.targetMonths || 3} months`);

    // Call internal daily tasks generator
    const messages = [
      {
        role: 'system',
        content: 'You are LaunchPact AI Task Engine. Output ONLY valid JSON. No markdown, no code blocks. Just pure JSON with dailyTasks array.'
      },
      {
        role: 'user',
        content: `Break plan into 3 granular tasks per day. Day 1: Setup/Research ONLY. Output JSON format: { "dailyTasks": [...] }. Plan: ${JSON.stringify(executionPlan ? executionPlan.slice(0, 8) : [])}`
      }
    ];

    console.log(`   📤 Generating daily tasks via AI...`);
    const aiResponse = await callOpenRouter(messages, true);
    let dailyTasks = [];

    try {
      const repaired = repairJson(aiResponse);
      const parsed = JSON.parse(repaired);
      dailyTasks = parsed.dailyTasks || parsed || [];

      // Ensure all tasks have required fields
      dailyTasks = (dailyTasks || []).map((t, idx) => ({
        ...t,
        id: t.id || `task-${idx + 1}`,
        dayNumber: t.dayNumber || Math.floor(idx / 3) + 1,
        isCompleted: t.isCompleted || false
      }));

      console.log(`   ✅ Daily tasks generated: ${dailyTasks.length} tasks`);
    } catch (parseError) {
      console.error(`   ⚠️  Failed to parse daily tasks, using rescue data: ${parseError.message}`);
      dailyTasks = getRescueDailyTasks();
    }

    const targetMonths = timeline?.targetMonths || 3;
    const lockedPlan = {
      id: Math.random().toString(36).substring(7),
      blueprint,
      executionPlan: executionPlan || getRescueExecutionPlan(blueprint?.productName || 'Startup'),
      timeline,
      dailyTasks: dailyTasks,
      lockedAt: new Date().toISOString(),
      startDate: new Date().toISOString(),
      targetLaunchDate: new Date(Date.now() + targetMonths * 30 * 24 * 60 * 60 * 1000).toISOString(),
      currentProgress: 0,
      completedTasksCount: 0,
      totalTasksCount: dailyTasks?.length || 0
    };

    console.log(`   ✅ Plan locked successfully`);
    console.log(`   Plan ID: ${lockedPlan.id}`);
    console.log(`   Total Tasks: ${lockedPlan.totalTasksCount}`);
    res.json({ lockedPlan });
  } catch (error) {
    console.error(`   ❌ Lock plan AI failed, launching mission support fallback: ${error.message}`);
    const { blueprint = {}, executionPlan = [], timeline = {} } = req.body;
    const rescueTasks = getRescueDailyTasks();
    const targetMonths = timeline?.targetMonths || 3;

    const lockedPlan = {
      id: "rescue-" + Math.random().toString(36).substring(7),
      blueprint,
      executionPlan: executionPlan || getRescueExecutionPlan(blueprint?.productName || 'Startup'),
      timeline,
      dailyTasks: rescueTasks,
      lockedAt: new Date().toISOString(),
      startDate: new Date().toISOString(),
      targetLaunchDate: new Date(Date.now() + targetMonths * 30 * 24 * 60 * 60 * 1000).toISOString(),
      currentProgress: 0,
      completedTasksCount: 0,
      totalTasksCount: rescueTasks.length
    };

    console.log(`   ✅ Using rescue plan: ${lockedPlan.id} (${rescueTasks.length} tasks)`);
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
    if (!resend) {
      console.warn('⚠️  Resend client not initialized. OTP stored but email not sent.');
      return res.json({ success: true, message: "OTP generated (email disabled)" });
    }

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

// Helper function to get base URL from request
const getBaseUrl = (req) => {
  // Try to get from environment variable first
  if (process.env.VITE_APP_URL) {
    return process.env.VITE_APP_URL;
  }

  // Try to get from request headers (for Vercel or similar)
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'launchpact-ai.vercel.app';

  // Build base URL
  let baseUrl = `${protocol}://${host}`;

  // Remove port if default
  if (host.includes(':3000') || host.includes(':5173')) {
    baseUrl = baseUrl.replace(/:\d+$/, '');
  }

  // Fallback to production URL
  if (!baseUrl || baseUrl.includes('localhost')) {
    baseUrl = 'https://launchpact-ai.vercel.app';
  }

  return baseUrl;
};

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
      if (!resend) {
        console.warn(`⚠️  Resend client not initialized. Skipping email for ${member.email}`);
        continue; // Skip this member and continue with next
      }

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
              <a href="${getBaseUrl(req)}/team-invite/${inviteToken}" 
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

// 17. Get Team Invite by Token (to verify and show invitation details)
app.get('/api/team/invite/:token', async (req, res) => {
  const { token } = req.params;

  try {
    const { data: member, error: fetchError } = await supabase
      .from('team_members')
      .select('*, plans(product_name)')
      .eq('invite_token', token)
      .single();

    if (fetchError || !member) {
      return res.status(404).json({ error: 'Invalid or expired invite' });
    }

    res.json({ success: true, member });
  } catch (error) {
    console.error('❌ Get invite failed:', error.message);
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

    // Check if already joined
    if (member.joined_at) {
      return res.status(400).json({ error: 'Invitation already accepted' });
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

    // Fetch updated member with plan details
    const { data: updatedMember } = await supabase
      .from('team_members')
      .select('*, plans(product_name)')
      .eq('invite_token', token)
      .single();

    res.json({ success: true, member: updatedMember });
  } catch (error) {
    console.error('❌ Accept invite failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 17a. Ignore Team Invite
app.post('/api/team/ignore-invite/:token', async (req, res) => {
  const { token } = req.params;
  const { userId } = req.body;

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

    // Mark as ignored by setting user_id but keeping joined_at null
    // Or we could add an ignored_at field - for now, we'll just leave it as is
    // The invite will remain in "Awaiting Uplink" but can be filtered client-side

    res.json({ success: true, message: 'Invitation ignored' });
  } catch (error) {
    console.error('❌ Ignore invite failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 17b. Accept Later Team Invite (mark for later)
app.post('/api/team/accept-later/:token', async (req, res) => {
  const { token } = req.params;
  const { userId } = req.body;

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

    // Store user_id but don't set joined_at - this marks it as "accepted later"
    // They can come back and fully accept it later
    const { error: updateError } = await supabase
      .from('team_members')
      .update({
        user_id: userId
        // joined_at stays null - means they've seen it but not fully joined
      })
      .eq('invite_token', token);

    if (updateError) throw updateError;

    res.json({ success: true, message: 'Invitation saved for later', member });
  } catch (error) {
    console.error('❌ Accept later failed:', error.message);
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
  } catch (error) {
    console.error('❌ Mark notification read failed:', error.message);
    res.status(500).json({ error: error.message });
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
