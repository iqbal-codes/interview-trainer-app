import { GoogleGenAI } from '@google/genai';
import { SpeechClient } from '@google-cloud/speech';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

// Initialize Google Generative AI
const genai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '' });

// Initialize Google Cloud Speech client
const speech = new SpeechClient();

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

export async function getGoogleFeedback(transcript: string): Promise<FeedbackResponse> {
  try {
    const prompt = `
      You are an expert interview coach analyzing a candidate's response to an interview question.
      Please provide constructive feedback on the following interview answer. 
      
      Here is the transcript of the candidate's answer:
      "${transcript}"
      
      Analyze the answer and provide feedback in the following JSON format:
      {
        "overall_summary": "A brief overall assessment of the answer",
        "strengths_feedback": "Specific points about what was done well",
        "areas_for_improvement_feedback": "Constructive criticism about areas that could be improved",
        "actionable_suggestions": "2-3 specific, actionable tips for improvement"
      }
      
      Ensure your feedback is constructive, specific, and actionable.
      Return ONLY the JSON object, with no additional text before or after.
    `;

    // Call the LLM using Google Generative AI
    const result = await genai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const generatedFeedback = result.text;
    if (!generatedFeedback) throw new Error('Empty response from Gemini');

    // Parse the LLM's response into a JSON object
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
