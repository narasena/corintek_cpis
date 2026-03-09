import { prisma } from '@/lib/prisma';
import { TUserResponse } from '@/@types/user.type';
import { TAuthLoginInput } from '@/@types/auth.type';
import {
  isUserAuthValid,
  toUserResponse,
  userResponseSelect,
} from '../users/utils';
import { ERROR_MESSAGES } from './constants';
import { secureCompare } from './crypto';
import { logger } from '@/lib/logger';

/**
 * Authenticate user with email and password
 * @param input - Login credentials
 * @returns User data (without password) if authentication successful
 * @throws Error if authentication fails (generic error message for security)
 */
export async function authenticateUser(
  input: TAuthLoginInput
): Promise<TUserResponse> {
  const { email, password } = input;

  // 1. Find user by email (include password for verification and necessary relations for response)
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      ...userResponseSelect,
      password: true,
    },
  });

  // 2. Securely verify password (timing-attack safe mechanism encapsulated in secureCompare)
  const isAuthValid = await secureCompare(password, (user as any)?.password);

  // 3. Final validation (all failures return the same generic message to prevent account enumeration)
  // Check both the password/existence check and the account lifecycle status.
  if (!isAuthValid) {
    logger.error('Auth', 'authenticateUser', 'Invalid credentials (password mismatch or user not found)', { email });
    throw new Error(ERROR_MESSAGES.AUTHENTICATION_FAILED);
  }

  // user is guaranteed to be non-null if isAuthValid is true (per secureCompare implementation)
  if (!isUserAuthValid(user! as any)) {
    logger.error('Auth', 'authenticateUser', 'User status invalid (blocked/inactive/deleted)', { email, userId: user!.id });
    throw new Error(ERROR_MESSAGES.AUTHENTICATION_FAILED);
  }

  // 4. Audit Log Success (for security monitoring and audit trail)
  logger.auth('Auth', 'authenticateUser', 'Login successful', { email, userId: user!.id, role: user!.role });

  // 5. Return validated user data (schema strips the password)
  return toUserResponse(user! as any);
}

/**
 * Validates a user for an active session by ID.
 * Used for token refresh and session verification.
 * 
 * @param userId - User ID from JWT sub
 * @returns Validated user data or null if user is not found or fails status checks
 */
export async function validateSessionUser(
  userId: string
): Promise<TUserResponse | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: userResponseSelect,
  });

  // Return null if user doesn't exist or fails authentication lifecycle validation
  if (!user) {
    logger.error('Auth', 'validateSessionUser', 'Active session user not found', { userId });
    return null;
  }

  if (!isUserAuthValid(user as any)) {
    logger.error('Auth', 'validateSessionUser', 'Session user status invalid (blocked/inactive/deleted)', { userId });
    return null;
  }

  return toUserResponse(user as any);
}
