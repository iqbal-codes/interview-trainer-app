'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function VerifyEmail() {
  const router = useRouter();
  const [isResending, setIsResending] = useState(false);

  const handleResendEmail = async () => {
    setIsResending(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: localStorage.getItem('signupEmail') || '',
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      toast.success('Verification email has been resent.');
    } catch (error) {
      toast.error((error as Error)?.message || 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Check your email</CardTitle>
        <CardDescription>
          We&apos;ve sent you a verification link to your email address
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center text-muted-foreground">
          <p>
            Please check your email inbox and click the verification link to complete your
            registration.
          </p>
          <p className="mt-2">If you don&apos;t see the email, check your spam folder.</p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <Button
          onClick={handleResendEmail}
          variant="outline"
          className="w-full"
          disabled={isResending}
        >
          {isResending ? 'Resending...' : 'Resend verification email'}
        </Button>
        <div className="text-center text-sm">
          <Button
            variant="link"
            onClick={() => router.push('/auth/login')}
            className="text-primary underline-offset-4 hover:underline"
          >
            Back to login
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
