/**
 * Service initialization and export
 * 
 * This file initializes all services and exports them for use throughout the application.
 */

import { Server } from 'http';
import { aiService } from './ai-service';
import { notificationService } from './notification-service';
import { workspaceService } from './workspace-service';
import { recommendationService } from './recommendation-service';

/**
 * Initialize all services that require setup
 * @param server HTTP server instance for WebSocket initialization
 */
export function initializeServices(server: Server): void {
  // Initialize the collaborative workspace service with WebSocket server
  try {
    workspaceService.initialize(server);
    console.log('All services initialized successfully');
  } catch (error) {
    console.error('Failed to initialize workspace service:', error);
    // Continue running even if WebSocket fails
  }
}

// Export all services
export {
  aiService,
  notificationService,
  workspaceService,
  recommendationService
};