import {
  createParameterLimit,
  fetchAllParameterLimits,
} from '@/features/api/features/v1/parameters/limits/parameterLimits.controller';
import { NextRequest } from 'next/server';

export async function GET() {
  return await fetchAllParameterLimits();
}

export async function POST(req: NextRequest) {
  return await createParameterLimit(req);
}
