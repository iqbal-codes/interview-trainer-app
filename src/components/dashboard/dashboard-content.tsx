'use client';

import { InterviewStats } from './interview-stats';
import { InterviewSessionsList } from './interview-sessions-list';
import { useQuery } from '@tanstack/react-query';
import { interviewService } from '@/lib/services';

export function DashboardContent() {
  const interviewListQuery = useQuery({
    queryKey: ['interviewList'],
    queryFn: () => interviewService.getInterviews()
  });

  // If the user has interviews, show the stats and list
  return (
    <div className="space-y-8">
      <InterviewStats interviews={interviewListQuery.data} isLoading={interviewListQuery.isLoading} />
      <InterviewSessionsList interviews={interviewListQuery.data} isLoading={interviewListQuery.isLoading} />
    </div>
  );
}
