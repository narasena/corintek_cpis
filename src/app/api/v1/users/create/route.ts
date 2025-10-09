import { createUser } from '@/features/api/features/v1/users/user.controller';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  return await createUser(req);
}
