/**
 * Recommendation Service - AI-powered suggestion engine for request optimization
 * 
 * This service analyzes historical request data, user preferences, and
 * successful patterns to provide personalized recommendations for
 * optimizing new and existing requests.
 */

import { storage } from '../storage';
import { aiService } from './ai-service';
import type { User, Request, Step, Payment } from '@shared/schema';

export interface RecommendationScore {
  score: number;  // 0-100 score
  confidence: number; // 0-1 confidence level
  reasons: string[]; // Reasons for the recommendation
}

export interface StepRecommendation {
  title: string;
  description: string;
  assignedTo: 'ai' | 'human';
  estimatedHours: number;
  score: RecommendationScore;
}

export interface ResourceRecommendation {
  type: 'team_member' | 'tool' | 'service' | 'provider';
  name: string;
  description: string;
  score: RecommendationScore;
}

export interface OptimizationRecommendation {
  type: 'cost' | 'time' | 'quality';
  description: string;
  potentialSavings?: number;
  potentialTimeReduction?: number;
  score: RecommendationScore;
}

/**
 * Recommendation service that provides personalized suggestions
 */
export class RecommendationService {
  /**
   * Get recommended steps for a request based on its description
   * and similar past requests
   */
  async getRecommendedSteps(
    requestDescription: string,
    userId: number
  ): Promise<StepRecommendation[]> {
    // Get user history
    const userRequests = await storage.getRequestsByUserId(userId);
    
    // Get similar completed requests from all users
    const allRequests = await storage.getAllRequests();
    const completedRequests = allRequests.filter(r => r.status === 'completed');
    
    // Find similar requests based on description (simplified implementation)
    // In a real system, this would use semantic similarity with embeddings
    const similarRequests = completedRequests.filter(r => 
      this.calculateSimilarity(r.description, requestDescription) > 0.6
    );
    
    // Get steps from similar requests
    const similarSteps = await Promise.all(
      similarRequests.map(r => storage.getStepsByRequestId(r.id))
    );
    
    // Group and count common step patterns
    const stepPatterns = this.analyzeStepPatterns(similarSteps.flat());
    
    // Generate recommendations based on common patterns
    const recommendations: StepRecommendation[] = [];
    
    for (const pattern of stepPatterns.slice(0, 5)) { // Take top 5 patterns
      recommendations.push({
        title: pattern.title,
        description: pattern.description,
        assignedTo: pattern.assignedTo as 'ai' | 'human',
        estimatedHours: pattern.averageHours,
        score: {
          score: Math.min(100, pattern.frequency * 20), // Score based on frequency
          confidence: pattern.frequency / stepPatterns.length,
          reasons: [
            `Similar to steps in ${pattern.frequency} successful requests`,
            `Typically takes ${pattern.averageHours.toFixed(1)} hours to complete`
          ]
        }
      });
    }
    
    // If not enough recommendations from historical data, use AI
    if (recommendations.length < 3) {
      try {
        // Use AI to generate additional step recommendations
        const aiAnalysis = await aiService.analyzeRequest(requestDescription);
        
        for (const step of aiAnalysis.plan) {
          if (!recommendations.some(r => r.title === step.step)) {
            recommendations.push({
              title: step.step,
              description: `AI-recommended step: ${step.step}`,
              assignedTo: step.assignedTo,
              estimatedHours: step.estimatedHours,
              score: {
                score: 75, // Default score for AI recommendations
                confidence: 0.7,
                reasons: [
                  'Recommended by AI based on request description',
                  `Estimated to take ${step.estimatedHours} hours to complete`
                ]
              }
            });
          }
        }
      } catch (error) {
        console.error('Error generating AI recommendations:', error);
      }
    }
    
    return recommendations;
  }
  
  /**
   * Get recommended resources (team members, tools, services) for a request
   */
  async getResourceRecommendations(
    requestId: number
  ): Promise<ResourceRecommendation[]> {
    const request = await storage.getRequest(requestId);
    if (!request) return [];
    
    const recommendations: ResourceRecommendation[] = [];
    
    // Get all users and find team members
    const users = await storage.getAllUsers();
    const teamMembers = users.filter(u => u.role === 'team_member' || u.role === 'admin');
    
    // Get step information to determine required skills
    const steps = await storage.getStepsByRequestId(requestId);
    
    // For each team member, calculate a match score based on past performance
    // and skills needed for this request
    for (const member of teamMembers) {
      // Get requests this team member has worked on
      const memberRequests = await Promise.all(
        (await storage.getAllRequests())
          .filter(r => r.status === 'completed')
          .map(async r => {
            const steps = await storage.getStepsByRequestId(r.id);
            return {
              request: r,
              worked: steps.some(s => s.assignedTo === member.username)
            };
          })
      );
      
      const workedRequests = memberRequests
        .filter(r => r.worked)
        .map(r => r.request);
      
      // Calculate similarity between this request and past requests
      const similarities = workedRequests.map(r => 
        this.calculateSimilarity(r.description, request.description)
      );
      
      // Calculate average similarity score
      const averageSimilarity = similarities.length > 0
        ? similarities.reduce((a, b) => a + b, 0) / similarities.length
        : 0;
      
      // Only recommend if similarity is significant
      if (averageSimilarity > 0.4) {
        recommendations.push({
          type: 'team_member',
          name: member.fullName,
          description: `${member.fullName} has experience with similar requests.`,
          score: {
            score: Math.min(100, Math.round(averageSimilarity * 100)),
            confidence: Math.min(1, averageSimilarity + 0.2),
            reasons: [
              `Worked on ${workedRequests.length} similar requests`,
              `${Math.round(averageSimilarity * 100)}% similarity to previous work`
            ]
          }
        });
      }
    }
    
    // Add AI provider recommendations based on request content
    const aiProviders = aiService.getAvailableProviders();
    for (const provider of aiProviders) {
      let score = 0;
      let description = '';
      let reasons: string[] = [];
      
      switch (provider) {
        case 'openai':
          score = this.containsKeywords(request.description, ['general', 'creative', 'writing', 'content']) ? 85 : 70;
          description = 'OpenAI is recommended for general tasks and creative content generation.';
          reasons = ['Good for general purpose tasks', 'Strong at creative writing and content generation'];
          break;
          
        case 'anthropic':
          score = this.containsKeywords(request.description, ['legal', 'document', 'contract', 'analysis']) ? 90 : 65;
          description = 'Anthropic Claude is ideal for legal document analysis and contract drafting.';
          reasons = ['Excellent at understanding complex documents', 'Strong reasoning capabilities'];
          break;
          
        case 'perplexity':
          score = this.containsKeywords(request.description, ['research', 'information', 'summarize', 'data']) ? 90 : 60;
          description = 'Perplexity AI excels at research tasks and information retrieval.';
          reasons = ['Specializes in research and information gathering', 'Access to recent information'];
          break;
          
        case 'xai':
          score = this.containsKeywords(request.description, ['technical', 'coding', 'debug', 'programming']) ? 88 : 65;
          description = 'xAI/Grok is recommended for technical and coding-related tasks.';
          reasons = ['Strong technical problem-solving abilities', 'Good at coding and debugging tasks'];
          break;
      }
      
      recommendations.push({
        type: 'provider',
        name: provider.charAt(0).toUpperCase() + provider.slice(1), // Capitalize
        description,
        score: {
          score,
          confidence: score / 100,
          reasons
        }
      });
    }
    
    // Sort by score (descending)
    return recommendations.sort((a, b) => b.score.score - a.score.score);
  }
  
  /**
   * Get optimization recommendations for cost and time savings
   */
  async getOptimizationRecommendations(
    requestId: number
  ): Promise<OptimizationRecommendation[]> {
    const request = await storage.getRequest(requestId);
    if (!request) return [];
    
    const recommendations: OptimizationRecommendation[] = [];
    const steps = await storage.getStepsByRequestId(requestId);
    
    // Check for opportunities to use AI instead of human for certain steps
    const humanSteps = steps.filter(s => s.assignedTo === 'human' && s.status !== 'completed');
    
    for (const step of humanSteps) {
      const aiReplacementCandidate = this.isAiReplacementCandidate(step.title, step.description);
      
      if (aiReplacementCandidate.isCandidate) {
        // Estimate cost savings based on step effort
        const estimatedHoursSaved = step.estimatedHours || 2; // Default to 2 hours if not specified
        const estimatedCostSaving = estimatedHoursSaved * 100; // Assume $100/hour
        
        recommendations.push({
          type: 'cost',
          description: `Consider using AI for the step "${step.title}". ${aiReplacementCandidate.reason}`,
          potentialSavings: estimatedCostSaving,
          potentialTimeReduction: estimatedHoursSaved,
          score: {
            score: aiReplacementCandidate.score,
            confidence: aiReplacementCandidate.confidence,
            reasons: [
              aiReplacementCandidate.reason,
              `Potential cost saving of $${estimatedCostSaving}`,
              `Potential time saving of ${estimatedHoursSaved} hours`
            ]
          }
        });
      }
    }
    
    // Look for redundant steps
    const stepTitles = steps.map(s => s.title.toLowerCase());
    const duplicateSteps = this.findDuplicateSteps(steps);
    
    for (const duplicate of duplicateSteps) {
      recommendations.push({
        type: 'time',
        description: `Consider combining similar steps: "${duplicate.first.title}" and "${duplicate.second.title}"`,
        potentialTimeReduction: Math.min(duplicate.first.estimatedHours || 1, duplicate.second.estimatedHours || 1),
        score: {
          score: 80,
          confidence: duplicate.similarity,
          reasons: [
            `Steps have ${Math.round(duplicate.similarity * 100)}% similarity`,
            `Combining could save ${Math.min(duplicate.first.estimatedHours || 1, duplicate.second.estimatedHours || 1)} hours`
          ]
        }
      });
    }
    
    // Add quality improvement recommendations
    if (request.status === 'in_progress') {
      // Check for steps that might benefit from additional quality control
      const criticalSteps = steps.filter(s => 
        this.containsKeywords(s.title, ['final', 'review', 'approve', 'deliver', 'submit']) ||
        this.containsKeywords(s.description, ['final', 'review', 'approve', 'deliver', 'submit'])
      );
      
      for (const step of criticalSteps) {
        recommendations.push({
          type: 'quality',
          description: `Add a quality review step before "${step.title}" to ensure high-quality delivery.`,
          score: {
            score: 85,
            confidence: 0.8,
            reasons: [
              'Critical final step that benefits from quality control',
              'Quality reviews reduce client revision requests'
            ]
          }
        });
      }
    }
    
    return recommendations;
  }
  
  /**
   * Calculate simple similarity between two text strings
   * (a very simplified implementation - in production, use semantic similarity)
   */
  private calculateSimilarity(text1: string, text2: string): number {
    // Normalize and tokenize
    const tokens1 = this.tokenize(text1);
    const tokens2 = this.tokenize(text2);
    
    // Count matching tokens
    const matches = tokens1.filter(t => tokens2.includes(t)).length;
    
    // Calculate Jaccard similarity
    const union = new Set([...tokens1, ...tokens2]).size;
    return union > 0 ? matches / union : 0;
  }
  
  /**
   * Simple tokenization function
   */
  private tokenize(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .split(/\s+/) // Split on whitespace
      .filter(t => t.length > 2); // Filter out short words
  }
  
  /**
   * Check if text contains any of the given keywords
   */
  private containsKeywords(text: string, keywords: string[]): boolean {
    const normalizedText = text.toLowerCase();
    return keywords.some(keyword => normalizedText.includes(keyword.toLowerCase()));
  }
  
  /**
   * Analyze step patterns to find common steps across requests
   */
  private analyzeStepPatterns(steps: Step[]): Array<{
    title: string;
    description: string;
    assignedTo: string;
    frequency: number;
    averageHours: number;
  }> {
    // Group steps by similarity in title
    const patterns: Map<string, {
      steps: Step[];
      title: string;
      description: string;
      assignedTo: string;
      frequency: number;
      averageHours: number;
    }> = new Map();
    
    for (const step of steps) {
      // Find if this step is similar to an existing pattern
      let matchFound = false;
      
      for (const [key, pattern] of patterns.entries()) {
        const similarity = this.calculateSimilarity(step.title, pattern.title);
        
        if (similarity > 0.7) { // High similarity threshold
          pattern.steps.push(step);
          pattern.frequency += 1;
          pattern.averageHours = pattern.steps.reduce((sum, s) => sum + (s.estimatedHours || 1), 0) / pattern.steps.length;
          matchFound = true;
          break;
        }
      }
      
      if (!matchFound) {
        // Create a new pattern
        patterns.set(step.title, {
          steps: [step],
          title: step.title,
          description: step.description,
          assignedTo: step.assignedTo,
          frequency: 1,
          averageHours: step.estimatedHours || 1
        });
      }
    }
    
    // Convert to array and sort by frequency
    return Array.from(patterns.values())
      .sort((a, b) => b.frequency - a.frequency);
  }
  
  /**
   * Check if a step is a good candidate for AI replacement
   */
  private isAiReplacementCandidate(title: string, description: string): {
    isCandidate: boolean;
    score: number;
    confidence: number;
    reason: string;
  } {
    const combinedText = `${title} ${description}`.toLowerCase();
    
    // Check for commonly automatable tasks
    if (this.containsKeywords(combinedText, ['research', 'gather', 'collect', 'information'])) {
      return {
        isCandidate: true,
        score: 85,
        confidence: 0.8,
        reason: 'Research and information gathering tasks can be efficiently handled by AI.'
      };
    }
    
    if (this.containsKeywords(combinedText, ['write', 'draft', 'create', 'content', 'summary'])) {
      return {
        isCandidate: true,
        score: 80,
        confidence: 0.75,
        reason: 'Content creation and drafting can be handled by AI with human review.'
      };
    }
    
    if (this.containsKeywords(combinedText, ['analyze', 'report', 'summarize', 'data'])) {
      return {
        isCandidate: true,
        score: 75,
        confidence: 0.7,
        reason: 'Data analysis and report generation can be partially automated with AI.'
      };
    }
    
    // Default not a candidate
    return {
      isCandidate: false,
      score: 0,
      confidence: 0,
      reason: ''
    };
  }
  
  /**
   * Find potentially redundant steps
   */
  private findDuplicateSteps(steps: Step[]): Array<{
    first: Step;
    second: Step;
    similarity: number;
  }> {
    const duplicates = [];
    
    // Compare each pair of steps
    for (let i = 0; i < steps.length; i++) {
      for (let j = i + 1; j < steps.length; j++) {
        const similarity = this.calculateSimilarity(
          `${steps[i].title} ${steps[i].description}`,
          `${steps[j].title} ${steps[j].description}`
        );
        
        if (similarity > 0.6) { // Threshold for potential duplication
          duplicates.push({
            first: steps[i],
            second: steps[j],
            similarity
          });
        }
      }
    }
    
    return duplicates;
  }
}

// Export singleton instance
export const recommendationService = new RecommendationService();