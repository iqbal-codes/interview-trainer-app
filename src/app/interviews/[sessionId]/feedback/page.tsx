'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { use } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react';

type Feedback = {
  overall_summary: string;
  strengths_feedback: string;
  areas_for_improvement_feedback: string;
  actionable_suggestions: string;
  overall_score_qualitative: string;
  generated_at: string;
};

export default function FeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Type-safe way to access params that works with both old and new Next.js versions
  const sessionId =
    params && typeof params === 'object' && 'sessionId' in params
      ? (params.sessionId as string)
      : '';

  useEffect(() => {
    async function fetchFeedback() {
      try {
        setLoading(true);
        const response = await fetch(`/api/interviews/${sessionId}/feedback`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch feedback');
        }

        const data = await response.json();
        setFeedback(data.feedback);
      } catch (err) {
        setError((err as Error).message);
        console.error('Error fetching feedback:', err);
      } finally {
        setLoading(false);
      }
    }

    if (sessionId) {
      fetchFeedback();
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading feedback...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="mb-6">
          <Button variant="outline" asChild>
            <Link href="/dashboard">← Back to History</Link>
          </Button>
        </div>
        <div className="bg-destructive/10 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p>{error}</p>
          <Button className="mt-4" onClick={() => router.refresh()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="mb-6">
          <Button variant="outline" asChild>
            <Link href="/dashboard">← Back to History</Link>
          </Button>
        </div>
        <div className="bg-muted p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">No Feedback Available</h2>
          <p>Feedback for this interview session is not available yet.</p>
          <Button className="mt-4" asChild>
            <Link href={`/api/interviews/${sessionId}/feedback`} prefetch={false}>
              Generate Feedback
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/dashboard">← Back to History</Link>
        </Button>
        <h1 className="text-3xl font-bold mt-4">Interview Feedback Report</h1>
        <p className="text-muted-foreground">
          For your session on{' '}
          {feedback.generated_at
            ? format(new Date(feedback.generated_at), 'PPP')
            : 'recent interview'}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Overall Summary Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Overall Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{feedback.overall_summary}</p>
          </CardContent>
        </Card>

        {/* Strengths Card */}
        <Card className="border-green-500">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle2 className="mr-2 text-green-500" /> Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{feedback.strengths_feedback}</p>
          </CardContent>
        </Card>

        {/* Areas for Improvement Card */}
        <Card className="border-orange-500">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 text-orange-500" /> Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{feedback.areas_for_improvement_feedback}</p>
          </CardContent>
        </Card>

        {/* Actionable Suggestions Card */}
        <Card className="md:col-span-2 bg-secondary">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="mr-2 text-yellow-500" /> Actionable Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{feedback.actionable_suggestions}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
