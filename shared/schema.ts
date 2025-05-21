import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("client"), // client, admin, team_member
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  role: true,
});

// Requests table
export const requests = pgTable("requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("pending"), // pending, in_progress, completed, cancelled
  aiPlan: jsonb("ai_plan"), // JSON array of steps with AI-generated plan
  costEstimate: integer("cost_estimate"), // Cost in cents
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const insertRequestSchema = createInsertSchema(requests).pick({
  userId: true,
  title: true,
  description: true,
  status: true,
  aiPlan: true,
  costEstimate: true,
});

// Steps table for tracking individual steps in a request
export const steps = pgTable("steps", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id").notNull(),
  title: text("title").notNull().default(""),
  description: text("description").notNull(),
  assignedTo: text("assigned_to").notNull(), // "ai" or userId
  status: text("status").notNull().default("pending"), // pending, in_progress, completed
  order: integer("order").notNull(),
  estimatedHours: integer("estimated_hours"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const insertStepSchema = createInsertSchema(steps).pick({
  requestId: true,
  title: true,
  description: true,
  assignedTo: true,
  status: true,
  order: true,
  estimatedHours: true,
});

// Messages for chat between user and AI/team
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id").notNull(),
  senderId: text("sender_id").notNull(), // userId or "ai"
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  requestId: true,
  senderId: true,
  content: true,
});

// Meetings table
export const meetings = pgTable("meetings", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id").notNull(),
  userId: integer("user_id").notNull(),
  teamMemberId: integer("team_member_id"),
  scheduledFor: timestamp("scheduled_for").notNull(),
  duration: integer("duration").notNull(), // In minutes
  topic: text("topic").notNull(),
  status: text("status").notNull().default("scheduled"), // scheduled, completed, cancelled
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMeetingSchema = createInsertSchema(meetings).pick({
  requestId: true,
  userId: true,
  teamMemberId: true,
  scheduledFor: true,
  duration: true,
  topic: true,
  status: true,
});

// Payments table
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  requestId: integer("request_id"),
  amount: integer("amount").notNull(), // In cents
  status: text("status").notNull().default("pending"), // pending, completed, failed, refunded
  paymentMethod: text("payment_method"),
  transactionId: text("transaction_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPaymentSchema = createInsertSchema(payments).pick({
  userId: true,
  requestId: true,
  amount: true,
  status: true,
  paymentMethod: true,
  transactionId: true,
});

// Contracts
export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  status: text("status").notNull().default("draft"), // draft, sent, signed, cancelled
  reviewedBy: integer("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  signedAt: timestamp("signed_at"),
});

export const insertContractSchema = createInsertSchema(contracts).pick({
  requestId: true,
  userId: true,
  content: true,
  status: true,
  reviewedBy: true,
  reviewedAt: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Request = typeof requests.$inferSelect;
export type InsertRequest = z.infer<typeof insertRequestSchema>;

export type Step = typeof steps.$inferSelect;
export type InsertStep = z.infer<typeof insertStepSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Meeting = typeof meetings.$inferSelect;
export type InsertMeeting = z.infer<typeof insertMeetingSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type Contract = typeof contracts.$inferSelect;
export type InsertContract = z.infer<typeof insertContractSchema>;
