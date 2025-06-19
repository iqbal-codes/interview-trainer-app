'use client'; // Still good practice for components with heavy client-side interactivity

import { use } from 'react';
import { interviewService } from '@/lib/services';
import { useObservableSyncedQuery } from '@legendapp/state/sync-plugins/tanstack-react-query';


// Import your UI components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, FileText, MessageSquare, Calendar, Clock, Play } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Memo } from "@legendapp/state/react"

// Helper functions
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusBadge = (status: string) => {
  const statusConfig = {
    'pending': { label: 'Pending', variant: 'secondary' as const },
    'in_progress': { label: 'In Progress', variant: 'default' as const },
    'completed': { label: 'Completed', variant: 'default' as const },
    'cancelled': { label: 'Cancelled', variant: 'destructive' as const }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'secondary' as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

const handleStartLiveSession = (sessionId: string) => {
  // Implement the live interview start functionality
  console.log('Starting live session for interview:', sessionId);

  // TODO: Navigate to the live interview interface
  // This would typically involve:
  // 1. Updating the session status to 'in_progress'
  // 2. Redirecting to a real-time interview page with WebSocket connection
  // 3. Setting up the AI voice interaction pipeline

  // For now, just log the action
  window.location.href = `/interviews/${sessionId}/live`;
};

// --- The React Component ---
const InterviewPage = ({ params }: { params: Promise<{ sessionId: string }> }) => {
  const sessionId = use(params).sessionId;

  // react query
  const sessionDetails$ = useObservableSyncedQuery({
    query: {
      queryKey: ['sessionDetails', sessionId],
      queryFn: () => interviewService.getInterview(sessionId),
    }
  });

  // Fetch feedback data
  const feedbackData$ = useObservableSyncedQuery({
    query: {
      queryKey: ['feedbackData', sessionId],
      queryFn: () => interviewService.getFeedback(sessionId),
      enabled: !!sessionId,
    }
  });

  return (
    <div>
      <div className="container py-6">
        {/* Header */}
        <div className="flex items-center justify-between">

          {/* Session Overview Card */}
          <Memo>
            {() => {
              const session = sessionDetails$.get();
              if (!session) {
                return <div className="text-muted-foreground">Loading session details...</div>;
              }

              return (
                <>
                  <h1 className="text-3xl font-bold">
                    {session.session_name || 'Practice Interview'}
                  </h1>
                  <div className="flex items-center gap-2">
                    {sessionDetails$.get()?.status && getStatusBadge(sessionDetails$.get()!.status)}
                  </div>
                </>
              );
            }}
          </Memo>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="questions">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="questions">Interview Questions</TabsTrigger>
          <TabsTrigger value="mock">Mock Interview</TabsTrigger>
        </TabsList>

        {/* Questions Tab */}
        <TabsContent value="questions" className="space-y-6 mt-4">
          <Memo>
            {() => {
              const session = sessionDetails$.get();
              if (!session) {
                return (
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center text-muted-foreground">
                        Loading session details...
                      </div>
                    </CardContent>
                  </Card>
                );
              }

              return (
                <div className="grid gap-6">
                  {/* Questions */}
                  {session.questions && session.questions.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MessageSquare className="w-5 h-5" />
                          Interview Questions ({session.questions.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {session.questions.map((question) => (
                            <div key={question.id} className="border-l-4 border-blue-500 pl-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="font-medium text-sm text-muted-foreground mb-1">
                                    Question {question.question_order}
                                  </p>
                                  <p className="text-base">{question.question_text}</p>
                                  {question.question_type_tag && (
                                    <Badge variant="outline" className="mt-2">
                                      {question.question_type_tag}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              );
            }}
          </Memo>
        </TabsContent>

        {/* Mock Interview Tab */}
        <TabsContent value="mock" className="space-y-6">
          <Memo>
            {() => {
              const feedback = feedbackData$.get();
              const session = sessionDetails$.get();

              if (!feedback) {
                return (
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center space-y-4">
                        <div className="text-muted-foreground">
                          No feedback available yet. Start a live interview session to generate feedback.
                        </div>
                        <Button
                          onClick={() => session && handleStartLiveSession(session.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          disabled={!session || !session.questions || session.questions.length === 0}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Start Live Interview
                        </Button>
                        {(!session || !session.questions || session.questions.length === 0) && (
                          <p className="text-sm text-muted-foreground">
                            No questions available for this session
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              }

              return (
                <div className="space-y-6">
                  {/* Overall Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Overall Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        <p className="whitespace-pre-wrap">{feedback.overall_summary}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Strengths */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg text-green-600">Strengths</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        <p className="whitespace-pre-wrap">{feedback.strengths_feedback}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Areas for Improvement */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg text-orange-600">Areas for Improvement</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        <p className="whitespace-pre-wrap">{feedback.areas_for_improvement_feedback}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Actionable Suggestions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg text-blue-600">Actionable Suggestions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        <p className="whitespace-pre-wrap">{feedback.actionable_suggestions}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            }}
          </Memo>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InterviewPage;

