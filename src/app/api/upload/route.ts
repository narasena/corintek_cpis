import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG } from '@/lib/config';
import { AppError } from '@/lib/app-error';
import { createErrorResponse } from '@/lib/error-handler';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const prefix = (formData.get('prefix') as string) || 'default';
    const customKey = formData.get('key') as string | null;

    if (!file) {
      throw new AppError({
        status: 400,
        message: 'No file uploaded',
        isExpose: true,
      });
    }

    // Compress images only (simple server-side compression if needed, but for now, upload as-is)
    const uploadBody: Blob = file;
    let contentType = file.type || 'application/octet-stream';

    // Optional: Basic image compression could be added here if needed
    if (file.type.startsWith('image/')) {
      // For now, skip compression on server; handle in worker if required
      contentType = 'image/jpeg';
    }

    let fileKey: string;
    if (customKey) {
      fileKey = customKey;
    } else {
      const timestamp = new Date(Date.now()).toISOString();
      const extension = file.name.split('.').pop() || '';
      fileKey = `${prefix}-${timestamp}-${file.name.replace(`.${extension}`, '')}.${extension}`;
    }

    const response = await fetch(`${API_CONFIG.WORKER_URL}/${fileKey}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${API_CONFIG.AUTH_SECRET}`,
        'Content-Type': contentType,
      },
      body: uploadBody,
    });

    const text = await response.text();

    if (!response.ok) {
      throw new AppError({
        status: response.status,
        message: text,
        isExpose: true,
      });
    }

    const url = `${API_CONFIG.WORKER_URL}/${fileKey}`;

    return NextResponse.json({
      success: true,
      message: text,
      key: fileKey,
      url,
      publicId: fileKey,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return createErrorResponse(error);
  }
}
