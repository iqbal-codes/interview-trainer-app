'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import Vapi from '@vapi-ai/web';
import { Database } from '@/lib/supabase/types';

// Define types for Vapi events
interface VapiMessage {
  role: 'assistant' | 'user';
  message?: {
    type: string;
    text: string;
  };
}

interface InterviewSession {
  id: string;
  target_role: string;
  interview_type: string;
  status: string;
  key_skills_focused: string[];
  job_description_context: string | null;
  requested_num_questions: number;
  actual_num_questions: number | null;
  vapi_call_id: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  user_id: string;
  session_name: string;
}

export default function InterviewSessionPage({ params }: { params: { sessionId: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClientComponentClient<Database>();
  
  const [sessionDetails, setSessionDetails] = useState<InterviewSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCallActive, setIsCallActive] = useState(false);
  const [currentQuestionText, setCurrentQuestionText] = useState<string>('');
  const [uiStatusText, setUiStatusText] = useState<string>('Press \'Start Interview\' to begin.');
  const [isListening, setIsListening] = useState(false);
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);
  const [vapiInstance, setVapiInstance] = useState<Vapi | null>(null);

  // Fetch session details
  useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
        const { data: session, error } = await supabase
          .from('interview_sessions')
          .select('*')
          .eq('id', params.sessionId)
          .single();

        if (error) {
          throw error;
        }

        if (!session) {
          toast({
            title: 'Session not found',
            description: 'The interview session could not be found.',
            variant: 'destructive',
          });
          router.push('/dashboard');
          return;
        }

        setSessionDetails(session as InterviewSession);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching session details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load interview session details.',
          variant: 'destructive',
        });
        router.push('/dashboard');
      }
    };

    fetchSessionDetails();
  }, [params.sessionId, supabase, toast, router]);

  // Initialize Vapi and handle events
  const startInterview = useCallback(async () => {
    try {
      setIsLoading(true);
      setUiStatusText('Connecting to interview assistant...');

      // Check for Vapi public key
      const vapiPublicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
      const vapiAssistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

      if (!vapiPublicKey || !vapiAssistantId) {
        throw new Error('Missing Vapi configuration');
      }

      // Initialize Vapi client
      const vapi = new Vapi(vapiPublicKey);

      // Set up event handlers
      vapi.on('call-start', () => {
        setIsCallActive(true);
        setUiStatusText('Waiting for the first question...');
        setIsLoading(false);
      });

      vapi.on('speech-start', () => {
        setIsListening(true);
        setIsAssistantSpeaking(false);
        setUiStatusText('Listening...');
      });

      vapi.on('speech-end', () => {
        setIsListening(false);
        setUiStatusText('Processing your response...');
      });

      vapi.on('message', (message: VapiMessage) => {
        if (message.role === 'assistant' && message.message?.type === 'text') {
          setCurrentQuestionText(message.message.text);
          setIsAssistantSpeaking(true);
          setUiStatusText('Assistant speaking...');
        }
      });

      // Note: These event names might need to be adjusted based on Vapi's actual SDK
      // If 'utterance-start' and 'utterance-end' are not supported, use appropriate alternatives
      // or remove these handlers if not needed
      try {
        // @ts-expect-error - Vapi SDK might support these events in future versions
        vapi.on('utterance-start', () => {
          setIsAssistantSpeaking(true);
          setUiStatusText('Assistant speaking...');
        });

        // @ts-expect-error - Vapi SDK might support these events in future versions
        vapi.on('utterance-end', () => {
          setIsAssistantSpeaking(false);
          setUiStatusText('Waiting for your response...');
        });
      } catch (_) {
        console.warn('Utterance events not supported in this Vapi SDK version');
      }

      vapi.on('call-end', () => {
        setIsCallActive(false);
        setIsListening(false);
        setIsAssistantSpeaking(false);
        setUiStatusText('Interview Complete! Redirecting to feedback...');
        
        // Clean up Vapi resources
        vapi.stop();
        setVapiInstance(null);

        // Show toast notification
        toast({
          title: 'Interview Completed',
          description: 'Your interview has been completed successfully.',
        });

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      });

      vapi.on('error', (error: Error) => {
        console.error('Vapi error:', error);
        setIsLoading(false);
        setIsCallActive(false);
        setUiStatusText('Error: Could not connect to interview assistant.');
        
        toast({
          title: 'Connection Error',
          description: 'Failed to connect to the interview assistant. Please try again.',
          variant: 'destructive',
        });
      });

      // Start the Vapi call with the session ID and initial question index
      // Note: The exact structure for passing custom data might need to be adjusted
      // based on Vapi's documentation
      // @ts-expect-error - Ignoring type check as the exact Vapi API structure might differ
      vapi.start(vapiAssistantId, {
        firstMessage: {
          forwardedParams: {
            custom_session_id: params.sessionId,
            current_question_index: 0
          }
        }
      });

      // Store the Vapi instance
      setVapiInstance(vapi);

    } catch (error) {
      console.error('Error starting interview:', error);
      setIsLoading(false);
      toast({
        title: 'Error',
        description: 'Failed to start the interview. Please try again.',
        variant: 'destructive',
      });
    }
  }, [params.sessionId, toast, router]);

  // End the interview
  const endInterview = useCallback(() => {
    if (vapiInstance && isCallActive) {
      vapiInstance.stop();
      setUiStatusText('Ending interview...');
    }
  }, [vapiInstance, isCallActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (vapiInstance && isCallActive) {
        vapiInstance.stop();
      }
    };
  }, [vapiInstance, isCallActive]);

  return (
    <MainLayout>
      <div className="container mx-auto p-4 md:p-8 flex flex-col items-center justify-center min-h-[calc(100vh-150px)]">
        <Card className="w-full max-w-xl shadow-xl">
          <CardHeader className="text-center border-b pb-4">
            <CardTitle className="text-2xl md:text-3xl font-bold">Interview Session In Progress</CardTitle>
            <CardDescription className="text-sm md:text-base text-muted-foreground mt-1">
              Role: {sessionDetails?.target_role || 'Loading...'} | Type: {sessionDetails?.interview_type || 'Loading...'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-center p-6 md:p-8">
            {/* Status Display / Current Question Area */}
            <div 
              id="interview-status-display" 
              className="text-lg md:text-xl font-semibold min-h-[90px] p-4 bg-secondary/50 rounded-md border border-secondary flex items-center justify-center"
            >
              {isCallActive && currentQuestionText ? currentQuestionText : uiStatusText}
            </div>

            {/* Visual Feedback for Speaking/Listening */}
            <div className="flex items-center justify-center space-x-2 text-muted-foreground my-4">
              <span>{isListening ? <Mic size={20} className="text-blue-500 animate-pulse" /> : <MicOff size={20} />}</span>
              <span>{isAssistantSpeaking ? <Volume2 size={20} className="text-green-500 animate-pulse" /> : <VolumeX size={20} />}</span>
              <span className="text-sm">{uiStatusText}</span>
            </div>

            {/* Controls */}
            <Button 
              id="toggle-interview-button" 
              size="lg" 
              className="w-full md:w-auto px-8 py-6 text-lg"
              onClick={isCallActive ? endInterview : startInterview}
              disabled={isLoading || (sessionDetails?.status !== 'ready_to_start' && !isCallActive)}
            >
              {isLoading ? 'Connecting...' : isCallActive ? 'End Interview' : 'Start Interview'}
            </Button>
          </CardContent>
          <CardFooter className="text-center border-t pt-4">
            <p className="text-xs md:text-sm text-muted-foreground">
              Ensure your microphone is enabled and speak clearly when prompted.
            </p>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
} 