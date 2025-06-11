import { useState, useCallback } from 'react';
import { useInterviewStore } from '@/lib/store/interview-store';
import { createVapiClient } from '@/lib/vapi/client';

interface UseInterviewOptions {
  onInterviewStart?: () => void;
  onInterviewEnd?: () => void;
  onQuestionReceived?: (question: string) => void;
  onTranscriptUpdate?: (transcript: string) => void;
}

export function useInterview(options: UseInterviewOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');

  const { session, initializeSession, addQuestion, updateAnswer, completeSession } =
    useInterviewStore();

  // Initialize Vapi client
  const initializeVapi = useCallback(() => {
    try {
      const vapi = createVapiClient();
      return vapi;
    } catch (err) {
      setError('Failed to initialize Vapi client');
      console.error('Vapi initialization error:', err);
      return null;
    }
  }, []);

  // Start interview session
  const startInterview = useCallback(
    async (jobTitle: string, jobDescription?: string) => {
      setIsLoading(true);
      setError(null);

      try {
        // Initialize the interview session in the store
        initializeSession(jobTitle, jobDescription);

        // Initialize Vapi client
        const vapi = initializeVapi();

        if (!vapi) {
          throw new Error('Failed to initialize Vapi client');
        }

        // Set up event listeners
        vapi.on('call-start', () => {
          setIsActive(true);
          options.onInterviewStart?.();
        });

        vapi.on('call-end', () => {
          setIsActive(false);
          completeSession();
          options.onInterviewEnd?.();
        });

        vapi.on('message', message => {
          if (message.type === 'transcript' && message.role === 'assistant') {
            // If this is a question from the assistant
            if (message.transcript && message.transcript.trim().endsWith('?')) {
              addQuestion(message.transcript);
              options.onQuestionReceived?.(message.transcript);
            }
          }

          if (message.type === 'transcript' && message.role === 'user') {
            // Store the user's answer
            if (
              session?.currentQuestionIndex !== -1 &&
              session?.questions[session.currentQuestionIndex]
            ) {
              updateAnswer(session.questions[session.currentQuestionIndex].id, message.transcript);
            }

            // Update transcript
            setCurrentTranscript(message.transcript);
            options.onTranscriptUpdate?.(message.transcript);
          }
        });

        // Start the call with Vapi
        // In a real implementation, you would use a pre-configured assistant ID
        // or create an assistant configuration
        vapi.start('your-assistant-id', {
          variableValues: {
            jobTitle,
            jobDescription: jobDescription || '',
          },
        });

        setIsLoading(false);
        return vapi;
      } catch (err) {
        setIsLoading(false);
        setError('Failed to start interview');
        console.error('Interview start error:', err);
        return null;
      }
    },
    [
      initializeSession,
      initializeVapi,
      addQuestion,
      updateAnswer,
      completeSession,
      session,
      options,
    ]
  );

  // End interview session
  const endInterview = useCallback(() => {
    try {
      const vapi = initializeVapi();
      if (vapi) {
        vapi.stop();
        setIsActive(false);
      }
    } catch (err) {
      setError('Failed to end interview');
      console.error('Interview end error:', err);
    }
  }, [initializeVapi]);

  return {
    isLoading,
    error,
    isActive,
    currentTranscript,
    startInterview,
    endInterview,
    session,
  };
}
