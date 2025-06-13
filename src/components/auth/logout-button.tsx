'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@/lib/supabase/client';

interface LogoutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export function LogoutButton({ variant = 'default' }: LogoutButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);

    try {
      const supabase = createClient();
      await supabase.auth.signOut();

      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully.',
      });

      router.push('/auth/login');
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error)?.message || 'Failed to log out',
        variant: 'destructive',
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button variant={variant} onClick={handleLogout} disabled={isLoading}>
      {isLoading ? 'Logging out...' : 'Log out'}
    </Button>
  );
}
