import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/features/api/connection/prisma';

interface ITokenPayload {
  id: string;
  role: string;
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as ITokenPayload;

    if (!decoded || !decoded.id) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        avatarUrl: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    // This will catch errors like invalid signature, token expired, etc.
    return NextResponse.json(
      { message: 'Invalid or expired token' },
      { status: 401 }
    );
  }
}
