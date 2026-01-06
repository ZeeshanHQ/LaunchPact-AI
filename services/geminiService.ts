
import { ProductBlueprint, ExecutionTask, TimelineSimulation } from "../types";

// Use relative path so Vite proxy forwards to backend (localhost:3000)
// Vite proxy is configured in vite.config.ts to forward /api/* to http://localhost:3000
const API_BASE_URL = '/api';

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
  try {
    const data = await handleResponse(await fetch(`${API_BASE_URL}/generate-blueprint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawIdea })
    }));
    return data;
  } catch (err) {
    console.error("Blueprint generation failed:", err);
    throw err;
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
