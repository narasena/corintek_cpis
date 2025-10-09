import { UserRole } from '@/features/api/generated/prisma';
import jwt from 'jsonwebtoken';

interface IToken {
  id: string;
  role: UserRole;
}

export function createToken(params: IToken) {
  return jwt.sign(params, String(process.env.JWT_SECRET), {
    expiresIn: '7d',
  });
}

export function decodeToken(token: string) {
  return jwt.verify(token, String(process.env.JWT_SECRET));
}
