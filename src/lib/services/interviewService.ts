import apiClient from './apiClient';

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
}

export interface CreateInterviewParams {
  target_role: string;
  interview_type: string;
  key_skills?: string[];
  job_description?: string;
  num_questions?: number;
  session_name?: string;
}

export interface ConversationTurn {
  role: 'user' | 'model';
  text: string;
}

export interface FeedbackRequest {
  conversationHistory: ConversationTurn[];
}

export interface FeedbackResponse {
  overall_summary: string;
  strengths_feedback: string;
  areas_for_improvement_feedback: string; 
  actionable_suggestions: string;
  [key: string]: string | number | boolean | null | object; // More specific types
}

const interviewService = {
  /**
   * Get a list of all interviews for the current user
   */
  getInterviews: async (): Promise<InterviewSession[]> => {
    const response = await apiClient.get('/interviews');
    return response.data;
  },

  /**
   * Get details for a specific interview session
   */
  getInterview: async (sessionId: string): Promise<InterviewSession> => {
    const response = await apiClient.get(`/interviews/${sessionId}`);
    return response.data;
  },

  /**
   * Create a new interview session
   */
  createInterview: async (params: CreateInterviewParams): Promise<InterviewSession> => {
    const response = await apiClient.post('/interviews', params);
    return response.data;
  },

  /**
   * Update an interview session status
   */
  updateInterviewStatus: async (
    sessionId: string, 
    status: 'active' | 'completed'
  ): Promise<InterviewSession> => {
    const response = await apiClient.patch(`/interviews/${sessionId}/status`, { status });
    return response.data;
  },

  /**
   * Save transcript and get feedback for an interview
   */
  saveFeedback: async (sessionId: string, data: FeedbackRequest): Promise<FeedbackResponse> => {
    const response = await apiClient.post(`/interviews/${sessionId}/feedback`, data);
    return response.data;
  },

  /**
   * Get feedback for a completed interview
   */
  getFeedback: async (sessionId: string): Promise<FeedbackResponse> => {
    const response = await apiClient.get(`/interviews/${sessionId}/feedback`);
    return response.data;
  }
};

export default interviewService; 