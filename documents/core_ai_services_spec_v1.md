# Core AI Services Utility File Spec

* **File Path:** `lib/openai-services.ts`
* **Purpose:** To create isolated, non-real-time utility functions for interacting with OpenAI APIs. This abstracts the direct API calls from our API route logic.
* **Dependencies:** `openai`, `@ai-sdk/google`, `ai`.

## Functions to Implement:

### 1. `transcribeAudio`
* **Signature:** `async function transcribeAudio(audioBuffer: Buffer): Promise<string>`
* **Input:** A `Buffer` containing the audio data.
* **Action:**
    1.  Uses the `openai` npm package.
    2.  Calls the Whisper API (`whisper-1` model).
    3.  To send a buffer, you'll need to convert it into a `File`-like object for the API.
* **Output:** Returns the full text transcript as a `string`.
* **Error Handling:** Should throw an error if the transcription fails.

### 2. `getLLMFeedback`
* **Signature:** `async function getLLMFeedback(transcript: string): Promise<object>`
* **Input:** The text transcript of a user's answer.
* **Action:**
    1.  Uses the Vercel AI SDK (`generateText`) with your initialized Google Generative AI provider.
    2.  Constructs a specific prompt designed to analyze the transcript and generate feedback. The prompt should ask for a JSON object with keys like `overall_summary`, `strengths_feedback`, `areas_for_improvement_feedback`, and `actionable_suggestions`.
    3.  Parses the LLM's text response into a JSON object.
* **Output:** Returns the feedback as a JavaScript `object`.
* **Error Handling:** Should throw an error if the LLM call or JSON parsing fails.

### 3. `synthesizeSpeech`
* **Signature:** `async function synthesizeSpeech(text: string): Promise<Buffer>`
* **Input:** A `string` of text to be converted to speech.
* **Action:**
    1.  Uses the `openai` npm package.
    2.  Calls the OpenAI TTS API (`tts-1` model, `alloy` voice, or similar).
* **Output:** Returns the generated audio as a `Buffer`.
* **Error Handling:** Should throw an error if the TTS generation fails.

