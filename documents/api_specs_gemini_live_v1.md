# API Endpoint Specifications (Gemini Live Pivot)

This document outlines the API routes needed to support a client-side Gemini Live API integration. The backend is no longer responsible for real-time transport.

## 1. `GET /api/interviews` (Unchanged)
* **Purpose:** Fetches the user's interview history for the dashboard.

## 2. `GET /api/interviews/{sessionId}/feedback` (Unchanged)
* **Purpose:** Fetches previously generated feedback for a completed session.

## 3. `POST /api/interviews/generate` (Unchanged)
* **Purpose:** Generates the initial list of interview questions using an LLM before the session begins.

## 4. `POST /api/interviews/save-transcript-and-get-feedback` (New)
* **Purpose:** Called by the client **after** a Gemini Live session ends. It receives the full conversation transcript, saves it, and generates/returns feedback.
* **HTTP Method:** `POST`
* **Authentication:** Required.
* **Request Body:**
    ```json
    {
      "sessionId": "the-session-uuid",
      "conversationHistory": [
        { "role": "user", "text": "This was my first answer." },
        { "role": "ai", "text": "That's an interesting approach..." },
        { "role": "user", "text": "This was my second answer." }
      ]
    }
    ```
* **Core Logic:**
    1.  Verify user authentication and ownership of the `sessionId`.
    2.  Iterate through `conversationHistory`:
        * Save the user's turns to the `interview_answers` table.
    3.  Compile the full transcript and send it to an LLM (e.g., via the Vercel AI SDK) to generate a feedback report.
    4.  Save the report to the `ai_feedback` table.
    5.  Return the feedback object to the client.
* **Response Body (Success - 200 OK):** The generated feedback object.
