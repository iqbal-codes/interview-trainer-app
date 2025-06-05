import { MainLayout } from "@/components/layout/main-layout";
import { InterviewForm } from "@/components/interview/interview-form";

export default function NewInterviewPage() {
  return (
    <MainLayout>
      <div className="container max-w-3xl py-10">
        <h1 className="text-3xl font-bold mb-6">Start a New Interview</h1>
        <InterviewForm />
      </div>
    </MainLayout>
  );
} 