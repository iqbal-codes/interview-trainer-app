'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useInterviewStore } from '@/lib/store/interview-store';

export default function InterviewResultsPage() {
  const router = useRouter();
  const { session } = useInterviewStore();
  
  useEffect(() => {
    // If there's no session, redirect to the new interview page
    if (!session) {
      router.push('/interview/new');
    }
  }, [session, router]);

  if (!session) {
    return null;
  }

  return (
    <MainLayout>
      <div className="container py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Interview Results</h1>
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Interview Summary</CardTitle>
              <CardDescription>
                Job Title: {session.jobTitle}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-lg">
                  You completed an interview with {session.questions.length} questions.
                </p>
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="italic">
                    &quot;Overall, you performed well in the interview. You demonstrated good communication skills and provided relevant examples. Areas for improvement include being more specific with your achievements and preparing more concise responses.&quot;
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => router.push('/interview/new')}>
                Start a New Interview
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Questions & Feedback</CardTitle>
              <CardDescription>
                Review your answers and feedback for each question
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {session.questions.map((question, index) => (
                  <div key={question.id} className="border rounded-lg p-4">
                    <h3 className="font-bold text-lg mb-2">Question {index + 1}</h3>
                    <p className="mb-4">{question.question}</p>
                    
                    {question.answer && (
                      <div className="mb-4">
                        <h4 className="font-medium text-sm text-muted-foreground mb-1">Your Answer:</h4>
                        <p className="pl-4 border-l-2 border-muted">{question.answer}</p>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-1">Feedback:</h4>
                      <p className="pl-4 border-l-2 border-primary">
                        {question.feedback || "Your answer was clear and concise. Consider adding specific examples to strengthen your response."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
} 