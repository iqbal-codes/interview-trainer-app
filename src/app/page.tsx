'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        router.push('/dashboard');
      } else {
        router.push('/auth/login');
      }
    };

    checkAuthAndRedirect();
  }, [router]);

  // Return a minimal loading state while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg">Redirecting...</p>
    </div>
  );
}
