import { prisma } from '@/lib/prisma';
import { comparePassword } from '@/lib/auth-helpers';
import { TUserResponse } from '@/@types/user.type';

/**
 * Authenticate user with email and password
 * @param email - User email
 * @param password - Plain text password
 * @returns User data (without password) if authentication successful
 * @throws Error if authentication fails
 */
export async function authenticateUser(
  email: string,
  password: string
): Promise<TUserResponse> {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  // Check if user exists
  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Check if user is blocked
  if (user.isBlocked) {
    throw new Error('Account is blocked. Please contact administrator.');
  }

  // Check if user is active
  if (!user.isActive) {
    throw new Error('Account is inactive. Please contact administrator.');
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // Return user data without password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword as TUserResponse;
}

/**
 * Get user by ID (for token refresh or user info retrieval)
 * @param userId - User ID
 * @returns User data without password
 */
export async function getUserById(
  userId: string
): Promise<TUserResponse | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return null;
  }

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword as TUserResponse;
}
