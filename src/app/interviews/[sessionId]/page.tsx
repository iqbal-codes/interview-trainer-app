'use client'; // Still good practice for components with heavy client-side interactivity

import { useState, useEffect, useRef, use, useCallback } from 'react';
import { useRouter } from 'next/navigation'; // Corrected import for Pages Router
import { GoogleGenAI, Modality, LiveServerMessage, Session, EndSensitivity, StartSensitivity } from '@google/genai';

// Import your UI components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useMicVAD, } from '@ricky0123/vad-react';
import { base64ToArrayBuffer, downsampleTo16kHz, int16ArrayToBase64, pcmToWav } from '@/lib/sound-utils';

// --- Helper Types & Interfaces ---
interface SessionDetails {
  id: string;
  target_role: string;
  interview_type: string;
  questions: { id: string; question_text: string }[];
}

interface ConversationTurn {
  role: 'user' | 'model';
  text: string;
}

// --- The React Component ---
const InterviewPage = ({ params }: { params: Promise<{ sessionId: string }> }) => {
  const sessionId = use(params).sessionId;
  const router = useRouter();

  // --- State Management ---
  const [sessionDetails, setSessionDetails] = useState<SessionDetails | null>(null);
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [userInterimTranscript, setUserInterimTranscript] = useState('');
  const [sessionStatus, setSessionStatus] = useState<'idle' | 'loading' | 'active' | 'finished' | 'error'>('idle');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isSavingTranscript, setIsSavingTranscript] = useState(false);

  // --- Refs for non-state objects ---
  const genaiClientRef = useRef<GoogleGenAI | null>(null);
  const geminiSessionRef = useRef<Session | null>(null);
  const scheduledTime = useRef<number>(0);
  const aiTranscriptedText = useRef<string>('');
  const userTranscriptedText = useRef<string>('');
  const conversationDataRef = useRef<ConversationTurn[]>([]);
  const conversationEndRef = useRef<HTMLDivElement>(null);

  // --- Refs for Web Audio API for smooth playback and interruption ---
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueue = useRef<ArrayBuffer[]>([]);
  const isPlayingAudio = useRef(false);
  const currentSourceNode = useRef<AudioBufferSourceNode | null>(null);
  const currentGainNode = useRef<GainNode | null>(null);

  const pcmStreamerNode = useRef<AudioWorkletNode | null>(null);

  const fetchInterviewData = useCallback(async (sessId: string) => {
    try {
      setSessionStatus('loading');

      // Fetch the real interview session data from API
      const response = await fetch(`/api/interviews/${sessId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch interview data');
      }

      const data = await response.json();
      console.log('Fetched interview session data:', data);

      setSessionDetails({
        id: sessId as string,
        target_role: data.target_role || 'Software Engineer',
        interview_type: data.interview_type || 'Behavioral',
        questions: data.questions || []
      });

      setSessionStatus('idle');
    } catch (error) {
      console.error('Error fetching interview data:', error);
      // Fallback to mock data if API call fails
      const mockData: SessionDetails = {
        id: sessId as string,
        target_role: 'Software Engineer',
        interview_type: 'Behavioral',
        questions: [{ id: 'q1', question_text: 'Tell me about yourself' }],
      };
      setSessionDetails(mockData);
      setSessionStatus('idle');
    }
  }, []);

  // --- Audio Processing & Playback with Web Audio API for RAW PCM data ---
  // --- Updated `processAudioQueue` function for your React component ---
  // This robust version uses a dedicated loop to process the queue,
  // providing smoother, gapless playback.
  const processAudioQueue = async () => {
    // If we are already in the middle of a playback loop, do nothing.
    if (isPlayingAudio.current || !audioContextRef.current) {
      return;
    }

    // Set the flag to indicate that the playback loop is active.
    isPlayingAudio.current = true;

    // Process all chunks currently in the queue.
    while (audioQueue.current.length > 0) {
      const pcmChunk = audioQueue.current.shift();
      if (!pcmChunk) continue;

      try {
        // 1. Create a WAV file in memory.
        const wavBlob = pcmToWav(pcmChunk, 24000);
        const arrayBuffer = await wavBlob.arrayBuffer();

        // 2. Decode the audio data.
        const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);

        // 3. Create audio nodes for playback.
        const source = audioContextRef.current.createBufferSource();
        const gainNode = audioContextRef.current.createGain();

        source.buffer = audioBuffer;
        gainNode.gain.value = 0.8; // Set volume to 80%
        source.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);

        // 4. Schedule playback seamlessly.
        const currentTime = audioContextRef.current.currentTime;
        const startTime = scheduledTime.current < currentTime ? currentTime : scheduledTime.current;

        source.start(startTime);

        // Update the schedule for the next chunk.
        scheduledTime.current = startTime + audioBuffer.duration;

      } catch (e) {
        console.error("Error processing audio chunk:", e);
      }
    }

    // Once the queue is empty, reset the flag to allow the loop to be triggered again.
    isPlayingAudio.current = false;
  };

  // --- Interruption Logic for Natural Conversation ---
  const handleInterrupt = () => {
    setIsSpeaking(true);
    console.log("User interruption detected!");
    audioQueue.current = [];

    if (currentGainNode.current && currentSourceNode.current && audioContextRef.current) {
      const fadeDuration = 0.15;
      const now = audioContextRef.current.currentTime;
      currentGainNode.current.gain.linearRampToValueAtTime(0, now + fadeDuration);
      currentSourceNode.current.stop(now + fadeDuration + 0.05);

      currentSourceNode.current = null;
      currentGainNode.current = null;
      isPlayingAudio.current = false;
    }
  };

  const handleEndInterrupt = () => {
    console.log('user ended speaking');
    setIsSpeaking(false);
  }

  // --- Core Function to Start the Interview ---
  const handleStartInterview = async () => {
    setSessionStatus('loading');

    if (!audioContextRef.current) {
      // Initialize if it doesn't exist
      audioContextRef.current = new AudioContext();
      scheduledTime.current = 0; // Reset scheduled playback time
    }
    if (audioContextRef.current.state === 'suspended') {
      // Resume it if it was created in a suspended state
      await audioContextRef.current.resume();
    }

    try {
      const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY;
      if (!API_KEY) throw new Error("Google API Key not found.");

      // Validate we have session details before starting
      if (!sessionDetails || !sessionDetails.questions || sessionDetails.questions.length === 0) {
        throw new Error("No questions available for this interview session");
      }

      // Ensure you have installed the correct package: npm install @google/genai
      const ai = new GoogleGenAI({ apiKey: API_KEY });
      genaiClientRef.current = ai;

      // --- Connect to Gemini Live using the callback pattern ---
      const session = await genaiClientRef.current.live.connect({
        model: 'gemini-2.0-flash-live-001',
        config: {
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          responseModalities: [Modality.AUDIO],
          tools: [
            {
              functionDeclarations: [{ name: 'end_interview', description: 'End the interview' }]
            }
          ],
          realtimeInputConfig: {
            automaticActivityDetection: {
              disabled: false, // default
              startOfSpeechSensitivity: StartSensitivity.START_SENSITIVITY_LOW,
              endOfSpeechSensitivity: EndSensitivity.END_SENSITIVITY_LOW,
              prefixPaddingMs: 50,
              silenceDurationMs: 1000,
            }
          }
        },
        callbacks: {
          onopen: async () => {
            setSessionStatus('active');
            vad.start();
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const source = audioContextRef.current!.createMediaStreamSource(stream);

            await audioContextRef.current!.audioWorklet.addModule('/pcm-processor.js');

            pcmStreamerNode.current = new AudioWorkletNode(audioContextRef.current!, 'pcm-processor');
            source.connect(pcmStreamerNode.current);

            pcmStreamerNode.current.port.onmessage = (event) => {
              // Handle the new message format that includes sample rate information
              const { pcmData, sampleRate } = event.data;

              // Downsample the audio to 16kHz for Gemini API
              const downsampledPcm = downsampleTo16kHz(pcmData, sampleRate);

              // Convert the downsampled PCM data to base64
              const base64Audio = int16ArrayToBase64(downsampledPcm);

              // Send downsampled audio to Gemini API
              session.sendRealtimeInput({
                audio: { data: base64Audio, mimeType: 'audio/pcm;rate=16000' }
              });
            };
          },
          onmessage: handleMessage,
          onerror: (e) => {
            console.error('Gemini Live Error:', e.message);
            setSessionStatus('error');
          },
          onclose: (e) => {
            console.log('Gemini Live session closed:', e.reason);
          },
        },
      });

      geminiSessionRef.current = session;

      const mockSessionDetails = {
        target_role: 'Software Engineer',
        interview_type: 'Behavioral',
        questions: [{ id: 'q1', question_text: 'Tell me about yourself' }, { id: 'q2', question_text: 'What is your greatest strength?' }, { id: 'q3', question_text: 'What is your greatest weakness?' }]
      };

      // Construct detailed system prompt with interview context
      const systemPrompt = `
        You are "Alex," an advanced AI designed to conduct professional, objective, and insightful job interviews. Your goal is to simulate a real-world interview experience to help candidates practice and improve. You must adhere strictly to the following persona and instructions.
        1. Core Persona & Tone
        - Professional & Courteous: Maintain a consistently professional, polite, and encouraging tone. Your name is Alex.
        - Objective & Neutral: You are an impartial evaluator. Do not express personal opinions, excitement, or disappointment. Avoid subjective or emotionally charged language (e.g., "Wow, that's amazing!" or "That's not very good."). Instead, use neutral acknowledgements like "Thank you for sharing that," "I see," or "That gives me a clear picture."
        - Focused & Structured: Your primary role is to ask the provided questions and facilitate the candidate's responses. Do not deviate from the list of questions unless a natural, brief follow-up is required for clarification.

        2. Interview Context
        This is the information you will use to guide the interview.
        Target Role: ${mockSessionDetails?.target_role}
        Interview Type: ${mockSessionDetails?.interview_type}
        Questions: ${mockSessionDetails?.questions.map(q => q.question_text).join(', ')}

        3. Rules of Engagement & Conversational Flow
        - Ask One Question at a Time: Do not list multiple questions at once.
        - Start the Interview: Begin the conversation by introducing yourself briefly and then asking the first question.
        - Start from the first question: "Hello, my name is Alex, and I'll be conducting your mock interview today. I'm ready when you are. Let's start with your first question: ${mockSessionDetails?.questions[0].question_text}"
        - Listen Fully: Allow the candidate to finish their answer completely before you speak again. Do not interrupt.
        - Be Adaptable: If the candidate asks for clarification on a question (e.g., "What do you mean by 'handle a setback'?"), you must provide a helpful, concise explanation. After clarifying, re-ask the original question or guide them back to it gracefully.
        - Keep Your Remarks Concise: After the candidate answers, provide a brief, neutral transition before moving to the next question.
        - Good Transition: "Thank you. Let's move on to the next question."
        - Good Transition: "Okay, that's helpful context. The next question is..."
        - Bad Transition: "That was a really great answer, I was particularly impressed by how you handled the conflict with your manager and I think that shows a lot of leadership potential which is something we really value here." (This is too subjective and opinionated).
        - Do Not Give Feedback During the Interview: Your role during the session is to ask questions, not to provide real-time feedback or hints. All feedback will be generated and provided to the user after the session is complete.
        - End the Interview: Once the last question has been answered, provide a polite closing statement.
        - Example End: "Thank you for your time. That concludes our mock interview session. Your detailed feedback will be prepared and made available to you shortly."
        - Please wait for candidate to reply your closing statement, and then you must use the end_interview tool to end the interview. if user do not reply your closing statement, you must use the end_interview tool to end the interview.

        Your strict adherence to these rules will ensure a standardized, fair, and effective practice experience for the candidate. Begin now.
      `;

      // // Send initial prompt to kick off the conversation
      geminiSessionRef.current.sendRealtimeInput({
        text: systemPrompt,
      });

    } catch (error) {
      console.error('Error starting interview:', error);
      setSessionStatus('error');
      alert('Could not start the interview: ' + (error as Error).message);
    }
  };


  // Helper function to send transcript to API
  const sendTranscriptToAPI = useCallback(async (conversationData: ConversationTurn[]) => {
    const response = await fetch('/api/interviews/save-transcript-and-get-feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        conversationHistory: conversationData,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to save transcript: ${response.statusText}`);
    }

    router.push(`/interviews/${sessionId}/feedback`);
  }, [sessionId, router]);

  // --- Function to save transcript and get feedback ---
  const saveTranscriptAndGetFeedback = useCallback(async () => {
    if (conversation.length === 0) {
      console.warn('No conversation data to save');
      return;
    }

    setIsSavingTranscript(true);
    try {
      console.log('Processing audio and generating transcript...');
      await sendTranscriptToAPI(conversation);

      // Navigate to feedback page
      router.push(`/interviews/${sessionId}/feedback`);
    } catch (error) {
      console.error('Error processing audio:', error);
      alert('There was an error processing the interview transcript. Please try again.');
    } finally {
      setIsSavingTranscript(false);
    }
  }, [conversation, sessionId, router, sendTranscriptToAPI]);

  // --- Function to Stop the Interview ---
  const handleStopInterview = useCallback(async () => {
    geminiSessionRef.current?.close();
    if (pcmStreamerNode.current?.port) {
      pcmStreamerNode.current.port.close();
    }
    setSessionStatus('finished');

    // Save transcript and get feedback
    await saveTranscriptAndGetFeedback();
  }, [saveTranscriptAndGetFeedback]);

  // --- VAD for speech detection ---
  const vad = useMicVAD({
    onSpeechEnd: handleEndInterrupt,
    onSpeechStart: handleInterrupt,
  })

  const handleMessage = useCallback((message: LiveServerMessage) => {
    if (message.data) {
      if (userTranscriptedText.current !== '') {
        conversationDataRef.current.push({ role: 'user', text: userTranscriptedText.current });
        setConversation([...conversationDataRef.current]);
        userTranscriptedText.current = '';
        setUserInterimTranscript('');
      }
      setIsAiSpeaking(true);
      // Use the optimized base64 conversion function
      const audioChunk = base64ToArrayBuffer(message.data);

      audioQueue.current.push(audioChunk);

      if (!isPlayingAudio.current) {
        processAudioQueue();
      }
    }

    if (message.serverContent?.outputTranscription) {
      aiTranscriptedText.current += message.serverContent.outputTranscription.text;
    }

    if (message.toolCall) {
      handleStopInterview();
      console.log('message.toolCall', message.toolCall);
    }

    if (message.serverContent?.turnComplete) {
      setIsAiSpeaking(false);
      conversationDataRef.current.push({ role: 'model', text: aiTranscriptedText.current });
      setConversation([...conversationDataRef.current]);
      aiTranscriptedText.current = '';
    }

    if (message.serverContent?.inputTranscription) {
      console.log('message.serverContent.inputTranscription', message.serverContent.inputTranscription);
      userTranscriptedText.current += message.serverContent.inputTranscription.text;
      setUserInterimTranscript(userTranscriptedText.current);
    }

    // Try to get any available transcript data
    // This might work in some models but not in pure audio mode
  }, [handleStopInterview]);

  // --- Effect to fetch initial interview data ---
  useEffect(() => {
    if (sessionId) fetchInterviewData(sessionId);
  }, [sessionId, fetchInterviewData]);

  // --- Main Cleanup Effect ---
  useEffect(() => {
    return () => {
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close();
      }
    };
  }, []);

  useEffect(() => {
    if (conversationEndRef.current) {
      conversationEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation, userInterimTranscript]);

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white text-xl font-semibold">
          Interview Session - {sessionDetails?.target_role || 'Loading...'}
        </h1>
        <div className="text-gray-300 text-sm">
          {sessionStatus === 'idle' && 'Ready to start'}
          {sessionStatus === 'loading' && 'Initializing...'}
          {sessionStatus === 'active' && 'Live Interview'}
          {sessionStatus === 'finished' && 'Session Ended'}
          {sessionStatus === 'error' && 'Error occurred'}
        </div>
      </div>

      {/* Main Video Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 max-w-6xl mx-auto">
        {/* AI Interviewer Card */}
        <Card className={`relative overflow-hidden bg-gray-800 border-gray-700 transition-all duration-300 ${sessionStatus === 'active' && isAiSpeaking
          ? 'ring-4 ring-green-500 shadow-lg shadow-green-500/20'
          : ''
          }`}>
          <CardContent className="p-0 aspect-video relative">
            {/* Avatar/Video placeholder */}
            <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">AI</span>
              </div>
            </div>

            {/* Speaking indicator */}
            {sessionStatus === 'active' && isAiSpeaking && (
              <div className="absolute top-4 left-4">
                <div className="flex items-center space-x-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span>Speaking</span>
                </div>
              </div>
            )}

            {/* Name label */}
            <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded">
              AI Interviewer
            </div>
          </CardContent>
        </Card>

        {/* User Card */}
        <Card className={`relative overflow-hidden bg-gray-800 border-gray-700 transition-all duration-300 ${sessionStatus === 'active' && isSpeaking
          ? 'ring-4 ring-blue-500 shadow-lg shadow-blue-500/20'
          : ''
          }`}>
          <CardContent className="p-0 aspect-video relative">
            {/* Avatar/Video placeholder */}
            <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">You</span>
              </div>
            </div>

            {/* Speaking indicator */}
            {sessionStatus === 'active' && isSpeaking && (
              <div className="absolute top-4 left-4">
                <div className="flex items-center space-x-2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span>Speaking</span>
                </div>
              </div>
            )}

            {/* Mic status */}
            {sessionStatus === 'active' && (
              <div className="absolute top-4 right-4">
                <div className={`p-2 rounded-full ${isSpeaking ? 'bg-blue-500' : 'bg-gray-600'
                  }`}>
                  <Mic className="w-4 h-4 text-white" />
                </div>
              </div>
            )}

            {/* Name label */}
            <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded">
              You
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversation Panel */}
      <Card className="max-w-6xl mx-auto mb-6 bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Conversation</CardTitle>
        </CardHeader>
        <CardContent className="h-64 overflow-y-auto space-y-3">
          {conversation.length === 0 && sessionStatus === 'idle' && (
            <div className="text-gray-400 text-center py-8">
              Start the interview to begin the conversation
            </div>
          )}
          {conversation.map((turn, index) => (
            <div key={index} className={`flex ${turn.role === 'model' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[80%] p-3 rounded-lg ${turn.role === 'model'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-600 text-white'
                }`}>
                <div className="text-xs opacity-75 mb-1">
                  {turn.role === 'model' ? 'AI Interviewer' : 'You'}
                </div>
                <div>{turn.text}</div>
              </div>
            </div>
          ))}
          {userInterimTranscript && (
            <div className="flex justify-end">
              <div className="bg-gray-500 text-white p-3 rounded-lg max-w-[80%] opacity-75">
                <div className="text-xs opacity-75 mb-1">You speaking...</div>
                <div><em>{userInterimTranscript}</em></div>
              </div>
            </div>
          )}
          <div ref={conversationEndRef} />
        </CardContent>
      </Card>

      {/* Control Panel */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              {sessionStatus !== 'active' ? (
                <>
                  <Button
                    onClick={handleStartInterview}
                    disabled={sessionStatus === 'loading' || !sessionDetails || isSavingTranscript}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full"
                    size="lg"
                  >
                    {sessionStatus === 'loading' || isSavingTranscript ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <Mic className="mr-2 h-5 w-5" />
                    )}
                    {isSavingTranscript ? 'Saving...' : 'Start Interview'}
                  </Button>

                  {sessionStatus === 'finished' && !isSavingTranscript && (
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/interviews/${sessionId}/feedback`)}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      View Feedback
                    </Button>
                  )}
                </>
              ) : (
                <>
                  {/* Pause/Resume Button */}
                  <Button
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700 rounded-full p-3"
                    onClick={() => {
                      // Add pause/resume logic here
                      console.log('Pause/Resume clicked');
                    }}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </Button>

                  {/* Mic Toggle */}
                  <Button
                    variant="outline"
                    className={`rounded-full p-3 ${isSpeaking
                      ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                      : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      }`}
                  >
                    <Mic className="w-5 h-5" />
                  </Button>

                  {/* End Interview */}
                  <Button
                    variant="destructive"
                    onClick={handleStopInterview}
                    className="bg-red-600 hover:bg-red-700 rounded-full p-3"
                  >
                    <MicOff className="w-5 h-5" />
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status indicator */}
      {isSavingTranscript && (
        <div className="fixed top-4 right-4">
          <Alert className="bg-blue-600 border-blue-500 text-white">
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertTitle>Processing</AlertTitle>
            <AlertDescription>
              Saving transcript and generating feedback...
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
};

export default InterviewPage;

