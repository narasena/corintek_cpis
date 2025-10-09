import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  const allCookies = req.cookies.getAll();

  if (token) {
    return NextResponse.json({
      message: 'Token Confirmed on Server',
      token: 'Token found  (value removed for security)',
      cookieCount: allCookies.length,
    });
  } else {
    return NextResponse.json({
      message: 'No Token Cookie Found on Server',
      allCookies: allCookies.map(c => c.name),
      cookieCount: allCookies.length,
    });
  }
}
