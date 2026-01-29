import { NextRequest } from 'next/server';
import {
  fetchParameterGroupMembers,
  addParameterGroupMembers,
  removeParameterGroupMembers,
} from '@/features/api/features/v1/parameters/groups/parameterGroupMembers.controller';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return await fetchParameterGroupMembers(req, id);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return await addParameterGroupMembers(req, id);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return await removeParameterGroupMembers(req, id);
}
