# API Endpoint Specifications (Phase 8)

This document outlines the `GET` endpoints required for the frontend to display interview history and detailed feedback reports.

## 1. `GET /api/interviews`

- **Purpose:** Fetches a list of all interview sessions for the currently authenticated user.
- **HTTP Method:** `GET`
- **Authentication:** Required. The user's ID will be derived from their Supabase session.
- **Core Logic:**
  1.  Verify user authentication. Get `user_id`.
  2.  Query the `interview_sessions` table in Supabase.
  3.  Filter results `WHERE user_id = auth.uid()`.
  4.  Order the results by creation date descending (`ORDER BY created_at DESC`).
- **Response Body (Success - 200 OK):** An array of interview session objects.
  ```json
  [
    {
      "id": "session-uuid-1",
      "target_role": "Software Engineer",
      "interview_type": "Behavioral",
      "status": "completed",
      "completed_at": "iso-timestamp"
    },
    {
      "id": "session-uuid-2",
      "target_role": "Product Manager",
      "interview_type": "Situational",
      "status": "completed",
      "completed_at": "iso-timestamp"
    }
  ]
  ```
- **Response Body (Error):**
  - `401 Unauthorized`: User not authenticated.
  - `500 Internal Server Error`: Database error.

---

## 2. `GET /api/interviews/{sessionId}/feedback`

- **Purpose:** Fetches the generated AI feedback for a single, specific interview session.
- **HTTP Method:** `GET`
- **Authentication:** Required. User must be the owner of the session.
- **Core Logic:**
  1.  Verify user authentication. Get `user_id`.
  2.  Extract `sessionId` from the URL path.
  3.  Query the `ai_feedback` table in Supabase.
  4.  Filter `WHERE session_id = {sessionId} AND user_id = auth.uid()`. This ensures a user can only access their own feedback.
- **Response Body (Success - 200 OK):** A single feedback object.
  ```json
  {
    "session_id": "session-uuid-1",
    "overall_summary": "Overall, your performance was strong...",
    "strengths_feedback": "You did an excellent job of...",
    "areas_for_improvement_feedback": "One area to focus on is...",
    "actionable_suggestions": "Try practicing the STAR method for...",
    "feedback_generated_at": "iso-timestamp"
  }
  ```
- **Response Body (Error):**
  - `401 Unauthorized`: User not authenticated or does not own the session.
  - `404 Not Found`: No feedback entry exists for the given session ID.
  - `500 Internal Server Error`: Database error.
