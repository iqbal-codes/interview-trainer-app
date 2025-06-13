import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Only run this middleware for the root path
  if (pathname !== '/') {
    return NextResponse.next();
  }

  try {
    const supabase = createServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    // If user is authenticated, redirect to dashboard
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    // If user is not authenticated, redirect to login page
    return NextResponse.redirect(new URL('/auth/login', request.url));
  } catch (error) {
    console.error('Middleware error:', error);
    // If there's an error, redirect to login as a fallback
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
}

// Configure the middleware to only run on the homepage
export const config = {
  matcher: '/',
}; 