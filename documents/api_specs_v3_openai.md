# API Endpoint Specifications (Phase 5 - OpenAI Pivot)

This document outlines the backend API routes for our new OpenAI-based architecture. Vapi-related endpoints are now removed.

## 1. `/api/interviews/generate` (Unchanged from previous plan)

- **Purpose:** Generates interview questions using the Vercel AI SDK with your chosen LLM (e.g., Google Generative AI).
- **HTTP Method:** `POST`
- **Authentication:** Required.
- **Core Logic:**
  1.  Receives user preferences (role, skills, etc.).
  2.  Constructs a detailed prompt for the LLM.
  3.  Calls the LLM via the Vercel AI SDK (`generateText`).
  4.  Parses the response and saves the generated questions to the `interview_questions` table, linked to a new `interview_sessions` entry.
  5.  Returns the `session_id` and questions to the client.

## 2. `/api/interviews/get-answer-feedback` (New Endpoint)

- **Purpose:** This is the core of our non-real-time proof of concept. It takes a user's complete recorded answer, gets a transcript, generates feedback, and returns it.
- **HTTP Method:** `POST`
- **Authentication:** Required.
- **Request Body:** `multipart/form-data` containing:
  - `audioBlob`: The user's recorded audio answer (e.g., as a `.webm` or `.mp3` file).
  - `questionId`: The UUID of the question being answered.
  - `sessionId`: The UUID of the current interview session.
- **Core Logic:**
  1.  Verify the user is authenticated and owns the `sessionId`.
  2.  Receive and buffer the audio file.
  3.  Call the `transcribeAudio()` utility function (defined in `lib/openai-services.ts`) with the audio buffer.
  4.  Save the resulting transcript to the `interview_answers` table, linking it to the `questionId` and `sessionId`.
  5.  Call the `getLLMFeedback()` utility function with the transcript.
  6.  Save the generated feedback to the `ai_feedback` table, linked to the `sessionId`.
  7.  Return the generated feedback object to the client.
- **Response Body (Success - 200 OK):**
  ```json
  {
    "message": "Feedback generated successfully.",
    "feedback": {
      "overall_summary": "...",
      "strengths_feedback": "...",
      "areas_for_improvement_feedback": "...",
      "actionable_suggestions": "..."
    }
  }
  ```
- **Response Body (Error):** `400`, `401`, `500` with a JSON error message.
