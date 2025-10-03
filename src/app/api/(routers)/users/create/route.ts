import { createUser } from '@/features/api/features/users/user.controller';
import { NextRequest } from 'next/server';
import { createErrorResponse } from '@/lib/error-handler';

// The route handler is the entry point. It only deals with HTTP.
export async function POST(req: NextRequest) {
  try {
    return await createUser(req);
  } catch (error) {
    console.error('Failed to create user:', error);
    return createErrorResponse(error);
  }
}
