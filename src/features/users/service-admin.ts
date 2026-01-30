import { prisma } from '@/lib/prisma';

// Additional utility functions for managing soft-deleted users

/**
 * Restore a soft-deleted user
 * Note: This doesn't update any data, just clears deletedAt
 */
export async function restoreUser(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new Error('User not found');
  }

  if (!user.deletedAt) {
    throw new Error('User is not deleted');
  }

  const restoredUser = await prisma.user.update({
    where: { id },
    data: {
      deletedAt: null,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      idNumber: true,
      email: true,
      phoneNumber: true,
      avatarUrl: true,
      role: true,
      employmentStatus: true,
      isActive: true,
      isBlocked: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
    },
  });

  return restoredUser;
}

/**
 * Permanently delete a user from database
 * WARNING: This is irreversible!
 */
export async function permanentlyDeleteUser(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new Error('User not found');
  }

  await prisma.user.delete({
    where: { id },
  });

  return { success: true };
}
