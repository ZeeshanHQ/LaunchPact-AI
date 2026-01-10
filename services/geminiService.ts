
import { ProductBlueprint, ExecutionTask, TimelineSimulation } from "../types";

// Use environment variable for production (Render backend) or relative path for dev (Vite proxy)
// In production on Vercel: Use /api (Vercel rewrite will proxy to Render backend)
// For direct Render calls: Set VITE_API_BASE_URL to https://launchpact-ai.onrender.com
// In development: Vite proxy forwards /api/* to http://localhost:3000
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Log API configuration for debugging
if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:', {
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    API_BASE_URL,
    mode: import.meta.env.MODE,
    isDev: import.meta.env.DEV
  });
}

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server error: ${response.status}`);
  }
  return response.json();
};

export const enhanceUserPrompt = async (rawInput: string): Promise<string> => {
  if (!rawInput.trim()) return "";
  try {
    const data = await handleResponse(await fetch(`${API_BASE_URL}/enhance-prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawInput })
    }));
    return data.text || rawInput;
  } catch (error) {
    console.error("Enhancement failed", error);
    return rawInput;
  }
};

export const generateProductBlueprint = async (rawIdea: string): Promise<ProductBlueprint> => {
  if (!rawIdea || !rawIdea.trim()) {
    throw new Error('Raw idea is required');
  }

  const requestId = Math.random().toString(36).substring(2, 9).toUpperCase();
  const timestamp = new Date().toISOString();

  console.log(`\n═══════════════════════════════════════════════════════════════`);
  console.log(`🚀 [${timestamp}] [FRONTEND-${requestId}] BLUEPRINT GENERATION STARTED`);
  console.log(`═══════════════════════════════════════════════════════════════`);
  console.log(`   Request ID: ${requestId}`);
  console.log(`   Idea Preview: "${rawIdea.slice(0, 100)}${rawIdea.length > 100 ? '...' : ''}"`);
  console.log(`   Idea Length: ${rawIdea.length} characters`);
  console.log(`   API Base URL: ${API_BASE_URL}`);
  console.log(`   Full Endpoint: ${API_BASE_URL}/generate-blueprint`);
  console.log(`   Environment: ${import.meta.env.MODE}`);
  console.log(`═══════════════════════════════════════════════════════════════\n`);

  try {
    const requestBody = { rawIdea };
    console.log(`📤 [${requestId}] Sending POST request to backend...`);

    const response = await fetch(`${API_BASE_URL}/generate-blueprint`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log(`📥 [${requestId}] Response received:`, {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      let errorData: any = {};
      try {
        const errorText = await response.text();
        errorData = errorText ? JSON.parse(errorText) : {};
      } catch (e) {
        console.error(`⚠️ [${requestId}] Failed to parse error response`);
        errorData = { error: `Server returned ${response.status}: ${response.statusText}` };
      }

      console.error(`\n❌ [${requestId}] API Error Response:`, {
        status: response.status,
        error: errorData.error || errorData.message,
        rescue: !!errorData.rescue
      });

      // Critical Fix: Use rescue data if available, even on 500 error
      if (errorData.rescue) {
        console.warn(`⚠️ [${requestId}] AI Generation failed, using rescue blueprint`);
        console.log(`✅ [${requestId}] Returning rescue blueprint: ${errorData.rescue.productName || 'Unknown'}`);
        return errorData.rescue;
      }

      throw new Error(errorData.error || errorData.message || `Server error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`\n✅ [${requestId}] Blueprint generated successfully!`);
    console.log(`   Product Name: ${data.productName || 'Unknown'}`);
    console.log(`   Response Keys: ${Object.keys(data).join(', ')}`);
    console.log(`═══════════════════════════════════════════════════════════════\n`);

    return data;
  } catch (err: any) {
    console.error(`\n❌❌❌ [${requestId}] BLUEPRINT GENERATION FAILED ❌❌❌`);
    console.error(`   Error Type: ${err.name || 'Unknown'}`);
    console.error(`   Error Message: ${err.message || 'Unknown error'}`);
    if (err.stack) {
      console.error(`   Stack Trace (first 3 lines):`);
      console.error(err.stack.split('\n').slice(0, 3).join('\n'));
    }
    console.error(`═══════════════════════════════════════════════════════════════\n`);

    throw new Error(err.message || "Failed to generate blueprint. Please check your connection and try again.");
  }
};

export const generateExecutionPlan = async (blueprint: ProductBlueprint): Promise<ExecutionTask[]> => {
  try {
    const data = await handleResponse(await fetch(`${API_BASE_URL}/execution-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blueprint })
    }));
    return Array.isArray(data) ? data : (data.tasks || []);
  } catch (error) {
    console.error("Execution plan failed", error);
    return [];
  }
};

export const simulateTimeline = async (blueprint: ProductBlueprint, months: number): Promise<TimelineSimulation> => {
  try {
    const data = await handleResponse(await fetch(`${API_BASE_URL}/simulate-timeline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blueprint, months })
    }));
    return data;
  } catch (error) {
    console.error("Timeline simulation failed", error);
    throw error;
  }
};

export const getGuidedCoFounderStep = async (step: string, blueprint: ProductBlueprint, selections?: Record<string, any>) => {
  try {
    const data = await handleResponse(await fetch(`${API_BASE_URL}/guided-step`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step, blueprint, selections })
    }));
    return data;
  } catch (e) {
    return {
      advice: "PNX backend is offline. Please check your terminal.",
      suggestions: ["Retry connection"]
    };
  }
};

export const chatWithAssistant = async (history: any[], newMessage: string, context?: string, isCoFounderMode: boolean = false) => {
  try {
    const data = await handleResponse(await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history, newMessage, context, isCoFounderMode })
    }));
    return data;
  } catch (e) {
    return { text: "Connection error. Is the backend server running?", suggestions: [] };
  }
};
