'use server';

import {
  userCreateSchema,
  userUpdateSchema,
  profileUpdateSchema,
  TUserCreateInput,
  TUserUpdateInput,
  TUserResponse,
  ICurrentUserProfile,
} from '@/@types/user.type';
import {
  createUser,
  getAllUsers,
  getTechniciansList,
  getUserById,
  updateUser,
  deleteUser,
  getCurrentUserProfile,
  updateCurrentUserProfile,
} from './service';
import { revalidatePath, revalidateTag } from 'next/cache';
import { getCurrentUser } from '@/lib/auth-helpers';
import { uploadToR2 } from '@/lib/r2-upload';
import { ECacheTag } from '../cache/tags';

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

    // CG-05: Cache invalidation
    revalidateTag(ECacheTag.USERS, 'max');
    revalidateTag(ECacheTag.USERS_TECHNICIANS, 'max');
    // revalidatePath('/users'); // fallback
    // revalidatePath('/test/users'); // fallback

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
 * Server Action: Get technicians list
 */
export async function getTechniciansListAction(): Promise<
  TActionResponse<TUserResponse[]>
> {
  const actor = await getCurrentUser();
  if (!actor) return { success: false, error: 'Unauthorized' };

  try {
    const technicians = await getTechniciansList(actor);

    return {
      success: true,
      data: technicians,
    };
  } catch (error) {
    console.error('[CPIS-ERROR] Users.TechniciansList:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Gagal mengambil daftar teknisi',
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

    // CG-05: Cache invalidation
    revalidateTag(ECacheTag.USERS, 'max');
    revalidateTag(ECacheTag.USERS_TECHNICIANS, 'max');
    // revalidatePath('/users'); // fallback
    // revalidatePath('/test/users'); // fallback
    // revalidatePath(`/users/${id}`); // fallback

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

    // CG-05: Cache invalidation
    revalidateTag(ECacheTag.USERS, 'max');
    revalidateTag(ECacheTag.USERS_TECHNICIANS, 'max');
    // revalidatePath('/users'); // fallback
    // revalidatePath('/test/users'); // fallback

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

export async function getCurrentUserProfileAction(): Promise<
  TActionResponse<ICurrentUserProfile>
> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  try {
    const profile = await getCurrentUserProfile(user.id);
    return { success: true, data: profile };
  } catch (error) {
    console.error('[CPIS-ERROR] Users.GetCurrentProfile:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Gagal mengambil data profil',
    };
  }
}

export async function updateCurrentUserProfileAction(
  input: unknown
): Promise<TActionResponse<ICurrentUserProfile>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  try {
    const validatedData = profileUpdateSchema.parse(input);
    const profile = await updateCurrentUserProfile(user.id, validatedData);
    // CG-05: Cache invalidation
    revalidateTag(ECacheTag.USERS, 'max');
    // revalidatePath('/my-profile'); // fallback
    return { success: true, data: profile };
  } catch (error) {
    console.error('[CPIS-ERROR] Users.UpdateCurrentProfile:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Gagal memperbarui profil',
    };
  }
}

export async function uploadAvatarAction(
  formData: FormData
): Promise<TActionResponse<{ url: string }>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

  try {
    const file = formData.get('file') as File | null;
    if (!file) throw new Error('File tidak ditemukan');
    if (!file.type.startsWith('image/'))
      throw new Error('File harus berupa gambar');
    if (file.size > MAX_AVATAR_SIZE)
      throw new Error('Ukuran file maksimal 5MB');

    const buffer = Buffer.from(await file.arrayBuffer());
    const key = `avatars/${user.id}/${Date.now()}-${file.name}`;
    const url = await uploadToR2({ key, body: buffer, contentType: file.type });

    return { success: true, data: { url } };
  } catch (error) {
    console.error('[CPIS-ERROR] Users.UploadAvatar:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gagal mengupload avatar',
    };
  }
}
