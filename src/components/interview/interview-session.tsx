'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useInterview } from '@/lib/hooks/use-interview';
import { useToast } from '@/components/ui/use-toast';

interface InterviewSessionProps {
  jobTitle: string;
  jobDescription?: string;
  onComplete?: () => void;
}

export function InterviewSession({ jobTitle, jobDescription, onComplete }: InterviewSessionProps) {
  const { toast } = useToast();
  const [transcript, setTranscript] = useState<string[]>([]);

  const { isLoading, error, isActive, startInterview, endInterview, session } = useInterview({
    onInterviewStart: () => {
      toast({
        title: 'Interview Started',
        description: 'Your interview session has begun. Speak clearly into your microphone.',
      });
    },
    onInterviewEnd: () => {
      toast({
        title: 'Interview Completed',
        description: 'Your interview session has ended. You can now view your feedback.',
      });
      onComplete?.();
    },
    onQuestionReceived: question => {
      setTranscript(prev => [...prev, `Interviewer: ${question}`]);
    },
    onTranscriptUpdate: text => {
      setTranscript(prev => [...prev, `You: ${text}`]);
    },
  });

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  const handleStart = async () => {
    await startInterview(jobTitle, jobDescription);
  };

  const handleEnd = () => {
    endInterview();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Interview Session: {jobTitle}</CardTitle>
          <CardDescription>
            {isActive
              ? 'Your interview is in progress. Speak clearly and answer the questions.'
              : 'Click Start to begin your interview session.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isActive && (
              <div className="flex items-center justify-center">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                  <div className="absolute inset-2 bg-primary/50 rounded-full"></div>
                  <div className="absolute inset-4 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white">Live</span>
                  </div>
                </div>
              </div>
            )}

            <div className="border rounded-lg p-4 h-64 overflow-y-auto">
              {transcript.length > 0 ? (
                <div className="space-y-2">
                  {transcript.map((line, index) => (
                    <p key={index} className={line.startsWith('Interviewer') ? 'font-medium' : ''}>
                      {line}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  {isLoading ? 'Connecting...' : 'Transcript will appear here'}
                </div>
              )}
            </div>

            {(session?.questions?.length || 0) > 0 && (
              <div>
                <h3 className="font-medium mb-2">Questions Asked:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {session?.questions?.map(q => <li key={q.id}>{q.question}</li>)}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {!isActive ? (
            <Button onClick={handleStart} disabled={isLoading}>
              {isLoading ? 'Connecting...' : 'Start Interview'}
            </Button>
          ) : (
            <Button onClick={handleEnd} variant="destructive">
              End Interview
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
