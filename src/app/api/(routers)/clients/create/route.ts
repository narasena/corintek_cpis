import { createClient } from '@/features/api/features/clients/client.controller';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  return await createClient(req);
}
