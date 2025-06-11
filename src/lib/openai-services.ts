import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Google Generative AI
const genai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });

/**
 * Transcribes audio using OpenAI's Whisper API
 * @param audioBuffer Buffer containing audio data
 * @returns Promise that resolves to the transcribed text
 */
export async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
  try {
    // Create a temporary file from the buffer for the OpenAI API
    const tempFilePath = path.join(os.tmpdir(), `audio-${Date.now()}.webm`);
    fs.writeFileSync(tempFilePath, audioBuffer);

    const transcription = await openai.audio.transcriptions.create({
      model: 'whisper-1',
      file: fs.createReadStream(tempFilePath),
    });

    // Clean up the temporary file
    fs.unlinkSync(tempFilePath);

    return transcription.text;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw new Error('Failed to transcribe audio');
  }
}

/**
 * Generates structured feedback for an interview answer using LLM
 * @param transcript The text transcript of the user's answer
 * @returns Promise that resolves to the feedback object
 */
export async function getLLMFeedback(transcript: string): Promise<object> {
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
    const response = await genai.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: prompt,
    });
    
    const generatedFeedback = response.text || '';

    // Parse the LLM's response into a JSON object
    try {
      // Extract JSON if the response contains additional text
      const jsonMatch = generatedFeedback.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : generatedFeedback;
      
      if (!jsonStr) {
        throw new Error('Empty response from LLM');
      }
      
      return JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Error parsing LLM feedback response:', parseError);
      throw new Error('Failed to parse feedback from LLM');
    }
  } catch (error) {
    console.error('Error generating LLM feedback:', error);
    throw new Error('Failed to generate feedback from LLM');
  }
}

/**
 * Generates speech from text using OpenAI's TTS API
 * @param text The text to convert to speech
 * @returns Promise that resolves to an audio buffer
 */
export async function synthesizeSpeech(text: string): Promise<Buffer> {
  try {
    const mp3Response = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'alloy',
      input: text,
    });

    // Convert the response to a buffer
    const buffer = Buffer.from(await mp3Response.arrayBuffer());
    return buffer;
  } catch (error) {
    console.error('Error synthesizing speech:', error);
    throw new Error('Failed to synthesize speech');
  }
}
