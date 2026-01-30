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
  try {
    // Validate input
    const validatedData = userCreateSchema.parse(input);

    // Remove confirmPassword before passing to service (underscore prefix indicates intentionally unused)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...userData } = validatedData;

    // Call service
    const user = await createUser(userData);

    // Revalidate user list pages
    revalidatePath('/users');
    revalidatePath('/test/users');

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create user',
    };
  }
}

/**
 * Server Action: Get all users
 */
export async function getAllUsersAction(): Promise<
  TActionResponse<TUserResponse[]>
> {
  try {
    const users = await getAllUsers();

    return {
      success: true,
      data: users,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch users',
    };
  }
}

/**
 * Server Action: Get user by ID
 */
export async function getUserByIdAction(
  id: string
): Promise<TActionResponse<TUserResponse>> {
  try {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid user ID');
    }

    const user = await getUserById(id);

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch user',
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
  try {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid user ID');
    }

    // Validate input
    const validatedData = userUpdateSchema.parse(input);

    // Call service
    const user = await updateUser(id, validatedData);

    // Revalidate user pages
    revalidatePath('/users');
    revalidatePath('/test/users');
    revalidatePath(`/users/${id}`);

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update user',
    };
  }
}

/**
 * Server Action: Delete user (soft delete)
 */
export async function deleteUserAction(id: string): Promise<TActionResponse> {
  try {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid user ID');
    }

    await deleteUser(id);

    // Revalidate user pages
    revalidatePath('/users');
    revalidatePath('/test/users');

    return {
      success: true,
      data: { id },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete user',
    };
  }
}
