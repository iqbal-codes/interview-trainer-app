'use client';

import { useState, useEffect, useRef, useCallback, use } from 'react';
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
import { Loader2, Mic, MicOff, Play, CheckCircle2, XCircle } from 'lucide-react';
import { Database } from '@/lib/supabase/types';

interface Question {
  id: string;
  question_text: string;
  question_order: number;
}

interface InterviewSession {
  id: string;
  target_role: string;
  interview_type: string;
  session_name: string;
}

interface Feedback {
  overall_summary: string;
  strengths_feedback: string;
  areas_for_improvement_feedback: string;
  actionable_suggestions: string;
}

export default function TestFeedbackPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const sessionId = use(params).sessionId;
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClientComponentClient<Database>();

  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Feedback state
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Check authentication and fetch session data
  useEffect(() => {
    async function checkAuthAndFetchData() {
      try {
        // Check if user is authenticated
        const {
          data: { session: authSession },
        } = await supabase.auth.getSession();
        if (!authSession) {
          toast({
            title: 'Authentication Required',
            description: 'Please sign in to access this page.',
            variant: 'destructive',
          });
          router.push('/auth/signin');
          return;
        }

        // Fetch the session details
        const { data: sessionData, error: sessionError } = await supabase
          .from('interview_sessions')
          .select('*')
          .eq('id', sessionId)
          .single();

        if (sessionError || !sessionData) {
          toast({
            title: 'Session Not Found',
            description: 'The interview session could not be found.',
            variant: 'destructive',
          });
          router.push('/dashboard');
          return;
        }

        // Verify the session belongs to the user
        if (sessionData.user_id !== authSession.user.id) {
          toast({
            title: 'Access Denied',
            description: 'You do not have permission to access this session.',
            variant: 'destructive',
          });
          router.push('/dashboard');
          return;
        }

        setSession(sessionData as InterviewSession);

        // Fetch questions for this session
        const { data: questionsData, error: questionsError } = await supabase
          .from('interview_questions')
          .select('*')
          .eq('session_id', sessionId)
          .order('question_order', { ascending: true });

        if (questionsError) {
          console.error('Error fetching questions:', questionsError);
          toast({
            title: 'Error',
            description: 'Failed to load interview questions.',
            variant: 'destructive',
          });
          return;
        }

        if (questionsData && questionsData.length > 0) {
          setQuestions(questionsData as Question[]);
          // Set the first question as the current question for this test page
          setCurrentQuestion(questionsData[0] as Question);
        } else {
          toast({
            title: 'No Questions Found',
            description: 'This interview session has no questions.',
            variant: 'destructive',
          });
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error in setup:', error);
        toast({
          title: 'Error',
          description: 'An unexpected error occurred while loading the page.',
          variant: 'destructive',
        });
      }
    }

    checkAuthAndFetchData();
  }, [sessionId, router, supabase, toast]);

  // Handle recording start/stop
  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
      return;
    }

    // Start recording
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Reset previous recording data
      audioChunksRef.current = [];
      setRecordingBlob(null);
      setAudioUrl(null);
      setFeedback(null);
      setFeedbackError(null);

      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Create blob from recorded chunks
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);

        setRecordingBlob(audioBlob);
        setAudioUrl(url);

        // Stop all tracks in the stream to release the microphone
        stream.getTracks().forEach(track => track.stop());
      };

      // Start recording
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);

      toast({
        title: 'Recording Started',
        description: 'Speak clearly into your microphone to answer the question.',
      });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: 'Microphone Access Error',
        description: 'Could not access your microphone. Please check your browser permissions.',
        variant: 'destructive',
      });
    }
  }, [isRecording, toast]);

  // Handle feedback generation
  const generateFeedback = useCallback(async () => {
    if (!recordingBlob || !currentQuestion) return;

    setIsFeedbackLoading(true);
    setFeedbackError(null);

    try {
      // Create form data with the recording and metadata
      const formData = new FormData();

      // Make sure to use a proper mime type for the audio blob
      // Use a smaller audio segment for testing if needed
      const audioFile = new File(
        [recordingBlob.slice(0, Math.min(recordingBlob.size, 500000))], // Limit size for testing
        'answer.webm',
        { type: recordingBlob.type || 'audio/webm' }
      );

      formData.append('audioBlob', audioFile);
      formData.append('questionId', currentQuestion.id);
      formData.append('sessionId', sessionId);

      console.log('Audio file details:', {
        name: audioFile.name,
        type: audioFile.type,
        size: audioFile.size,
      });

      // Try the API call with our modified endpoint
      console.log('Sending feedback request...');
      const response = await fetch('/api/interviews/get-answer-feedback', {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', {
        contentType: response.headers.get('content-type'),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to generate feedback';
        const contentType = response.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } else {
          // If the response is not JSON, get the text
          const errorText = await response.text();
          console.error('Non-JSON error response:', errorText);
          errorMessage = 'Received HTML error page instead of JSON. Check server logs.';
        }
        throw new Error(errorMessage);
      }

      // Parse the JSON response
      const data = await response.json();
      setFeedback(data.feedback);

      toast({
        title: 'Feedback Generated',
        description: 'Your answer has been analyzed successfully.',
      });
    } catch (error) {
      console.error('Error generating feedback:', error);
      setFeedbackError(error instanceof Error ? error.message : 'Failed to generate feedback');
      toast({
        title: 'Feedback Error',
        description: 'Failed to analyze your answer. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsFeedbackLoading(false);
    }
  }, [recordingBlob, currentQuestion, sessionId, toast]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-[80vh]">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <p>Loading question...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container max-w-4xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-2">Test Feedback Loop</h1>
        <p className="text-muted-foreground mb-6">
          {session?.session_name || 'Interview Practice'} - Single Question Test
        </p>

        {/* Question Card */}
        {currentQuestion && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Interview Question</CardTitle>
              <CardDescription>
                Answer this question as if you were in a real interview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-medium">{currentQuestion.question_text}</p>
            </CardContent>
          </Card>
        )}

        {/* Recording Controls */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Record Your Answer</h2>
          <div className="space-y-4">
            <Button
              onClick={toggleRecording}
              variant={isRecording ? 'destructive' : 'default'}
              size="lg"
              className="w-full md:w-auto"
            >
              {isRecording ? (
                <>
                  <MicOff className="mr-2 h-5 w-5" /> Stop Recording
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-5 w-5" /> Record Answer
                </>
              )}
            </Button>

            {/* Recording status */}
            {isRecording && (
              <div className="flex items-center mt-2 text-red-500">
                <span className="animate-pulse mr-2">●</span> Recording in progress...
              </div>
            )}

            {/* Audio playback */}
            {audioUrl && (
              <div className="bg-muted p-4 rounded-md">
                <p className="mb-2 font-medium">Review your answer:</p>
                <audio controls src={audioUrl} className="w-full" />
              </div>
            )}
          </div>
        </div>

        {/* Generate Feedback Button */}
        <div className="mb-8">
          <Button
            onClick={generateFeedback}
            disabled={!recordingBlob || isFeedbackLoading}
            variant="secondary"
            size="lg"
            className="w-full md:w-auto"
          >
            {isFeedbackLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing...
              </>
            ) : (
              <>
                <Play className="mr-2 h-5 w-5" /> Get Feedback
              </>
            )}
          </Button>
        </div>

        {/* Feedback Display */}
        {feedback && (
          <Card className="mb-8 border-green-200 bg-green-50 dark:bg-green-900/10">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle2 className="mr-2 h-5 w-5 text-green-600" />
                AI Feedback on Your Answer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Overall Summary</h3>
                <p>{feedback.overall_summary}</p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Strengths</h3>
                <p>{feedback.strengths_feedback}</p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Areas for Improvement</h3>
                <p>{feedback.areas_for_improvement_feedback}</p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Actionable Suggestions</h3>
                <p>{feedback.actionable_suggestions}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {feedbackError && (
          <Card className="mb-8 border-red-200 bg-red-50 dark:bg-red-900/10">
            <CardHeader>
              <CardTitle className="flex items-center">
                <XCircle className="mr-2 h-5 w-5 text-red-600" />
                Error Generating Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{feedbackError}</p>
              <p className="mt-2">
                Please try recording your answer again or contact support if the problem persists.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Back to Dashboard Button */}
        <div className="text-center mt-12">
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
