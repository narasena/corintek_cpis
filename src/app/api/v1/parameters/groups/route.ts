import { NextRequest } from 'next/server';
import {
  createParameterGroup,
  fetchAllParameterGroups,
} from '@/features/api/features/v1/parameters/groups/parameterGroups.controller';

export async function GET() {
  return await fetchAllParameterGroups();
}

export async function POST(req: NextRequest) {
  return await createParameterGroup(req);
}
