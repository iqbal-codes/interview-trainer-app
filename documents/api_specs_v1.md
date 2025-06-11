# API Endpoint Specifications (Next.js API Routes)

This document outlines the specifications for the backend API routes that will be developed as part of the AI-Powered Interview Practice Platform. These routes will be implemented using Next.js API Routes.

## Table of Contents

1.  `/api/auth/on-signup` (Potentially handled by Supabase trigger/function, or client-side logic as discussed in Phase 1)
2.  `/api/cv/upload`
3.  `/api/interviews/generate`
4.  `/api/interviews/{sessionId}/feedback` (For later phase, but good to define early)
5.  `/api/vapi/assistant` (Endpoint for Vapi to call - core for interview interaction)

---

## 1. `/api/auth/on-signup`

- **Purpose:** To create a corresponding entry in the `profiles` table after a new user successfully signs up via Supabase Auth.
- **Note:** As discussed in Phase 1, this might be better handled by a Supabase Database Function (trigger on `auth.users` table) or a Supabase Edge Function. If implemented as a Next.js API route, it would likely be called by a Supabase Auth webhook. For simplicity in V1, if client-side insert into `profiles` after signup is secure with RLS, that could also be an option.
- **If implemented as an API Route (e.g., called by a webhook):**
  - **HTTP Method:** `POST`
  - **Route Path:** `/api/auth/on-signup`
  - **Authentication:** Requires a secure mechanism (e.g., secret key from Supabase webhook) if called externally. Not directly user-authenticated.
  - **Request Body:**
    ```json
    {
      "type": "INSERT", // from Supabase webhook event
      "table": "users",
      "schema": "auth",
      "record": {
        "id": "user-uuid-from-auth",
        "email": "user@example.com"
        // ... other auth user fields
      },
      "old_record": null
    }
    ```
  - **Core Logic:**
    1.  Verify the request is legitimate (e.g., check a secret if it's a webhook).
    2.  Extract `id` (as `user_id`) and `email` from `request.body.record`.
    3.  Insert a new row into the `public.profiles` table with `user_id` and `email`. Other fields in `profiles` will use their default values or be NULL.
  - **Response Body (Success - 201 Created):**
    ```json
    {
      "message": "Profile created successfully",
      "profile": {
        "user_id": "user-uuid-from-auth",
        "email": "user@example.com"
        // ... other profile fields
      }
    }
    ```
  - **Response Body (Error):**
    - `400 Bad Request`: Invalid request body.
    - `401 Unauthorized`: Invalid webhook secret.
    - `500 Internal Server Error`: Database error or other server issues.
    ```json
    { "error": "Error message description" }
    ```

---

## 2. `/api/cv/upload`

- **Purpose:** Handles CV file uploads, parses the text content, and stores metadata and text.
- **HTTP Method:** `POST`
- **Route Path:** `/api/cv/upload`
- **Authentication:** Required (User must be logged in). The `user_id` will be derived from the authenticated Supabase session.
- **Request Body:** `multipart/form-data` containing the CV file.
  - `cvFile`: The uploaded file (PDF or DOCX).
- **Core Logic:**
  1.  Verify user authentication. Get `user_id` from session.
  2.  Receive the uploaded file.
  3.  Validate file type (allow PDF, DOCX) and size (e.g., max 5MB).
  4.  Parse the file to extract raw text content.
  5.  Upload the original file to Supabase Storage (e.g., to a path like `user_id/cv_uploads/original_filename_timestamp.ext`).
  6.  Save metadata to the `cv_uploads` table (including `user_id`, `file_name`, `storage_path`, `mime_type`, `file_size_bytes`). Mark as `is_current_cv = true` and update previous user CVs to `false`.
  7.  Update the `cv_text_content` field in the user's `profiles` table with the newly extracted text.
- **Response Body (Success - 200 OK):**
  ```json
  {
    "message": "CV uploaded and processed successfully.",
    "cv_upload_id": "uuid-of-cv-upload-entry",
    "file_name": "original_filename.pdf",
    "cv_text_preview": "First 200 characters of extracted text..." // Optional
  }
  ```
- **Response Body (Error):**
  - `400 Bad Request`: No file, invalid file type, file too large.
  - `401 Unauthorized`: User not authenticated.
  - `500 Internal Server Error`: File parsing error, Supabase storage/DB error.
  ```json
  { "error": "Error message description" }
  ```

---

## 3. `/api/interviews/generate`

- **Purpose:** Generates interview questions based on user inputs and initiates an interview session.
- **HTTP Method:** `POST`
- **Route Path:** `/api/interviews/generate`
- **Authentication:** Required.
- **Request Body:**
  ```json
  {
    "target_role": "Software Engineer",
    "key_skills_focused": ["React", "Node.js"],
    "interview_type": "Behavioral",
    "job_description_context": "Optional job description text...",
    "requested_num_questions": 5
  }
  ```
- **Core Logic:**
  1.  Verify user authentication. Get `user_id`.
  2.  Validate input parameters.
  3.  Create a new entry in the `interview_sessions` table with status 'pending' and the provided details. Get the `session_id`.
  4.  **LLM Interaction (Stub for now, full integration later):**
      - Construct a prompt for the LLM based on the request body and user's profile/CV context (from `profiles.cv_text_content`).
      - **Initial Stub:** Return a mock array of question strings based on `requested_num_questions`.
      - **Full Implementation:** Call the LLM API to generate questions.
  5.  Save the generated (or mock) questions to the `interview_questions` table, associated with the `session_id`.
  6.  Update the `interview_sessions` table with `actual_num_questions` and potentially change status to `ready_to_start` or similar if not immediately starting.
- **Response Body (Success - 201 Created):**
  ```json
  {
    "message": "Interview session created and questions generated.",
    "session_id": "uuid-of-interview-session",
    "questions": [
      {
        "id": "q_uuid_1",
        "question_text": "Tell me about yourself.",
        "order": 1
      },
      {
        "id": "q_uuid_2",
        "question_text": "Describe a challenging project.",
        "order": 2
      }
      // ...
    ]
  }
  ```
- **Response Body (Error):**
  - `400 Bad Request`: Invalid input parameters.
  - `401 Unauthorized`: User not authenticated.
  - `500 Internal Server Error`: LLM API error, Supabase DB error.
  ```json
  { "error": "Error message description" }
  ```

---

## 4. `/api/interviews/{sessionId}/feedback`

- **Purpose:** To fetch all answers for a completed session, send them to an LLM for analysis, and return/store the feedback.
- **HTTP Method:** `POST` (to trigger generation) or `GET` (if feedback is already generated and just being fetched). Let's make it `POST` to trigger generation and save, then subsequent `GET`s could fetch. For simplicity in this phase, we can just consider the `POST` to generate & return.
- **Route Path:** `/api/interviews/{sessionId}/feedback` (where `{sessionId}` is the UUID of the interview session)
- **Authentication:** Required. User must own the session.
- **Request Body (for POST):** (Potentially empty, or could have parameters for feedback specificity if needed in the future)
- **Core Logic (for POST):**
  1.  Verify user authentication and that the user owns the specified `sessionId`.
  2.  Fetch the `interview_session` details and all related `interview_answers` from Supabase.
  3.  Check if feedback already exists in `ai_feedback` for this `session_id`. If so, perhaps return existing feedback or allow re-generation based on a flag.
  4.  **LLM Interaction:**
      - Compile questions and answers into a suitable format for the LLM.
      - Send a prompt to the LLM to generate: overall summary, strengths, areas for improvement, actionable suggestions.
  5.  Save the generated feedback to the `ai_feedback` table.
- **Response Body (Success - 200 OK for POST):**
  ```json
  {
    "message": "Feedback generated successfully.",
    "session_id": "uuid-of-interview-session",
    "feedback": {
      "overall_summary": "...",
      "strengths_feedback": "...",
      "areas_for_improvement_feedback": "...",
      "actionable_suggestions": "..."
    }
  }
  ```
- **Response Body (Error):**
  - `401 Unauthorized`: User not authenticated or does not own the session.
  - `404 Not Found`: Session ID not found or no answers to process.
  - `500 Internal Server Error`: LLM API error, Supabase DB error.
  ```json
  { "error": "Error message description" }
  ```

---

## 5. `/api/vapi/assistant`

- **Purpose:** This is the webhook endpoint that Vapi will call during an active interview session. It processes user utterances (transcribed by Vapi) and returns the AI's next response/question.
- **HTTP Method:** `POST`
- **Route Path:** `/api/vapi/assistant`
- **Authentication:** Vapi may use a mechanism like a secret token in headers for verification. This is not standard user session auth.
- **Request Body (Example - Vapi's format will be specific, this is conceptual):**
  ```json
  {
    "call_id": "vapi-call-uuid", // Vapi's call identifier
    "session_id": "our-internal-session-uuid", // Your app's interview session ID, should be passed to Vapi when starting the call
    "transcript": {
      "text": "The user's latest spoken words.",
      "is_final": true
    },
    "current_state": {
      // Any state you asked Vapi to maintain or your backend has
      "current_question_index": 0
    }
    // ... other Vapi specific data
  }
  ```
- **Core Logic:**
  1.  Verify the request (e.g., check Vapi's secret token).
  2.  Identify the active `interview_sessions.id` (should be passed in the request or retrievable via `vapi_call_id` if stored).
  3.  If `transcript.text` is present (user spoke):
      - Save the user's answer (`transcript.text`) to the `interview_answers` table, linked to the current question.
  4.  Determine the next question:
      - Increment `current_question_index`.
      - Fetch the next question text from the `interview_questions` table for the current session and new index.
  5.  If there are more questions:
      - Prepare the response for Vapi, containing the next question text.
  6.  If no more questions (interview ended):
      - Prepare a concluding message for Vapi (e.g., "Thank you, that concludes our mock interview. Your feedback will be available shortly.").
      - Update `interview_sessions` status to 'completed'.
      - Potentially trigger the feedback generation process asynchronously (calling `/api/interviews/{sessionId}/feedback`).
- **Response Body (Success - 200 OK - Vapi's expected format):**
  - **If sending a message/question:**
    ```json
    {
      "type": "assistant_response", // Or Vapi's equivalent
      "message": {
        "type": "text",
        "text": "Next interview question goes here..."
      },
      "updated_state": {
        "current_question_index": 1
      }
      // ... other Vapi control flags
    }
    ```
  - **If ending the call:**
    ```json
    {
      "type": "hangup", // Or Vapi's equivalent
      "message": {
        "type": "text",
        "text": "Thank you for your time."
      }
    }
    ```
- **Response Body (Error):**
  - `400 Bad Request`: Invalid request from Vapi.
  - `401 Unauthorized`: Invalid Vapi token.
  - `500 Internal Server Error`: Database error, logic error.
  ```json
  {
    "error": "Error message for internal logging, Vapi might expect a specific error format or just a non-200 status"
  }
  ```

---

**LLM Interaction Details (Initial Thoughts for Phase 2 Stubs):**

- For `/api/interviews/generate`:
  - **Stub Logic:** Instead of a real LLM call, have a predefined list of 5-10 generic questions. If `requested_num_questions` is 3, return the first 3. This allows frontend development to proceed.
- For `/api/vapi/assistant`:
  - **Stub Logic:** This endpoint will primarily manage fetching pre-generated questions from the database one by one. No LLM calls needed here _yet_ for simply delivering questions. LLM interaction for dynamic follow-ups or real-time analysis is an advanced feature for later.
- For `/api/interviews/{sessionId}/feedback`:
  - **Stub Logic:** Return a hardcoded JSON object that mimics the structure of real feedback (summary, strengths, weaknesses, suggestions).

This should give you a clear roadmap for the backend API development in Phase 2!
