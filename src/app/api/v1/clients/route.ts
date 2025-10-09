import {
  createClient,
  fetchAllClients,
} from '@/features/api/features/v1/clients/client.controller';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  return await fetchAllClients(req);
}

export async function POST(req: NextRequest) {
  return await createClient(req);
}
