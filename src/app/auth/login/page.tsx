import { MainLayout } from "@/components/layout/main-layout";
import { LoginForm } from "@/components/auth/login-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | AI Interview Practice",
  description: "Login to your AI Interview Practice account",
};

export default function LoginPage() {
  return (
    <MainLayout>
      <div className="flex items-center justify-center min-h-[80vh]">
        <LoginForm />
      </div>
    </MainLayout>
  );
} 