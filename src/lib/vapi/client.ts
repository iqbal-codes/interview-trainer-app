import Vapi from '@vapi-ai/web';
import { VapiClient } from '@vapi-ai/server-sdk';

// Client-side Vapi instance
export const createVapiClient = () => {
  const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
  
  if (!publicKey) {
    throw new Error('Missing Vapi public key');
  }
  
  return new Vapi(publicKey);
};

// Server-side Vapi client
export const createVapiServerClient = () => {
  const apiKey = process.env.VAPI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Missing Vapi API key');
  }
  
  return new VapiClient({ token: apiKey });
}; 