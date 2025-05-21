import {
  users, type User, type InsertUser,
  requests, type Request, type InsertRequest,
  steps, type Step, type InsertStep,
  messages, type Message, type InsertMessage,
  meetings, type Meeting, type InsertMeeting,
  payments, type Payment, type InsertPayment,
  contracts, type Contract, type InsertContract
} from "@shared/schema";

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Request operations
  getRequest(id: number): Promise<Request | undefined>;
  getRequestsByUserId(userId: number): Promise<Request[]>;
  getAllRequests(): Promise<Request[]>;
  createRequest(request: InsertRequest): Promise<Request>;
  updateRequest(id: number, updates: Partial<Request>): Promise<Request | undefined>;
  
  // Step operations
  getStep(id: number): Promise<Step | undefined>;
  getStepsByRequestId(requestId: number): Promise<Step[]>;
  createStep(step: InsertStep): Promise<Step>;
  updateStep(id: number, updates: Partial<Step>): Promise<Step | undefined>;
  
  // Message operations
  getMessage(id: number): Promise<Message | undefined>;
  getMessagesByRequestId(requestId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Meeting operations
  getMeeting(id: number): Promise<Meeting | undefined>;
  getMeetingsByUserId(userId: number): Promise<Meeting[]>;
  getMeetingsByRequestId(requestId: number): Promise<Meeting[]>;
  createMeeting(meeting: InsertMeeting): Promise<Meeting>;
  updateMeeting(id: number, updates: Partial<Meeting>): Promise<Meeting | undefined>;
  
  // Payment operations
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentsByUserId(userId: number): Promise<Payment[]>;
  getPaymentsByRequestId(requestId: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, updates: Partial<Payment>): Promise<Payment | undefined>;
  
  // Contract operations
  getContract(id: number): Promise<Contract | undefined>;
  getContractsByUserId(userId: number): Promise<Contract[]>;
  getContractByRequestId(requestId: number): Promise<Contract | undefined>;
  createContract(contract: InsertContract): Promise<Contract>;
  updateContract(id: number, updates: Partial<Contract>): Promise<Contract | undefined>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private requests: Map<number, Request>;
  private steps: Map<number, Step>;
  private messages: Map<number, Message>;
  private meetings: Map<number, Meeting>;
  private payments: Map<number, Payment>;
  private contracts: Map<number, Contract>;
  
  private userId: number;
  private requestId: number;
  private stepId: number;
  private messageId: number;
  private meetingId: number;
  private paymentId: number;
  private contractId: number;
  
  constructor() {
    this.users = new Map();
    this.requests = new Map();
    this.steps = new Map();
    this.messages = new Map();
    this.meetings = new Map();
    this.payments = new Map();
    this.contracts = new Map();
    
    this.userId = 1;
    this.requestId = 1;
    this.stepId = 1;
    this.messageId = 1;
    this.meetingId = 1;
    this.paymentId = 1;
    this.contractId = 1;
    
    // Add default admin user
    this.createUser({
      username: "admin",
      password: "admin123",
      email: "admin@assist.ai",
      fullName: "Admin User",
      role: "admin"
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: now,
      role: insertUser.role || "client" // Ensure role is always defined
    };
    this.users.set(id, user);
    return user;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  // Request operations
  async getRequest(id: number): Promise<Request | undefined> {
    return this.requests.get(id);
  }
  
  async getRequestsByUserId(userId: number): Promise<Request[]> {
    return Array.from(this.requests.values()).filter(
      (request) => request.userId === userId
    );
  }
  
  async getAllRequests(): Promise<Request[]> {
    return Array.from(this.requests.values());
  }
  
  async createRequest(insertRequest: InsertRequest): Promise<Request> {
    const id = this.requestId++;
    const now = new Date();
    const request: Request = {
      ...insertRequest,
      id,
      createdAt: now,
      completedAt: null,
      status: insertRequest.status || "pending", // Ensure status is always defined
      aiPlan: insertRequest.aiPlan || null,
      costEstimate: insertRequest.costEstimate || null
    };
    this.requests.set(id, request);
    return request;
  }
  
  async updateRequest(id: number, updates: Partial<Request>): Promise<Request | undefined> {
    const request = this.requests.get(id);
    if (!request) return undefined;
    
    const updatedRequest = { ...request, ...updates };
    this.requests.set(id, updatedRequest);
    return updatedRequest;
  }
  
  // Step operations
  async getStep(id: number): Promise<Step | undefined> {
    return this.steps.get(id);
  }
  
  async getStepsByRequestId(requestId: number): Promise<Step[]> {
    return Array.from(this.steps.values())
      .filter(step => step.requestId === requestId)
      .sort((a, b) => a.order - b.order);
  }
  
  async createStep(insertStep: InsertStep): Promise<Step> {
    const id = this.stepId++;
    const now = new Date();
    const step: Step = {
      ...insertStep,
      id,
      createdAt: now,
      completedAt: null,
      status: insertStep.status || "pending" // Ensure status is always defined
    };
    this.steps.set(id, step);
    return step;
  }
  
  async updateStep(id: number, updates: Partial<Step>): Promise<Step | undefined> {
    const step = this.steps.get(id);
    if (!step) return undefined;
    
    const updatedStep = { ...step, ...updates };
    this.steps.set(id, updatedStep);
    return updatedStep;
  }
  
  // Message operations
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }
  
  async getMessagesByRequestId(requestId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.requestId === requestId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
  
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageId++;
    const now = new Date();
    const message: Message = {
      ...insertMessage,
      id,
      timestamp: now
    };
    this.messages.set(id, message);
    return message;
  }
  
  // Meeting operations
  async getMeeting(id: number): Promise<Meeting | undefined> {
    return this.meetings.get(id);
  }
  
  async getMeetingsByUserId(userId: number): Promise<Meeting[]> {
    return Array.from(this.meetings.values())
      .filter(meeting => meeting.userId === userId)
      .sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime());
  }
  
  async getMeetingsByRequestId(requestId: number): Promise<Meeting[]> {
    return Array.from(this.meetings.values())
      .filter(meeting => meeting.requestId === requestId)
      .sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime());
  }
  
  async createMeeting(insertMeeting: InsertMeeting): Promise<Meeting> {
    const id = this.meetingId++;
    const now = new Date();
    const meeting: Meeting = {
      ...insertMeeting,
      id,
      createdAt: now,
      status: insertMeeting.status || "scheduled", // Ensure status is always defined
      teamMemberId: insertMeeting.teamMemberId || null // Ensure teamMemberId is always defined
    };
    this.meetings.set(id, meeting);
    return meeting;
  }
  
  async updateMeeting(id: number, updates: Partial<Meeting>): Promise<Meeting | undefined> {
    const meeting = this.meetings.get(id);
    if (!meeting) return undefined;
    
    const updatedMeeting = { ...meeting, ...updates };
    this.meetings.set(id, updatedMeeting);
    return updatedMeeting;
  }
  
  // Payment operations
  async getPayment(id: number): Promise<Payment | undefined> {
    return this.payments.get(id);
  }
  
  async getPaymentsByUserId(userId: number): Promise<Payment[]> {
    return Array.from(this.payments.values())
      .filter(payment => payment.userId === userId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
  
  async getPaymentsByRequestId(requestId: number): Promise<Payment[]> {
    return Array.from(this.payments.values())
      .filter(payment => payment.requestId === requestId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
  
  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = this.paymentId++;
    const now = new Date();
    const payment: Payment = {
      ...insertPayment,
      id,
      createdAt: now,
      status: insertPayment.status || "pending", // Ensure status is always defined
      requestId: insertPayment.requestId || null, // Ensure requestId is always defined
      paymentMethod: insertPayment.paymentMethod || null, // Ensure paymentMethod is always defined
      transactionId: insertPayment.transactionId || null // Ensure transactionId is always defined
    };
    this.payments.set(id, payment);
    return payment;
  }
  
  async updatePayment(id: number, updates: Partial<Payment>): Promise<Payment | undefined> {
    const payment = this.payments.get(id);
    if (!payment) return undefined;
    
    const updatedPayment = { ...payment, ...updates };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }
  
  // Contract operations
  async getContract(id: number): Promise<Contract | undefined> {
    return this.contracts.get(id);
  }
  
  async getContractsByUserId(userId: number): Promise<Contract[]> {
    return Array.from(this.contracts.values())
      .filter(contract => contract.userId === userId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
  
  async getContractByRequestId(requestId: number): Promise<Contract | undefined> {
    return Array.from(this.contracts.values())
      .find(contract => contract.requestId === requestId);
  }
  
  async createContract(insertContract: InsertContract): Promise<Contract> {
    const id = this.contractId++;
    const now = new Date();
    const contract: Contract = {
      ...insertContract,
      id,
      createdAt: now,
      signedAt: null,
      status: insertContract.status || "draft" // Ensure status is always defined
    };
    this.contracts.set(id, contract);
    return contract;
  }
  
  async updateContract(id: number, updates: Partial<Contract>): Promise<Contract | undefined> {
    const contract = this.contracts.get(id);
    if (!contract) return undefined;
    
    const updatedContract = { ...contract, ...updates };
    this.contracts.set(id, updatedContract);
    return updatedContract;
  }
}

import { DatabaseStorage } from "./database-storage";

// Replace MemStorage with DatabaseStorage for persistent data
export const storage = new DatabaseStorage();
