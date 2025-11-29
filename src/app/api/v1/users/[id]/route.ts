import { deleteUser } from '@/features/api/features/v1/users/user.controller';
import { NextRequest } from 'next/server';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return deleteUser(req, id);
}
