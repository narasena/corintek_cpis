import { fetchAllClients } from '@/features/api/features/clients/client.controller';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  return await fetchAllClients(req);
}
