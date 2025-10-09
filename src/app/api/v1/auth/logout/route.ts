import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const res = NextResponse.json(
    { message: 'Logout successful' },
    { status: 200 }
  );

  // Clear the cookie by setting its maxAge to a past date
  res.cookies.set('auth_token', '', {
    maxAge: -1,
    path: '/',
  });

  return res;
}
