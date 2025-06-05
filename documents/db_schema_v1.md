# Data Models / Database Schema (Supabase - PostgreSQL)

This document outlines the database schema for the AI-Powered Interview Practice Platform. It's designed for use with Supabase, leveraging PostgreSQL.

## Table of Contents
- users (Handled by Supabase Auth)
- profiles
- cv_uploads
- interview_sessions
- interview_questions
- interview_answers
- ai_feedback

## 1. users Table (Handled by Supabase Auth)
This table is automatically created and managed by Supabase Authentication. We will reference its id (UUID) as a foreign key in other tables.

**Key Columns (provided by Supabase Auth):**
- **id** (UUID, Primary Key): Unique identifier for the user.
- **email** (VARCHAR): User's email address.
- **created_at** (TIMESTAMPTZ): Timestamp of user creation.
- Other auth-related fields.

## 2. profiles Table
Stores additional user-specific information not covered by Supabase Auth, including onboarding details.

**Table Name:** profiles

**Columns:**
- **user_id** (UUID, Primary Key, Foreign Key -> auth.users.id ON DELETE CASCADE): Links to the users table in the auth schema.
- **full_name** (TEXT, Nullable): User's full name.
- **years_of_experience** (INT, Nullable): User's years of professional experience.
- **primary_roles_pursued** (TEXT[], Nullable): Array of roles the user is targeting (e.g., {"Software Engineer", "Frontend Developer"}).
- **key_skills** (TEXT[], Nullable): Array of user's key skills (e.g., {"React", "Node.js", "Python", "Agile"}).
- **industries_of_interest** (TEXT[], Nullable): Array of industries the user is interested in.
- **cv_text_content** (TEXT, Nullable): Stores the extracted text content from the user's latest CV.
- **created_at** (TIMESTAMPTZ, Default: now()): Timestamp of profile creation.
- **updated_at** (TIMESTAMPTZ, Default: now()): Timestamp of last profile update.

## 3. cv_uploads Table
Stores metadata about CV files uploaded by users. Actual files will be stored in Supabase Storage.

**Table Name:** cv_uploads

**Columns:**
- **id** (UUID, Primary Key, Default: gen_random_uuid()): Unique identifier for the CV upload.
- **user_id** (UUID, Foreign Key -> auth.users.id ON DELETE CASCADE): Links to the users table.
- **file_name** (TEXT, Not Null): Original name of the uploaded file.
- **storage_path** (TEXT, Not Null, Unique): Path to the file in Supabase Storage.
- **mime_type** (TEXT, Nullable): Mime type of the file (e.g., application/pdf).
- **file_size_bytes** (BIGINT, Nullable): Size of the file in bytes.
- **uploaded_at** (TIMESTAMPTZ, Default: now()): Timestamp of when the file was uploaded.
- **is_current_cv** (BOOLEAN, Default: true): Indicates if this is the CV currently used for context (can be used to manage multiple CV versions, though V1 might only use the latest).

> **Note:** When a new CV is uploaded and marked as is_current_cv = true, previous CVs for that user might be set to is_current_cv = false. The profiles.cv_text_content would be updated from this current CV.

## 4. interview_sessions Table
Stores information about each mock interview session a user undertakes.

**Table Name:** interview_sessions

**Columns:**
- **id** (UUID, Primary Key, Default: gen_random_uuid()): Unique identifier for the interview session.
- **user_id** (UUID, Foreign Key -> auth.users.id ON DELETE CASCADE): The user who undertook the interview.
- **session_name** (TEXT, Nullable, Default: 'Practice Interview'): A user-friendly name for the session (e.g., "Software Engineer - Behavioral").
- **target_role** (TEXT, Nullable): The role the user was practicing for.
- **key_skills_focused** (TEXT[], Nullable): Skills focused on during this session.
- **interview_type** (TEXT, Nullable): Type of interview (e.g., "Behavioral," "Technical," "HR Screening").
- **job_description_context** (TEXT, Nullable): The job description text used for generating questions, if provided.
- **requested_num_questions** (INT, Nullable): Number of questions user requested.
- **actual_num_questions** (INT, Nullable): Number of questions actually asked.
- **status** (TEXT, Not Null, Default: 'pending'): Status of the interview (e.g., pending, in_progress, completed, aborted).
- **started_at** (TIMESTAMPTZ, Nullable): Timestamp when the interview started.
- **completed_at** (TIMESTAMPTZ, Nullable): Timestamp when the interview was completed or aborted.
- **vapi_call_id** (TEXT, Nullable): Identifier from Vapi for the call, if applicable.
- **created_at** (TIMESTAMPTZ, Default: now()): Timestamp of session creation.

## 5. interview_questions Table
Stores the questions that were generated and asked during an interview session.

**Table Name:** interview_questions

**Columns:**
- **id** (UUID, Primary Key, Default: gen_random_uuid()): Unique identifier for the question.
- **session_id** (UUID, Foreign Key -> interview_sessions.id ON DELETE CASCADE): Links to the specific interview session.
- **question_text** (TEXT, Not Null): The text of the interview question.
- **question_order** (INT, Not Null): The order in which the question was asked in the session.
- **question_type_tag** (TEXT, Nullable): A tag for the type of question (e.g., "behavioral", "technical_general", "situational").
- **generated_at** (TIMESTAMPTZ, Default: now()): Timestamp of when the question was generated/added to the session.

## 6. interview_answers Table
Stores the user's transcribed answers to the interview questions.

**Table Name:** interview_answers

**Columns:**
- **id** (UUID, Primary Key, Default: gen_random_uuid()): Unique identifier for the answer.
- **question_id** (UUID, Foreign Key -> interview_questions.id ON DELETE CASCADE): Links to the specific question that was answered.
- **session_id** (UUID, Foreign Key -> interview_sessions.id ON DELETE CASCADE): Links to the interview session (for easier querying).
- **user_id** (UUID, Foreign Key -> auth.users.id ON DELETE CASCADE): Links to the user (for easier querying).
- **answer_transcript_text** (TEXT, Nullable): The transcribed text of the user's answer.
- **answered_at** (TIMESTAMPTZ, Default: now()): Timestamp when the answer was recorded/transcribed.
- **audio_storage_path** (TEXT, Nullable): Path to the Vapi audio recording of the answer in Supabase Storage, if saved.

## 7. ai_feedback Table
Stores the AI-generated feedback for a completed interview session.

**Table Name:** ai_feedback

**Columns:**
- **id** (UUID, Primary Key, Default: gen_random_uuid()): Unique identifier for the feedback entry.
- **session_id** (UUID, Foreign Key -> interview_sessions.id ON DELETE CASCADE, Unique): Links to the specific interview session. Ensures one feedback entry per session.
- **user_id** (UUID, Foreign Key -> auth.users.id ON DELETE CASCADE): Links to the user.
- **overall_summary** (TEXT, Nullable): A concise summary of the interview performance.
- **strengths_feedback** (TEXT, Nullable): Detailed feedback on what the user did well. Can be structured JSON or Markdown.
- **areas_for_improvement_feedback** (TEXT, Nullable): Detailed feedback on areas needing improvement. Can be structured JSON or Markdown.
- **actionable_suggestions** (TEXT, Nullable): Specific suggestions for the user. Can be structured JSON or Markdown.
- **overall_score_qualitative** (TEXT, Nullable): A qualitative score or assessment (e.g., "Needs Improvement," "Good," "Excellent") if a numerical score is avoided.
- **feedback_generated_at** (TIMESTAMPTZ, Default: now()): Timestamp when the feedback was generated.

## General Notes on Schema

- **UUIDs for Primary Keys:** Using gen_random_uuid() is generally good practice.
- **Foreign Keys & Cascade:** ON DELETE CASCADE is used for simplicity here, meaning if a parent record (e.g., a user or an interview session) is deleted, related child records (e.g., their profiles, answers, feedback) are also deleted. Review if this is the desired behavior for all relationships or if ON DELETE SET NULL or ON DELETE RESTRICT might be more appropriate in some cases.
- **Timestamps:** created_at and updated_at (where applicable) are useful for auditing and tracking.
- **TEXT[] for arrays:** PostgreSQL's array type is used for lists like skills or roles.
- **RLS (Row Level Security):** This schema assumes RLS policies will be configured in Supabase to ensure users can only access their own data. For example, a user should only be able to select from interview_sessions where user_id matches auth.uid().

## SQL Statements for Table Creation

```sql
-- Create profiles table
CREATE TABLE public.profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    years_of_experience INTEGER,
    primary_roles_pursued TEXT[],
    key_skills TEXT[],
    industries_of_interest TEXT[],
    cv_text_content TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create cv_uploads table
CREATE TABLE public.cv_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL UNIQUE,
    mime_type TEXT,
    file_size_bytes BIGINT,
    uploaded_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    is_current_cv BOOLEAN DEFAULT true NOT NULL
);

-- Create interview_sessions table
CREATE TABLE public.interview_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_name TEXT DEFAULT 'Practice Interview',
    target_role TEXT,
    key_skills_focused TEXT[],
    interview_type TEXT,
    job_description_context TEXT,
    requested_num_questions INTEGER,
    actual_num_questions INTEGER,
    status TEXT NOT NULL DEFAULT 'pending',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    vapi_call_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create interview_questions table
CREATE TABLE public.interview_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_order INTEGER NOT NULL,
    question_type_tag TEXT,
    generated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create interview_answers table
CREATE TABLE public.interview_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.interview_questions(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    answer_transcript_text TEXT,
    answered_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    audio_storage_path TEXT
);

-- Create ai_feedback table
CREATE TABLE public.ai_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE UNIQUE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    overall_summary TEXT,
    strengths_feedback TEXT,
    areas_for_improvement_feedback TEXT,
    actionable_suggestions TEXT,
    overall_score_qualitative TEXT,
    feedback_generated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
```