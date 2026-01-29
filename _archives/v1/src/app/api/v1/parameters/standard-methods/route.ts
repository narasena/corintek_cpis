import { fetchAllStandardMethods } from '@/features/api/features/v1/parameters/standard-methods/standardMethods.controller';

export async function GET() {
  return fetchAllStandardMethods();
}
