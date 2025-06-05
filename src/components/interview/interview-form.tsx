'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

interface InterviewFormProps {
  onSubmit?: (jobTitle: string, jobDescription: string) => void;
}

export function InterviewForm({ onSubmit }: InterviewFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!jobTitle.trim()) {
      toast({
        title: 'Error',
        description: 'Job title is required',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (onSubmit) {
        onSubmit(jobTitle, jobDescription);
      } else {
        // Store in session storage for the interview page
        sessionStorage.setItem('interviewJobTitle', jobTitle);
        sessionStorage.setItem('interviewJobDescription', jobDescription);
        
        // Navigate to the interview session page
        router.push('/interview/session');
      }
    } catch (error) {
      console.error('Error starting interview:', error);
      toast({
        title: 'Error',
        description: 'Failed to start interview session',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Details</CardTitle>
        <CardDescription>
          Enter the details of the job you&apos;re applying for. This will help our AI generate relevant interview questions.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="job-title">Job Title</Label>
              <Input 
                id="job-title" 
                placeholder="e.g., Software Engineer, Marketing Manager" 
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="job-description">Job Description</Label>
              <Textarea
                id="job-description"
                placeholder="Paste the job description here or describe the role you're applying for..."
                className="min-h-32"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Starting...' : 'Start Interview'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 