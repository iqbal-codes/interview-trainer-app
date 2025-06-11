# **UI Component Specifications & Wireframes (Textual)**

## **Phase 7: Real-Time Interview Session Page**

This document outlines the UI specifications for the interview session page, refactored to support a live, streaming voice conversation via WebSockets.

### **1\. Page Details**

- **Route:** /interviews/\[sessionId\] (Dynamic route where \[sessionId\] is the ID of the interview session). This page is a **Protected Route** and requires user login.
- **Purpose:** To provide a real-time, conversational interface for the mock interview.
- **Layout:** A focused, clean interface that provides clear feedback on the conversation state.

### **2\. Key Components & Structure**

- \<div className="container mx-auto p-4 md:p-8"\>
  - \<h1 className="text-2xl font-bold mb-2"\>Live Interview Session\</h1\>
  - \<p className="text-muted-foreground mb-6"\>Role: {sessionDetails.target_role}\</p\>
  - \<Card className="w-full max-w-3xl mx-auto shadow-xl"\>
    - **Conversation Transcript Area:**
    - \<CardContent className="p-6 h-\[400px\] overflow-y-auto space-y-4"\>
      - _(This area will be dynamically populated with messages)_
      - \<div className="flex justify-start"\>\<span className="bg-secondary p-3 rounded-lg"\>\*\*AI:\*\* Welcome\! Are you ready to begin?\</span\>\</div\>
      - \<div className="flex justify-end"\>\<span className="bg-primary text-primary-foreground p-3 rounded-lg"\>\*\*You:\*\* {liveTranscript || finalTranscript}\</span\>\</div\>
    - \</CardContent\>
    - **Status & Controls Footer:**
    - \<CardFooter className="border-t p-4 flex items-center justify-between"\>
      - **Status Indicator:**
        - \<div className="flex items-center space-x-2"\>
          - \<div className="w-3 h-3 rounded-full {connectionStatusColor} animate-pulse"\>\</div\>
          - \<span className="text-sm text-muted-foreground"\>{connectionStatusText}\</span\> (e.g., "Connecting...", "Live", "Disconnected")
        - \</div\>
      - **End Interview Button:**
        - \<Button variant="destructive" onClick={handleEndInterview}\>End Interview\</Button\>
    - \</CardFooter\>
  - \</Card\>
- \</div\>

### **3\. Interactions & Logic**

- **State Management (useState):**
  - connectionStatusText: "Connecting...", "Live", "Reconnecting...", "Disconnected".
  - conversationHistory: An array of objects, e.g., { role: 'ai' | 'user', text: '...' }.
  - liveTranscript: The current interim transcript from the user.
- **Page Load (useEffect):**
  1. Get sessionId and user auth token.
  2. Establish a WebSocket connection to the backend.
  3. Send the client-auth message immediately after the connection opens.
  4. Set up MediaRecorder to capture microphone audio. Once the connection is live and authenticated, start recording and sending client-audio-chunk messages on a fixed interval (e.g., every 250ms).
- **WebSocket Event Handling:**
  - **onopen**: Set status to "Authenticating...", send client-auth message.
  - **onmessage**: A central handler that parses incoming JSON messages.
    - **server-auth-success**: Set status to "Live", start the MediaRecorder.
    - **server-live-transcript**: Update the liveTranscript state, which should update the last message in the conversation history UI.
    - **server-ai-speech-chunk**: Decode the Base64 audio data and push it into a client-side audio player queue to be played immediately. Append the AI's final text to conversationHistory once the full thought is delivered.
    - **server-session-ended**: Close the WebSocket connection, stop the MediaRecorder, and navigate the user to the feedback page.
  - **onclose**: Set status to "Disconnected". Attempt to reconnect if appropriate.
  - **onerror**: Display an error state.
- **Interruption Handling (Barge-in):**
  - The client should monitor microphone activity. If the user starts speaking while the AI audio is playing, the client should:
    1. Immediately stop playback of the AI's audio queue.
    2. Send a client-interrupt message over the WebSocket.
- **useEffect Cleanup:**
  - Ensure the MediaRecorder is stopped and the WebSocket connection is gracefully closed when the component unmounts.
