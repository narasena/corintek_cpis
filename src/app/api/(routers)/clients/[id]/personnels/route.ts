import { createClientPersonnel } from '@/features/api/features/clients/client.controller';
import { NextRequest } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return await createClientPersonnel(req, params.id);
}
