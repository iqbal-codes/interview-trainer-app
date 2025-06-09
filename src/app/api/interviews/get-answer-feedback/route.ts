import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/supabase/types';
import { transcribeAudio, getLLMFeedback } from '@/lib/openai-services';

export async function POST(request: NextRequest) {
  try {
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

    // Parse the multipart form data
    const formData = await request.formData();
    const audioBlob = formData.get('audioBlob') as Blob | null;
    const questionId = formData.get('questionId') as string;
    const sessionId = formData.get('sessionId') as string;

    // Validate required fields
    if (!audioBlob || !questionId || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify the session belongs to the user
    const { data: sessionData, error: sessionError } = await supabase
      .from('interview_sessions')
      .select('user_id')
      .eq('id', sessionId)
      .single();

    if (sessionError || !sessionData) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    if (sessionData.user_id !== userId) {
      return NextResponse.json(
        { error: 'You do not have permission to access this session' },
        { status: 403 }
      );
    }

    // Convert Blob to Buffer
    const arrayBuffer = await audioBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    try {
      // Step 1: Transcribe the audio
      const transcript = await transcribeAudio(buffer);

      // Step 2: Save transcript to the database
      const { error: transcriptError } = await supabase
        .from('interview_answers')
        .insert({
          question_id: questionId,
          session_id: sessionId,
          answer_text: transcript,
          audio_url: null, // We're not storing the audio file in this implementation
          status: 'completed',
        });

      if (transcriptError) {
        console.error('Error saving transcript:', transcriptError);
        return NextResponse.json(
          { error: 'Failed to save transcript' },
          { status: 500 }
        );
      }

      // Step 3: Generate feedback for the answer
      const feedbackObject = await getLLMFeedback(transcript);

      // Step 4: Save the feedback to the database
      const { error: feedbackError } = await supabase
        .from('ai_feedback')
        .insert({
          session_id: sessionId,
          question_id: questionId,
          feedback_json: feedbackObject,
          feedback_type: 'answer_feedback',
        });

      if (feedbackError) {
        console.error('Error saving feedback:', feedbackError);
        return NextResponse.json(
          { error: 'Failed to save feedback' },
          { status: 500 }
        );
      }

      // Return the feedback to the client
      return NextResponse.json({
        message: 'Feedback generated successfully.',
        feedback: feedbackObject,
      });
    } catch (processingError) {
      console.error('Error processing answer:', processingError);
      return NextResponse.json(
        { error: 'Failed to process answer' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in get-answer-feedback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 