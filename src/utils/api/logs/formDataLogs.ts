import { NextRequest, NextResponse } from 'next/server';

export default async function formDataLogs(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.NODE_ENV === 'test'
    ) {
      console.log(
        'Full FormData entries:',
        Array.from(formData.entries()).map(
          ([k, v]) =>
            `${k}: ${v instanceof File ? `File(${v.name}, ${v.size} bytes)` : v}`
        )
      );
    }
  } catch (error) {
    console.error('FormData parse error:', error);
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }
  return formData;
}
