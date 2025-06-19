import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/types';

/**
 * GET /api/ai/interviews/feedback?sessionId={sessionId}
 *
 * Retrieves existing feedback for an interview session
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Initialize Supabase client
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Please log in' }, { status: 401 });
    }

    const userId = session.user.id;

    // Verify the session belongs to the user
    const { data: interviewSession, error: sessionError } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single();

    if (sessionError || !interviewSession) {
      return NextResponse.json(
        {
          error: 'Interview session not found or access denied',
        },
        { status: 404 }
      );
    }

    // Fetch feedback
    const { data: feedback, error: feedbackError } = await supabase
      .from('ai_feedback')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (feedbackError || !feedback) {
      return NextResponse.json(
        {
          error: 'Feedback not found for this session',
        },
        { status: 404 }
      );
    }

    // Return feedback
    return NextResponse.json({
      message: 'Feedback retrieved successfully',
      session_id: sessionId,
      feedback: {
        overall_summary: feedback.overall_summary,
        strengths_feedback: feedback.strengths_feedback,
        areas_for_improvement_feedback: feedback.areas_for_improvement_feedback,
        actionable_suggestions: feedback.actionable_suggestions,
        overall_score_qualitative: feedback.overall_score_qualitative,
        generated_at: feedback.feedback_generated_at,
      },
    });
  } catch (error) {
    console.error('Feedback retrieval error:', error);
    return NextResponse.json(
      {
        error: `An unexpected error occurred: ${(error as Error).message}`,
      },
      { status: 500 }
    );
  }
}
