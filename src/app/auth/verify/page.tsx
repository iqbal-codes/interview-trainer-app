import { MainLayout } from "@/components/layout/main-layout";
import { VerifyEmail } from "@/components/auth/verify-email";

export default function VerifyPage() {
  return (
    <MainLayout>
      <div className="container flex items-center justify-center min-h-[80vh]">
        <VerifyEmail />
      </div>
    </MainLayout>
  );
} 