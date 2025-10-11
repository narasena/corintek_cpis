import { NextRequest } from 'next/server';
import {
  createParameterGroup,
  fetchAllParameterGroups,
} from '@/features/api/features/v1/parameters/groups/parameterGroups.controller';

export async function GET(req: NextRequest) {
  return await fetchAllParameterGroups(req);
}

export async function POST(req: NextRequest) {
  return await createParameterGroup(req);
}
