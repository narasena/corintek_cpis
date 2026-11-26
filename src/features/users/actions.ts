'use server';

import {
  userCreateSchema,
  userUpdateSchema,
  profileUpdateSchema,
  TUserResponse,
} from '@/@types/user.type';
import {
  createUser,
  updateUser,
  deleteUser,
  updateCurrentUserProfile,
} from './services/user-mutations';
import {
  getAllUsers,
  getTechniciansList,
  getUserById,
  getCurrentUserProfile,
} from './services/user-queries';
import { uploadUserAvatar } from './services/user-media';
import { revalidatePath } from 'next/cache';
import { actionFactory } from '@/features/auth/di';
import { RbacResource } from '@/lib/rbac';
import { signAvatarUrl, signAvatarUrls, signR2Url } from '@/lib/r2-sign';
import { z } from 'zod/v4';

const USER_PATHS = ['/users', '/test/users'] as const;

function revalidateUserPaths(userId?: string) {
  USER_PATHS.forEach(path => revalidatePath(path));
  if (userId) {
    revalidatePath(`/users/${userId}`);
  }
}

/**
 * Server Action: Create a new user
 */
export const createUserAction = actionFactory.protected(
  async ({ input, actor }) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...userData } = input;
    const user = await createUser(actor, userData);

    revalidateUserPaths();

    return user;
  },
  {
    schema: userCreateSchema,
    metadata: {
      rbac: { resource: RbacResource.USERS_ADMIN, capability: 'create' },
    },
  }
);

/**
 * Server Action: Get all users
 */
export const getAllUsersAction = actionFactory.protected(
  async ({ actor }) => {
    // Sign at the action boundary: query results may be served from cache,
    // and a cached signature would expire.
    return signAvatarUrls(await getAllUsers(actor));
  },
  {
    metadata: {
      rbac: { resource: RbacResource.USERS_ADMIN, capability: 'read' },
    },
  }
);

/**
 * Server Action: Get technicians list
 */
export const getTechniciansListAction = actionFactory.protected(
  async ({ actor }) => {
    // Technician responses carry no avatarUrl; nothing to sign.
    return getTechniciansList(actor);
  },
  {
    metadata: {
      rbac: { resource: RbacResource.PROJECTS_LIST, capability: 'read' },
    },
  }
);

/**
 * Server Action: Get user by ID
 */
export const getUserByIdAction = actionFactory.protected(
  async ({ input, actor }) => {
    const user = await getUserById(actor, input);
    if (!user) throw new Error('Pengguna tidak ditemukan');
    return signAvatarUrl(user);
  },
  {
    schema: z.string().uuid(),
    metadata: {
      rbac: { resource: RbacResource.USERS_ADMIN, capability: 'read' },
    },
  }
);

/**
 * Server Action: Update user
 */
export const updateUserAction = actionFactory.protected(
  async ({ input, actor }) => {
    const { id, confirmPassword, ...data } = input as any;
    const user = await updateUser(actor, id, data);

    revalidateUserPaths(id);

    return user;
  },
  {
    schema: userUpdateSchema,
    metadata: {
      rbac: { resource: RbacResource.USERS_ADMIN, capability: 'update' },
    },
  }
);

/**
 * Server Action: Delete user (soft delete)
 */
export const deleteUserAction = actionFactory.protected(
  async ({ input, actor }) => {
    await deleteUser(actor, input);

    revalidateUserPaths();

    return { id: input };
  },
  {
    schema: z.string().uuid(),
    metadata: {
      rbac: { resource: RbacResource.USERS_ADMIN, capability: 'delete' },
    },
  }
);

export const getCurrentUserProfileAction = actionFactory.protected(
  async ({ actor }) => {
    return signAvatarUrl(await getCurrentUserProfile(actor.id));
  }
);

export const updateCurrentUserProfileAction = actionFactory.protected(
  async ({ input, actor }) => {
    const profile = await updateCurrentUserProfile(actor.id, input);
    revalidatePath('/my-profile');
    return profile;
  },
  {
    schema: profileUpdateSchema,
  }
);

export const uploadAvatarAction = actionFactory.protected(
  async ({ input: formData, actor }) => {
    const file = formData.get('file') as File | null;
    const url = await uploadUserAvatar(actor.id, file);

    // Signed for immediate browser rendering; the stored value is unsigned.
    return { url: await signR2Url(url) };
  }
) as (
  formData: FormData
) => Promise<{ success: boolean; data: { url: string }; error?: string }>;
