'use client'; // Still good practice for components with heavy client-side interactivity

import { useRef, use } from 'react';
import { useRouter } from 'next/navigation'; // Corrected import for Pages Router
import { GoogleGenAI, Modality, LiveServerMessage, Session, EndSensitivity, StartSensitivity } from '@google/genai';
import { interviewService } from '@/lib/services';
import { useObservableSyncedQuery } from '@legendapp/state/sync-plugins/tanstack-react-query';


// Import your UI components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useMicVAD, } from '@ricky0123/vad-react';
import { base64ToArrayBuffer, downsampleTo16kHz, int16ArrayToBase64, pcmToWav } from '@/lib/sound-utils';
import { MainLayout } from '@/components/layout/main-layout';
import { StakeholderCard } from '@/components/interview/stakeholder-card';
import { Memo, useObservable, useObserve, useUnmount } from "@legendapp/state/react"

interface ConversationTurn {
  role: 'user' | 'model';
  text: string;
}

const conversationEndMessage = 'Thank you for your time. That concludes our mock interview session. Your detailed feedback will be prepared and made available to you shortly.';

// --- The React Component ---
const InterviewPage = ({ params }: { params: Promise<{ sessionId: string }> }) => {
  const sessionId = use(params).sessionId;
  const router = useRouter();

  const conversation$ = useObservable<ConversationTurn[]>([]);
  const userInterimTranscript$ = useObservable<string>('');
  const sessionStatus$ = useObservable<'idle' | 'active' | 'finished' | 'error'>('idle');
  const isSpeaking$ = useObservable<boolean>(false);
  const isAiSpeaking$ = useObservable<boolean>(false);
  const isSavingTranscript$ = useObservable<boolean>(false);
  const isPlayingAudio$ = useObservable<boolean>(false);
  const scheduledTime$ = useObservable<number>(0);
  const aiTranscriptedText$ = useObservable<string>('');

  // --- Refs for non-state objects ---
  const genaiClientRef = useRef<GoogleGenAI | null>(null);
  const geminiSessionRef = useRef<Session | null>(null);
  const conversationEndRef = useRef<HTMLDivElement>(null);

  // --- Refs for Web Audio API for smooth playback and interruption ---
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueue = useRef<ArrayBuffer[]>([]);
  const currentSourceNode = useRef<AudioBufferSourceNode | null>(null);
  const currentGainNode = useRef<GainNode | null>(null);
  const pcmStreamerNode = useRef<AudioWorkletNode | null>(null);

  // react query
  const sessionDetails$ = useObservableSyncedQuery({
    query: {
      queryKey: ['sessionDetails', sessionId],
      queryFn: () => interviewService.getInterview(sessionId),
    }
  });

  // --- Audio Processing & Playback with Web Audio API for RAW PCM data ---
  // --- Updated `processAudioQueue` function for your React component ---
  // This robust version uses a dedicated loop to process the queue,
  // providing smoother, gapless playback.
  const processAudioQueue = async () => {
    // If we are already in the middle of a playback loop, do nothing.
    if (isPlayingAudio$.get() || !audioContextRef.current) {
      return;
    }

    // Set the flag to indicate that the playback loop is active.
    isPlayingAudio$.set(true);

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
        const startTime = scheduledTime$.get() < currentTime ? currentTime : scheduledTime$.get();

        source.start(startTime);

        // Update the schedule for the next chunk.
        scheduledTime$.set(startTime + audioBuffer.duration);

      } catch (e) {
        console.error("Error processing audio chunk:", e);
      }
    }

    // Once the queue is empty, reset the flag to allow the loop to be triggered again.
    isPlayingAudio$.set(false);
  };

  // --- Interruption Logic for Natural Conversation ---
  const handleInterrupt = () => {
    isSpeaking$.set(true);
    console.log("User interruption detected!");
    audioQueue.current = [];

    if (currentGainNode.current && currentSourceNode.current && audioContextRef.current) {
      const fadeDuration = 0.15;
      const now = audioContextRef.current.currentTime;
      currentGainNode.current.gain.linearRampToValueAtTime(0, now + fadeDuration);
      currentSourceNode.current.stop(now + fadeDuration + 0.05);

      currentSourceNode.current = null;
      currentGainNode.current = null;
      isPlayingAudio$.set(false);
    }
  };

  const handleEndInterrupt = () => {
    console.log('user ended speaking');
    isSpeaking$.set(false);
  }

  // --- Core Function to Start the Interview ---
  const handleStartInterview = async () => {
    if (!audioContextRef.current) {
      // Initialize if it doesn't exist
      audioContextRef.current = new AudioContext();
      scheduledTime$.set(0); // Reset scheduled playback time
    }
    if (audioContextRef.current.state === 'suspended') {
      // Resume it if it was created in a suspended state
      await audioContextRef.current.resume();
    }

    try {
      const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY;
      const sessionDetails = sessionDetails$.get();
      if (!API_KEY) throw new Error("Google API Key not found.");

      // Validate we have session details before starting
      if (!sessionDetails || !sessionDetails?.questions || sessionDetails?.questions?.length === 0) {
        throw new Error("No questions available for this interview session");
      }

      // Ensure you have installed the correct package: npm install @google/genai
      const ai = new GoogleGenAI({ apiKey: API_KEY });
      genaiClientRef.current = ai;

      // Construct detailed system prompt with interview context
      const systemPrompt = `
        You are "Alex," an advanced AI designed to conduct professional, objective, and insightful job interviews. Your goal is to simulate a real-world interview experience to help candidates practice and improve. You must adhere strictly to the following persona and instructions.
        1. Core Persona & Tone
        - Professional & Courteous: Maintain a consistently professional, polite, and encouraging tone. Your name is Alex.
        - Objective & Neutral: You are an impartial evaluator. Do not express personal opinions, excitement, or disappointment. Avoid subjective or emotionally charged language (e.g., "Wow, that's amazing!" or "That's not very good."). Instead, use neutral acknowledgements like "Thank you for sharing that," "I see," or "That gives me a clear picture."
        - Focused & Structured: Your primary role is to ask the provided questions and facilitate the candidate's responses. Do not deviate from the list of questions unless a natural, brief follow-up is required for clarification.

        2. Interview Context
        This is the information you will use to guide the interview.
        Target Role: ${sessionDetails?.target_role}
        Interview Type: ${sessionDetails?.interview_type}
        Questions: ${sessionDetails?.questions.slice(0, 2).map(q => q.question_text).join(', ')}

        3. Rules of Engagement & Conversational Flow
        - Ask One Question at a Time: Do not list multiple questions at once.
        - Start the Interview: Begin the conversation by introducing yourself briefly and then asking the first question.
        - Start from the first question: "Hello, my name is Alex, and I'll be conducting your mock interview today. I'm ready when you are. Let's start with your first question: ${sessionDetails?.questions[0].question_text}"
        - Listen Fully: Allow the candidate to finish their answer completely before you speak again. Do not interrupt.
        - Be Adaptable: If the candidate asks for clarification on a question (e.g., "What do you mean by 'handle a setback'?"), you must provide a helpful, concise explanation. After clarifying, re-ask the original question or guide them back to it gracefully.
        - Keep Your Remarks Concise: After the candidate answers, provide a brief, neutral transition before moving to the next question.
        - Good Transition: "Thank you. Let's move on to the next question."
        - Good Transition: "Okay, that's helpful context. The next question is..."
        - Bad Transition: "That was a really great answer, I was particularly impressed by how you handled the conflict with your manager and I think that shows a lot of leadership potential which is something we really value here." (This is too subjective and opinionated).
        - Do Not Give Feedback During the Interview: Your role during the session is to ask questions, not to provide real-time feedback or hints. All feedback will be generated and provided to the user after the session is complete.
        - End the Interview: Once the last question has been answered, provide a polite closing statement by using the following message: ${conversationEndMessage}
        Your strict adherence to these rules will ensure a standardized, fair, and effective practice experience for the candidate. Begin now.
      `;

      // --- Connect to Gemini Live using the callback pattern ---
      const session = await genaiClientRef.current.live.connect({
        model: 'gemini-2.0-flash-live-001',
        config: {
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          // systemInstruction: systemPrompt,
          speechConfig: {
            languageCode: 'en-US',
          },
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
            sessionStatus$.set('active');
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
            sessionStatus$.set('error');
          },
          onclose: (e) => {
            console.log('Gemini Live session closed:', e.reason);
          },
        },
      });

      geminiSessionRef.current = session;

      // // Send initial prompt to kick off the conversation
      geminiSessionRef.current.sendRealtimeInput({
        text: systemPrompt,
      });

    } catch (error) {
      console.error('Error starting interview:', error);
      sessionStatus$.set('error');
      alert('Could not start the interview: ' + (error as Error).message);
    }
  };

  // --- Function to save transcript and get feedback ---
  const saveTranscriptAndGetFeedback = async () => {
    if (conversation$.get().length === 0) {
      console.warn('No conversation data to save');
      return;
    }

    isSavingTranscript$.set(true);
    try {
      console.log('Processing audio and generating transcript...');

      // Use the interview service instead of direct fetch
      await interviewService.saveFeedback(sessionId, {
        conversationHistory: conversation$.get()
      });

      // Navigate to feedback page
      router.push(`/interviews/${sessionId}/feedback`);
    } catch (error) {
      console.error('Error processing audio:', error);
      alert('There was an error processing the interview transcript. Please try again.');
    } finally {
      isSavingTranscript$.set(false);
    }
  }

  // --- Function to Stop the Interview ---
  const handleStopInterview = async () => {
    if (userInterimTranscript$.get() !== '') {
      conversation$.set([...conversation$.get(), { role: 'user', text: userInterimTranscript$.get() }]);
      userInterimTranscript$.set('');
    }
    geminiSessionRef.current?.close();
    if (pcmStreamerNode.current?.port) {
      pcmStreamerNode.current.port.close();
    }
    sessionStatus$.set('finished');

    // Save transcript and get feedback
    await saveTranscriptAndGetFeedback();
  };

  // --- VAD for speech detection ---
  const vad = useMicVAD({
    onSpeechEnd: handleEndInterrupt,
    onSpeechStart: handleInterrupt,
  })

  const handleMessage = (message: LiveServerMessage) => {
    if (message.data) {
      if (userInterimTranscript$.get() !== '') {
        conversation$.set([...conversation$.get(), { role: 'user', text: userInterimTranscript$.get() }]);
        userInterimTranscript$.set('');
      }
      isAiSpeaking$.set(true);
      // Use the optimized base64 conversion function
      const audioChunk = base64ToArrayBuffer(message.data);

      audioQueue.current.push(audioChunk);

      if (!isPlayingAudio$.get()) {
        processAudioQueue();
      }
    }

    if (message.serverContent?.outputTranscription) {
      aiTranscriptedText$.set(aiTranscriptedText$.get() + message.serverContent.outputTranscription.text);
    }

    if (message.serverContent?.turnComplete) {
      isAiSpeaking$.set(false);
      conversation$.set([...conversation$.get(), { role: 'model', text: aiTranscriptedText$.get() }]);
      aiTranscriptedText$.set('');
    }

    if (message.serverContent?.inputTranscription) {
      console.log('message.serverContent.inputTranscription', message.serverContent.inputTranscription);
      userInterimTranscript$.set(userInterimTranscript$.get() + message.serverContent.inputTranscription.text);
    }
  }

  // --- Main Cleanup Effect ---
  useUnmount(() => {
    if (audioContextRef.current?.state !== 'closed') {
      audioContextRef.current?.close();
    }
  });

  useObserve(() => {
    if (conversation$.get().length > 0 && conversation$.get()[conversation$.get().length - 1]?.text.includes(conversationEndMessage)) {
      handleStopInterview();
    }
    if (conversationEndRef.current) {
      setTimeout(() => {
        conversationEndRef?.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, { deps: [conversation$, userInterimTranscript$] });

  return (
    <MainLayout>
      <div className="container py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">
            Interview Session - {sessionDetails$.get()?.target_role || 'Loading...'}
          </h1>
          <Memo>
            {() => (
              <div className="text-muted-foreground text-base">
                {sessionStatus$.get() === 'idle' && !sessionDetails$.get() && 'Ready to start'}
                {!sessionDetails$.get() && 'Initializing...'}
                {sessionStatus$.get() === 'active' && 'Live Interview'}
                {sessionStatus$.get() === 'finished' && 'Session Ended'}
                {sessionStatus$.get() === 'error' && 'Error occurred'}
              </div>
            )}
          </Memo>
        </div>

        {/* Main Video Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Memo>
            {() => (
              <StakeholderCard
                initials="AI"
                name="AI Interviewer"
                isSpeaking={isAiSpeaking$.get()}
                ringColorClass="ring-blue-500"
                accentBgClass="bg-blue-500/20"
                avatarBgClass="bg-blue-500/20"
                circleBgClass="bg-blue-500/60"
                avatarTextColorClass="text-white"
              />
            )}
          </Memo>
          <Memo>
            {() => (
              <StakeholderCard
                initials="You"
                name="You"
                isSpeaking={isSpeaking$.get()}
                ringColorClass="ring-green-500"
                accentBgClass="bg-green-500/20"
                avatarBgClass="bg-green-500/20"
                circleBgClass="bg-green-500/60"
                avatarTextColorClass="text-white"
                showMic
              />
            )}
          </Memo>
        </div>

        {/* Conversation Panel */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Conversation</CardTitle>
          </CardHeader>
          <Memo>
            {() => (
              <CardContent className="h-64 overflow-y-auto space-y-3">
                {conversation$.get().length === 0 && sessionStatus$.get() === 'idle' && (
                  <div className="text-muted-foreground text-center py-8">
                    Start the interview to begin the conversation
                  </div>
                )}
                {conversation$.get().map((turn, index) => (
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
                {userInterimTranscript$.get() && (
                  <div className="flex justify-end">
                    <div className="bg-gray-500 text-white p-3 rounded-lg max-w-[80%] opacity-75">
                      <div className="text-xs opacity-75 mb-1">You speaking...</div>
                      <div><em>{userInterimTranscript$.get()}</em></div>
                    </div>
                  </div>
                )}
                <div ref={conversationEndRef} />
              </CardContent>
            )}
          </Memo>
        </Card>

        {/* Control Panel */}
        <Card className="bg-card border-card mb-6">
          <CardContent className="p-4">
            <Memo>
              {() => (
                <div className="flex items-center space-x-4">
                  {sessionStatus$.get() !== 'active' ? (
                    <>
                      <Button
                        onClick={handleStartInterview}
                        disabled={!sessionDetails$.get() || isSavingTranscript$.get()}
                        className="px-6 py-3 rounded-full"
                        size="lg"
                      >
                        {!sessionDetails$.get() || isSavingTranscript$.get() ? (
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                          <Mic className="mr-2 h-5 w-5" />
                        )}
                        {isSavingTranscript$.get() ? 'Saving...' : 'Start Interview'}
                      </Button>
                      {sessionStatus$.get() === 'finished' && !isSavingTranscript$.get() && (
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
                        className="rounded-full p-3"
                        onClick={() => {
                          // Add pause/resume logic here
                          console.log('Pause/Resume clicked');
                        }}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </Button>
                      {/* End Interview */}
                      <Button
                        variant="destructive"
                        onClick={handleStopInterview}
                        className="rounded-full p-3"
                      >
                        <MicOff className="w-5 h-5" />
                      </Button>
                    </>
                  )}
                </div>
              )}
            </Memo>
          </CardContent>
        </Card>

        {/* Status indicator */}
        {isSavingTranscript$.get() && (
          <Alert className="bg-blue-600 border-blue-500 text-white">
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertTitle>Processing</AlertTitle>
            <AlertDescription>
              Saving transcript and generating feedback...
            </AlertDescription>
          </Alert>
        )}
      </div>
    </MainLayout>
  );
};

export default InterviewPage;

