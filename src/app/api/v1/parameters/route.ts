import {
  createParameter,
  fetchAllParameters,
} from '@/features/api/features/v1/parameters/parameters.controller';
import { NextRequest } from 'next/server';

export async function GET() {
  return await fetchAllParameters();
}

export async function POST(req: NextRequest) {
  return await createParameter(req);
}
