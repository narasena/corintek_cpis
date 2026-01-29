import { deleteUser } from '@/features/api/features/v1/users/user.controller';
import { NextRequest } from 'next/server';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // console.log('Delete user with id: ', id);
  return await deleteUser(req, id);
}
