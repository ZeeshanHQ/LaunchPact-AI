
import { ProductBlueprint, ExecutionTask, TimelineSimulation } from "../types";

// Use environment variable for production (Render backend) or relative path for dev (Vite proxy)
// In production: VITE_API_BASE_URL should be set to your Render backend URL (e.g., https://your-app.onrender.com)
// In development: Vite proxy forwards /api/* to http://localhost:3000
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

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

  console.log(`🚀 Generating blueprint for: "${rawIdea.slice(0, 50)}..."`);
  console.log(`📡 API Base URL: ${API_BASE_URL}`);

  try {
    const response = await fetch(`${API_BASE_URL}/generate-blueprint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawIdea })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`❌ API Error (${response.status}):`, errorData);
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Blueprint generated successfully: ${data.productName || 'Unknown'}`);
    return data;
  } catch (err: any) {
    console.error("❌ Blueprint generation failed:", err);
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
