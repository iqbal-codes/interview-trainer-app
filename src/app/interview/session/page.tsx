'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from "@/components/layout/main-layout";
import { InterviewSession } from "@/components/interview/interview-session";
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export default function InterviewSessionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [jobTitle, setJobTitle] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get job details from session storage
    const storedJobTitle = sessionStorage.getItem('interviewJobTitle');
    const storedJobDescription = sessionStorage.getItem('interviewJobDescription');
    
    if (!storedJobTitle) {
      toast({
        title: 'Missing Job Details',
        description: 'Please fill out the job details form first.',
        variant: 'destructive',
      });
      router.push('/interview/new');
      return;
    }
    
    setJobTitle(storedJobTitle);
    if (storedJobDescription) {
      setJobDescription(storedJobDescription);
    }
    
    setIsLoading(false);
  }, [router, toast]);

  const handleComplete = () => {
    // Navigate to the results page
    router.push('/interview/results');
  };

  return (
    <MainLayout>
      <div className="container py-10">
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
              </div>
              <p className="mt-4">Loading interview session...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Interview Session</h1>
              <Button variant="outline" onClick={() => router.push('/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
            <InterviewSession 
              jobTitle={jobTitle} 
              jobDescription={jobDescription}
              onComplete={handleComplete}
            />
          </>
        )}
      </div>
    </MainLayout>
  );
} 