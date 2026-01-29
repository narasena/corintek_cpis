import { NextRequest } from 'next/server';
import {
  fetchParameterGroupById,
  updateParameterGroup,
  deleteParameterGroup,
} from '@/features/api/features/v1/parameters/groups/parameterGroups.controller';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return await fetchParameterGroupById(req, id);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return await updateParameterGroup(req, id);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return await deleteParameterGroup(req, id);
}
