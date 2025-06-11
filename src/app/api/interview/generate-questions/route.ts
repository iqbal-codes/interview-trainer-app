import { NextResponse } from 'next/server';
import { generateInterviewQuestions } from '@/lib/api/llm';

export async function POST(request: Request) {
  try {
    const { jobTitle, jobDescription, count } = await request.json();

    if (!jobTitle) {
      return NextResponse.json({ error: 'Job title is required' }, { status: 400 });
    }

    const questions = await generateInterviewQuestions({
      jobTitle,
      jobDescription,
      count,
    });

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json({ error: 'Failed to generate interview questions' }, { status: 500 });
  }
}
