import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from './types';

/**
 * Ensures that all required storage buckets exist in Supabase
 * This should be called during app initialization
 */
export async function ensureStorageBuckets(supabase: SupabaseClient<Database>) {
  try {
    // Check if cv_uploads bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const cvUploadsBucketExists = buckets?.some(bucket => bucket.name === 'cv_uploads');

    // Create cv_uploads bucket if it doesn't exist
    if (!cvUploadsBucketExists) {
      await supabase.storage.createBucket('cv_uploads', {
        public: false,
        fileSizeLimit: 5 * 1024 * 1024, // 5MB
      });
      console.log('Created cv_uploads bucket');
    }

    // Add more bucket creation logic here as needed

    return { success: true };
  } catch (error) {
    console.error('Error ensuring storage buckets:', error);
    return { success: false, error };
  }
}
