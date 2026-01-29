import {
  createUser,
  fetchAllUsers,
} from '@/features/api/features/v1/users/user.controller';
import { NextRequest } from 'next/server';

export async function GET() {
  return await fetchAllUsers();
}

export async function POST(req: NextRequest) {
  return await createUser(req);
}
