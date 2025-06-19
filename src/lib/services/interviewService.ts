import apiClient from './apiClient';
import { FeedbackResponse } from './googleService';

/**
 * Service for managing interview-related API operations
 */
export interface InterviewQuestion {
  id: string;
  question_text: string;
  question_order?: number;
  question_type_tag?: string;
}

export interface InterviewSession {
  id: string;
  target_role: string;
  interview_type: string;
  key_skills_focused?: string[];
  job_description_context?: string;
  requested_num_questions?: number;
  actual_num_questions?: number;
  status: 'pending' | 'active' | 'completed';
  started_at?: string;
  completed_at?: string;
  session_name: string;
  questions?: InterviewQuestion[];
  created_at: string;
}

export interface CreateInterviewParams {
  target_role: string;
  interview_type: string;
  job_description_context?: string;
  requested_num_questions?: number;
  session_name?: string;
}

export interface ConversationTurn {
  role: 'user' | 'model';
  text: string;
}

export interface FeedbackRequest {
  conversationHistory: ConversationTurn[];
}

// Using our own interface here to avoid circular dependencies
export interface InterviewSessionDTO {
  id: string;
  target_role: string;
  interview_type: string;
  job_description_context?: string;
  requested_num_questions?: number;
  actual_num_questions?: number;
  status: 'pending' | 'active' | 'completed';
  started_at?: string;
  completed_at?: string;
  session_name: string;
  created_at: string;
  questions?: InterviewQuestion[];
}

const interviewService = {
  /**
   * Get a list of all interviews for the current user
   */
  getInterviews: async (): Promise<InterviewSessionDTO[]> => {
    const response = await apiClient.get('/interviews');
    return response.data;
  },

  /**
   * Get details for a specific interview session
   */
  getInterview: async (sessionId: string): Promise<InterviewSessionDTO> => {
    const response = await apiClient.get(`/interviews/${sessionId}`);
    return response.data;
  },

  /**
   * Create a new interview session
   */
  createInterview: async (
    params: CreateInterviewParams
  ): Promise<{
    message: string;
    session_id: string;
    questions: Array<{
      id: string;
      question_text: string;
      order: number;
    }>;
  }> => {
    const response = await apiClient.post('/ai/interview/generate', params);
    return response.data;
  },

  /**
   * Update an interview session status
   */
  updateInterviewStatus: async (
    sessionId: string,
    status: 'active' | 'completed'
  ): Promise<InterviewSessionDTO> => {
    const response = await apiClient.patch(`/interviews/${sessionId}/status`, { status });
    return response.data;
  },

  /**
   * Save transcript and get feedback for an interview
   */
  saveFeedback: async (sessionId: string, data: FeedbackRequest): Promise<FeedbackResponse> => {
    const response = await apiClient.post(`/ai/interviews/feedback`, {
      ...data,
      sessionId,
    });
    return response.data;
  },

  /**
   * Get feedback for a completed interview
   */
  getFeedback: async (sessionId: string): Promise<FeedbackResponse> => {
    const response = await apiClient.get(`/interviews/${sessionId}/feedback`);
    return response.data;
  },
};

export default interviewService;
