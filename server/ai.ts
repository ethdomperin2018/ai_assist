import OpenAI from "openai";
import { log } from "./vite";

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Function to analyze a request and create a plan
export async function analyzeRequest(requestDescription: string) {
  try {
    const prompt = `
    You are an expert personal assistant tasked with analyzing client requests and creating actionable plans. 
    Please analyze the following request and create a detailed plan:

    Request: "${requestDescription}"

    Create a JSON response with the following structure:
    - plan: An array of steps with fields:
      * step: A description of what needs to be done
      * assignedTo: Either "ai" or "human" based on who should handle it
      * estimatedHours: Approximate hours to complete this step
    - costEstimateRange: Object with min and max cost in USD
    - summary: A brief, clear summary of the overall plan
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a professional project planner with expertise in various domains." } as const,
        { role: "user", content: prompt } as const
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    return JSON.parse(content);

  } catch (error) {
    log(`Error analyzing request with OpenAI: ${error}`, "ai");
    throw new Error("Failed to analyze request. Please try again.");
  }
}

// Function to draft a contract based on request details
export async function draftContract(requestDetails: string) {
  try {
    const prompt = `
    Create a professional service contract based on the following project details:

    "${requestDetails}"

    The contract should include:
    1. Scope of work
    2. Timeline
    3. Payment terms
    4. Deliverables
    5. Standard legal protections for both parties
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a professional contract drafter with legal expertise." },
        { role: "user", content: prompt }
      ],
    });

    return { contractContent: response.choices[0].message.content || "" };

  } catch (error) {
    log(`Error drafting contract with OpenAI: ${error}`, "ai");
    throw new Error("Failed to draft contract. Please try again.");
  }
}

// Function to generate an AI response in the chat
export async function generateAssistantResponse(conversation: any[], context: string) {
  try {
    const prompt = `
    You are a helpful personal assistant at a company handling a client's request.
    Here's the context of their request: "${context}"

    Please respond to the latest message in a helpful, professional manner.
    `;

    // Type-safe message formatting for OpenAI
    const messages = [
      { role: "system" as const, content: prompt },
      ...conversation.map(msg => ({
        role: (msg.senderId === "assistant" ? "assistant" : "user") as const,
        content: msg.content
      }))
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: messages,
    });

    return response.choices[0].message.content || "I'm not sure how to respond to that. Could you provide more information?";

  } catch (error) {
    log(`Error generating assistant response with OpenAI: ${error}`, "ai");
    throw new Error("Failed to generate response. Please try again.");
  }
}