'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CVUpload } from '@/components/profile/cv-upload';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface Profile {
  full_name: string | null;
  cv_text_content: string | null;
}

interface CvUpload {
  file_name: string;
  uploaded_at: string;
}

interface CvUploadResponse {
  message: string;
  cv_upload_id: string;
  file_name: string;
  cv_text_preview?: string;
}

export function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentCv, setCurrentCv] = useState<CvUpload | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);

      try {
        const supabase = createClient();

        // Get current user
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          return;
        }

        setUser(session.user);

        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, cv_text_content')
          .eq('user_id', session.user.id)
          .single();

        if (profileError) {
          throw profileError;
        }

        setProfile(profileData);

        // Get current CV
        const { data: cvData, error: cvError } = await supabase
          .from('cv_uploads')
          .select('file_name, uploaded_at')
          .eq('user_id', session.user.id)
          .eq('is_current_cv', true)
          .order('uploaded_at', { ascending: false })
          .limit(1)
          .single();

        if (!cvError) {
          setCurrentCv(cvData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleCvUploadSuccess = (data: CvUploadResponse) => {
    // Update the current CV information
    setCurrentCv({
      file_name: data.file_name,
      uploaded_at: new Date().toISOString(),
    });

    // Update the CV text preview
    if (profile && data.cv_text_preview) {
      setProfile({
        ...profile,
        cv_text_content: data.cv_text_preview,
      });
    }
  };

  if (isLoading) {
    return <div className="py-8">Loading profile...</div>;
  }

  if (!user) {
    return <div className="py-8">Please log in to view your profile.</div>;
  }

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

      {/* User Information Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          {profile?.full_name && (
            <p>
              <strong>Name:</strong> {profile.full_name}
            </p>
          )}
          {/* Future: Display additional profile fields */}
        </CardContent>
      </Card>

      {/* CV Upload Section */}
      <CVUpload
        currentCvName={currentCv?.file_name}
        currentCvUploadDate={currentCv?.uploaded_at}
        cvTextPreview={profile?.cv_text_content || undefined}
        onUploadSuccess={handleCvUploadSuccess}
      />
    </div>
  );
}
