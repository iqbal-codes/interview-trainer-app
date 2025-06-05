import { create } from 'zustand';

interface InterviewQuestion {
  id: string;
  question: string;
  answer?: string;
  feedback?: string;
}

interface InterviewSession {
  id?: string;
  jobTitle: string;
  jobDescription?: string;
  status: 'pending' | 'in-progress' | 'completed';
  questions: InterviewQuestion[];
  currentQuestionIndex: number;
}

interface InterviewStore {
  session: InterviewSession | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  initializeSession: (jobTitle: string, jobDescription?: string) => void;
  setCurrentQuestion: (index: number) => void;
  addQuestion: (question: string) => void;
  updateAnswer: (questionId: string, answer: string) => void;
  updateFeedback: (questionId: string, feedback: string) => void;
  completeSession: () => void;
  resetSession: () => void;
}

export const useInterviewStore = create<InterviewStore>((set) => ({
  session: null,
  isLoading: false,
  error: null,
  
  initializeSession: (jobTitle: string, jobDescription?: string) => {
    set({
      session: {
        jobTitle,
        jobDescription,
        status: 'pending',
        questions: [],
        currentQuestionIndex: -1,
      },
      isLoading: false,
      error: null,
    });
  },
  
  setCurrentQuestion: (index: number) => {
    set((state: InterviewStore) => {
      if (!state.session) return state;
      
      return {
        session: {
          ...state.session,
          currentQuestionIndex: index,
        },
      };
    });
  },
  
  addQuestion: (question: string) => {
    set((state: InterviewStore) => {
      if (!state.session) return state;
      
      const newQuestion: InterviewQuestion = {
        id: `q-${Date.now()}`,
        question,
      };
      
      return {
        session: {
          ...state.session,
          questions: [...state.session.questions, newQuestion],
          currentQuestionIndex: state.session.questions.length,
          status: 'in-progress',
        },
      };
    });
  },
  
  updateAnswer: (questionId: string, answer: string) => {
    set((state: InterviewStore) => {
      if (!state.session) return state;
      
      const updatedQuestions = state.session.questions.map((q) => {
        if (q.id === questionId) {
          return { ...q, answer };
        }
        return q;
      });
      
      return {
        session: {
          ...state.session,
          questions: updatedQuestions,
        },
      };
    });
  },
  
  updateFeedback: (questionId: string, feedback: string) => {
    set((state: InterviewStore) => {
      if (!state.session) return state;
      
      const updatedQuestions = state.session.questions.map((q) => {
        if (q.id === questionId) {
          return { ...q, feedback };
        }
        return q;
      });
      
      return {
        session: {
          ...state.session,
          questions: updatedQuestions,
        },
      };
    });
  },
  
  completeSession: () => {
    set((state: InterviewStore) => {
      if (!state.session) return state;
      
      return {
        session: {
          ...state.session,
          status: 'completed',
        },
      };
    });
  },
  
  resetSession: () => {
    set({
      session: null,
      isLoading: false,
      error: null,
    });
  },
})); 