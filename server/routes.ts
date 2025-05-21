import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertUserSchema, insertRequestSchema, insertStepSchema, insertMessageSchema, insertMeetingSchema, insertPaymentSchema, insertContractSchema } from "@shared/schema";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import MemoryStore from "memorystore";
import { analyzeRequest, draftContract, generateAssistantResponse } from "./ai";
import { initializeServices, aiService, notificationService, workspaceService, recommendationService } from "./services";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Initialize all our services
  initializeServices(httpServer);
  
  // Session setup
  const MemoryStoreSession = MemoryStore(session);
  app.use(session({
    secret: process.env.SESSION_SECRET || "assist-ai-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
    store: new MemoryStoreSession({
      checkPeriod: 86400000 // prune expired entries every 24h
    })
  }));
  
  // Passport setup
  app.use(passport.initialize());
  app.use(passport.session());
  
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return done(null, false, { message: "Incorrect username." });
      }
      if (user.password !== password) { // In a real app, use proper password hashing
        return done(null, false, { message: "Incorrect password." });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));
  
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
  
  // Check auth middleware
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Not authenticated" });
  };
  
  // Helper to send error for invalid data
  const validateData = (schema: z.ZodType<any>, data: any) => {
    const result = schema.safeParse(data);
    if (!result.success) {
      return { valid: false, errors: result.error.errors };
    }
    return { valid: true, data: result.data };
  };
  
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validation = validateData(insertUserSchema, req.body);
      if (!validation.valid) {
        return res.status(400).json({ errors: validation.errors });
      }
      
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      const existingEmail = await storage.getUserByEmail(req.body.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }
      
      const user = await storage.createUser(req.body);
      
      // Login after registration
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error during login after registration" });
        }
        return res.json({ user: { ...user, password: undefined } });
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  app.post("/api/auth/login", passport.authenticate("local"), (req, res) => {
    const user = req.user as any;
    res.json({ user: { ...user, password: undefined } });
  });
  
  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "Logged out successfully" });
    });
  });
  
  app.get("/api/auth/me", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ authenticated: false });
    }
    const user = req.user as any;
    res.json({ authenticated: true, user: { ...user, password: undefined } });
  });
  
  // User routes
  app.get("/api/users", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const users = await storage.getAllUsers();
      const safeUsers = users.map(u => ({ ...u, password: undefined }));
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  // Request routes
  app.get("/api/requests", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      let requests;
      
      if (user.role === "admin" || user.role === "team_member") {
        requests = await storage.getAllRequests();
      } else {
        requests = await storage.getRequestsByUserId(user.id);
      }
      
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  app.get("/api/requests/:id", isAuthenticated, async (req, res) => {
    try {
      const requestId = parseInt(req.params.id);
      const request = await storage.getRequest(requestId);
      
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }
      
      const user = req.user as any;
      if (user.role !== "admin" && user.role !== "team_member" && request.userId !== user.id) {
        return res.status(403).json({ message: "Not authorized to view this request" });
      }
      
      res.json(request);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  app.post("/api/requests", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const requestData = {
        ...req.body,
        userId: user.id
      };
      
      const validation = validateData(insertRequestSchema, requestData);
      if (!validation.valid) {
        return res.status(400).json({ errors: validation.errors });
      }
      
      const request = await storage.createRequest(requestData);
      res.status(201).json(request);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  app.patch("/api/requests/:id", isAuthenticated, async (req, res) => {
    try {
      const requestId = parseInt(req.params.id);
      const request = await storage.getRequest(requestId);
      
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }
      
      const user = req.user as any;
      if (user.role !== "admin" && user.role !== "team_member" && request.userId !== user.id) {
        return res.status(403).json({ message: "Not authorized to update this request" });
      }
      
      const updatedRequest = await storage.updateRequest(requestId, req.body);
      res.json(updatedRequest);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  // AI Analysis routes
  app.post("/api/ai/analyze-request", isAuthenticated, async (req, res) => {
    try {
      const { requestDescription } = req.body;
      if (!requestDescription) {
        return res.status(400).json({ error: "Request description is required" });
      }
      
      const analysis = await analyzeRequest(requestDescription);
      return res.json(analysis);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error analyzing request:", errorMessage);
      res.status(500).json({ error: "Failed to analyze request" });
    }
  });
  
  app.post("/api/ai/draft-contract", isAuthenticated, async (req, res) => {
    try {
      const { requestId, details } = req.body;
      if (!requestId || !details) {
        return res.status(400).json({ error: "Request ID and details are required" });
      }
      
      const request = await storage.getRequest(parseInt(requestId));
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }
      
      const user = req.user as any;
      if (user.role !== "admin" && user.role !== "team_member" && request.userId !== user.id) {
        return res.status(403).json({ message: "Not authorized to generate contract for this request" });
      }
      
      const contract = await draftContract(details);
      return res.json(contract);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error drafting contract:", errorMessage);
      res.status(500).json({ error: "Failed to draft contract" });
    }
  });
  
  // AI message assistance route
  app.post("/api/ai/chat-response", isAuthenticated, async (req, res) => {
    try {
      const { requestDescription } = req.body;
      
      if (!requestDescription || typeof requestDescription !== "string") {
        return res.status(400).json({ message: "Request description is required" });
      }
      
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an AI assistant for a personal assistance service. Analyze the client request and break it down into actionable steps. For each step, determine whether it should be handled by AI or requires human expertise. Also provide a cost estimate range for the entire request. Return JSON with the following structure: { plan: [{ step: string, assignedTo: string, estimatedHours: number }], costEstimateRange: { min: number, max: number }, summary: string }"
          },
          {
            role: "user",
            content: requestDescription
          }
        ],
        response_format: { type: "json_object" }
      });
      
      const aiResponseContent = response.choices[0].message.content || "{}";
      const aiResponse = JSON.parse(aiResponseContent);
      res.json(aiResponse);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ message: "Error analyzing request", error: errorMessage });
    }
  });
  
  // Step routes
  app.get("/api/requests/:requestId/steps", isAuthenticated, async (req, res) => {
    try {
      const requestId = parseInt(req.params.requestId);
      const request = await storage.getRequest(requestId);
      
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }
      
      const user = req.user as any;
      if (user.role !== "admin" && user.role !== "team_member" && request.userId !== user.id) {
        return res.status(403).json({ message: "Not authorized to view steps for this request" });
      }
      
      const steps = await storage.getStepsByRequestId(requestId);
      res.json(steps);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  app.post("/api/steps", isAuthenticated, async (req, res) => {
    try {
      const validation = validateData(insertStepSchema, req.body);
      if (!validation.valid) {
        return res.status(400).json({ errors: validation.errors });
      }
      
      const request = await storage.getRequest(req.body.requestId);
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }
      
      const user = req.user as any;
      if (user.role !== "admin" && user.role !== "team_member" && request.userId !== user.id) {
        return res.status(403).json({ message: "Not authorized to add steps to this request" });
      }
      
      const step = await storage.createStep(req.body);
      res.status(201).json(step);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  app.patch("/api/steps/:id", isAuthenticated, async (req, res) => {
    try {
      const stepId = parseInt(req.params.id);
      const step = await storage.getStep(stepId);
      
      if (!step) {
        return res.status(404).json({ message: "Step not found" });
      }
      
      const request = await storage.getRequest(step.requestId);
      if (!request) {
        return res.status(404).json({ message: "Associated request not found" });
      }
      
      const user = req.user as any;
      if (user.role !== "admin" && user.role !== "team_member" && request.userId !== user.id) {
        return res.status(403).json({ message: "Not authorized to update this step" });
      }
      
      const updatedStep = await storage.updateStep(stepId, req.body);
      res.json(updatedStep);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  // Analytics route
  app.get("/api/analytics", isAuthenticated, async (req, res) => {
    try {
      // Only allow admin and team members to access analytics
      const user = req.user as any;
      if (user.role !== "admin" && user.role !== "team_member") {
        return res.status(403).json({ message: "Not authorized to view analytics" });
      }
      
      // Fetch all necessary data for analytics
      const requests = await storage.getAllRequests();
      const messages = await Promise.all(
        requests.map(request => storage.getMessagesByRequestId(request.id))
      ).then(results => results.flat());
      
      const payments = await Promise.all(
        requests.map(request => storage.getPaymentsByRequestId(request.id))
      ).then(results => results.flat());
      
      // Calculate analytics metrics
      const totalRequests = requests.length;
      const completedRequests = requests.filter(r => r.status === "completed").length;
      const pendingRequests = requests.filter(r => r.status === "pending").length;
      const inProgressRequests = requests.filter(r => r.status === "in_progress").length;
      
      // Calculate average response time
      // In a real system, this would be based on actual message timestamps
      let avgResponseTime = "6.2 hours"; // Default fallback
      
      // Calculate total revenue from payments
      let totalRevenue = "$0";
      if (payments.length > 0) {
        const sum = payments.reduce((acc, payment) => {
          if (payment.status === "completed") {
            return acc + payment.amount;
          }
          return acc;
        }, 0);
        
        totalRevenue = `$${(sum / 100).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}`;
      }
      
      // Use 4.8 as the default satisfaction rating for demo purposes
      const satisfaction = "4.8";
      
      // Return analytics data
      res.json({
        totalRequests,
        completedRequests,
        pendingRequests,
        inProgressRequests,
        completionRate: totalRequests > 0 ? Math.round((completedRequests / totalRequests) * 100) : 0,
        avgResponseTime,
        totalRevenue,
        satisfaction,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics data" });
    }
  });

  // Message routes
  app.get("/api/requests/:requestId/messages", isAuthenticated, async (req, res) => {
    try {
      const requestId = parseInt(req.params.requestId);
      const request = await storage.getRequest(requestId);
      
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }
      
      const user = req.user as any;
      if (user.role !== "admin" && user.role !== "team_member" && request.userId !== user.id) {
        return res.status(403).json({ message: "Not authorized to view messages for this request" });
      }
      
      const messages = await storage.getMessagesByRequestId(requestId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  app.post("/api/messages", isAuthenticated, async (req, res) => {
    try {
      const validation = validateData(insertMessageSchema, req.body);
      if (!validation.valid) {
        return res.status(400).json({ errors: validation.errors });
      }
      
      const request = await storage.getRequest(req.body.requestId);
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }
      
      const user = req.user as any;
      if (user.role !== "admin" && user.role !== "team_member" && request.userId !== user.id) {
        return res.status(403).json({ message: "Not authorized to add messages to this request" });
      }
      
      const message = await storage.createMessage(req.body);
      
      // If the message is from a user, generate an AI response
      if (req.body.senderId !== "ai") {
        try {
          // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          const messages = await storage.getMessagesByRequestId(req.body.requestId);
          const conversationHistory = messages.map(msg => ({
            role: msg.senderId === "ai" ? "assistant" : "user",
            content: msg.content
          }));
          
          // Generate simple AI response without OpenAI until API key is properly configured
          let responseContent = "Thank you for your message. I'm here to help with your request. Our team will review it and get back to you shortly. Is there anything specific you need assistance with?";
          
          // When OpenAI API key is configured properly, we'll use the OpenAI API
          // For now, we're using a simple response
          
          const aiMessage = await storage.createMessage({
            requestId: req.body.requestId,
            senderId: "ai",
            content: responseContent
          });
          
          return res.status(201).json({ userMessage: message, aiResponse: aiMessage });
        } catch (aiError) {
          console.error("Error generating AI response:", aiError);
          return res.status(201).json({ message, aiError: "Failed to generate AI response" });
        }
      }
      
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  // Meeting routes
  app.get("/api/meetings", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      let meetings;
      
      if (user.role === "admin" || user.role === "team_member") {
        meetings = user.role === "team_member" 
          ? (await storage.getAllMeetings()).filter(m => m.teamMemberId === user.id)
          : await storage.getAllMeetings();
      } else {
        meetings = await storage.getMeetingsByUserId(user.id);
      }
      
      res.json(meetings);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  app.post("/api/meetings", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const meetingData = {
        ...req.body,
        userId: user.id
      };
      
      const validation = validateData(insertMeetingSchema, meetingData);
      if (!validation.valid) {
        return res.status(400).json({ errors: validation.errors });
      }
      
      const request = await storage.getRequest(req.body.requestId);
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }
      
      if (user.role !== "admin" && user.role !== "team_member" && request.userId !== user.id) {
        return res.status(403).json({ message: "Not authorized to schedule meetings for this request" });
      }
      
      const meeting = await storage.createMeeting(meetingData);
      res.status(201).json(meeting);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  // Payment routes
  app.post("/api/payments", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const paymentData = {
        ...req.body,
        userId: user.id
      };
      
      const validation = validateData(insertPaymentSchema, paymentData);
      if (!validation.valid) {
        return res.status(400).json({ errors: validation.errors });
      }
      
      if (req.body.requestId) {
        const request = await storage.getRequest(req.body.requestId);
        if (!request) {
          return res.status(404).json({ message: "Request not found" });
        }
        
        if (request.userId !== user.id) {
          return res.status(403).json({ message: "Not authorized to make payments for this request" });
        }
      }
      
      // In a real app, this would integrate with a payment processor like Stripe
      // For now, we'll simulate a successful payment
      const payment = await storage.createPayment({
        ...paymentData,
        status: "completed",
        transactionId: `sim_${Date.now()}`
      });
      
      // If payment is for a request, update request status
      if (req.body.requestId) {
        await storage.updateRequest(req.body.requestId, { 
          status: "in_progress" 
        });
      }
      
      res.status(201).json(payment);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  // Contract routes
  app.post("/api/contracts", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const contractData = {
        ...req.body,
        userId: user.id
      };
      
      const validation = validateData(insertContractSchema, contractData);
      if (!validation.valid) {
        return res.status(400).json({ errors: validation.errors });
      }
      
      const request = await storage.getRequest(req.body.requestId);
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }
      
      if (user.role !== "admin" && user.role !== "team_member" && request.userId !== user.id) {
        return res.status(403).json({ message: "Not authorized to create contracts for this request" });
      }
      
      const contract = await storage.createContract(contractData);
      res.status(201).json(contract);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  app.get("/api/contracts/:id", isAuthenticated, async (req, res) => {
    try {
      const contractId = parseInt(req.params.id);
      const contract = await storage.getContract(contractId);
      
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      const user = req.user as any;
      if (user.role !== "admin" && user.role !== "team_member" && contract.userId !== user.id) {
        return res.status(403).json({ message: "Not authorized to view this contract" });
      }
      
      res.json(contract);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  app.patch("/api/contracts/:id", isAuthenticated, async (req, res) => {
    try {
      const contractId = parseInt(req.params.id);
      const contract = await storage.getContract(contractId);
      
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      const user = req.user as any;
      if (user.role !== "admin" && contract.userId !== user.id) {
        return res.status(403).json({ message: "Not authorized to update this contract" });
      }
      
      const updatedContract = await storage.updateContract(contractId, req.body);
      res.json(updatedContract);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  // Draft a contract using AI
  app.post("/api/ai/draft-contract", isAuthenticated, async (req, res) => {
    try {
      const { requestId, details } = req.body;
      
      if (!requestId || !details) {
        return res.status(400).json({ message: "Request ID and details are required" });
      }
      
      const request = await storage.getRequest(parseInt(requestId));
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }
      
      const user = req.user as any;
      if (user.role !== "admin" && user.role !== "team_member" && request.userId !== user.id) {
        return res.status(403).json({ message: "Not authorized to draft contracts for this request" });
      }
      
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a legal assistant tasked with drafting service contracts. Create a professional contract for the personal assistance service described."
          },
          {
            role: "user",
            content: `Draft a contract for the following request: ${request.title}\n\nRequest details: ${request.description}\n\nAdditional details: ${details}`
          }
        ]
      });
      
      const contractContent = response.choices[0].message.content;
      res.json({ contractContent });
    } catch (error) {
      res.status(500).json({ message: "Error drafting contract", error: error.message });
    }
  });
  
  return httpServer;
}
