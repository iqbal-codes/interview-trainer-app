import { MainLayout } from "@/components/layout/main-layout";
import { SignUpForm } from "@/components/auth/signup-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | AI Interview Practice",
  description: "Create an account for AI Interview Practice",
};

export default function SignUpPage() {
  return (
    <MainLayout>
      <div className="flex items-center justify-center min-h-[80vh]">
        <SignUpForm />
      </div>
    </MainLayout>
  );
}
