# UI Component Specifications & Wireframes (Textual)

## Phase 5: Interview Session Page

This document outlines the UI specifications for the "Interview Session Page," where the user engages in the voice-based mock interview with the Vapi AI assistant. We will be using Next.js, TypeScript, Tailwind CSS, and Shadcn/ui components.

---

## 1. Page Details

- **Route:** `/interviews/[sessionId]` (Dynamic route where `[sessionId]` is the ID of the interview session). This page is a **Protected Route** and requires user login.
- **Purpose:** Provides the interface for the live voice interview. Initializes the Vapi call and displays interview progress and questions.
- **Layout:** A clean, focused interface designed to minimize distractions and center the user's attention on the voice interaction. It could resemble a simplified call interface.

---

## 2. Key Components & Structure

- `<div className="container mx-auto p-4 md:p-8 flex flex-col items-center justify-center min-h-[calc(100vh-150px)]">` (Adjust `min-h` based on your navbar/footer height to center content effectively)
  - `<Card className="w-full max-w-xl shadow-xl">`
    - `<CardHeader className="text-center border-b pb-4">`
      - `<CardTitle className="text-2xl md:text-3xl font-bold">Interview Session In Progress</CardTitle>`
      - `<CardDescription className="text-sm md:text-base text-muted-foreground mt-1">Role: {sessionDetails?.target_role || 'Loading...'} | Type: {sessionDetails?.interview_type || 'Loading...'}</CardDescription>`
      - _(Session details like target_role and interview_type will be fetched based on `sessionId`)_
    - `</CardHeader>`
    - `<CardContent className="space-y-6 text-center p-6 md:p-8">`
      - **Status Display / Current Question Area:**
        - `<div id="interview-status-display" className="text-lg md:text-xl font-semibold min-h-[90px] p-4 bg-secondary/50 rounded-md border border-secondary flex items-center justify-center">`
          - **Initial State:** "Press 'Start Interview' to begin."
          - **Connecting State:** "Connecting to interview assistant..."
          - **Waiting State:** "Waiting for the first question..."
          - **Question Display State:** Will display the current question text spoken by the AI. (e.g., "Tell me about a time you faced a challenge.")
          - **User Speaking State:** (Optional text, primarily visual cues) "You are speaking..."
          - **AI Processing State:** "Assistant is processing..."
          - **End of Interview State:** "Interview Complete! Your feedback is being prepared."
        - `</div>`
      - **Visual Feedback for Speaking/Listening:**
        - `<div className="flex items-center justify-center space-x-2 text-muted-foreground my-4">`
          - _(Example: Use Lucide Icons from `lucide-react`)_
          - `<span>{isListening ? <Mic size={20} className="text-blue-500 animate-pulse" /> : <MicOff size={20} />}</span>`
          - `<span>{isAssistantSpeaking ? <Volume2 size={20} className="text-green-500 animate-pulse" /> : <VolumeX size={20} />}</span>`
          - `<span className="text-sm">{uiStatusText}</span>` (e.g., "Listening", "Assistant Speaking", "Idle")
        - `</div>`
      - **Controls:**
        - **Start/End Interview Button:**
          - `<Button id="toggle-interview-button" size="lg" className="w-full md:w-auto px-8 py-6 text-lg">Start Interview</Button>`
          - Button text should dynamically change: "Start Interview" -> "End Interview".
          - Button should be disabled during critical transitions (e.g., while Vapi is connecting, or while AI is speaking for a long duration if that's a state you manage).
    - `</CardContent>`
    - `<CardFooter className="text-center border-t pt-4">`
      - `<p className="text-xs md:text-sm text-muted-foreground">Ensure your microphone is enabled and speak clearly when prompted.</p>`
    - `</CardFooter>`
  - `</Card>`
- `</div>`

---

## 3. Interactions & Vapi Integration (Client-Side Logic)

- **Page Load / `useEffect`:**
  1.  Verify user authentication. Redirect if not logged in.
  2.  Extract `sessionId` from the URL.
  3.  Fetch `interview_session` details (like `target_role`, `interview_type`) from Supabase using the `sessionId`. Store this in component state (e.g., `sessionDetails`). This is for display purposes.
  4.  **Do NOT initialize Vapi immediately on load.** Wait for the user to click the "Start Interview" button.
- **State Management (`useState` or similar):**
  - `sessionDetails`: Stores fetched details of the current interview session.
  - `vapiInstance`: To hold the Vapi SDK instance.
  - `isCallActive`: Boolean, true if Vapi call is ongoing.
  - `currentQuestionText`: String, to display the question from the assistant.
  - `uiStatusText`: String, for textual feedback like "Listening...", "Connecting...".
  - `isListening`: Boolean, true if Vapi is actively listening to the user.
  - `isAssistantSpeaking`: Boolean, true if the Vapi assistant is currently speaking.
  - `isLoading`: Boolean, for the Start/End button or general page loading.
- **"Start Interview" Button Click:**
  1.  Set `isLoading` to true, update `uiStatusText` to "Connecting...".
  2.  Initialize the Vapi client SDK (e.g., `const vapi = new Vapi('<YOUR_VAPI_PUBLIC_KEY>');`). Store in `vapiInstance`.
  3.  Start the Vapi call: `vapi.start('<YOUR_VAPI_ASSISTANT_ID>', assistantOverrides)`.
      - **`assistantOverrides` (or similar in Vapi SDK):** This is where you pass custom data to your Vapi assistant (and thus to your `/api/vapi/assistant` webhook).
        - **Crucial:** Pass your internal `sessionId` (from the URL) and an initial `current_question_index` (e.g., -1 or 0) as `forwardedParams` (or the equivalent field Vapi uses, e.g., `model.messages[0].content.forwardedParams` or `assistant.firstMessage.content.forwardedParams` - **CONSULT VAPI DOCS**).
        ```javascript
        // Conceptual example for passing parameters
        // vapi.start('<YOUR_VAPI_ASSISTANT_ID>', {
        //   model: { // Or wherever Vapi expects these forwarded params
        //     messages: [
        //       {
        //         role: 'system', // or directly in first message if that's how Vapi forwards
        //         content: JSON.stringify({ // Example of a structured way
        //            forwardedParams: {
        //                custom_session_id: sessionIdFromUrl,
        //                current_question_index: -1 // Backend will handle initial question
        //            }
        //         })
        //       }
        //     ]
        //   }
        // });
        ```
  4.  Update UI: Set `isCallActive` to true, change button text to "End Interview".
  5.  Set `isLoading` to false.
- **Vapi Event Handling (Client-Side, attach these to `vapiInstance`):**
  - **`call-start` (or similar "connected" event):** Update `uiStatusText` to "Connected! Waiting for first question...".
  - **`speech-start`:** Set `isListening` to true, `isAssistantSpeaking` to false, update `uiStatusText` to "Listening...".
  - **`speech-end`:** Set `isListening` to false. Update `uiStatusText` (e.g., "Processing your response...").
  - **`message` (when a message from the assistant arrives):**
    - If `message.role === 'assistant'` and `message.message.type === 'text'`:
      - Set `currentQuestionText` to `message.message.text`. Display this in the UI.
      - Set `isAssistantSpeaking` to true (and shortly after it's displayed, set to false, or use Vapi's `utterance-start`/`utterance-end` events if available for better accuracy).
      - Update `uiStatusText` to "Assistant speaking...".
  - **`utterance-start` (if Vapi provides this):** Assistant has started speaking. Set `isAssistantSpeaking` true.
  - **`utterance-end` (if Vapi provides this):** Assistant has finished speaking. Set `isAssistantSpeaking` false. Update `uiStatusText`.
  - **`call-end`:**
    - Set `isCallActive` to false, `isListening` false, `isAssistantSpeaking` false.
    - Update `uiStatusText` to "Interview Complete! Redirecting to feedback..."
    - Clean up Vapi resources: `vapi.stop()`.
    - Navigate the user to the feedback page (`/interviews/[sessionId]/feedback` - to be created in Phase 6) or dashboard.
  - **`error`:**
    - Display an appropriate error message to the user (e.g., using a Shadcn/ui `<Alert variant="destructive">`).
    - Update `uiStatusText`. Set `isLoading` false, `isCallActive` false.
- **"End Interview" Button Click:**
  - If `vapiInstance` and `isCallActive` are true, call `vapiInstance.stop()`.
  - This should trigger the `call-end` event handler for cleanup and UI updates.
- **`useEffect` Cleanup:**
  - On component unmount, if `vapiInstance` and `isCallActive` are true, ensure `vapiInstance.stop()` is called to prevent lingering calls.

---

This UI specification should provide a solid foundation for building the frontend of the interview session. The Vapi integration part is key and will require careful attention to Vapi's specific SDK methods and event names.

