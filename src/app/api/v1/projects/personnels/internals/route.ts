import { fetchInternalPersonnels } from '@/features/api/features/v1/projects/project.controller';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  return fetchInternalPersonnels(req);
}
