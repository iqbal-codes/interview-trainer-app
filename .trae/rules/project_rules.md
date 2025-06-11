---
description:
globs:
alwaysApply: true
---

AI-Powered Interview Practice Platform - Project Rules for Cursor AI

1. Core Technology Stack

- Framework: Next.js (React)
- Language: TypeScript (strict mode preferred)
- Styling: Tailwind CSS
- UI Components: shadcn@latest (prioritize using these components for UI elements)
- State Management: Zustand (or a similar lightweight React state manager; prefer simple context/hooks for localized state)
- Server State Management: React Query
- Form Handling: React Hook Form + Zod
- Backend/API: Next.js API Routes
- Database & BaaS: Supabase (PostgreSQL, Supabase Auth, Supabase Storage)
- Voice AI: Vapi (via Vapi SDK and custom backend webhook)
- Testing: Jest (for unit testing)
- LLM: External LLM Provider API (e.g., OpenAI, Anthropic) via Next.js API routes.

2. Code Generation & Style

- Modularity: Generate code in a modular fashion. Create reusable React components (functional components with hooks) and well-defined functions.
- TypeScript: All new code should be in TypeScript. Use appropriate types for props, state, function arguments, and return values. Avoid any where possible.
- Clarity & Comments: Generated code should be clear and understandable. Add JSDoc comments for functions, especially for API routes and complex logic.
- Error Handling: Implement basic error handling (try/catch blocks) for API calls, database operations, and other potentially failing operations. Return meaningful error messages or use a consistent error response structure for APIs.
- Async/Await: Use async/await for asynchronous operations.
- Naming Conventions: Follow standard JavaScript/TypeScript naming conventions (e.g., camelCase for variables/functions, PascalCase for components/types).

3. Frontend (Next.js & shadcn@latest)

- Component Structure: Follow standard Next.js page and component structure.
- shadcn@latest Usage: When generating UI, actively use components from the shadcn@latest library. Refer to its documentation for available components and props.
- Responsiveness: Ensure UI components are responsive using Tailwind CSS utility classes.
- Accessibility (a11y): Keep accessibility in mind. Shadcn/ui components are generally accessible; maintain this standard.
- API Calls: Frontend components should call Next.js API routes for backend operations. Use fetch or a lightweight library like axios or SWR/React Query for data fetching and mutations.

4. Backend (Next.js API Routes)

- API Design: Adhere to RESTful principles where applicable.
- Request/Response: API routes should expect and return JSON. Define clear request and response structures.
- Authentication: Secure API routes appropriately. Most routes will require user authentication via Supabase Auth. Check for user sessions.
- Validation: Validate incoming request data (body, query params).

5. Supabase Interaction

- Client SDK: Use the official Supabase JavaScript client library (@supabase/supabase-js) for all interactions with the database, authentication, and storage.
- Database Operations:
  Write clear and efficient SQL queries (if using supabase.rpc) or use Supabase's query builder methods.
  Always consider data relationships defined in the schema.
- Row Level Security (RLS): Assume RLS policies are in place. Queries should be written with the understanding that users can only access/modify data they are permitted to. For example, users should only be able to fetch their own interview sessions.
- Data Integrity: Ensure data being inserted/updated is consistent with the table schema.

6. Vapi Integration

- SDK Usage: Interact with Vapi using its provided SDK for client-side setup.
- Backend Webhook: The Next.js API route acting as the custom LLM server for Vapi needs to handle Vapi's request format and provide responses in the expected format (e.g., for sending messages/questions back to Vapi for TTS).
- State Management: The backend will manage the state of the interview (current question, user answers) during a Vapi session, likely storing this in Supabase.

7. LLM Interaction

- API Calls: All LLM interactions (question generation, feedback, summarization) will be handled through Next.js API routes.
- Prompt Engineering: Prompts sent to the LLM should be carefully structured based on the project's prompt design documents.
- Response Parsing: Parse responses from the LLM carefully, expecting specific structures (e.g., JSON).

8. General Guidelines

- Refer to Provided Documents: When a specific feature or component is being worked on, refer to the relevant PRD section, Feature Specification, Data Model, API Spec, or UI Wireframe that I will provide context for.
- Iterative Development: Understand that we are building this project iteratively. We will focus on specific modules or features in phases.
- Ask for Clarification: If a request is ambiguous or lacks sufficient detail, please ask for clarification before generating extensive code.
