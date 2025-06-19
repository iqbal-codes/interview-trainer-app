import { Metadata } from 'next';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { InterviewSetupForm } from '@/components/interview/interview-setup-form';
import { MainLayout } from '@/components/layout/main-layout';

export const metadata: Metadata = {
  title: 'New Interview | Interview Trainer',
  description: 'Set up a new interview practice session',
};

export default function NewInterviewPage() {
  return (
    <MainLayout>
      <ProtectedRoute>
        <div className="container mx-auto p-4 md:p-8">
          <h1 className="text-3xl font-bold mb-6">Setup New Mock Interview</h1>
          <InterviewSetupForm />
        </div>
      </ProtectedRoute>
    </MainLayout>
  );
}
