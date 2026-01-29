import { NextRequest } from 'next/server';
import { fetchAssignedProjects } from '@/features/api/features/v1/projects/project.controller';

export async function GET(req: NextRequest) {
  return await fetchAssignedProjects(req);
}
