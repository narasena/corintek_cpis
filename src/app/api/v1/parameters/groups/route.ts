import { NextRequest } from 'next/server';
import {
  createParameterGroup,
  fetchAllParameterGroups,
} from '@/features/api/features/v1/parameters/parameter.controller';

export async function GET(req: NextRequest) {
  return await fetchAllParameterGroups(req);
}

export async function POST(req: NextRequest) {
  return await createParameterGroup(req);
}
