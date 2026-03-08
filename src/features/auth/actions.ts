'use server';

import { z } from 'zod/v4';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { authenticateUser } from './service';
import { setAuthSession, deleteAuthSession } from '@/lib/auth-helpers';
import { authLoginSchema, TAuthLoginResponse } from '@/@types/auth.type';
import { TUserRole } from '@/@types/user.type';
import { AUTH_ROUTES, ERROR_MESSAGES, SUCCESS_MESSAGES } from './constants';

/**
 * Server action for user login
 * @param previousState - Previous state from useActionState
 * @param formData - Form data containing email and password
 * @returns Login response with success status and message
 */
export async function loginAction(
  previousState: TAuthLoginResponse | null,
  formData: FormData
): Promise<TAuthLoginResponse> {
  try {
    // Extract and validate input
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const validatedData = authLoginSchema.parse({ email, password });

    // Authenticate user
    const user = await authenticateUser(validatedData);

    // Create session (encapsulates JWT generation and cookie management)
    await setAuthSession({
      id: user.id,
      email: user.email,
      role: user.role as TUserRole,
    });

    // Revalidate paths
    revalidatePath(AUTH_ROUTES.HOME);

    // Return success - client will handle redirect
    return {
      success: true,
      message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  } catch (error: any) {
    let message = ERROR_MESSAGES.LOGIN_FAILED;

    if (error instanceof z.ZodError || error.name === 'ZodError') {
      message =
        error.errors?.[0]?.message || error.message || ERROR_MESSAGES.INPUT_INVALID;
    } else if (error instanceof Error) {
      message = error.message;
    }

    console.error('[CPIS-ERROR] Auth.loginAction', error);

    return {
      success: false,
      message,
    };
  }
}

/**
 * Server action for user logout
 */
export async function logoutAction(): Promise<void> {
  await deleteAuthSession();
  revalidatePath(AUTH_ROUTES.HOME);
  redirect(AUTH_ROUTES.LOGIN);
}
