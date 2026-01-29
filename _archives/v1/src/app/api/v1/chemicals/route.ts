import {
  createChemical,
  fetchAllChemicals,
} from '@/features/api/features/v1/chemicals/chemicals.controller';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  return await createChemical(req);
}

export async function GET() {
  return await fetchAllChemicals();
}
