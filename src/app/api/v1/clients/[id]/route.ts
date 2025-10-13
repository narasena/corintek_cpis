import { fetchClientById } from '@/features/api/features/v1/clients/client.controller';
import { NextRequest } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return await fetchClientById(req, id);
}
