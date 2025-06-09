import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/supabase/types';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

// Allowed file types
const ALLOWED_FILE_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

export async function POST(request: NextRequest) {
  try {
    // Initialize Supabase client
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
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
      return NextResponse.json({ 
        error: 'Invalid file type. Only PDF and DOCX files are allowed' 
      }, { status: 400 });
    }

    // Validate file size
    if (cvFile.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB` 
      }, { status: 400 });
    }

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
    let extractedText = '';
    const arrayBuffer = await cvFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (fileType === 'application/pdf') {
      // Parse PDF
      const pdfData = await pdfParse(buffer);
      extractedText = pdfData.text;
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // Parse DOCX
      const docxResult = await mammoth.extractRawText({ buffer });
      extractedText = docxResult.value;
    }

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('cv_uploads')
      .upload(storagePath, buffer, {
        contentType: fileType,
        cacheControl: '3600',
      });

    if (uploadError) {
      return NextResponse.json({ 
        error: `Failed to upload file: ${uploadError.message}` 
      }, { status: 500 });
    }

    // Update all previous CV uploads to is_current_cv = false
    await supabase
      .from('cv_uploads')
      .update({ is_current_cv: false })
      .eq('user_id', userId);

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
      })
      .select()
      .single();

    if (cvUploadError) {
      return NextResponse.json({ 
        error: `Failed to save CV metadata: ${cvUploadError.message}` 
      }, { status: 500 });
    }

    // Update profiles table with extracted text
    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({ 
        cv_text_content: extractedText,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (profileUpdateError) {
      return NextResponse.json({ 
        error: `Failed to update profile with CV text: ${profileUpdateError.message}` 
      }, { status: 500 });
    }

    // Return success response
    return NextResponse.json({
      message: 'CV uploaded and processed successfully.',
      cv_upload_id: cvUploadData.id,
      file_name: fileName,
      cv_text_preview: extractedText.substring(0, 200) + (extractedText.length > 200 ? '...' : '')
    }, { status: 200 });

  } catch (error) {
    console.error('CV upload error:', error);
    return NextResponse.json({ 
      error: `An unexpected error occurred: ${(error as Error).message}` 
    }, { status: 500 });
  }
} 