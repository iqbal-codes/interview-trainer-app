import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import interviewService from '@/lib/services/interviewService';
import type { InterviewSetupInput } from '@/lib/validations/interview';

// Define the response type
export interface InterviewSessionResponse {
  message: string;
  session_id: string;
  questions: Array<{
    id: string;
    question_text: string;
    order: number;
  }>;
}

interface UseCreateInterviewOptions {
  onSuccess?: (data: InterviewSessionResponse) => void;
}

export function useCreateInterview({ onSuccess }: UseCreateInterviewOptions = {}) {
  const [apiError, setApiError] = useState<string | null>(null);
  const [generatedSession, setGeneratedSession] = useState<InterviewSessionResponse | null>(null);
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: (data: InterviewSetupInput) => interviewService.createInterview(data),
    onSuccess: responseData => {
      // Store the generated session data
      setGeneratedSession(responseData);

      // Show success message
      toast.success('Interview session created successfully!');

      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess(responseData);
      } else {
        // Navigate to the dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      }
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'An error occurred while generating the interview';
      setApiError(errorMessage);
      toast.error(errorMessage);
    },
  });

  const createInterview = (data: InterviewSetupInput) => {
    setApiError(null);
    setGeneratedSession(null);
    mutation.mutate(data);
  };

  return {
    createInterview,
    apiError,
    generatedSession,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
  };
}
