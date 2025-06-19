'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

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

import { interviewSetupSchema, type InterviewSetupInput } from '@/lib/validations/interview';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import interviewService from '@/lib/services/interviewService';


export function InterviewSetupForm() {
  const { mutate: createInterview, isPending: isLoading } = useMutation({
    mutationFn: (data: InterviewSetupInput) => interviewService.createInterview(data),
    onSuccess: () => {
      // Show success message
      toast.success('Interview session created successfully!');

      // Call the onSuccess callback if provided
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'An error occurred while generating the interview';
      toast.error(errorMessage);
    },
  });

  const form = useForm<InterviewSetupInput>({
    resolver: zodResolver(interviewSetupSchema),
    defaultValues: {
      target_role: '',
      interview_type: 'Behavioral',
      job_description_context: '',
      requested_num_questions: 5,
    },
  });

  const onSubmit = (data: InterviewSetupInput) => {
    createInterview(data);
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
          </CardContent>

          <CardFooter className="flex justify-end">
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Generating...' : 'Generate Interview'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
