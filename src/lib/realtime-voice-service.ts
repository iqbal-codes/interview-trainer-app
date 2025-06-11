import { WebSocket } from 'ws';

// Define message types for client-server communication
export enum MessageType {
  // Client messages
  CLIENT_AUTH = 'client-auth',
  CLIENT_AUDIO_CHUNK = 'client-audio-chunk',
  CLIENT_INTERRUPT = 'client-interrupt',

  // Server messages
  SERVER_AUTH_SUCCESS = 'server-auth-success',
  SERVER_AUTH_FAILURE = 'server-auth-failure',
  SERVER_LIVE_TRANSCRIPT = 'server-live-transcript',
  SERVER_AI_SPEECH_CHUNK = 'server-ai-speech-chunk',
  SERVER_SESSION_ENDED = 'server-session-ended',
}

// RTC Data Channel message types
export enum RTCMessageType {
  TRANSCRIPT = 'transcript', // Interim transcripts from STT
  INTERRUPT = 'interrupt', // User has interrupted the AI
  END_SESSION = 'end-session', // Session has ended
}

// Client message structure
export interface ClientMessage {
  type: MessageType;
  payload: any;
}

// Auth payload structure
export interface AuthPayload {
  token: string;
  sessionId: string;
}

// Audio chunk payload
export interface AudioChunkPayload {
  data: string; // Base64-encoded audio data
}

// Interview question structure
export interface InterviewQuestion {
  id: string;
  question_text: string;
  question_order: number;
}

// RTC Data Channel message format
export interface RTCDataChannelMessage {
  type: RTCMessageType;
  payload: any;
}

// WebRTC Connection interface for the client
export interface RTCConnection {
  peerConnection: RTCPeerConnection;
  dataChannel: RTCDataChannel;
  audioTransceiver?: RTCRtpTransceiver;
}

/**
 * Abstract interface for real-time voice providers
 * This will be implemented by specific providers like Google Gemini or OpenAI
 */
export abstract class RealtimeVoiceProvider {
  protected clientWs: WebSocket;
  protected questions: InterviewQuestion[];
  protected currentQuestionIndex: number = 0;
  protected sessionId: string;
  protected isActive: boolean = false;

  /**
   * Constructor for the voice provider
   * @param clientWs - WebSocket connection to the client
   * @param sessionId - The current interview session ID
   */
  constructor(clientWs: WebSocket, sessionId: string) {
    this.clientWs = clientWs;
    this.sessionId = sessionId;
    this.questions = [];
  }

  /**
   * Initialize the provider with interview questions and start the session
   * @param questions - Array of interview questions for this session
   */
  abstract start(questions: InterviewQuestion[]): Promise<void>;

  /**
   * Handle an audio chunk from the client
   * @param chunk - Buffer containing raw audio data from client
   */
  abstract handleAudioChunk(chunk: Buffer): Promise<void>;

  /**
   * Handle interruption (barge-in) from the client
   * Should immediately stop any ongoing AI speech/generation
   */
  abstract handleInterrupt(): Promise<void>;

  /**
   * Clean up resources and close connection to the AI provider
   */
  abstract close(): Promise<void>;

  /**
   * Move to the next question in the interview
   */
  protected moveToNextQuestion(): boolean {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      return true;
    }
    return false; // No more questions
  }

  /**
   * Get the current question text
   */
  protected getCurrentQuestion(): string {
    return this.questions[this.currentQuestionIndex]?.question_text || '';
  }

  /**
   * Send a message back to the client
   * @param type - Message type
   * @param payload - Message payload
   */
  protected sendToClient(type: MessageType, payload: any): void {
    if (this.clientWs.readyState === WebSocket.OPEN) {
      this.clientWs.send(
        JSON.stringify({
          type,
          payload,
        })
      );
    }
  }

  /**
   * Send a live transcript update to the client
   * @param transcript - The current transcript text
   */
  protected sendLiveTranscript(transcript: string): void {
    this.sendToClient(MessageType.SERVER_LIVE_TRANSCRIPT, { transcript });
  }

  /**
   * Send an audio chunk to the client
   * @param audioData - Base64-encoded audio data
   */
  protected sendAudioChunk(audioData: string): void {
    this.sendToClient(MessageType.SERVER_AI_SPEECH_CHUNK, { data: audioData });
  }

  /**
   * Send session ended notification to the client
   * @param reason - Reason for ending the session
   */
  protected sendSessionEnded(reason: string): void {
    this.sendToClient(MessageType.SERVER_SESSION_ENDED, { reason });
    this.isActive = false;
  }
}
