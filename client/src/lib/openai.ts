import { apiRequest } from "./queryClient";

// Types for AI analysis response
export interface AiStep {
  step: string;
  assignedTo: "ai" | "human";
  estimatedHours: number;
}

export interface AiAnalysisResponse {
  plan: AiStep[];
  costEstimateRange: {
    min: number;
    max: number;
  };
  summary: string;
}

// Function to analyze a request using the AI backend
export async function analyzeRequest(requestDescription: string): Promise<AiAnalysisResponse> {
  try {
    const response = await apiRequest("POST", "/api/ai/analyze-request", { requestDescription });
    return await response.json();
  } catch (error) {
    console.error("Error analyzing request:", error);
    throw new Error("Failed to analyze request. Please try again.");
  }
}

// Function to generate an AI response for the chat
export async function sendMessage(requestId: number, content: string, senderId: string): Promise<any> {
  try {
    const response = await apiRequest("POST", "/api/messages", {
      requestId,
      content,
      senderId
    });
    return await response.json();
  } catch (error) {
    console.error("Error sending message:", error);
    throw new Error("Failed to send message. Please try again.");
  }
}

// Function to draft a contract using AI
export async function draftContract(requestId: number, details: string): Promise<{ contractContent: string }> {
  try {
    const response = await apiRequest("POST", "/api/ai/draft-contract", {
      requestId,
      details
    });
    return await response.json();
  } catch (error) {
    console.error("Error drafting contract:", error);
    throw new Error("Failed to draft contract. Please try again.");
  }
}
