import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/supabase/types';

/**
 * GET /api/interviews/[sessionId]
 *
 * Fetches details about a specific interview session, including questions.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  // Initialize Supabase client
  const supabase = createRouteHandlerClient<Database>({ cookies });

  // Check authentication
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const { sessionId } = await params;

  try {
    // Fetch interview session details
    const { data: interviewSession, error: sessionError } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single();

    if (sessionError || !interviewSession) {
      return NextResponse.json(
        { error: 'Interview session not found or access denied' },
        { status: 404 }
      );
    }

    // Fetch questions for this session
    const { data: questions, error: questionsError } = await supabase
      .from('interview_questions')
      .select('id, question_text, question_order')
      .eq('session_id', sessionId)
      .order('question_order', { ascending: true });

    if (questionsError) {
      console.error('Error fetching questions:', questionsError);
      return NextResponse.json({ error: 'Failed to fetch interview questions' }, { status: 500 });
    }

    // Return combined session data
    return NextResponse.json({
      ...interviewSession,
      questions: questions || [],
    });
  } catch (error) {
    console.error('Error in /api/interviews/[sessionId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
