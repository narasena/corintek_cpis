import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const prefix = formData.get('prefix') as string || 'default';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Compress images only (simple server-side compression if needed, but for now, upload as-is)
    let uploadBody: Blob = file;
    let contentType = file.type || 'application/octet-stream';

    // Optional: Basic image compression could be added here if needed
    if (file.type.startsWith('image/')) {
      // For now, skip compression on server; handle in worker if required
      contentType = 'image/jpeg';
    }

    const timestamp = new Date(Date.now()).toISOString();
    const fileKey = `${prefix}-${timestamp}-${file.name}`;

    const response = await fetch(`${API_CONFIG.WORKER_URL}/${fileKey}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${API_CONFIG.AUTH_SECRET}`,
        'Content-Type': contentType
      },
      body: uploadBody
    });

    const text = await response.text();

    if (!response.ok) {
      return NextResponse.json({ error: text }, { status: response.status });
    }

    const url = `${API_CONFIG.WORKER_URL}/${fileKey}`;

    return NextResponse.json({ success: true, message: text, key: fileKey, url });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}