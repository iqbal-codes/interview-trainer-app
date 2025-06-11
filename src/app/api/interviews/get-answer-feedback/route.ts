import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/supabase/types';
import { transcribeAudio, getLLMFeedback } from '@/lib/openai-services';

// NOTE: In App Router, we don't use the config export like in Pages Router
// For debugging file uploads, we need to implement proper error handling

export async function POST(request: NextRequest) {
  console.log('Handling POST request to get-answer-feedback');
  console.log('Content-Type:', request.headers.get('content-type'));

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
    let formData;
    let audioBlob;
    let questionId;
    let sessionId;

    try {
      formData = await request.formData();
      console.log('FormData parsed successfully');

      // Extract form fields
      audioBlob = formData.get('audioBlob') as Blob | null;
      questionId = formData.get('questionId') as string;
      sessionId = formData.get('sessionId') as string;

      // Log what we received for debugging
      console.log('Received form data:', {
        hasAudioBlob: !!audioBlob,
        audioBlobType: audioBlob ? audioBlob.type : 'none',
        audioBlobSize: audioBlob ? audioBlob.size : 0,
        questionId,
        sessionId,
      });
    } catch (formError) {
      console.error('Error parsing FormData:', formError);

      // Try to read the raw body for debugging
      try {
        const bodyText = await request.text();
        console.log('Request body (first 200 chars):', bodyText.substring(0, 200));
      } catch (bodyError) {
        console.error('Error reading request body:', bodyError);
      }

      return NextResponse.json(
        { error: `Failed to parse form data: ${(formError as Error).message}` },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!audioBlob || !questionId || !sessionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify the session belongs to the user
    const { data: sessionData, error: sessionError } = await supabase
      .from('interview_sessions')
      .select('user_id')
      .eq('id', sessionId)
      .single();

    if (sessionError || !sessionData) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (sessionData.user_id !== userId) {
      return NextResponse.json(
        { error: 'You do not have permission to access this session' },
        { status: 403 }
      );
    }

    // Convert Blob to Buffer
    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      console.log('Successfully converted audio blob to buffer, size:', buffer.length);

      // For testing, let's skip the audio processing and use a mock transcript
      console.log('TEMPORARY: Using mock transcript for testing');
      const transcript =
        "This is a mock transcript for testing purposes. We're bypassing the audio transcription for now to isolate the API issues.";

      // Step 2: Save transcript to the database
      console.log('Saving transcript to database...');
      const { error: transcriptError } = await supabase.from('interview_answers').insert({
        question_id: questionId,
        session_id: sessionId,
        user_id: userId,
        answer_transcript_text: transcript,
        audio_url: null, // We're not storing the audio file in this implementation
        status: 'completed',
      });

      if (transcriptError) {
        console.error('Error saving transcript:', transcriptError);
        return NextResponse.json(
          { error: `Failed to save transcript: ${transcriptError.message}` },
          { status: 500 }
        );
      }
      console.log('Transcript saved successfully');

      // Step 3: Generate mock feedback for testing
      console.log('TEMPORARY: Using mock feedback for testing');
      const feedbackObject = {
        overall_summary: 'This is a mock feedback response for testing purposes.',
        strengths_feedback: 'You articulated your points clearly and concisely.',
        areas_for_improvement_feedback:
          'You could provide more specific examples to support your claims.',
        actionable_suggestions:
          '1. Practice using the STAR method for behavioral questions.\n2. Prepare 3-5 strong examples from your past experience.',
      };
      console.log('LLM feedback generated');

      // Step 4: Save the feedback to the database
      console.log('Saving feedback to database...');
      const { error: feedbackError } = await supabase.from('ai_feedback').insert({
        session_id: sessionId,
        question_id: questionId,
        user_id: userId,
        feedback_json: feedbackObject,
        feedback_type: 'answer_feedback',
      });

      if (feedbackError) {
        console.error('Error saving feedback:', feedbackError);
        return NextResponse.json(
          { error: `Failed to save feedback: ${feedbackError.message}` },
          { status: 500 }
        );
      }
      console.log('Feedback saved successfully');

      // Return the feedback to the client
      return NextResponse.json({
        message: 'Feedback generated successfully.',
        feedback: feedbackObject,
      });
    } catch (processingError) {
      console.error('Error processing answer:', processingError);
      return NextResponse.json(
        { error: `Failed to process answer: ${(processingError as Error).message}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in get-answer-feedback:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
