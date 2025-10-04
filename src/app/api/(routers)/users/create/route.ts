import { createUser } from '@/features/api/features/users/user.controller';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  return await createUser(req);
}
