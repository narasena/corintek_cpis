'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { authenticateUser } from './service';
import { generateToken } from '@/lib/jwt';
import { getAuthCookieName } from '@/lib/auth-helpers';
import { authLoginSchema, TAuthLoginResponse } from '@/@types/auth.type';
import { TUserRole } from '@/@types/user.type';

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
    const user = await authenticateUser(
      validatedData.email,
      validatedData.password
    );

    // Generate JWT token
    const token = await generateToken({
      id: user.id,
      email: user.email,
      role: user.role as TUserRole,
    });

    // Set httpOnly cookie
    const cookieStore = await cookies();
    cookieStore.set(getAuthCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Revalidate paths
    revalidatePath('/');
    revalidatePath('/users');

    // Return success - client will handle redirect
    return {
      success: true,
      message: 'Login berhasil',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Login gagal',
    };
  }
}

/**
 * Server action for user logout
 */
export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(getAuthCookieName());
  revalidatePath('/');
  redirect('/login');
}
