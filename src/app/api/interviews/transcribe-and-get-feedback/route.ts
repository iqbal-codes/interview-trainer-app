import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/supabase/types';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

// Import Google services
import { transcribeGoogleAudio, getGoogleFeedback } from '@/lib/google-services';

// Interface for conversation turns
interface ConversationTurn {
  role: 'user' | 'model';
  text: string;
}

/**
 * POST /api/interviews/transcribe-and-get-feedback
 *
 * Receives audio recordings from a Gemini Live interview session,
 * transcribes them using Google Cloud Speech-to-Text,
 * and generates feedback.
 */
export async function POST(request: NextRequest) {
  // Get current session
  const supabase = createRouteHandlerClient<Database>({ cookies });
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

  try {
    // Parse form data with audio files
    const formData = await request.formData();
    const sessionId = formData.get('sessionId') as string;
    const userAudio = formData.get('userAudio') as Blob;
    const aiAudio = formData.get('aiAudio') as Blob;

    if (!sessionId || !userAudio || !aiAudio) {
      return NextResponse.json(
        { error: 'Missing required data: sessionId, userAudio, or aiAudio' },
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

    // Create temp files for the audio blobs
    const userAudioBuffer = Buffer.from(await userAudio.arrayBuffer());
    const aiAudioBuffer = Buffer.from(await aiAudio.arrayBuffer());

    const userAudioPath = path.join(os.tmpdir(), `user-audio-${Date.now()}.wav`);
    const aiAudioPath = path.join(os.tmpdir(), `ai-audio-${Date.now()}.wav`);

    fs.writeFileSync(userAudioPath, userAudioBuffer);
    fs.writeFileSync(aiAudioPath, aiAudioBuffer);

    // Transcribe user audio using Google services
    console.log('Transcribing user audio...');
    const userTranscript = await transcribeGoogleAudio(userAudioPath);

    // Transcribe AI audio using Google services
    console.log('Transcribing AI audio...');
    const aiTranscript = await transcribeGoogleAudio(aiAudioPath);

    // Clean up temp files
    try {
      fs.unlinkSync(userAudioPath);
      fs.unlinkSync(aiAudioPath);
    } catch (cleanupError) {
      console.error('Error cleaning up temp files:', cleanupError);
    }

    // Create a conversation history from the transcripts
    const conversationHistory: ConversationTurn[] = [];

    // Add AI introduction (usually the first to speak)
    conversationHistory.push({
      role: 'model',
      text: aiTranscript,
    });

    // Add user response
    conversationHistory.push({
      role: 'user',
      text: userTranscript,
    });

    // Save user answers to the database
    const { error: answerError } = await supabase.from('interview_answers').insert({
      session_id: sessionId,
      answer_text: userTranscript,
      answer_index: 0,
      user_id: userId,
    });

    if (answerError) {
      console.error('Error saving answer:', answerError);
    }

    // Compile full transcript for feedback generation
    const fullTranscript = conversationHistory
      .map(message => `${message.role === 'user' ? 'Candidate' : 'Interviewer'}: ${message.text}`)
      .join('\n\n');

    // Generate feedback using Google Gemini
    console.log('Generating feedback using Google Gemini...');
    const feedback = await getGoogleFeedback(fullTranscript);

    // Save feedback
    const { error: feedbackError } = await supabase
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
      return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 });
    }

    // Update session status to completed
    await supabase.from('interview_sessions').update({ status: 'completed' }).eq('id', sessionId);

    return NextResponse.json(feedback);
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
