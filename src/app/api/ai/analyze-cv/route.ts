import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/supabase/types';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { withTransaction } from '@/lib/utils/supabaseTransaction';
import { analyzeCVWithGemini } from '@/lib/services/googleService';

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

// Allowed file types
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export async function POST(request: NextRequest) {
  // Initialize Supabase client
  const supabase = createRouteHandlerClient<Database>({ cookies });

  try {
    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Please log in' }, { status: 401 });
    }

    const userId = session.user.id;

    // Parse form data
    const formData = await request.formData();
    const cvFile = formData.get('cvFile') as File | null;

    // Validate file existence
    if (!cvFile) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(cvFile.type)) {
      return NextResponse.json(
        {
          error: 'Invalid file type. Only PDF and DOCX files are allowed',
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (cvFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        },
        { status: 400 }
      );
    }

    return await withTransaction(supabase, async txManager => {
      // Find current CV to delete it later
      const { data: currentCvData } = await supabase
        .from('cv_uploads')
        .select('id, storage_path')
        .eq('user_id', userId)
        .eq('is_current_cv', true)
        .single();

      // Extract file details
      const fileName = cvFile.name;
      const fileType = cvFile.type;
      const fileSize = cvFile.size;

      // Create a timestamp for unique file naming
      const timestamp = new Date().getTime();
      const fileExtension = fileName.split('.').pop();
      const uniqueFileName = `${fileName.split('.')[0]}_${timestamp}.${fileExtension}`;

      // Define storage path
      const storagePath = `${userId}/cv_uploads/${uniqueFileName}`;

      // Extract text content based on file type
      let rawExtractedText = '';
      const arrayBuffer = await cvFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (fileType === 'application/pdf') {
        // Parse PDF
        const pdfData = await pdfParse(buffer);
        rawExtractedText = pdfData.text;
      } else if (
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        // Parse DOCX
        const docxResult = await mammoth.extractRawText({ buffer });
        rawExtractedText = docxResult.value;
      }

      // Analyze CV text with Google Gemini AI
      console.log('Analyzing CV with Google Gemini...');
      const analyzedCV = await analyzeCVWithGemini(rawExtractedText);

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('cv_uploads')
        .upload(storagePath, buffer, {
          contentType: fileType,
          cacheControl: '3600',
        });

      if (uploadError) {
        throw new Error(`Failed to upload file: ${uploadError.message}`);
      }

      // If there's a previous CV, mark it as not current
      if (currentCvData) {
        const { error: updateError } = await supabase
          .from('cv_uploads')
          .update({ is_current_cv: false })
          .eq('id', currentCvData.id);

        if (updateError) {
          throw new Error(`Failed to update previous CV status: ${updateError.message}`);
        }

        // Track the update operation
        txManager.trackUpdate('cv_uploads', currentCvData.id, { is_current_cv: true });

        // Remove the old file from storage
        const { error: removeError } = await supabase.storage
          .from('cv_uploads')
          .remove([currentCvData.storage_path]);

        if (removeError) {
          console.error('Failed to remove old CV file:', removeError);
          // Continue even if file removal fails - this is not critical
        }
      }

      // Save metadata to cv_uploads table
      const { data: cvUploadData, error: cvUploadError } = await supabase
        .from('cv_uploads')
        .insert({
          user_id: userId,
          file_name: fileName,
          storage_path: storagePath,
          mime_type: fileType,
          file_size_bytes: fileSize,
          is_current_cv: true,
          uploaded_at: new Date().toISOString(),
          analyzed_data: analyzedCV,
        })
        .select()
        .single();

      if (cvUploadError) {
        throw new Error(`Failed to save CV metadata: ${cvUploadError.message}`);
      }

      // Track the insert operation
      txManager.trackInsert('cv_uploads', cvUploadData.id);

      // Update profiles table with extracted text and structured data
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({
          cv_context: analyzedCV,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (profileUpdateError) {
        throw new Error(`Failed to update profile with CV text: ${profileUpdateError.message}`);
      }

      // Return success response with analyzed data
      return NextResponse.json(
        {
          message: 'CV uploaded, analyzed, and processed successfully.',
          cv_upload_id: cvUploadData.id,
          file_name: fileName,
          cv_summary: analyzedCV.summary,
          skills: analyzedCV.skills,
        },
        { status: 200 }
      );
    });
  } catch (error) {
    console.error('CV upload error:', error);
    return NextResponse.json(
      {
        error: `An unexpected error occurred: ${(error as Error).message}`,
      },
      { status: 500 }
    );
  }
}
