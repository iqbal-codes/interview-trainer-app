import * as z from 'zod';

export const interviewSetupSchema = z.object({
  target_role: z.string().min(3, { message: 'Target role must be at least 3 characters' }).trim(),
  key_skills_focused: z.union([
    z.string().min(1, { message: 'Please enter at least one skill' }).trim(),
    z.array(z.string().trim()).min(1, { message: 'Please enter at least one skill' }),
  ]),
  interview_type: z.enum(['Behavioral', 'Technical - General', 'HR Screening', 'Situational'], {
    required_error: 'Please select an interview type',
  }),
  job_description_context: z.string().trim().optional(),
  requested_num_questions: z
    .number({
      required_error: 'Please select the number of questions',
      invalid_type_error: 'Please select a valid number of questions',
    })
    .refine(val => [3, 5, 7, 10].includes(val), {
      message: 'Number of questions must be 3, 5, 7, or 10',
    }),
});

export type InterviewSetupInput = z.infer<typeof interviewSetupSchema>;
