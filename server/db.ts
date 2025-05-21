import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { neonConfig } from '@neondatabase/serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// This is needed for the Neon serverless driver
neonConfig.webSocketConstructor = ws;

// Create the connection
const connection = drizzle(process.env.DATABASE_URL, { schema });

export { connection as db };

// Check for DATABASE_URL environment variable
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

// Create connection pool and Drizzle ORM instance
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

console.log("Database connection established successfully");