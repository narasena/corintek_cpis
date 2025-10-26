import { NextRequest } from 'next/server';
import { createLogSheet } from '@/features/api/features/v1/log-sheets/logSheets.controller';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return createLogSheet(id, req);
}
