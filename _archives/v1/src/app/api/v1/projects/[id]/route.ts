import { fetchProjectById } from '@/features/api/features/v1/projects/project.controller';
import { NextRequest } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return await fetchProjectById(req, id);
}
