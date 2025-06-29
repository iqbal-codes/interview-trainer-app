import apiClient from './apiClient';
import authService from './authService';
import cvService from './cvService';
import interviewService from './interviewService';
import { withTransaction, SupabaseTransactionManager } from '@/lib/utils/supabaseTransaction';

export {
  apiClient,
  authService,
  cvService,
  interviewService,
  withTransaction,
  SupabaseTransactionManager
};

// Re-export the types from services for easier imports
export type {
  // Auth service types
  ProfileData,
} from './authService';

export type {
  // CV service types
  CVUpload,
  CVContent,
} from './cvService';

export type {
  // Interview service types
  InterviewQuestion,
  InterviewSession,
  CreateInterviewParams,
  ConversationTurn,
  FeedbackRequest,
  FeedbackResponse,
} from './interviewService';

export type {
  // Transaction types
  TransactionRecord,
} from '@/lib/utils/supabaseTransaction'; 