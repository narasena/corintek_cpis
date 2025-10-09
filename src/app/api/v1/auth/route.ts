import { userLogin } from '@/features/api/features/v1/auth/auth.controller';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  return await userLogin(req);
}
