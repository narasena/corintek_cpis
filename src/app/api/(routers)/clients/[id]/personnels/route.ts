import {
  createClientPersonnel,
  fetchClientPersonnel,
} from '@/features/api/features/clients/client.controller';
import { NextRequest } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return await createClientPersonnel(req, id);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return await fetchClientPersonnel(req, id);
}
