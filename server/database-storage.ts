import { 
  users, type User, type InsertUser,
  requests, type Request, type InsertRequest,
  steps, type Step, type InsertStep,
  messages, type Message, type InsertMessage,
  meetings, type Meeting, type InsertMeeting,
  payments, type Payment, type InsertPayment,
  contracts, type Contract, type InsertContract
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import { IStorage } from "./storage";

/**
 * DatabaseStorage implementation using Drizzle ORM with PostgreSQL
 * This class replaces MemStorage with persistent database storage
 */
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [createdUser] = await db.insert(users).values(user).returning();
    return createdUser;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.id);
  }

  // Request operations
  async getRequest(id: number): Promise<Request | undefined> {
    const [request] = await db.select().from(requests).where(eq(requests.id, id));
    return request;
  }

  async getRequestsByUserId(userId: number): Promise<Request[]> {
    return await db
      .select()
      .from(requests)
      .where(eq(requests.userId, userId))
      .orderBy(desc(requests.createdAt));
  }

  async getAllRequests(): Promise<Request[]> {
    return await db.select().from(requests).orderBy(desc(requests.createdAt));
  }

  async createRequest(request: InsertRequest): Promise<Request> {
    const [createdRequest] = await db.insert(requests).values({
      ...request,
      updatedAt: new Date()
    }).returning();
    return createdRequest;
  }

  async updateRequest(id: number, updates: Partial<Request>): Promise<Request | undefined> {
    const [updatedRequest] = await db
      .update(requests)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(requests.id, id))
      .returning();
    
    return updatedRequest;
  }

  // Step operations
  async getStep(id: number): Promise<Step | undefined> {
    const [step] = await db.select().from(steps).where(eq(steps.id, id));
    return step;
  }

  async getStepsByRequestId(requestId: number): Promise<Step[]> {
    return await db
      .select()
      .from(steps)
      .where(eq(steps.requestId, requestId))
      .orderBy(steps.order);
  }

  async createStep(step: InsertStep): Promise<Step> {
    const [createdStep] = await db.insert(steps).values({
      ...step,
      title: step.title || "",
      updatedAt: new Date()
    }).returning();
    return createdStep;
  }

  async updateStep(id: number, updates: Partial<Step>): Promise<Step | undefined> {
    const [updatedStep] = await db
      .update(steps)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(steps.id, id))
      .returning();
    
    return updatedStep;
  }

  // Message operations
  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message;
  }

  async getMessagesByRequestId(requestId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.requestId, requestId))
      .orderBy(messages.timestamp);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [createdMessage] = await db.insert(messages).values(message).returning();
    return createdMessage;
  }

  // Meeting operations
  async getMeeting(id: number): Promise<Meeting | undefined> {
    const [meeting] = await db.select().from(meetings).where(eq(meetings.id, id));
    return meeting;
  }

  async getMeetingsByUserId(userId: number): Promise<Meeting[]> {
    return await db
      .select()
      .from(meetings)
      .where(eq(meetings.userId, userId))
      .orderBy(desc(meetings.scheduledFor));
  }

  async getMeetingsByRequestId(requestId: number): Promise<Meeting[]> {
    return await db
      .select()
      .from(meetings)
      .where(eq(meetings.requestId, requestId))
      .orderBy(desc(meetings.scheduledFor));
  }

  async createMeeting(meeting: InsertMeeting): Promise<Meeting> {
    const [createdMeeting] = await db.insert(meetings).values({
      ...meeting,
      updatedAt: new Date()
    }).returning();
    return createdMeeting;
  }

  async updateMeeting(id: number, updates: Partial<Meeting>): Promise<Meeting | undefined> {
    const [updatedMeeting] = await db
      .update(meetings)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(meetings.id, id))
      .returning();
    
    return updatedMeeting;
  }

  // Payment operations
  async getPayment(id: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment;
  }

  async getPaymentsByUserId(userId: number): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.createdAt));
  }

  async getPaymentsByRequestId(requestId: number): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.requestId, requestId))
      .orderBy(desc(payments.createdAt));
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [createdPayment] = await db.insert(payments).values({
      ...payment,
      updatedAt: new Date()
    }).returning();
    return createdPayment;
  }

  async updatePayment(id: number, updates: Partial<Payment>): Promise<Payment | undefined> {
    const [updatedPayment] = await db
      .update(payments)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(payments.id, id))
      .returning();
    
    return updatedPayment;
  }

  // Contract operations
  async getContract(id: number): Promise<Contract | undefined> {
    const [contract] = await db.select().from(contracts).where(eq(contracts.id, id));
    return contract;
  }

  async getContractsByUserId(userId: number): Promise<Contract[]> {
    return await db
      .select()
      .from(contracts)
      .where(eq(contracts.userId, userId))
      .orderBy(desc(contracts.createdAt));
  }

  async getContractByRequestId(requestId: number): Promise<Contract | undefined> {
    const [contract] = await db
      .select()
      .from(contracts)
      .where(eq(contracts.requestId, requestId));
    
    return contract;
  }

  async createContract(contract: InsertContract): Promise<Contract> {
    const [createdContract] = await db.insert(contracts).values({
      ...contract,
      updatedAt: new Date()
    }).returning();
    return createdContract;
  }

  async updateContract(id: number, updates: Partial<Contract>): Promise<Contract | undefined> {
    const [updatedContract] = await db
      .update(contracts)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(contracts.id, id))
      .returning();
    
    return updatedContract;
  }
}