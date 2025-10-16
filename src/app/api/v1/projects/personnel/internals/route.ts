import { fetchInternalPersonnel } from '@/features/api/features/v1/projects/project.controller';

export async function GET() {
  return fetchInternalPersonnel();
}
