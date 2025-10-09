import { fetchAllUsers } from '@/features/api/features/v1/users/user.controller';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  return await fetchAllUsers(req);
}
