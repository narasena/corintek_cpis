'use server';

import {
  userCreateSchema,
  userUpdateSchema,
  TUserCreateInput,
  TUserUpdateInput,
} from '@/@types/user.type';
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from './service';
import { revalidatePath } from 'next/cache';
import { TUserResponse } from '@/@types/user.type';
import { getCurrentUser } from '@/lib/auth-helpers';

type TActionResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Server Action: Create a new user
 */
export async function createUserAction(
  input: TUserCreateInput
): Promise<TActionResponse<TUserResponse>> {
  const actor = await getCurrentUser();
  if (!actor) return { success: false, error: 'Unauthorized' };

  try {
    // Validate input
    const validatedData = userCreateSchema.parse(input);

    // Remove confirmPassword before passing to service (underscore prefix indicates intentionally unused)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...userData } = validatedData;

    // Call service
    const user = await createUser(actor, userData);

    // Revalidate user list pages
    revalidatePath('/users');
    revalidatePath('/test/users');

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    console.error('[CPIS-ERROR] Users.Create:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gagal membuat pengguna',
    };
  }
}

/**
 * Server Action: Get all users
 */
export async function getAllUsersAction(): Promise<
  TActionResponse<TUserResponse[]>
> {
  const actor = await getCurrentUser();
  if (!actor) return { success: false, error: 'Unauthorized' };

  try {
    const users = await getAllUsers(actor);

    return {
      success: true,
      data: users,
    };
  } catch (error) {
    console.error('[CPIS-ERROR] Users.List:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Gagal mengambil data pengguna',
    };
  }
}

/**
 * Server Action: Get user by ID
 */
export async function getUserByIdAction(
  id: string
): Promise<TActionResponse<TUserResponse>> {
  const actor = await getCurrentUser();
  if (!actor) return { success: false, error: 'Unauthorized' };

  try {
    if (!id || typeof id !== 'string') {
      throw new Error('ID pengguna tidak valid');
    }

    const user = await getUserById(actor, id);

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    console.error('[CPIS-ERROR] Users.GetById:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Gagal mengambil data pengguna',
    };
  }
}

/**
 * Server Action: Update user
 */
export async function updateUserAction(
  id: string,
  input: TUserUpdateInput
): Promise<TActionResponse<TUserResponse>> {
  const actor = await getCurrentUser();
  if (!actor) return { success: false, error: 'Unauthorized' };

  try {
    if (!id || typeof id !== 'string') {
      throw new Error('ID pengguna tidak valid');
    }

    // Validate input
    const validatedData = userUpdateSchema.parse(input);

    // Call service
    const user = await updateUser(actor, id, validatedData);

    // Revalidate user pages
    revalidatePath('/users');
    revalidatePath('/test/users');
    revalidatePath(`/users/${id}`);

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    console.error('[CPIS-ERROR] Users.Update:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Gagal memperbarui pengguna',
    };
  }
}

/**
 * Server Action: Delete user (soft delete)
 */
export async function deleteUserAction(id: string): Promise<TActionResponse> {
  const actor = await getCurrentUser();
  if (!actor) return { success: false, error: 'Unauthorized' };

  try {
    if (!id || typeof id !== 'string') {
      throw new Error('ID pengguna tidak valid');
    }

    await deleteUser(actor, id);

    // Revalidate user pages
    revalidatePath('/users');
    revalidatePath('/test/users');

    return {
      success: true,
      data: { id },
    };
  } catch (error) {
    console.error('[CPIS-ERROR] Users.Delete:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Gagal menghapus pengguna',
    };
  }
}
