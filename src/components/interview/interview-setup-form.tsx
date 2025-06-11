'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { interviewSetupSchema, type InterviewSetupInput } from '@/lib/validations/interview';

interface InterviewSessionResponse {
  message: string;
  session_id: string;
  questions: Array<{
    id: string;
    question_text: string;
    order: number;
  }>;
}

interface InterviewSetupFormProps {
  onSuccess?: (data: InterviewSessionResponse) => void;
}

export function InterviewSetupForm({ onSuccess }: InterviewSetupFormProps) {
  const [apiError, setApiError] = useState<string | null>(null);
  const [generatedSession, setGeneratedSession] = useState<InterviewSessionResponse | null>(null);
  const router = useRouter();

  const form = useForm<InterviewSetupInput>({
    resolver: zodResolver(interviewSetupSchema),
    defaultValues: {
      target_role: '',
      key_skills_focused: '',
      interview_type: 'Behavioral',
      job_description_context: '',
      requested_num_questions: 5,
    },
  });

  const onSubmit = async (data: InterviewSetupInput) => {
    setApiError(null);
    setGeneratedSession(null);

    try {
      // Process key_skills_focused into an array
      const processedData = {
        ...data,
        key_skills_focused: Array.isArray(data.key_skills_focused)
          ? data.key_skills_focused.map((skill: string) => skill.trim())
          : [data.key_skills_focused.trim()],
      };

      // Call the API
      const response = await fetch('/api/interviews/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(processedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate interview');
      }

      const responseData = (await response.json()) as InterviewSessionResponse;

      // Store the generated session data
      setGeneratedSession(responseData);

      // Show success message
      toast.success('Interview session created successfully!');

      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess(responseData);
      } else {
        // Navigate to the dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      }
    } catch (error) {
      const errorMessage =
        (error as Error).message || 'An error occurred while generating the interview';
      setApiError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Configure Your Practice Session</CardTitle>
        <CardDescription>
          Fill in the details below to generate a tailored interview experience.
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {/* Target Role Input */}
            <FormField
              control={form.control}
              name="target_role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Role</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Software Engineer, Product Manager" {...field} />
                  </FormControl>
                  <FormDescription>What role are you practicing for?</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Key Skills Input */}
            <FormField
              control={form.control}
              name="key_skills_focused"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key Skills to Focus On</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., React, Node.js, Problem Solving" {...field} />
                  </FormControl>
                  <FormDescription>Enter skills separated by commas.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Interview Type Select */}
            <FormField
              control={form.control}
              name="interview_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interview Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an interview type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Behavioral">Behavioral</SelectItem>
                      <SelectItem value="Technical - General">Technical - General</SelectItem>
                      <SelectItem value="HR Screening">HR Screening</SelectItem>
                      <SelectItem value="Situational">Situational</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Choose the type of interview.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Job Description Textarea (Optional) */}
            <FormField
              control={form.control}
              name="job_description_context"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Paste job description here for more targeted questions..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Providing a job description can help generate more relevant questions.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Number of Questions Select */}
            <FormField
              control={form.control}
              name="requested_num_questions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Questions</FormLabel>
                  <Select
                    onValueChange={(value: string) => field.onChange(parseInt(value))}
                    defaultValue={String(field.value)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select number of questions" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="3">3 Questions</SelectItem>
                      <SelectItem value="5">5 Questions</SelectItem>
                      <SelectItem value="7">7 Questions</SelectItem>
                      <SelectItem value="10">10 Questions</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    How many questions would you like in this session?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* API Error Display */}
            {apiError && (
              <Alert variant="destructive">
                <AlertDescription>{apiError}</AlertDescription>
              </Alert>
            )}

            {/* Success Message (temporary) */}
            {generatedSession && (
              <Alert>
                <AlertDescription>
                  Interview session created! Redirecting to dashboard...
                </AlertDescription>
              </Alert>
            )}
          </CardContent>

          <CardFooter className="flex justify-end">
            <Button
              type="submit"
              disabled={form.formState.isSubmitting || generatedSession !== null}
            >
              {form.formState.isSubmitting ? 'Generating...' : 'Generate Interview'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
