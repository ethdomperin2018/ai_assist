# Assist.ai Web Application Architecture

## Overview
This repository contains a full-stack web application called "Assist.ai" - a personal assistance service that combines AI and human expertise. The system follows a modern stack with React on the frontend, Express on the backend, and Drizzle ORM for database operations (intended to work with PostgreSQL).

The application uses a monorepo structure with client and server directories, shared schema definitions, and a comprehensive UI component library based on Shadcn/UI. The system appears to be designed around a request-based workflow where users can create assistance requests that are analyzed by AI, then fulfilled by a combination of AI and human team members.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Uses Wouter for lightweight routing
- **State Management**: React Query for server state, Context API for auth state
- **Styling**: Tailwind CSS with a custom theme system (light/dark modes)
- **UI Components**: Comprehensive component library built with Radix UI primitives and Shadcn UI
- **Build System**: Vite for development and production builds

The frontend follows a component-based architecture with separation of concerns. Pages are stored in the `client/src/pages` directory, and reusable components in `client/src/components`. UI components are primarily sourced from a shadcn/ui implementation.

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API**: RESTful API endpoints
- **Authentication**: Session-based authentication with Passport.js
- **Database Access**: Drizzle ORM for type-safe database operations
- **AI Integration**: OpenAI for request analysis and planning

The backend serves both the API endpoints and the static frontend assets in production. In development, it works with Vite's dev server.

### Data Layer
- **ORM**: Drizzle for database operations
- **Schema**: Shared schema definitions between frontend and backend
- **Schema Validation**: Zod for runtime validation of data

The database schema includes tables for users, requests, steps, messages, meetings, payments, and contracts, modeling a personal assistance service workflow.

## Key Components

### Authentication System
The application implements a session-based authentication system using Passport.js with local strategy. It handles user registration, login, and session management.

### Request Management
The core workflow revolves around "requests" that users submit. Each request:
- Is analyzed by AI to create a plan
- Can be discussed through a messaging interface
- Has trackable steps
- May involve meetings, contracts, and payments

### AI Integration
The system integrates with OpenAI to:
- Analyze user requests and generate execution plans
- Create cost estimates
- Draft contracts
- Potentially assist in messages

### UI Component System
The application uses a comprehensive UI component library built on Radix UI primitives, with shadcn/ui styling. Components include:
- Form elements (inputs, selects, checkboxes)
- Layout components (cards, tabs, dialogs)
- Feedback components (toasts, alerts)
- Interactive elements (buttons, menus)

### Theme System
The application supports both light and dark themes through a ThemeProvider component that sets CSS variables.

## Data Flow

1. **Authentication Flow**:
   - User registers or logs in
   - Backend validates credentials and creates a session
   - Frontend stores authentication state in context

2. **Request Creation Flow**:
   - User creates a new request with title and description
   - Backend passes request to OpenAI for analysis
   - AI generates a plan with steps and cost estimate
   - Plan is saved and displayed to user

3. **Request Fulfillment Flow**:
   - User and team members communicate via the chat interface
   - Steps are marked as completed as work progresses
   - Meetings can be scheduled
   - Contracts can be generated and signed
   - Payments can be processed

## External Dependencies

### Frontend Dependencies
- **@tanstack/react-query**: For data fetching and caching
- **@radix-ui/**: For accessible UI primitives
- **wouter**: For client-side routing
- **tailwindcss**: For utility-first styling
- **date-fns**: For date formatting
- **react-hook-form**: For form handling
- **zod**: For schema validation

### Backend Dependencies
- **express**: Web server framework
- **passport**: Authentication middleware
- **drizzle-orm**: Database ORM
- **openai**: OpenAI API client
- **zod**: Schema validation

## Deployment Strategy

The application is set up to be deployed on Replit with:

1. **Build Process**:
   - Frontend: Vite bundles the React application
   - Backend: ESBuild compiles the server code

2. **Runtime Config**:
   - The Express server serves both the API and static assets
   - Environment variables control database connection, OpenAI API keys, etc.

3. **Database**:
   - The application is configured to work with PostgreSQL
   - Drizzle ORM handles database migrations and queries

4. **Scaling Considerations**:
   - Session storage is currently in-memory, which would need to be changed for multi-instance deployment
   - Static assets should be served from a CDN in a production environment

## Development Workflow

1. Run `npm run dev` to start the development server
2. The Vite dev server handles hot module replacement for the frontend
3. The Express server runs in development mode with auto-reloading
4. Use `npm run db:push` to apply schema changes to the database