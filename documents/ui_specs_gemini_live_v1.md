# UI Component Specifications (Textual)
## Phase 7: Gemini Live Interview Session Page

This document outlines the UI specifications for the interview session page, refactored to use the Google Generative AI SDK for a direct, real-time connection to the Gemini Live API.

### 1. Page Details
* **Route:** `/interviews/[sessionId]` (Protected Route).
* **Purpose:** To provide a real-time, conversational interface powered directly by the Gemini Live API.
* **Layout:** A focused, clean interface that provides clear feedback on the conversation state.

### 2. Key Components & Structure
* The visual layout is largely the same as the previous real-time spec (`ui_specs_realtime_session_v1`), with a conversation transcript area and a status footer. The key difference is in the underlying logic.
* **UI Elements:**
    * **Conversation Transcript Area:** Displays the back-and-forth between "You" and "AI".
    * **Status Indicator:** Shows the connection status (e.g., "Connecting...", "Live", "Session Ended").
    * **Start/End Interview Button:** Manages the Gemini Live API session lifecycle.

### 3. Interactions & Logic (Client-Side)
* **Dependencies:** `@google/genai`.
* **State Management (`useState`):**
    * `geminiSession`: Holds the active Gemini Live API session object.
    * `connectionStatusText`: "Ready", "Live", "Ended".
    * `conversationHistory`: An array of objects, e.g., `{ role: 'user' | 'model', text: '...' }`, to store the full conversation.
    * `isResponding`: A boolean to indicate if the AI is currently generating a response.
* **Page Load (`useEffect`):**
    1.  Fetch the pre-generated questions for the `sessionId` from your backend.
    2.  Initialize the Google Generative AI client: `const ai = new GoogleGenAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY)`.
* **"Start Interview" Button Click:**
    1.  Instantiate a Gemini Live session using the SDK: `const session = await ai.getGenerativeModel({ model: 'gemini-1.5-flash-preview-0514' }).startChat({ history: [...] });`. You can prime the history with the first interview question.
    2.  Set `geminiSession` and update status to "Live".
    3.  **Start sending microphone audio:** Use `MediaRecorder` to capture audio chunks and send them directly to the Gemini session via `await session.sendAudio(audioChunk)`.
* **Handling Gemini SDK Responses:**
    * **Loop through responses:** Use a `for await (const chunk of session.responseStream)` loop to handle incoming data from Google.
    * **Update Transcript:** When a `chunk.text()` is received, append it to the `conversationHistory`. This updates the UI to show what the AI is saying in real-time.
    * **Play Audio:** The Gemini Live API does **not** send back audio for you to play. It expects the browser to handle Text-to-Speech synthesis on its own. You will need to use the browser's built-in `SpeechSynthesisUtterance` and `speechSynthesis` APIs to speak the text you receive from the `chunk.text()`.
        ```javascript
        // Inside your response loop
        const aiText = chunk.text();
        // Update conversation history with aiText...

        // Use browser TTS to speak the text
        const utterance = new SpeechSynthesisUtterance(aiText);
        speechSynthesis.speak(utterance);
        ```
* **"End Interview" Button Click:**
    1.  Stop the `MediaRecorder`.
    2.  The Gemini Live session may close automatically, or you may need to handle cleanup.
    3.  Set status to "Ended".
    4.  **Crucially, call your new backend endpoint (`POST /api/interviews/save-transcript-and-get-feedback`)**, sending the entire `conversationHistory` array to be saved and analyzed.
    5.  Navigate the user to the feedback page.
* **`useEffect` Cleanup:** Ensure any active `MediaRecorder` or speech synthesis is stopped when the component unmounts.
