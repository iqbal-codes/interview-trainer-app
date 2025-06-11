import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Database } from '@/lib/supabase/types';
import { ensureStorageBuckets } from '@/lib/supabase/storage-setup';

// This route can be called during app initialization or by an admin
export async function GET() {
  try {
    // Initialize Supabase client
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Check authentication (optional - could require admin role)
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Please log in' }, { status: 401 });
    }

    // Ensure storage buckets exist
    const storageResult = await ensureStorageBuckets(supabase);

    if (!storageResult.success) {
      return NextResponse.json(
        {
          error: 'Failed to set up storage buckets',
          details: storageResult.error,
        },
        { status: 500 }
      );
    }

    // Add more setup tasks here as needed

    return NextResponse.json({
      message: 'Setup completed successfully',
      storage: storageResult,
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      {
        error: `An unexpected error occurred: ${(error as Error).message}`,
      },
      { status: 500 }
    );
  }
}
