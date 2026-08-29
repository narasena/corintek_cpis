'use server';

import { authLoginSchema, TAuthLoginResponse } from '@/@types/auth.type';
import { TUserRole } from '@/@types/user.type';
import { hashPassword } from '@/features/auth/crypto';
import { deleteAuthSession, setAuthSession } from '@/lib/auth-helpers';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { formatZodError, isZodError } from '@/lib/utils/validation';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { AUTH_ROUTES, ERROR_MESSAGES, SUCCESS_MESSAGES } from './constants';
import { authenticateUser } from './service';

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
    let message: string = ERROR_MESSAGES.LOGIN_FAILED;

    if (isZodError(error)) {
      message = formatZodError(error, ERROR_MESSAGES.INPUT_INVALID);
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

/**
 * Server action for the demo (portfolio) login bypass.
 *
 * One-click login as a demo ADMIN or CLIENT user — visible only when
 * NEXT_PUBLIC_DEMO_MODE=true (development only). Reuses the normal
 * session path (setAuthSession) so the demo user behaves like any login.
 *
 * The demo user is created on first use if missing (idempotent), so a
 * recruiter can explore the dev DB as-is without a seed step.
 *
 * @param role - 'admin' or 'client' demo persona
 * @returns true on success (client then handles redirect), false on failure
 */
export async function demoLoginAction(
  role: 'admin' | 'client'
): Promise<boolean> {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
    logger.warn('Auth', 'demoLoginAction', 'Demo mode is disabled', { role });
    redirect(AUTH_ROUTES.LOGIN);
  }

  const email =
    role === 'admin'
      ? process.env.DEMO_ADMIN_EMAIL
      : process.env.DEMO_CLIENT_EMAIL;

  if (!email) {
    logger.error('Auth', 'demoLoginAction', 'Demo email not configured', {
      role,
    });
    redirect(AUTH_ROUTES.LOGIN);
  }

  try {
    let user = await prisma.user.findUnique({ where: { email } });

    // Idempotent demo-user creation on first login (development data only)
    if (!user) {
      user = await prisma.user.create({
        data:
          role === 'admin'
            ? {
                firstName: 'Demo',
                lastName: 'Admin',
                email,
                phoneNumber: '0811000001', // unique, dummy range — avoid colliding with seed-data
                password: await hashPassword('demo-password-2026'),
                role: 'ADMIN',
                employmentStatus: 'PERMANENT',
                isActive: true,
                isBlocked: false,
              }
            : {
                firstName: 'Demo',
                lastName: 'Client',
                email,
                phoneNumber: '0888000002', // unique, dummy range — avoid colliding with seed-data
                password: await hashPassword('demo-password-2026'),
                role: 'CLIENT_SUPERVISOR',
                employmentStatus: 'PERMANENT',
                isActive: true,
                isBlocked: false,
                // Link to an existing Client so the portal has context.
                clientId: (
                  await prisma.client.findFirst({
                    select: { id: true },
                    orderBy: { createdAt: 'asc' },
                  })
                )?.id,
              },
      });

      // CLIENT-role access is granted via an active ProjectAssignment
      // (see buildProjectAccessWhere), not via clientId alone — create one.
      if (role === 'client') {
        const demoProject = await prisma.project.findFirst({
          where: { deletedAt: null },
          select: { id: true },
          orderBy: { createdAt: 'asc' },
        });

        if (demoProject) {
          await prisma.projectAssignment.create({
            data: {
              projectId: demoProject.id,
              userId: user.id,
              role: 'CLIENT_PIC',
              isActive: true,
            },
          });
        }
      }

      logger.auth('Auth', 'demoLoginAction', 'Demo user created', {
        role,
        email,
      });
    }

    await setAuthSession({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    revalidatePath(AUTH_ROUTES.HOME);
    // NOTE: redirect() throws NEXT_REDIRECT internally — must stay OUTSIDE the
    // try/catch, otherwise it is swallowed as a "login failed" error.
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Auth', 'demoLoginAction', 'Demo login failed', {
      role,
      message,
    });
    return false;
  }

  redirect(AUTH_ROUTES.HOME);
}
