import { MainLayout } from "@/components/layout/main-layout";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <MainLayout>
      <div className="container flex items-center justify-center min-h-[80vh]">
        <LoginForm />
      </div>
    </MainLayout>
  );
} 