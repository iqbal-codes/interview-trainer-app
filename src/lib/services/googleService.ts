import { SpeechClient } from '@google-cloud/speech';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

// Initialize Google Generative AI

// Initialize Google Cloud Speech client
const speech = new SpeechClient();

/**
 * Gets the Google API key from environment variables
 * Checks both server-side and client-side environment variable names
 * @returns The API key or throws an error if not found
 */
function getGoogleApiKey(): string {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error('Google Generative AI API key not found in environment variables');
  }
  return apiKey;
}

/**
 * Transcribes audio file using Google Cloud Speech-to-Text
 * @param audioFilePath Path to the audio file
 * @returns Promise that resolves to the transcribed text
 */
export async function transcribeGoogleAudio(audioFilePath: string): Promise<string> {
  try {
    // Read the audio file
    const audioBytes = fs.readFileSync(audioFilePath).toString('base64');

    // Configure the request
    const request = {
      audio: {
        content: audioBytes,
      },
      config: {
        encoding: 'LINEAR16' as const,
        sampleRateHertz: 16000,
        languageCode: 'en-US',
        model: 'default',
        enableAutomaticPunctuation: true,
      },
    };

    // Detects speech in the audio file
    const [response] = await speech.recognize(request);

    const transcription = response.results
      ?.map(result => result.alternatives?.[0]?.transcript)
      .filter(Boolean)
      .join(' ');

    return transcription || '';
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw new Error('Failed to transcribe audio');
  }
}

/**
 * Generates structured feedback for an interview answer using Google Gemini
 * @param transcript The text transcript of the user's answer
 * @returns Promise that resolves to the feedback object
 */
interface FeedbackResponse {
  overall_summary: string;
  strengths_feedback: string;
  areas_for_improvement_feedback: string;
  actionable_suggestions: string;
}

export async function getGoogleFeedback(conversationHistory: string): Promise<FeedbackResponse> {
  try {
    // Ensure we have an API key
    getGoogleApiKey();

    const prompt = `
      You are an expert interview coach analyzing a candidate's response to an interview question.
      Please provide constructive feedback on the following interview answer. 

      Here is the conversation history:
      ${conversationHistory}
      
      Analyze the answer and provide feedback in the following JSON format:
      {
        "overall_summary": "A brief overall assessment of the answer",
        "strengths_feedback": "Specific points about what was done well",
        "areas_for_improvement_feedback": "Constructive criticism about areas that could be improved",
        "actionable_suggestions": "2-3 specific, actionable tips for improvement",
        "questions_answer": "A list of question, user answer and suggestion answer from AI in array of json format",
      }
      
      Ensure your feedback is constructive, specific, and actionable.
      Return ONLY the JSON object, with no additional text before or after.
    `;

    // Call the LLM using Google Generative AI
    const { text: generatedText } = await generateText({
      model: google('gemini-2.0-flash'),
      prompt,
    });

    const generatedFeedback = generatedText;
    if (!generatedFeedback) throw new Error('Empty response from Gemini');

    // Parse the LLM's response into a JSON object

    console.log('generatedFeedback', generatedFeedback);
    try {
      // Extract JSON if the response contains additional text
      const jsonMatch = generatedFeedback.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : generatedFeedback;

      if (!jsonStr) {
        throw new Error('Empty response from Gemini');
      }

      return JSON.parse(jsonStr) as FeedbackResponse;
    } catch (parseError) {
      console.error('Error parsing Gemini feedback response:', parseError);
      throw new Error('Failed to parse feedback from Gemini');
    }
  } catch (error) {
    console.error('Error generating Gemini feedback:', error);
    throw new Error('Failed to generate feedback from Gemini');
  }
}

/**
 * Generates interview questions using Google Gemini LLM
 * @param interviewType The type of interview (HR Screening, Technical, Behavioral, etc.)
 * @param numQuestions Number of questions to generate
 * @param skills Key skills to focus on
 * @param jobDescription Optional job description context
 * @param cvContext Optional candidate CV/resume context
 * @returns Promise that resolves to an array of generated questions
 */
export async function generateInterviewQuestions(
  interviewType: string,
  numQuestions: number,
  skills: string[],
  jobDescription?: string,
  cvContext?: string
): Promise<string[]> {
  try {
    // Ensure we have an API key
    getGoogleApiKey();
    
    // Construct prompt for the LLM
    const prompt = `
      You are an expert Question Generator for job interviews. Your task is to create a list of ${numQuestions} high-quality, relevant interview questions based on the provided context.

      Output Requirement: You MUST return the output as a JSON array of strings. Example: ["Question 1", "Question 2", "Question 3"]
      
      1. Core Interview Context:
      Interview Type: ${interviewType}
      Key Skills: ${skills.join(', ')}
      ${jobDescription ? `Job Description: ${jobDescription}` : ''}
      ${cvContext ? `Candidate Background: ${cvContext}` : ''}

      2. Interview Type & Instructions
      Based on the specified Interview Type, follow these instructions precisely:
      Interview Type: ${interviewType}

      A. If the Interview Type is "HR Screening":
      Generate general, introductory questions designed to understand the candidate's background, motivation, and personality. The questions should be non-technical.
      Focus on: General fit, career goals, and interest in the company.
      Example questions: "Tell me about yourself.", "Why are you interested in this role?", "What do you know about our company?", "What are your salary expectations?".

      B. If the Interview Type is "Behavioral Interview":
      Generate situational questions that require the candidate to provide specific examples from their past work experiences. These questions should assess soft skills and problem-solving approaches.
      Focus on: Questions that prompt a STAR (Situation, Task, Action, Result) method response.
      Example questions: "Describe a time you faced a major professional challenge and how you overcame it.", "Tell me about a successful project you were a part of. What was your specific contribution?", "How do you handle disagreements with a team member?".

      C. If the Interview Type is "Technical Interview":
      Generate questions that strictly test the candidate's technical knowledge and problem-solving abilities.
      Focus on: The technical requirements mentioned in the Job Description, the specific Job Title, and the provided Related Skills.

      D. If the Interview Type is "Behavioral + Technical Interview Combination":
      Generate a balanced mix of questions from both the Behavioral and Technical categories above.
      Focus on: Creating a list where approximately half the questions are behavioral and half are technical, based on all the provided context.
    `;

    // Call the LLM using Vercel AI SDK
    const { text: generatedText } = await generateText({
      model: google('gemini-2.0-'),
      prompt,
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
          .split('\n')
          .filter(line => line.trim().match(/^\d+[\.\)]\s+/)) // Match lines starting with numbers
          .map(line => line.replace(/^\d+[\.\)]\s+/, '').trim());
      }
    } catch (parseError) {
      console.error('Error parsing LLM response:', parseError);
      // Fallback: split by newlines and clean up
      questions = generatedText
        .split('\n')
        .filter(line => line.trim().length > 10) // Simple heuristic to find question-like lines
        .map(line => line.trim());
    }

    // Ensure we have at least some questions
    if (questions.length === 0) {
      throw new Error('Failed to generate valid questions from LLM');
    }

    // Limit to the requested number of questions
    return questions.slice(0, numQuestions);
  } catch (error) {
    console.error('Error generating interview questions:', error);
    throw new Error('Failed to generate interview questions with Gemini LLM');
  }
}

/**
 * Converts audio format from WebM to PCM for Google APIs
 * @param audioBuffer Buffer containing audio data in WebM format
 * @returns Promise that resolves to a temporary file path with PCM data
 */
export async function convertAudioForGoogle(audioBuffer: Buffer): Promise<string> {
  try {
    // Create a temporary file for the audio buffer
    const tempFilePath = path.join(os.tmpdir(), `audio-${Date.now()}.webm`);
    const outputPcmPath = path.join(os.tmpdir(), `audio-${Date.now()}.pcm`);

    // Write the buffer to the temp file
    fs.writeFileSync(tempFilePath, audioBuffer);

    // Use ffmpeg to convert the audio format (requires ffmpeg to be installed)
    execSync(`ffmpeg -i "${tempFilePath}" -ar 16000 -ac 1 -f s16le "${outputPcmPath}"`);

    // Clean up the input temp file
    fs.unlinkSync(tempFilePath);

    return outputPcmPath;
  } catch (error) {
    console.error('Error converting audio for Google:', error);
    throw new Error('Failed to convert audio format');
  }
}
