import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/supabase/types';

// Define types for Vapi request structure
interface VapiTranscript {
  role: 'user' | 'assistant';
  transcript: string;
  timestamp: string;
  confidence?: number;
}

interface VapiCall {
  id: string;
  orgId: string;
  assistantId: string;
}

interface VapiPayload {
  custom_session_id: string;
  current_question_index: number;
}

interface VapiMessage {
  type: string;
  call?: VapiCall;
  transcript?: VapiTranscript[];
  payload?: VapiPayload;
}

interface VapiRequest {
  message: VapiMessage;
}

// Environment variable for Vapi secret token (should be set in .env.local)
const VAPI_SECRET_TOKEN = process.env.VAPI_SECRET_TOKEN || 'default-secret-token-for-dev';

export async function POST(request: NextRequest) {
  try {
    // Verify Vapi request authenticity
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.replace('Bearer ', '') !== VAPI_SECRET_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    // Parse request body
    const requestData = await request.json() as VapiRequest;
    
    // Extract data from Vapi request based on their format
    // Note: This structure should be adjusted based on actual Vapi documentation
    const message = requestData.message;
    
    if (!message) {
      return NextResponse.json({ error: 'Invalid Vapi request format' }, { status: 400 });
    }

    // Extract custom session ID and current question index from payload
    const payload = message.payload || {} as VapiPayload;
    const customSessionId = payload.custom_session_id;
    const currentQuestionIndex = payload.current_question_index || 0;
    
    if (!customSessionId) {
      return NextResponse.json({ 
        error: 'Missing custom_session_id in payload' 
      }, { status: 400 });
    }

    // Initialize Supabase client
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Retrieve the interview session
    const { data: sessionData, error: sessionError } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('id', customSessionId)
      .single();

    if (sessionError || !sessionData) {
      return NextResponse.json({ 
        error: 'Interview session not found' 
      }, { status: 404 });
    }

    // Update the vapi_call_id if not already set
    if (message.call && message.call.id && !sessionData.vapi_call_id) {
      await supabase
        .from('interview_sessions')
        .update({ vapi_call_id: message.call.id })
        .eq('id', customSessionId);
    }

    // Process user transcript if available
    if (message.transcript && Array.isArray(message.transcript) && message.transcript.length > 0) {
      // Get the latest user transcript
      const latestTranscript = message.transcript.filter((t: VapiTranscript) => t.role === 'user')
        .sort((a: VapiTranscript, b: VapiTranscript) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
      
      if (latestTranscript && latestTranscript.transcript) {
        // Get the current question
        const { data: currentQuestion } = await supabase
          .from('interview_questions')
          .select('*')
          .eq('session_id', customSessionId)
          .eq('question_order', currentQuestionIndex)
          .single();

        if (currentQuestion) {
          // Save the user's answer
          await supabase
            .from('interview_answers')
            .insert({
              question_id: currentQuestion.id,
              session_id: customSessionId,
              user_id: sessionData.user_id,
              answer_transcript_text: latestTranscript.transcript,
              answered_at: new Date().toISOString()
            });
        }
      }
    }

    // Determine next action based on message type and current state
    let nextQuestionIndex = currentQuestionIndex;
    
    // If this is an assistant_request or after user speech, move to next question
    if (message.type === 'assistant_request' || message.transcript) {
      nextQuestionIndex = currentQuestionIndex + 1;
    }
    
    // Get the next question
    const { data: nextQuestion } = await supabase
      .from('interview_questions')
      .select('*')
      .eq('session_id', customSessionId)
      .eq('question_order', nextQuestionIndex)
      .single();

    // If there's a next question, send it
    if (nextQuestion) {
      // Update session status if this is the first question
      if (nextQuestionIndex === 1) {
        await supabase
          .from('interview_sessions')
          .update({ 
            status: 'in_progress',
            started_at: new Date().toISOString()
          })
          .eq('id', customSessionId);
      }
      
      // Return the next question for Vapi to ask
      return NextResponse.json({
        assistant: {
          messages: [
            {
              type: "text",
              role: "assistant",
              text: nextQuestion.question_text
            }
          ]
        },
        control: {
          state: {
            custom_session_id: customSessionId,
            current_question_index: nextQuestionIndex
          }
        }
      });
    } else {
      // No more questions, end the interview
      await supabase
        .from('interview_sessions')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', customSessionId);
      
      // Return a concluding message and hangup
      return NextResponse.json({
        assistant: {
          messages: [
            {
              type: "text",
              role: "assistant",
              text: "Thank you for your time. That concludes our mock interview. Your feedback will be available shortly."
            }
          ]
        },
        control: {
          endCall: true
        }
      });
    }
    
  } catch (error) {
    console.error('Vapi assistant error:', error);
    return NextResponse.json({ 
      error: `An unexpected error occurred: ${(error as Error).message}` 
    }, { status: 500 });
  }
} 