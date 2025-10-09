import {
  createProject,
  fetchAllProjects,
} from '@/features/api/features/projects/project.controller';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  return await fetchAllProjects(req);
}

export async function POST(req: NextRequest) {
  return await createProject(req);
}
