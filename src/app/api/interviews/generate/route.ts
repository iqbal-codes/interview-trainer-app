import { NextResponse } from "next/server";
import { interviewSetupSchema } from "@/lib/validations/interview";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/lib/supabase/types";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

export async function POST(request: Request) {
  try {
    // Initialize Supabase client
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Parse and validate the request body
    const body = await request.json();

    try {
      // Validate the input
      const validatedData = interviewSetupSchema.parse({
        ...body,
        key_skills_focused: Array.isArray(body.key_skills_focused)
          ? body.key_skills_focused.join(",")
          : body.key_skills_focused,
      });

      // Process key_skills_focused as an array
      const skills = Array.isArray(validatedData.key_skills_focused)
        ? validatedData.key_skills_focused.map((skill) => skill.trim())
        : [validatedData.key_skills_focused.trim()];

      // Create a new interview session in the database
      const { data: sessionData, error: sessionError } = await supabase
        .from("interview_sessions")
        .insert({
          user_id: userId,
          target_role: validatedData.target_role,
          key_skills_focused: skills,
          interview_type: validatedData.interview_type,
          job_description_context:
            validatedData.job_description_context || null,
          requested_num_questions: validatedData.requested_num_questions,
          status: "pending",
          session_name: `${validatedData.interview_type} Interview for ${validatedData.target_role}`,
        })
        .select()
        .single();

      if (sessionError) {
        console.error("Error creating interview session:", sessionError);
        return NextResponse.json(
          { error: "Failed to create interview session" },
          { status: 500 }
        );
      }

      const sessionId = sessionData.id;

      // Get user's CV content for context if available
      const { data: profileData } = await supabase
        .from("profiles")
        .select("cv_text_content")
        .eq("user_id", userId)
        .single();

      const cvContext = profileData?.cv_text_content || "";

      // Initialize Google Generative AI
      if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        return NextResponse.json(
          { error: "LLM API key not configured" },
          { status: 500 }
        );
      }

      const google = createGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      });

      // Construct prompt for the LLM
      const prompt = `
        Generate ${
          validatedData.requested_num_questions
        } interview questions for a ${validatedData.target_role} position.
        
        Interview Type: ${validatedData.interview_type}
        Key Skills: ${skills.join(", ")}
        ${
          validatedData.job_description_context
            ? `Job Description: ${validatedData.job_description_context}`
            : ""
        }
        ${cvContext ? `Candidate Background: ${cvContext}` : ""}
        
        Please return the questions in a JSON array format like this:
        [
          "Question 1 text here",
          "Question 2 text here",
          ...
        ]
        
        The questions should be challenging but fair, and specifically tailored to the role and skills mentioned.
        For technical roles, include appropriate technical questions related to the skills.
        For behavioral interviews, focus on past experiences and situational questions.
        For HR screening, focus on motivation, cultural fit, and career goals.
      `;

      try {
        // Call the LLM using Vercel AI SDK
        const { text: generatedText } = await generateText({
          model: google("models/gemini-pro"),
          prompt,
          temperature: 0.7,
          maxTokens: 2048,
        });

        // Parse the LLM response to extract questions
        let questions: string[] = [];

        try {
          // Try parsing as JSON array first
          const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            questions = JSON.parse(jsonMatch[0]);
          } else {
            // Fallback to line-by-line parsing for numbered lists
            questions = generatedText
              .split("\n")
              .filter((line) => line.trim().match(/^\d+[\.\)]\s+/)) // Match lines starting with numbers
              .map((line) => line.replace(/^\d+[\.\)]\s+/, "").trim());
          }
        } catch (parseError) {
          console.error("Error parsing LLM response:", parseError);
          // Fallback: split by newlines and clean up
          questions = generatedText
            .split("\n")
            .filter((line) => line.trim().length > 10) // Simple heuristic to find question-like lines
            .map((line) => line.trim());
        }

        // Ensure we have at least some questions
        if (questions.length === 0) {
          return NextResponse.json(
            { error: "Failed to generate valid questions from LLM" },
            { status: 500 }
          );
        }

        // Limit to the requested number of questions
        questions = questions.slice(0, validatedData.requested_num_questions);

        // Save questions to the database
        const questionsToInsert = questions.map((questionText, index) => ({
          session_id: sessionId,
          question_text: questionText,
          question_order: index + 1,
          question_type_tag: validatedData.interview_type
            .toLowerCase()
            .replace(" - ", "_"),
        }));

        const { data: insertedQuestions, error: questionsError } =
          await supabase
            .from("interview_questions")
            .insert(questionsToInsert)
            .select();

        if (questionsError) {
          console.error("Error inserting questions:", questionsError);
          return NextResponse.json(
            { error: "Failed to save generated questions" },
            { status: 500 }
          );
        }

        // Update the session with the actual number of questions and status
        await supabase
          .from("interview_sessions")
          .update({
            actual_num_questions: questions.length,
            status: "ready_to_start",
          })
          .eq("id", sessionId);

        // Format the response
        const formattedQuestions = insertedQuestions.map((q) => ({
          id: q.id,
          question_text: q.question_text,
          order: q.question_order,
        }));

        return NextResponse.json(
          {
            message:
              "Interview session created and questions generated by LLM.",
            session_id: sessionId,
            questions: formattedQuestions,
          },
          { status: 201 }
        );
      } catch (llmError) {
        console.error("Error calling LLM:", llmError);
        return NextResponse.json(
          { error: "Failed to generate questions with LLM" },
          { status: 500 }
        );
      }
    } catch (validationError) {
      console.error("Validation error:", validationError);
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error generating interview:", error);
    return NextResponse.json(
      { error: "Failed to generate interview" },
      { status: 500 }
    );
  }
}

