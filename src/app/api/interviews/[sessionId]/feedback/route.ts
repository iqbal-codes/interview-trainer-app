import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Database } from "@/lib/supabase/types";

// Mock LLM feedback generation function (to be replaced with actual LLM API call later)
function generateMockFeedback(questions: any[], answers: any[]) {
  // Ensure we have answers to analyze
  if (!answers || answers.length === 0) {
    throw new Error("No answers available to generate feedback");
  }

  // Create a simple analysis based on answer length and keywords
  const answerTexts = answers.map((a) => a.answer_transcript_text || "");
  const totalLength = answerTexts.join(" ").length;
  const avgLength = totalLength / answerTexts.length;

  // Simple keyword detection for demonstration purposes
  const specificKeywords = [
    "specific",
    "example",
    "situation",
    "result",
    "outcome",
    "learned",
  ];
  const fillerWords = [
    "um",
    "like",
    "you know",
    "sort of",
    "kind of",
    "basically",
  ];

  const specificCount = answerTexts.reduce((count, text) => {
    return (
      count +
      specificKeywords.reduce(
        (c, keyword) =>
          c +
          (text.toLowerCase().match(new RegExp(`\\b${keyword}\\b`, "g")) || [])
            .length,
        0
      )
    );
  }, 0);

  const fillerCount = answerTexts.reduce((count, text) => {
    return (
      count +
      fillerWords.reduce(
        (c, word) =>
          c +
          (text.toLowerCase().match(new RegExp(`\\b${word}\\b`, "g")) || [])
            .length,
        0
      )
    );
  }, 0);

  // Generate feedback based on simple metrics
  let overallSummary = "";
  let strengthsFeedback = "";
  let areasForImprovement = "";
  let actionableSuggestions = "";

  // Overall summary based on answer length
  if (avgLength < 50) {
    overallSummary =
      "Your responses were quite brief. In most interview situations, more detailed answers would be beneficial.";
  } else if (avgLength < 150) {
    overallSummary =
      "Your responses were concise but could benefit from more detail in some areas.";
  } else if (avgLength < 300) {
    overallSummary =
      "Your responses had a good balance of detail and conciseness.";
  } else {
    overallSummary =
      "Your responses were very detailed, which shows thoroughness, though some could be more focused.";
  }

  // Strengths based on specific examples
  if (specificCount > 5) {
    strengthsFeedback =
      "You provided specific examples and situations in your answers, which makes your responses more credible and memorable.";
  } else {
    strengthsFeedback =
      "Some of your answers included specific details, which is good.";
  }

  // Areas for improvement based on filler words
  if (fillerCount > 10) {
    areasForImprovement =
      "Your responses contained several filler words and phrases that could be reduced to make your communication more confident and clear.";
  } else {
    areasForImprovement =
      "Your communication was generally clear, with minimal use of filler words.";
  }

  // Actionable suggestions
  actionableSuggestions = `
1. Practice the STAR method (Situation, Task, Action, Result) for behavioral questions.
2. Record yourself answering practice questions to identify speech patterns.
3. Prepare 3-5 strong examples from your experience that demonstrate key skills.
4. Focus on quantifiable achievements and outcomes in your responses.
5. Consider timing your responses - aim for 1-2 minutes per answer for most questions.
  `.trim();

  return {
    overall_summary: overallSummary,
    strengths_feedback: strengthsFeedback,
    areas_for_improvement_feedback: areasForImprovement,
    actionable_suggestions: actionableSuggestions,
    overall_score_qualitative:
      avgLength > 100 && specificCount > 3 ? "Good" : "Needs Improvement",
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId;

    // Initialize Supabase client
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized: Please log in" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Verify the session belongs to the user
    const { data: interviewSession, error: sessionError } = await supabase
      .from("interview_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("user_id", userId)
      .single();

    if (sessionError || !interviewSession) {
      return NextResponse.json(
        {
          error: "Interview session not found or access denied",
        },
        { status: 404 }
      );
    }

    // Check if session is completed
    if (interviewSession.status !== "completed") {
      return NextResponse.json(
        {
          error: "Cannot generate feedback for an incomplete interview session",
        },
        { status: 400 }
      );
    }

    // Check if feedback already exists
    const { data: existingFeedback } = await supabase
      .from("ai_feedback")
      .select("*")
      .eq("session_id", sessionId)
      .single();

    // If feedback exists and no regenerate flag is set, return existing feedback
    if (existingFeedback) {
      return NextResponse.json({
        message: "Feedback already exists for this session",
        session_id: sessionId,
        feedback: {
          overall_summary: existingFeedback.overall_summary,
          strengths_feedback: existingFeedback.strengths_feedback,
          areas_for_improvement_feedback:
            existingFeedback.areas_for_improvement_feedback,
          actionable_suggestions: existingFeedback.actionable_suggestions,
          overall_score_qualitative: existingFeedback.overall_score_qualitative,
        },
      });
    }

    // Fetch questions and answers for the session
    const { data: questions } = await supabase
      .from("interview_questions")
      .select("*")
      .eq("session_id", sessionId)
      .order("question_order", { ascending: true });

    const { data: answers } = await supabase
      .from("interview_answers")
      .select("*")
      .eq("session_id", sessionId);

    if (!answers || answers.length === 0) {
      return NextResponse.json(
        {
          error: "No answers found for this session",
        },
        { status: 404 }
      );
    }

    // Generate feedback (mock implementation)
    // In a real implementation, this would call an LLM API
    const feedback = generateMockFeedback(questions || [], answers);

    // Save feedback to database
    const { error: feedbackError } = await supabase
      .from("ai_feedback")
      .insert({
        session_id: sessionId,
        user_id: userId,
        overall_summary: feedback.overall_summary,
        strengths_feedback: feedback.strengths_feedback,
        areas_for_improvement_feedback: feedback.areas_for_improvement_feedback,
        actionable_suggestions: feedback.actionable_suggestions,
        overall_score_qualitative: feedback.overall_score_qualitative,
        feedback_generated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (feedbackError) {
      return NextResponse.json(
        {
          error: `Failed to save feedback: ${feedbackError.message}`,
        },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json({
      message: "Feedback generated successfully",
      session_id: sessionId,
      feedback: {
        overall_summary: feedback.overall_summary,
        strengths_feedback: feedback.strengths_feedback,
        areas_for_improvement_feedback: feedback.areas_for_improvement_feedback,
        actionable_suggestions: feedback.actionable_suggestions,
        overall_score_qualitative: feedback.overall_score_qualitative,
      },
    });
  } catch (error) {
    console.error("Feedback generation error:", error);
    return NextResponse.json(
      {
        error: `An unexpected error occurred: ${(error as Error).message}`,
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve existing feedback
export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId;

    // Initialize Supabase client
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized: Please log in" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Verify the session belongs to the user
    const { data: interviewSession, error: sessionError } = await supabase
      .from("interview_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("user_id", userId)
      .single();

    if (sessionError || !interviewSession) {
      return NextResponse.json(
        {
          error: "Interview session not found or access denied",
        },
        { status: 404 }
      );
    }

    // Fetch feedback
    const { data: feedback, error: feedbackError } = await supabase
      .from("ai_feedback")
      .select("*")
      .eq("session_id", sessionId)
      .single();

    if (feedbackError || !feedback) {
      return NextResponse.json(
        {
          error: "Feedback not found for this session",
        },
        { status: 404 }
      );
    }

    // Return feedback
    return NextResponse.json({
      message: "Feedback retrieved successfully",
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
    console.error("Feedback retrieval error:", error);
    return NextResponse.json(
      {
        error: `An unexpected error occurred: ${(error as Error).message}`,
      },
      { status: 500 }
    );
  }
}

