import { MainLayout } from '@/components/layout/main-layout';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center py-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          AI-Powered Interview Practice
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-3xl">
          Prepare for your next job interview with our AI-powered mock interview platform. Practice
          answering common interview questions and receive personalized feedback to improve your
          skills.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link href="/dashboard">
            <Button size="lg">Get Started</Button>
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
