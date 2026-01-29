import { fetchLogSheetById } from '@/features/api/features/v1/log-sheets/logSheets.controller';
import { NextRequest } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return await fetchLogSheetById(id);
}
