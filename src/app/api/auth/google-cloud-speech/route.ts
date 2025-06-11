import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/types';

/**
 * GET /api/auth/google-cloud-speech
 * 
 * Returns a configured API key for Google Cloud Speech-to-Text.
 * This adds a layer of protection around your Google Cloud API key.
 */
export async function GET(request: NextRequest) {
  // Check authentication
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json(
      { error: 'You must be logged in to access this endpoint' },
      { status: 401 }
    );
  }

  try {
    // Return API key for client-side use
    // In production, you would want to use a proper token service with rate limiting
    return NextResponse.json({
      apiKey: process.env.GOOGLE_CLOUD_API_KEY || '',
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || '',
    });
  } catch (error) {
    console.error('Error fetching Google Cloud credentials:', error);
    return NextResponse.json(
      { error: 'Failed to get speech recognition credentials' },
      { status: 500 }
    );
  }
} 