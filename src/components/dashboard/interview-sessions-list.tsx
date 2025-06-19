'use client';

import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { InterviewSession } from '@/lib/services';
import { InterviewSetupForm } from '../interview/interview-setup-form';

export type InterviewSessionListProps = {
  interviews?: InterviewSession[];
  isLoading: boolean;
}

export function InterviewSessionsList({ isLoading, interviews }: InterviewSessionListProps) {
  if (isLoading) {
    return <SessionsLoadingSkeleton />;
  }

  if (!interviews || interviews.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-4">
          <h2 className="text-2xl font-semibold mb-2">Welcome to Interview Trainer</h2>
          <p className="text-muted-foreground mb-6">
            Get started by setting up your first interview practice session
          </p>
        </div>
        <InterviewSetupForm />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Recent Interview Sessions</h2>
        <Link href="/dashboard/new">
          <Button>New Interview</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {interviews.map(interview => (
          <Card key={interview.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-semibold truncate">
                  {interview.target_role}
                </CardTitle>
                <StatusIndicator status={interview.status} />
              </div>
              <p className="text-sm text-muted-foreground">
                {format(new Date(interview.created_at), 'MMM d, yyyy')}
              </p>
            </CardHeader>

            <CardContent className="pb-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p>{interview.interview_type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Questions</p>
                  <p>{interview.actual_num_questions}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Score</p>
                  <p>-</p>
                  {/* <p>
                    {typeof interview.overall_score === 'number'
                      ? `${interview.overall_score}/10`
                      : '—'}
                  </p> */}
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="capitalize">{interview.status.replace(/_/g, ' ')}</p>
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-2">
              <Link
                href={
                  interview.status === 'completed'
                    ? `/interviews/${interview.id}/feedback`
                    : `/interviews/${interview.id}`
                }
                className="w-full"
              >
                <Button variant="outline" className="w-full">
                  {interview.status === 'completed' ? 'View Feedback' : 'Continue Interview'}
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

function StatusIndicator({ status }: { status: string }) {
  let color = 'bg-gray-400';

  switch (status) {
    case 'completed':
      color = 'bg-green-500';
      break;
    case 'in_progress':
    case 'ready_to_start':
      color = 'bg-blue-500';
      break;
    case 'abandoned':
      color = 'bg-red-500';
      break;
  }

  return (
    <div className="flex items-center">
      <div className={`w-2 h-2 rounded-full ${color}`} />
    </div>
  );
}

function SessionsLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-10 w-[120px]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-[80%]" />
                <Skeleton className="h-4 w-[40%]" />
              </CardHeader>
              <CardContent className="pb-2">
                <div className="grid grid-cols-2 gap-2">
                  {Array(4)
                    .fill(0)
                    .map((_, j) => (
                      <div key={j}>
                        <Skeleton className="h-4 w-[60%] mb-1" />
                        <Skeleton className="h-4 w-[40%]" />
                      </div>
                    ))}
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
      </div>
    </div>
  );
}
