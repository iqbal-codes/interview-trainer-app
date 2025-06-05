import { NextResponse } from 'next/server';
import { generateInterviewQuestions } from '@/lib/api/llm';

// This is a placeholder for the Vapi webhook handler
// In a real implementation, this would handle various events from Vapi
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Log the webhook event for debugging
    console.log('Received Vapi webhook:', JSON.stringify(body));
    
    // Handle different message types
    if (body.message?.type === 'function-call') {
      const functionCall = body.message.functionCall;
      
      // Handle different function calls
      switch (functionCall.name) {
        case 'generate_interview_questions':
          const { jobTitle, jobDescription, count } = functionCall.parameters;
          
          const questions = await generateInterviewQuestions({
            jobTitle,
            jobDescription,
            count: count || 5,
          });
          
          return NextResponse.json({ result: { questions } });
          
        default:
          return NextResponse.json(
            { error: `Unknown function: ${functionCall.name}` },
            { status: 400 }
          );
      }
    }
    
    // Default response for other event types
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing Vapi webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
} 