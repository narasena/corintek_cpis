import { fetchClientById } from '@/features/api/features/v1/clients/client.controller';
import { NextRequest } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return await fetchClientById(req, params.id);
}
