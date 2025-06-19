import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Database, Json } from '@/types';
import { getGoogleFeedback, type FeedbackResponse } from '@/lib/services/googleService';
import { withTransaction } from '@/lib/utils/supabaseTransaction';

/**
 * POST /api/ai/interviews/feedback
 *
 * Called by the client after a Gemini Live session ends.
 * Receives the full conversation transcript, saves user answers,
 * and generates/returns feedback.
 */
export async function POST(request: NextRequest) {
  // Get current session
  const supabase = createRouteHandlerClient<Database>({ cookies });

  // Check authentication
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json(
      { error: 'You must be logged in to access this endpoint' },
      { status: 401 }
    );
  }

  const userId = session.user.id;

  // Parse request body
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
  }

  const { sessionId, conversationHistory } = body;

  // Validate required fields
  if (!sessionId || !conversationHistory || !Array.isArray(conversationHistory)) {
    return NextResponse.json(
      { error: 'Missing required fields: sessionId or conversationHistory' },
      { status: 400 }
    );
  }

  // Verify the session belongs to the current user
  const { data: sessionData, error: sessionError } = await supabase
    .from('interview_sessions')
    .select('user_id')
    .eq('id', sessionId)
    .single();

  if (sessionError || !sessionData) {
    return NextResponse.json({ error: 'Session not found or access denied' }, { status: 404 });
  }

  if (sessionData.user_id !== userId) {
    return NextResponse.json(
      { error: 'You do not have permission to access this session' },
      { status: 403 }
    );
  }

  // Use our transaction manager to handle rollbacks
  try {
    return await withTransaction(supabase, async txManager => {
      // Get the questions for this session
      const { data: questions, error: questionsError } = await supabase
        .from('interview_questions')
        .select('id, question_order')
        .eq('session_id', sessionId)
        .order('question_order', { ascending: true });

      if (questionsError || !questions || questions.length === 0) {
        throw new Error('Failed to retrieve questions for this session');
      }

      // Extract and save user answers
      const userMessages = conversationHistory.filter(
        (message: { role: string }) => message.role === 'user'
      );

      const insertedAnswerIds = [];
      for (const [index, message] of userMessages.entries()) {
        // Match user answer to question by index (simple mapping)
        // In a real app, you might need more sophisticated matching
        const questionId = index < questions.length ? questions[index].id : questions[0].id;

        const { data: answerData, error: answerError } = await supabase
          .from('interview_answers')
          .insert({
            session_id: sessionId,
            question_id: questionId,
            answer_transcript_text: message.text,
            user_id: userId,
            status: 'completed',
          })
          .select('id')
          .single();

        if (answerError) {
          throw new Error(`Failed to save answer: ${answerError.message}`);
        }

        if (answerData) {
          insertedAnswerIds.push(answerData.id);
          txManager.trackInsert('interview_answers', answerData.id);
        }
      }

      // Compile full transcript for feedback generation
      const fullTranscript = conversationHistory
        .map(
          (message: { role: string; text: string }) =>
            `${message.role === 'user' ? 'Candidate' : 'Interviewer'}: ${message.text}`
        )
        .join('\n\n');

      // Generate feedback using Google Gemini
      console.log('Generating feedback with Google Gemini...');
      const feedback: FeedbackResponse = await getGoogleFeedback(fullTranscript);

      // Save feedback
      const { data: feedbackData, error: feedbackInsertError } = await supabase
        .from('ai_feedback')
        .insert({
          session_id: sessionId,
          user_id: userId,
          overall_summary: feedback.overall_summary,
          strengths_feedback: feedback.strengths_feedback,
          areas_for_improvement_feedback: feedback.areas_for_improvement_feedback,
          actionable_suggestions: feedback.actionable_suggestions,
          feedback_json: feedback as unknown as Json,
        })
        .select('id')
        .single();

      if (feedbackInsertError) {
        throw new Error(`Failed to save feedback: ${feedbackInsertError.message}`);
      }

      if (feedbackData) {
        txManager.trackInsert('ai_feedback', feedbackData.id);
      }

      // Update the session status to completed
      await supabase
        .from('interview_sessions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', sessionId);

      return NextResponse.json(feedback);
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      {
        error: `Failed to process request: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      { status: 500 }
    );
  }
}

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
