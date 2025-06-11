'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Database } from '@/lib/supabase/types';

// Define types for the interview session
interface InterviewSession {
  id: string;
  target_role: string;
  interview_type: string;
  status: string;
  key_skills_focused: string[];
  job_description_context: string | null;
  requested_num_questions: number;
  actual_num_questions: number | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  user_id: string;
  session_name: string;
}

export default function InterviewSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClientComponentClient<Database>();

  // Extract sessionId from params for forward compatibility
  const sessionId = use(params).sessionId;

  const [sessionDetails, setSessionDetails] = useState<InterviewSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCallActive, setIsCallActive] = useState(false);
  const [currentQuestionText, setCurrentQuestionText] = useState<string>('');
  const [uiStatusText, setUiStatusText] = useState<string>("Press 'Start Interview' to begin.");
  const [isListening, setIsListening] = useState(false);
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);

  // Fetch session details
  useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
        const { data: session, error } = await supabase
          .from('interview_sessions')
          .select('*')
          .eq('id', sessionId)
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
  }, [sessionId, supabase, toast, router]);

  // Start interview handler - placeholder for new OpenAI implementation
  const startInterview = useCallback(async () => {
    try {
      setIsLoading(true);
      setUiStatusText('Connecting to interview assistant...');

      // TODO: Replace with WebSocket connection to our OpenAI-based backend

      toast({
        title: 'Not Implemented',
        description: 'Real-time interview functionality is still being implemented with OpenAI.',
        variant: 'default',
      });

      setIsLoading(false);
    } catch (error) {
      console.error('Error starting interview:', error);
      setIsLoading(false);
      toast({
        title: 'Error',
        description: 'Failed to start the interview. Please try again.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // End interview handler - placeholder for new implementation
  const endInterview = useCallback(() => {
    setIsCallActive(false);
    setIsListening(false);
    setIsAssistantSpeaking(false);
    setUiStatusText('Interview ended.');

    toast({
      title: 'Interview Ended',
      description: 'You have ended the interview.',
    });

    // Redirect to dashboard
    router.push('/dashboard');
  }, [router, toast]);

  // Toggle microphone handler - placeholder for new implementation
  const toggleMicrophone = useCallback(() => {
    // TODO: Implement with new WebSocket-based audio streaming
    setIsListening(prev => !prev);
  }, []);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-[80vh]">
          <p>Loading interview session...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {sessionDetails?.session_name || 'Interview Session'}
          </h1>
          <p className="text-muted-foreground">
            Role: {sessionDetails?.target_role} | Type: {sessionDetails?.interview_type}
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Current Question</CardTitle>
            <CardDescription>
              Answer the question as if you were in a real interview
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-medium min-h-[80px]">
              {currentQuestionText || 'The question will appear here when the interview starts.'}
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center mb-8">
          <p className="bg-muted p-2 rounded w-full">Status: {uiStatusText}</p>
        </div>

        <div className="flex gap-4 justify-center">
          {!isCallActive ? (
            <Button onClick={startInterview} disabled={isLoading} size="lg" className="w-40">
              Start Interview
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="icon"
                className="w-16 h-16 rounded-full"
                onClick={toggleMicrophone}
              >
                {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </Button>
              <Button variant="destructive" onClick={endInterview} size="lg" className="w-40">
                End Interview
              </Button>
            </>
          )}
        </div>

        <div className="mt-8">
          <p className="text-sm text-muted-foreground text-center">
            {isAssistantSpeaking ? (
              <span className="flex items-center justify-center gap-2">
                <Volume2 className="h-4 w-4 animate-pulse" /> Assistant is speaking
              </span>
            ) : isListening ? (
              <span className="flex items-center justify-center gap-2">
                <Mic className="h-4 w-4 animate-pulse" /> Microphone active
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <VolumeX className="h-4 w-4" /> Audio inactive
              </span>
            )}
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
