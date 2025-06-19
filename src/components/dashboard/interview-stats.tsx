'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { InterviewSession } from '@/lib/services';

interface InterviewStats {
  total: number;
  completed: number;
  inProgress: number;
  averageScore: number | null;
}

type InterviewStatsProps = {
  interviews?: InterviewSession[];
  isLoading: boolean;
}

export function InterviewStats({ interviews, isLoading }: InterviewStatsProps) {
  const stats = useMemo(() => {
    if (!interviews) return null;

    const total = interviews?.length || 0;
    const completed = interviews?.filter(interview => interview.status === 'completed').length || 0;
    const inProgress =
      interviews?.filter(
        interview => interview.status === 'active' || interview.status === 'pending'
      ).length || 0;

    // Calculate average score if any interviews have scores
    const averageScore = null;
    // const interviewsWithScores = interviews?.filter(interview => interview.overall_score !== null);

    // if (interviewsWithScores && interviewsWithScores.length > 0) {
    //   const totalScore = interviewsWithScores.reduce(
    //     (sum, interview) => sum + (interview.overall_score || 0),
    //     0
    //   );
    //   averageScore = Math.round((totalScore / interviewsWithScores.length) * 10) / 10;
    // }

    return {
      total,
      completed,
      inProgress,
      averageScore,
    };
  }, [interviews]);

  if (isLoading) {
    return <StatsLoadingSkeleton />;
  }

  if (!stats || stats.total === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Completed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completed}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">In Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.inProgress}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Average Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.averageScore !== null ? `${stats.averageScore}/10` : 'N/A'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatsLoadingSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      {Array(4)
        .fill(0)
        .map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-[100px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[60px]" />
            </CardContent>
          </Card>
        ))}
    </div>
  );
}
