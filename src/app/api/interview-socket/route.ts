import { createRouter, IncomingMessage, ServerResponse } from 'next-ws';
import { WebSocket } from 'ws';
import {
  RealtimeVoiceProvider,
  InterviewQuestion,
  MessageType,
  ClientMessage,
  AuthPayload,
  AudioChunkPayload,
} from '@/lib/realtime-voice-service';
import { GeminiRealtimeService } from '@/lib/services/gemini-realtime-service';

// Map of active sessions - key is connection ID, value is voice provider instance
const activeSessions = new Map<string, RealtimeVoiceProvider>();
// Used to generate unique connection IDs
let nextConnectionId = 1;

export function GET() {
  const headers = new Headers();
  headers.set('Connection', 'Upgrade');
  headers.set('Upgrade', 'websocket');
  return new Response('Upgrade Required', { status: 426, headers });
}

// Create a WebSocket router using next-ws

export function SOCKET(
  client: import('ws').WebSocket,
  request: import('http').IncomingMessage,
  server: import('ws').WebSocketServer
) {
  const connId = `conn_${nextConnectionId++}`;
  console.log(`[WebSocket] New connection: ${connId}`);

  client.on('open', () => {
    console.log(`[WebSocket] Connection opened: ${connId}`);
  });

  let isAuthenticated = false;

  // Handle messages from client
  client.on('message', async (message: WebSocket.RawData) => {
    try {
      console.log(`[WebSocket] Received message from ${connId}`);
      const msg = JSON.parse(message.toString()) as ClientMessage;

      // Handle authentication first
      if (msg.type === MessageType.CLIENT_AUTH) {
        if (isAuthenticated) return; // Already authenticated

        console.log(`[WebSocket] Processing auth for ${connId}`);
        const authPayload = msg.payload as AuthPayload;
        // Verify the token and session ID
        const isValid = await verifyAuth(authPayload.token, authPayload.sessionId);

        if (!isValid) {
          client.send(
            JSON.stringify({
              type: MessageType.SERVER_AUTH_FAILURE,
              payload: { error: 'Invalid credentials' },
            })
          );
          client.close();
          return;
        }

        // Authentication successful
        isAuthenticated = true;
        console.log(`[WebSocket] Auth success for ${connId}`);

        // Fetch interview questions from database
        const questions = await getInterviewQuestions(authPayload.sessionId);

        // Initialize the voice provider based on environment variable
        // This allows easy switching between providers
        const provider =
          process.env.ACTIVE_AI_PROVIDER?.toUpperCase() === 'OPENAI'
            ? null // OpenAI provider will be implemented later
            : new GeminiRealtimeService(client, authPayload.sessionId);

        if (!provider) {
          client.send(
            JSON.stringify({
              type: MessageType.SERVER_AUTH_FAILURE,
              payload: { error: 'AI provider not configured' },
            })
          );
          client.close();
          return;
        }

        // Store provider in active sessions map
        activeSessions.set(connId, provider);

        // Send authentication success to client
        client.send(
          JSON.stringify({
            type: MessageType.SERVER_AUTH_SUCCESS,
            payload: { message: 'Authenticated successfully. Ready to begin.' },
          })
        );

        // Start the interview session
        await provider.start(questions);
        return;
      }

      // All other messages require authentication
      if (!isAuthenticated) {
        client.send(
          JSON.stringify({
            type: MessageType.SERVER_AUTH_FAILURE,
            payload: { error: 'Not authenticated' },
          })
        );
        client.close();
        return;
      }

      const provider = activeSessions.get(connId);
      if (!provider) {
        client.send(
          JSON.stringify({
            type: MessageType.SERVER_AUTH_FAILURE,
            payload: { error: 'Session not found' },
          })
        );
        client.close();
        return;
      }

      // Handle different message types
      switch (msg.type) {
        case MessageType.CLIENT_AUDIO_CHUNK:
          // Convert Base64 to Buffer and send to provider
          const audioPayload = msg.payload as AudioChunkPayload;
          if (audioPayload && audioPayload.data) {
            const audioData = Buffer.from(audioPayload.data, 'base64');
            await provider.handleAudioChunk(audioData);
          }
          break;

        case MessageType.CLIENT_INTERRUPT:
          await provider.handleInterrupt();
          break;

        default:
          console.warn(`[WebSocket] Unknown message type: ${msg.type}`);
      }
    } catch (error) {
      console.error('[WebSocket] Error processing message:', error);
      client.send(
        JSON.stringify({
          type: MessageType.SERVER_AUTH_FAILURE,
          payload: { error: 'Error processing message' },
        })
      );
    }
  });

  // Handle connection close
  client.on('close', () => {
    console.log(`[WebSocket] Connection closed: ${connId}`);
    // Clean up provider resources
    const provider = activeSessions.get(connId);
    if (provider) {
      provider.close();
      activeSessions.delete(connId);
    }
  });
}
// Handle connection events

/**
 * Verify authentication token and session ID
 * @param token JWT token from Supabase
 * @param sessionId Interview session ID
 */
async function verifyAuth(token: string, sessionId: string): Promise<boolean> {
  try {
    // In real implementation, this would verify with Supabase
    // For now, we'll simulate successful authentication
    // This will be replaced with actual Supabase auth verification
    console.log('[WebSocket] Auth verification successful for session:', sessionId);
    return true;
  } catch (error) {
    console.error('[WebSocket] Auth verification error:', error);
    return false;
  }
}

/**
 * Fetch interview questions from database
 * @param sessionId Interview session ID
 */
async function getInterviewQuestions(sessionId: string): Promise<InterviewQuestion[]> {
  try {
    // In real implementation, this would fetch from Supabase
    // For now, we'll return mock questions
    console.log('[WebSocket] Fetched questions for session:', sessionId);
    return [
      { id: '1', question_text: 'Tell me about yourself and your background.', question_order: 1 },
      { id: '2', question_text: 'What are your strengths and weaknesses?', question_order: 2 },
      { id: '3', question_text: 'Why are you interested in this position?', question_order: 3 },
    ];
  } catch (error) {
    console.error('[WebSocket] Error fetching questions:', error);
    return [];
  }
}
