import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Database } from '@/types';

export async function GET() {
  // Initialize Supabase client
  const supabase = createRouteHandlerClient<Database>({ cookies });

  try {
    // Get user session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Query interview sessions for the authenticated user
    const { data: interviews, error } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching interview sessions:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Return the interview sessions
    return NextResponse.json(interviews);
  } catch (error) {
    console.error('Error in /api/interviews handler:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
