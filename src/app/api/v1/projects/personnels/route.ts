import { fetchInternalPersonnels } from '@/features/api/features/v1/projects/project.controller';

export async function GET() {
  return fetchInternalPersonnels();
}
