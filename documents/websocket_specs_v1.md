# **WebSocket Server Specifications**

## **Phase 7: Real-Time Voice Integration**

This document specifies the requirements for the WebSocket server that will manage the real-time, bidirectional communication between the client and our backend AI services.

### **1\. Endpoint and Setup**

- **Endpoint:** The WebSocket server will be accessible via a specific endpoint, likely /api/interview-socket or similar, integrated into our Next.js backend.
- **Technology:** Use a library like ws in a custom Next.js server setup or a dedicated WebSocket server.
- **Connection Lifecycle:**
  - **Handshake & Auth:** When a client connects, it must send an initial message containing an authentication token (e.g., Supabase access token) and the sessionId for the interview. The server must validate this before proceeding.
  - **Connection Management:** The server must handle multiple concurrent connections, mapping each WebSocket connection to a specific user and interview session.
  - **Disconnection:** Gracefully handle client disconnections, cleaning up any resources.

### **2\. Message Flow & Format**

Communication will be handled via structured JSON messages. The contract between the client and this server is provider-agnostic.

#### **Client-to-Server Messages**

- **client-audio-chunk**: Sends a chunk of audio data from the user's microphone.  
  {  
   "type": "client-audio-chunk",  
   "payload": {  
   "data": "Base64-encoded audio data chunk"  
   }  
  }

- **client-interrupt**: Signals that the user has started speaking, interrupting the AI.  
  {  
   "type": "client-interrupt"  
  }

- **client-auth**: The initial message sent upon connection to authenticate.  
  {  
   "type": "client-auth",  
   "payload": {  
   "token": "supabase-jwt-access-token",  
   "sessionId": "interview-session-uuid"  
   }  
  }

#### **Server-to-Client Messages**

- **server-auth-success**: Confirms successful authentication.  
  {  
   "type": "server-auth-success",  
   "payload": { "message": "Authenticated successfully. Ready to begin." }  
  }

- **server-auth-failure**: Indicates authentication failed.  
  {  
   "type": "server-auth-failure",  
   "payload": { "error": "Invalid token or session." }  
  }

- **server-live-transcript**: Sends a real-time (interim) transcript from the STT service.  
  {  
   "type": "server-live-transcript",  
   "payload": { "transcript": "Partial user transcript..." }  
  }

- **server-ai-speech-chunk**: Sends a chunk of synthesized audio from the TTS service for the client to play.  
  {  
   "type": "server-ai-speech-chunk",  
   "payload": {  
   "data": "Base64-encoded audio data chunk"  
   }  
  }

- **server-session-ended**: Informs the client that the interview session is over.  
  {  
   "type": "server-session-ended",  
   "payload": { "reason": "All questions answered." }  
  }

### **3\. Backend Logic Flow**

1. On client-auth, validate the user and session. If successful, load the interview questions for that session from Supabase.
2. Once authenticated, the server sends the first question to the client via a series of server-ai-speech-chunk messages.
3. The server continuously receives client-audio-chunk messages. **It then forwards this audio stream to the configured real-time AI provider (e.g., OpenAI Realtime API or a custom pipeline using Google Gemini).**
4. As the STT service (from the chosen provider) produces interim results, the server forwards them to the client using server-live-transcript.
5. When the STT service detects the end of a user's utterance, the server takes the final transcript and sends it to the LLM (from the chosen provider) for a response (with streaming enabled).
6. As the LLM streams back its text response, the server immediately forwards this text to the TTS service.
7. As the TTS service streams back audio chunks, the server sends them to the client via server-ai-speech-chunk.
8. If a client-interrupt message is received, the server must immediately stop any ongoing LLM and TTS processes for the current response and prioritize the new user audio stream.
