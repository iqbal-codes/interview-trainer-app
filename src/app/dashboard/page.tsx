import { Metadata } from 'next';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { MainLayout } from '@/components/layout/main-layout';
import { DashboardContent } from '@/components/dashboard/dashboard-content';

export const metadata: Metadata = {
  title: 'Dashboard | Interview Trainer',
  description: 'Set up a new interview practice session',
};

export default function DashboardPage() {
  return (
    <MainLayout>
      <ProtectedRoute>
        <div className="container mx-auto p-4 md:p-8">
          <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
          <DashboardContent />
        </div>
      </ProtectedRoute>
    </MainLayout>
  );
}
