import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Content-Type:', request.headers.get('content-type'));

    // Try to parse the form data
    try {
      const formData = await request.formData();
      const entries = Array.from(formData.entries()).map(([key, value]) => {
        if (value instanceof Blob) {
          return [key, `Blob: ${value.size} bytes, type: ${value.type}`];
        }
        return [key, value];
      });

      console.log('FormData parsed successfully', Object.fromEntries(entries));

      // Return success response
      return NextResponse.json({
        success: true,
        message: 'Form data received successfully',
        data: Object.fromEntries(entries),
      });
    } catch (formError) {
      console.error('Error parsing form data:', formError);

      // Try to read the body as text
      const bodyText = await request.text();
      console.log('Request body (first 200 chars):', bodyText.substring(0, 200));

      return NextResponse.json(
        {
          success: false,
          error: `Failed to parse form data: ${(formError as Error).message}`,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Unexpected error in test-form API:', error);
    return NextResponse.json(
      {
        success: false,
        error: `Unexpected error: ${(error as Error).message}`,
      },
      { status: 500 }
    );
  }
}
