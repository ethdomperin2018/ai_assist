/**
 * Collaborative Workspace Service 
 * 
 * This service facilitates real-time collaboration between team members
 * working on client requests, including shared document editing, task
 * assignment, and progress tracking.
 */

import { storage } from '../storage';
import { WebSocketServer } from 'ws';
import { Server } from 'http';
import type { User, Request, Step } from '@shared/schema';

// Action types for collaborative workspace
export type WorkspaceActionType = 
  | 'join_workspace'
  | 'leave_workspace'
  | 'update_step'
  | 'add_comment'
  | 'assign_task'
  | 'edit_document'
  | 'ping';

export interface WorkspaceAction {
  type: WorkspaceActionType;
  userId: number;
  requestId: number;
  userName: string;
  payload: any;
  timestamp: Date;
}

export interface ActiveUser {
  id: number;
  username: string;
  fullName: string;
  role: string;
  joinedAt: Date;
  lastActivity: Date;
}

export interface WorkspaceState {
  requestId: number;
  activeUsers: ActiveUser[];
  lastActivity: Date;
}

/**
 * Collaborative workspace service that manages real-time collaboration
 */
export class WorkspaceService {
  private workspaces: Map<number, WorkspaceState> = new Map();
  private wss: WebSocketServer | null = null;
  private clients: Map<string, { 
    userId: number;
    userName: string;
    requestIds: number[];
    ws: any; // WebSocket instance
  }> = new Map();
  
  /**
   * Initialize the workspace service with WebSocket server
   */
  initialize(server: Server): void {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws/workspace'
    });
    
    this.wss.on('connection', (ws: any) => {
      const clientId = this.generateClientId();
      
      ws.on('message', (message: string) => {
        try {
          const action = JSON.parse(message) as WorkspaceAction;
          this.handleWorkspaceAction(clientId, ws, action);
        } catch (error) {
          console.error('Error handling workspace message:', error);
        }
      });
      
      ws.on('close', () => {
        const client = this.clients.get(clientId);
        if (client) {
          // Handle user leaving all workspaces they were part of
          for (const requestId of client.requestIds) {
            this.handleUserLeaving(client.userId, client.userName, requestId);
          }
          this.clients.delete(clientId);
        }
      });
      
      // Ping/Pong to keep connection alive
      const pingInterval = setInterval(() => {
        if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify({ type: 'ping', timestamp: new Date() }));
        } else {
          clearInterval(pingInterval);
        }
      }, 30000);
    });
  }
  
  /**
   * Generate a unique client ID
   */
  private generateClientId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
  
  /**
   * Handle workspace actions from clients
   */
  private async handleWorkspaceAction(clientId: string, ws: any, action: WorkspaceAction): Promise<void> {
    switch (action.type) {
      case 'join_workspace':
        await this.handleUserJoining(clientId, ws, action);
        break;
        
      case 'leave_workspace':
        await this.handleUserLeaving(action.userId, action.userName, action.requestId);
        
        // Update client's joined workspaces
        const client = this.clients.get(clientId);
        if (client) {
          client.requestIds = client.requestIds.filter(id => id !== action.requestId);
          this.clients.set(clientId, client);
        }
        break;
        
      case 'update_step':
        // Handle step update (status change, progress update, etc.)
        const { stepId, status, notes } = action.payload;
        
        // Update step in database
        try {
          const step = await storage.getStep(stepId);
          if (step && step.requestId === action.requestId) {
            const updatedStep = await storage.updateStep(stepId, {
              status,
              // Add additional fields as needed
            });
            
            // Broadcast update to all users in the workspace
            this.broadcastToWorkspace(action.requestId, {
              type: 'step_updated',
              userId: action.userId,
              requestId: action.requestId,
              userName: action.userName,
              payload: {
                step: updatedStep,
                notes
              },
              timestamp: new Date()
            });
          }
        } catch (error) {
          console.error('Error updating step:', error);
        }
        break;
        
      case 'assign_task':
        // Handle task assignment
        const { stepId: taskId, assignedTo } = action.payload;
        
        try {
          const step = await storage.getStep(taskId);
          if (step && step.requestId === action.requestId) {
            const updatedStep = await storage.updateStep(taskId, {
              assignedTo
            });
            
            // Broadcast assignment to all users in the workspace
            this.broadcastToWorkspace(action.requestId, {
              type: 'task_assigned',
              userId: action.userId,
              requestId: action.requestId,
              userName: action.userName,
              payload: {
                step: updatedStep
              },
              timestamp: new Date()
            });
          }
        } catch (error) {
          console.error('Error assigning task:', error);
        }
        break;
        
      case 'add_comment':
        // For now, comments are handled as messages in the system
        const { content } = action.payload;
        
        try {
          // Create a message in the database
          await storage.createMessage({
            requestId: action.requestId,
            senderId: action.userId.toString(),
            content,
            type: 'comment'
          });
          
          // Broadcast comment to all users in the workspace
          this.broadcastToWorkspace(action.requestId, {
            type: 'comment_added',
            userId: action.userId,
            requestId: action.requestId,
            userName: action.userName,
            payload: {
              content,
              timestamp: new Date()
            },
            timestamp: new Date()
          });
        } catch (error) {
          console.error('Error adding comment:', error);
        }
        break;
        
      case 'edit_document':
        // In a real implementation, this would handle collaborative document editing
        // through operational transforms or similar techniques
        this.broadcastToWorkspace(action.requestId, {
          type: 'document_updated',
          userId: action.userId,
          requestId: action.requestId,
          userName: action.userName,
          payload: action.payload,
          timestamp: new Date()
        });
        break;
        
      case 'ping':
        // Update client's last activity time
        const pingClient = this.clients.get(clientId);
        if (pingClient) {
          // Update all active workspaces this user is part of
          for (const requestId of pingClient.requestIds) {
            const workspace = this.workspaces.get(requestId);
            if (workspace) {
              const activeUser = workspace.activeUsers.find(u => u.id === action.userId);
              if (activeUser) {
                activeUser.lastActivity = new Date();
              }
              workspace.lastActivity = new Date();
            }
          }
        }
        
        // Send pong reply
        ws.send(JSON.stringify({
          type: 'pong',
          timestamp: new Date()
        }));
        break;
    }
  }
  
  /**
   * Handle a user joining a workspace
   */
  private async handleUserJoining(
    clientId: string, 
    ws: any, 
    action: WorkspaceAction
  ): Promise<void> {
    const { userId, userName, requestId } = action;
    
    // Store client connection
    this.clients.set(clientId, {
      userId,
      userName,
      requestIds: [requestId],
      ws
    });
    
    // Get or create workspace state
    let workspace = this.workspaces.get(requestId);
    
    if (!workspace) {
      workspace = {
        requestId,
        activeUsers: [],
        lastActivity: new Date()
      };
      this.workspaces.set(requestId, workspace);
    }
    
    // Check if user is already in the workspace
    const existingUserIndex = workspace.activeUsers.findIndex(u => u.id === userId);
    
    if (existingUserIndex >= 0) {
      // Update existing user's info
      workspace.activeUsers[existingUserIndex].lastActivity = new Date();
    } else {
      // Get user details from database
      try {
        const user = await storage.getUser(userId);
        
        if (user) {
          // Add user to active users list
          workspace.activeUsers.push({
            id: user.id,
            username: user.username,
            fullName: user.fullName,
            role: user.role,
            joinedAt: new Date(),
            lastActivity: new Date()
          });
        }
      } catch (error) {
        console.error('Error getting user details:', error);
      }
    }
    
    // Update last activity timestamp
    workspace.lastActivity = new Date();
    
    // Broadcast to all users in the workspace that a new user joined
    this.broadcastToWorkspace(requestId, {
      type: 'user_joined',
      userId,
      requestId,
      userName,
      payload: {
        activeUsers: workspace.activeUsers
      },
      timestamp: new Date()
    });
    
    // Send current workspace state to the joining user
    const request = await storage.getRequest(requestId);
    const steps = await storage.getStepsByRequestId(requestId);
    const messages = await storage.getMessagesByRequestId(requestId);
    
    ws.send(JSON.stringify({
      type: 'workspace_state',
      requestId,
      payload: {
        request,
        steps,
        messages: messages.filter(m => m.type === 'comment'), // Only send comments
        activeUsers: workspace.activeUsers
      },
      timestamp: new Date()
    }));
  }
  
  /**
   * Handle a user leaving a workspace
   */
  private handleUserLeaving(userId: number, userName: string, requestId: number): void {
    const workspace = this.workspaces.get(requestId);
    
    if (workspace) {
      // Remove user from active users
      workspace.activeUsers = workspace.activeUsers.filter(u => u.id !== userId);
      
      // Update last activity timestamp
      workspace.lastActivity = new Date();
      
      // If no users left, consider cleanup or archiving workspace state
      if (workspace.activeUsers.length === 0) {
        this.workspaces.delete(requestId);
      } else {
        // Broadcast to remaining users that a user left
        this.broadcastToWorkspace(requestId, {
          type: 'user_left',
          userId,
          userName,
          requestId,
          payload: {
            activeUsers: workspace.activeUsers
          },
          timestamp: new Date()
        });
      }
    }
  }
  
  /**
   * Broadcast a message to all clients in a workspace
   */
  private broadcastToWorkspace(requestId: number, action: any): void {
    const message = JSON.stringify(action);
    
    // Send to all connected clients who are part of this workspace
    for (const [_, client] of this.clients.entries()) {
      if (client.requestIds.includes(requestId) && client.ws.readyState === client.ws.OPEN) {
        client.ws.send(message);
      }
    }
  }
  
  /**
   * Get the current state of a workspace
   */
  getWorkspaceState(requestId: number): WorkspaceState | null {
    return this.workspaces.get(requestId) || null;
  }
  
  /**
   * Get all active workspaces
   */
  getAllActiveWorkspaces(): WorkspaceState[] {
    return Array.from(this.workspaces.values());
  }
}

// Export singleton instance
export const workspaceService = new WorkspaceService();