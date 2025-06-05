import { MainLayout } from "@/components/layout/main-layout";
import { SignUpForm } from "@/components/auth/signup-form";

export default function SignUpPage() {
  return (
    <MainLayout>
      <div className="container flex items-center justify-center min-h-[80vh]">
        <SignUpForm />
      </div>
    </MainLayout>
  );
}
