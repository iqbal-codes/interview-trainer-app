export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      ai_feedback: {
        Row: {
          actionable_suggestions: string | null;
          areas_for_improvement_feedback: string | null;
          feedback_generated_at: string;
          feedback_json: Json | null;
          feedback_type: string | null;
          id: string;
          overall_score_qualitative: string | null;
          overall_summary: string | null;
          question_id: string | null;
          session_id: string;
          strengths_feedback: string | null;
          user_id: string;
        };
        Insert: {
          actionable_suggestions?: string | null;
          areas_for_improvement_feedback?: string | null;
          feedback_generated_at?: string;
          feedback_json?: Json | null;
          feedback_type?: string | null;
          id?: string;
          overall_score_qualitative?: string | null;
          overall_summary?: string | null;
          question_id?: string | null;
          session_id: string;
          strengths_feedback?: string | null;
          user_id: string;
        };
        Update: {
          actionable_suggestions?: string | null;
          areas_for_improvement_feedback?: string | null;
          feedback_generated_at?: string;
          feedback_json?: Json | null;
          feedback_type?: string | null;
          id?: string;
          overall_score_qualitative?: string | null;
          overall_summary?: string | null;
          question_id?: string | null;
          session_id?: string;
          strengths_feedback?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'ai_feedback_question_id_fkey';
            columns: ['question_id'];
            isOneToOne: false;
            referencedRelation: 'interview_questions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'ai_feedback_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: true;
            referencedRelation: 'interview_sessions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'ai_feedback_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      cv_uploads: {
        Row: {
          file_name: string;
          file_size_bytes: number | null;
          id: string;
          is_current_cv: boolean;
          mime_type: string | null;
          storage_path: string;
          uploaded_at: string;
          user_id: string;
        };
        Insert: {
          file_name: string;
          file_size_bytes?: number | null;
          id?: string;
          is_current_cv?: boolean;
          mime_type?: string | null;
          storage_path: string;
          uploaded_at?: string;
          user_id: string;
        };
        Update: {
          file_name?: string;
          file_size_bytes?: number | null;
          id?: string;
          is_current_cv?: boolean;
          mime_type?: string | null;
          storage_path?: string;
          uploaded_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'cv_uploads_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      interview_answers: {
        Row: {
          answer_transcript_text: string | null;
          answered_at: string;
          audio_storage_path: string | null;
          audio_url: string | null;
          id: string;
          question_id: string;
          session_id: string;
          status: string | null;
          user_id: string;
        };
        Insert: {
          answer_transcript_text?: string | null;
          answered_at?: string;
          audio_storage_path?: string | null;
          audio_url?: string | null;
          id?: string;
          question_id: string;
          session_id: string;
          status?: string | null;
          user_id: string;
        };
        Update: {
          answer_transcript_text?: string | null;
          answered_at?: string;
          audio_storage_path?: string | null;
          audio_url?: string | null;
          id?: string;
          question_id?: string;
          session_id?: string;
          status?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'interview_answers_question_id_fkey';
            columns: ['question_id'];
            isOneToOne: false;
            referencedRelation: 'interview_questions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'interview_answers_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'interview_sessions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'interview_answers_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      interview_questions: {
        Row: {
          generated_at: string;
          id: string;
          question_order: number;
          question_text: string;
          question_type_tag: string | null;
          session_id: string;
        };
        Insert: {
          generated_at?: string;
          id?: string;
          question_order: number;
          question_text: string;
          question_type_tag?: string | null;
          session_id: string;
        };
        Update: {
          generated_at?: string;
          id?: string;
          question_order?: number;
          question_text?: string;
          question_type_tag?: string | null;
          session_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'interview_questions_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'interview_sessions';
            referencedColumns: ['id'];
          },
        ];
      };
      interview_sessions: {
        Row: {
          actual_num_questions: number | null;
          completed_at: string | null;
          created_at: string;
          id: string;
          interview_type: string | null;
          job_description_context: string | null;
          requested_num_questions: number | null;
          session_name: string | null;
          started_at: string | null;
          status: string;
          target_role: string | null;
          user_id: string;
        };
        Insert: {
          actual_num_questions?: number | null;
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          interview_type?: string | null;
          job_description_context?: string | null;
          requested_num_questions?: number | null;
          session_name?: string | null;
          started_at?: string | null;
          status?: string;
          target_role?: string | null;
          user_id: string;
        };
        Update: {
          actual_num_questions?: number | null;
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          interview_type?: string | null;
          job_description_context?: string | null;
          requested_num_questions?: number | null;
          session_name?: string | null;
          started_at?: string | null;
          status?: string;
          target_role?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'interview_sessions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          cv_text_content: string | null;
          full_name: string | null;
          industries_of_interest: string[] | null;
          key_skills: string[] | null;
          primary_roles_pursued: string[] | null;
          updated_at: string;
          user_id: string;
          years_of_experience: number | null;
        };
        Insert: {
          created_at?: string;
          cv_text_content?: string | null;
          full_name?: string | null;
          industries_of_interest?: string[] | null;
          key_skills?: string[] | null;
          primary_roles_pursued?: string[] | null;
          updated_at?: string;
          user_id: string;
          years_of_experience?: number | null;
        };
        Update: {
          created_at?: string;
          cv_text_content?: string | null;
          full_name?: string | null;
          industries_of_interest?: string[] | null;
          key_skills?: string[] | null;
          primary_roles_pursued?: string[] | null;
          updated_at?: string;
          user_id?: string;
          years_of_experience?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// Convenient type aliases for tables
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type CVUpload = Database['public']['Tables']['cv_uploads']['Row'];
export type CVUploadInsert = Database['public']['Tables']['cv_uploads']['Insert'];
export type CVUploadUpdate = Database['public']['Tables']['cv_uploads']['Update'];

export type InterviewSession = Database['public']['Tables']['interview_sessions']['Row'];
export type InterviewSessionInsert = Database['public']['Tables']['interview_sessions']['Insert'];
export type InterviewSessionUpdate = Database['public']['Tables']['interview_sessions']['Update'];

export type InterviewQuestion = Database['public']['Tables']['interview_questions']['Row'];
export type InterviewQuestionInsert = Database['public']['Tables']['interview_questions']['Insert'];
export type InterviewQuestionUpdate = Database['public']['Tables']['interview_questions']['Update'];

export type InterviewAnswer = Database['public']['Tables']['interview_answers']['Row'];
export type InterviewAnswerInsert = Database['public']['Tables']['interview_answers']['Insert'];
export type InterviewAnswerUpdate = Database['public']['Tables']['interview_answers']['Update'];

export type AIFeedback = Database['public']['Tables']['ai_feedback']['Row'];
export type AIFeedbackInsert = Database['public']['Tables']['ai_feedback']['Insert'];
export type AIFeedbackUpdate = Database['public']['Tables']['ai_feedback']['Update'];
