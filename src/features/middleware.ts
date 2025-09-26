import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  // This middleware will run for all API routes
  console.log(`Middleware triggered for API route: ${req.nextUrl.pathname}`);

  // You can perform checks here, like authentication
  // const isAuthenticated = req.headers.get('authorization');
  // if (!isAuthenticated) {
  //   return new NextResponse(
  //     JSON.stringify({ success: false, message: 'authentication failed' }),
  //     { status: 401, headers: { 'content-type': 'application/json' } }
  //   )
  // }

  // Call NextResponse.next() to continue to the API route or next middleware
  return NextResponse.next();
}

// The config object specifies which paths the middleware should run on
export const config = {
  // Match all API routes
  matcher: '/api/:path*',
};
