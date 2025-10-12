import { NextRequest } from 'next/server';
import {
  fetchParameterGroupMembers,
  addParameterGroupMembers,
  removeParameterGroupMembers,
} from '@/features/api/features/v1/parameters/groups/parameterGroupMembers.controller';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return await fetchParameterGroupMembers(req, params.id);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return await addParameterGroupMembers(req, params.id);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return await removeParameterGroupMembers(req, params.id);
}
