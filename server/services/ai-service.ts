/**
 * AI Service - Unified interface for multiple AI providers
 * 
 * This service provides a consistent interface for interacting with 
 * different AI providers based on the specific needs of each task.
 */

import { analyzeRequest, draftContract, generateAssistantResponse } from "../ai";

export type AiProvider = 'openai' | 'anthropic' | 'perplexity' | 'xai';

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

export interface AiMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * AI Service class that provides a unified interface to different AI providers
 */
export class AiService {
  // Default to OpenAI
  private provider: AiProvider = 'openai';
  
  /**
   * Set the AI provider to use
   * @param provider The AI provider to use
   */
  setProvider(provider: AiProvider): void {
    this.provider = provider;
  }
  
  /**
   * Get the recommended provider for a specific task type
   * @param taskType The type of task
   * @returns The recommended provider
   */
  getRecommendedProvider(taskType: string): AiProvider {
    // Logic to determine the best provider for each task type
    switch (taskType.toLowerCase()) {
      case 'contract':
      case 'legal':
      case 'document-analysis':
        return 'anthropic'; // Claude is excellent for legal text
      
      case 'research':
      case 'information-retrieval':
        return 'perplexity'; // Perplexity is best for research
        
      case 'technical':
      case 'coding':
        return 'xai'; // xAI/Grok for technical tasks
        
      default:
        return 'openai'; // Default to OpenAI for general tasks
    }
  }
  
  /**
   * Analyze a client request to generate a plan
   * @param requestDescription The client's request description
   * @param taskType Optional task type to determine provider
   * @returns Analysis with plan, cost estimate, and summary
   */
  async analyzeRequest(
    requestDescription: string, 
    taskType?: string
  ): Promise<AiAnalysisResponse> {
    // If task type provided, use the recommended provider
    if (taskType) {
      this.setProvider(this.getRecommendedProvider(taskType));
    }
    
    // For now, we'll use our existing OpenAI implementation
    // In the future, this can be extended to use different providers
    return await analyzeRequest(requestDescription);
  }
  
  /**
   * Draft a contract based on request details
   * @param requestDetails Details needed for the contract
   * @returns Generated contract content
   */
  async draftContract(requestDetails: string): Promise<{ contractContent: string }> {
    // Contracts benefit from Claude's reasoning, but fallback to OpenAI
    this.setProvider('openai'); // Default to OpenAI for now
    
    const result = await draftContract(requestDetails);
    return {
      contractContent: result.contractContent
    };
  }
  
  /**
   * Generate an AI response for conversation
   * @param conversation Previous messages in the conversation
   * @param context Additional context information
   * @returns AI generated response
   */
  async generateResponse(
    conversation: AiMessage[],
    context: string
  ): Promise<string> {
    // Convert our message format to what our current implementation expects
    const formattedConversation = conversation.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    return await generateAssistantResponse(formattedConversation, context);
  }
  
  /**
   * Check if a specific provider is available (has API key configured)
   * @param provider The provider to check
   * @returns Boolean indicating if the provider is available
   */
  isProviderAvailable(provider: AiProvider): boolean {
    switch (provider) {
      case 'openai':
        return !!process.env.OPENAI_API_KEY;
      case 'anthropic':
        return !!process.env.ANTHROPIC_API_KEY;
      case 'perplexity':
        return !!process.env.PERPLEXITY_API_KEY;
      case 'xai':
        return !!process.env.XAI_API_KEY;
      default:
        return false;
    }
  }
  
  /**
   * Get all available AI providers
   * @returns Array of available providers
   */
  getAvailableProviders(): AiProvider[] {
    return ['openai', 'anthropic', 'perplexity', 'xai'].filter(
      provider => this.isProviderAvailable(provider as AiProvider)
    ) as AiProvider[];
  }
}

// Export a singleton instance
export const aiService = new AiService();