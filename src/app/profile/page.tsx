import { MainLayout } from '@/components/layout/main-layout';
import { UserProfile } from '@/components/profile/user-profile';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile | AI Interview Practice',
  description: 'Manage your profile and CV for AI Interview Practice',
};

export default function ProfilePage() {
  return (
    <MainLayout>
      <ProtectedRoute>
        <UserProfile />
      </ProtectedRoute>
    </MainLayout>
  );
}
