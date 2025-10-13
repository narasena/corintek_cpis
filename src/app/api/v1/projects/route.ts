import {
  createProject,
  fetchAllProjects,
} from '@/features/api/features/v1/projects/project.controller';
import { NextRequest } from 'next/server';

export async function GET() {
  return await fetchAllProjects();
}

export async function POST(req: NextRequest) {
  return await createProject(req);
}
