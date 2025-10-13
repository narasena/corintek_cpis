import { fetchAllUsers } from '@/features/api/features/v1/users/user.controller';

export async function GET() {
  return await fetchAllUsers();
}
