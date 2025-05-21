/**
 * Notification Service - Intelligent reminder system with contextual awareness
 * 
 * This service manages notifications and reminders for users and team members,
 * providing context-aware notifications based on request status, deadlines,
 * and user preferences.
 */

import { storage } from '../storage';
import type { User, Request, Step, Meeting } from '@shared/schema';

// Notification types
export type NotificationType = 
  | 'reminder'
  | 'status_update'
  | 'deadline'
  | 'meeting'
  | 'contract'
  | 'message'
  | 'payment';

export interface Notification {
  id: string;
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  relatedItemId?: number; // ID of related request, meeting, etc.
  relatedItemType?: string; // Type of related item (request, meeting, etc.)
  createdAt: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  scheduledFor?: Date; // For scheduled notifications/reminders
}

/**
 * Notification service that handles creating, managing and sending notifications
 */
export class NotificationService {
  private notifications: Map<string, Notification> = new Map();
  private notificationId: number = 1;
  
  /**
   * Create a new notification
   */
  async createNotification(data: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Promise<Notification> {
    const id = this.notificationId++.toString();
    
    const notification: Notification = {
      id,
      ...data,
      createdAt: new Date(),
      isRead: false
    };
    
    this.notifications.set(id, notification);
    
    return notification;
  }
  
  /**
   * Get all notifications for a user
   */
  async getUserNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<Notification | undefined> {
    const notification = this.notifications.get(notificationId);
    
    if (notification) {
      notification.isRead = true;
      this.notifications.set(notificationId, notification);
    }
    
    return notification;
  }
  
  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<boolean> {
    return this.notifications.delete(notificationId);
  }
  
  /**
   * Create a reminder for an upcoming deadline
   */
  async createDeadlineReminder(requestId: number): Promise<Notification | null> {
    const request = await storage.getRequest(requestId);
    if (!request) return null;
    
    // Get steps to determine completion status
    const steps = await storage.getStepsByRequestId(requestId);
    const completedSteps = steps.filter(step => step.status === 'completed').length;
    const totalSteps = steps.length;
    const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
    
    // Create a contextually relevant message based on progress
    let message = '';
    let priority: 'low' | 'medium' | 'high' = 'medium';
    
    if (progress < 25) {
      message = `Request "${request.title}" is still in the early stages. Consider prioritizing this request to meet deadlines.`;
      priority = 'high';
    } else if (progress < 75) {
      message = `Request "${request.title}" is ${progress}% complete. Make sure to complete the remaining steps on time.`;
      priority = 'medium';
    } else {
      message = `Request "${request.title}" is almost complete (${progress}%). Finish the remaining steps to complete this request.`;
      priority = 'low';
    }
    
    return this.createNotification({
      userId: request.userId,
      title: `Progress Update: ${request.title}`,
      message,
      type: 'deadline',
      relatedItemId: requestId,
      relatedItemType: 'request',
      priority
    });
  }
  
  /**
   * Create a meeting reminder
   */
  async createMeetingReminder(meetingId: number): Promise<Notification | null> {
    const meeting = await storage.getMeeting(meetingId);
    if (!meeting) return null;
    
    const timeUntilMeeting = meeting.scheduledFor.getTime() - new Date().getTime();
    const hoursUntilMeeting = timeUntilMeeting / (1000 * 60 * 60);
    
    // Determine priority based on how soon the meeting is
    let priority: 'low' | 'medium' | 'high' = 'medium';
    if (hoursUntilMeeting < 1) {
      priority = 'high';
    } else if (hoursUntilMeeting < 24) {
      priority = 'medium';
    } else {
      priority = 'low';
    }
    
    // Get related request info
    const request = await storage.getRequest(meeting.requestId);
    const requestTitle = request ? request.title : 'Unknown request';
    
    return this.createNotification({
      userId: meeting.userId,
      title: `Upcoming Meeting: ${meeting.topic}`,
      message: `You have a meeting about "${requestTitle}" scheduled for ${meeting.scheduledFor.toLocaleString()}. Duration: ${meeting.duration} minutes.`,
      type: 'meeting',
      relatedItemId: meetingId,
      relatedItemType: 'meeting',
      priority,
      scheduledFor: new Date(meeting.scheduledFor.getTime() - 30 * 60 * 1000) // Notify 30 minutes before
    });
  }
  
  /**
   * Create a contract approval reminder
   */
  async createContractReminder(contractId: number): Promise<Notification | null> {
    const contract = await storage.getContract(contractId);
    if (!contract) return null;
    
    return this.createNotification({
      userId: contract.userId,
      title: 'Contract Ready for Review',
      message: `Your contract is ready for review and signature. Please review and approve or request revisions.`,
      type: 'contract',
      relatedItemId: contractId,
      relatedItemType: 'contract',
      priority: 'high'
    });
  }
  
  /**
   * Notify team members about a new request
   */
  async notifyTeamAboutNewRequest(requestId: number): Promise<Notification[]> {
    const request = await storage.getRequest(requestId);
    if (!request) return [];
    
    // Get all team members
    const users = await storage.getAllUsers();
    const teamMembers = users.filter(user => user.role === 'team_member' || user.role === 'admin');
    
    // Create notifications for each team member
    const notifications: Notification[] = [];
    
    for (const teamMember of teamMembers) {
      const notification = await this.createNotification({
        userId: teamMember.id,
        title: 'New Request Assigned',
        message: `A new request "${request.title}" has been created and needs team attention.`,
        type: 'status_update',
        relatedItemId: requestId,
        relatedItemType: 'request',
        priority: 'medium'
      });
      
      notifications.push(notification);
    }
    
    return notifications;
  }
  
  /**
   * Create a status update notification for a user
   */
  async createStatusUpdateNotification(requestId: number): Promise<Notification | null> {
    const request = await storage.getRequest(requestId);
    if (!request) return null;
    
    // Get the latest step updates
    const steps = await storage.getStepsByRequestId(requestId);
    const completedSteps = steps.filter(step => step.status === 'completed');
    
    if (completedSteps.length === 0) return null;
    
    // Sort by most recently completed
    completedSteps.sort((a, b) => {
      if (!a.completedAt || !b.completedAt) return 0;
      return b.completedAt.getTime() - a.completedAt.getTime();
    });
    
    const latestStep = completedSteps[0];
    
    return this.createNotification({
      userId: request.userId,
      title: 'Request Progress Update',
      message: `Step "${latestStep.title}" has been completed for your request "${request.title}".`,
      type: 'status_update',
      relatedItemId: requestId,
      relatedItemType: 'request',
      priority: 'medium'
    });
  }
  
  /**
   * Check for upcoming deadlines and create reminders
   * This would typically be run by a scheduler/cron job
   */
  async checkDeadlinesAndCreateReminders(): Promise<void> {
    // Get all active requests
    const requests = await storage.getAllRequests();
    const activeRequests = requests.filter(req => req.status !== 'completed' && req.status !== 'cancelled');
    
    // Create reminders for each active request
    for (const request of activeRequests) {
      await this.createDeadlineReminder(request.id);
    }
    
    // Check for upcoming meetings
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // This would need to be properly implemented in the storage interface
    // Checking for meetings in the next 24 hours
    const meetings = await Promise.all(requests.map(req => storage.getMeetingsByRequestId(req.id)));
    const upcomingMeetings = meetings
      .flat()
      .filter(meeting => 
        meeting.scheduledFor >= now && 
        meeting.scheduledFor <= tomorrow &&
        meeting.status !== 'cancelled'
      );
    
    // Create reminders for upcoming meetings
    for (const meeting of upcomingMeetings) {
      await this.createMeetingReminder(meeting.id);
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();