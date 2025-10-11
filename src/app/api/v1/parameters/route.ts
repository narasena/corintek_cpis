import {
  createParameter,
  fetchAllParameters,
} from '@/features/api/features/v1/parameters/parameters.controller';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  return await fetchAllParameters(req);
}

export async function POST(req: NextRequest) {
  return await createParameter(req);
}
