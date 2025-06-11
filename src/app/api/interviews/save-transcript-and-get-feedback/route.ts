import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getGoogleFeedback } from '@/lib/google-services';
import { Database } from '@/lib/supabase/types';

// Define feedback structure
interface FeedbackData {
  overall_summary: string;
  strengths_feedback: string;
  areas_for_improvement_feedback: string;
  actionable_suggestions: string;
  [key: string]: any; // Allow for additional properties
}

/**
 * POST /api/interviews/save-transcript-and-get-feedback
 * 
 * Called by the client after a Gemini Live session ends.
 * Receives the full conversation transcript, saves user answers,
 * and generates/returns feedback.
 */
export async function POST(request: NextRequest) {
  // Get current session
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json(
      { error: 'You must be logged in to access this endpoint' },
      { status: 401 }
    );
  }

  const userId = session.user.id;
  
  try {
    const body = await request.json();
    const { sessionId, conversationHistory } = body;

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
      return NextResponse.json(
        { error: 'Session not found or access denied' },
        { status: 404 }
      );
    }

    if (sessionData.user_id !== userId) {
      return NextResponse.json(
        { error: 'You do not have permission to access this session' },
        { status: 403 }
      );
    }

    // Extract and save user answers
    const userMessages = conversationHistory.filter(
      (message: { role: string }) => message.role === 'user'
    );

    for (const [index, message] of userMessages.entries()) {
      await supabase.from('interview_answers').insert({
        session_id: sessionId,
        answer_text: message.text,
        answer_index: index,
        user_id: userId,
      });
    }

    // Compile full transcript for feedback generation
    const fullTranscript = conversationHistory
      .map((message: { role: string; text: string }) => 
        `${message.role === 'user' ? 'Candidate' : 'Interviewer'}: ${message.text}`
      )
      .join('\n\n');

    // Generate feedback using Google Gemini
    console.log('Generating feedback with Google Gemini...');
    const feedback = await getGoogleFeedback(fullTranscript);

    // Save feedback
    const { data: savedFeedback, error: feedbackError } = await supabase
      .from('ai_feedback')
      .insert({
        session_id: sessionId,
        feedback: feedback,
        user_id: userId,
      })
      .select()
      .single();

    if (feedbackError) {
      console.error('Error saving feedback:', feedbackError);
      return NextResponse.json(
        { error: 'Failed to save feedback' },
        { status: 500 }
      );
    }

    return NextResponse.json(feedback);
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 