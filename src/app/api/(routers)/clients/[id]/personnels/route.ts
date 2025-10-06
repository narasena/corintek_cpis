import { createClientPersonnel, fetchClientPersonnel } from '@/features/api/features/clients/client.controller';
import { NextRequest } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return await createClientPersonnel(req, params.id);
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return await fetchClientPersonnel(req, params.id);
}
