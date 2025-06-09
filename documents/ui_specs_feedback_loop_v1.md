# **AI-Powered Interview Practice Platform \- Project Rules for Cursor AI (OpenAI Pivot)**

## **1\. Core Technology Stack**

* **Framework:** Next.js (React)  
* **Language:** TypeScript (strict mode preferred)  
* **Styling:** Tailwind CSS  
* **UI Components:** Shadcn/ui  
* **State Management:** Zustand (or a similar lightweight React state manager)  
* **Backend/API:** Next.js API Routes, WebSocket Server (e.g., using ws package) for real-time communication.  
* **Database & BaaS:** Supabase (PostgreSQL, Supabase Auth, Supabase Storage)  
* **Voice AI Pipeline:** Custom implementation using:  
  * **STT:** OpenAI Whisper API (via openai SDK).  
  * **LLM:** OpenAI GPT series (e.g., gpt-4o) via openai SDK for real-time streaming, and Vercel AI SDK (@ai-sdk/google) for non-streaming tasks like feedback generation.  
  * **TTS:** OpenAI TTS API (via openai SDK).  
* **Real-time Communication:** WebSockets.

## **2\. Code Generation & Style**

* **Modularity:** Generate code in a modular fashion. Create reusable React components and well-defined service functions (e.g., in lib/).  
* **TypeScript:** All new code should be in TypeScript. Use appropriate types for props, state, and function arguments. Avoid any.  
* **Clarity & Comments:** Generated code should be clear. Add JSDoc comments for complex functions, API routes, and service logic.  
* **Error Handling:** Implement robust try/catch blocks for all API calls, database operations, and WebSocket communications.  
* **Async/Await:** Use async/await for asynchronous operations.  
* **Naming Conventions:** Follow standard JavaScript/TypeScript naming conventions.

## **3\. Frontend (Next.js & Shadcn/ui)**

* **Component Structure:** Follow standard Next.js page and component structure.  
* **Real-time Interaction:**  
  * Use the browser's MediaRecorder API to capture microphone audio.  
  * Use the native WebSocket API to establish and manage a connection with the backend server.  
  * Implement logic to stream audio chunks to the server.  
  * Implement logic to receive and handle multiple incoming streams from the server (e.g., live transcript, final transcript, TTS audio chunks).  
  * Create a client-side audio player to queue and play incoming TTS audio buffers with minimal latency.

## **4\. Backend (Next.js API Routes & WebSocket Server)**

* **REST APIs:** Standard API Routes will handle non-real-time operations like user auth, session generation (/api/interviews/generate), and non-real-time feedback (/api/interviews/get-answer-feedback).  
* **WebSocket Server:**  
  * Manage the lifecycle of WebSocket connections.  
  * Receive incoming audio streams from clients.  
  * Orchestrate the real-time STT-LLM-TTS pipeline.  
  * Stream data (transcripts, final AI audio) back to the correct client.  
* **Authentication:** Secure both REST API routes and WebSocket connections. For WebSockets, this might involve an initial authentication handshake.  
* **Validation:** Validate all incoming data from both REST and WebSocket clients.

## **5\. Supabase Interaction**

* **Client SDK:** Use the official Supabase JavaScript client library (@supabase/supabase-js) for all database, auth, and storage interactions.  
* **RLS:** Assume Row Level Security policies are in place. Write queries with the understanding that users can only access their own data.

## **6\. OpenAI Real-time Pipeline Integration**

* **Service Abstraction:** All direct interactions with OpenAI APIs (Whisper, GPT, TTS) should be abstracted into service functions within lib/openai-services.ts as specified in the core\_ai\_services\_spec\_v1.md in the Canvas.  
* **Streaming:** For real-time interaction, leverage the streaming capabilities of the OpenAI SDK for both LLM responses and TTS audio generation where possible.  
* **Interruption Handling (Barge-in):** The architecture must support interruption. The backend WebSocket handler should be able to receive an "interrupt" signal from the client, stop the ongoing LLM/TTS process, and prioritize the new user input.  
* **Environment Variables:** All API keys (OPENAI\_API\_KEY, GOOGLE\_GENERATIVE\_AI\_API\_KEY, etc.) and secrets must be stored securely as environment variables.

## **7\. General Guidelines**

* **Refer to Provided Documents:** When working on a feature, refer to the relevant PRD, Feature Spec, Data Model, API Spec, or UI Wireframe that I provide context for. Our core architectural plan is now the document titled "Transitioning to OpenAI Realtime API...".  
* **Iterative Development:** We are following an adjusted, phased approach. Focus on the specific task for the current phase (e.g., non-real-time services first, then the real-time pipeline).  
* **Ask for Clarification:** If a request is ambiguous, ask for clarification.