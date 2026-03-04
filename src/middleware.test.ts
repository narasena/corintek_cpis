import { describe, it, expect, vi, beforeEach } from 'vitest';
import { middleware } from './middleware';
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './lib/jwt';

vi.mock('./lib/jwt', () => ({
  verifyToken: vi.fn(),
}));

// Mock NextResponse.redirect and NextResponse.next
vi.mock('next/server', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/server')>();
  return {
    ...actual,
    NextResponse: {
      next: vi.fn(() => ({ type: 'next' })),
      redirect: vi.fn((url) => ({ type: 'redirect', url })),
    },
  };
});

describe('Middleware', () => {
  const baseUrl = 'http://localhost:3000';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects unauthenticated user to login from protected route', async () => {
    const req = new NextRequest(new URL('/users', baseUrl));
    // No cookie set
    
    const res = await middleware(req);
    
    expect(res.type).toBe('redirect');
    expect(res.url.toString()).toContain('/login');
    expect(res.url.toString()).toContain('from=%2Fusers');
  });

  it('allows unauthenticated user to access public routes', async () => {
    const req = new NextRequest(new URL('/login', baseUrl));
    
    const res = await middleware(req);
    
    expect(NextResponse.next).toHaveBeenCalled();
  });

  it('redirects authenticated user away from login to /users', async () => {
    const req = new NextRequest(new URL('/login', baseUrl));
    req.cookies.set('auth_token', 'valid-token');
    vi.mocked(verifyToken).mockResolvedValue({ id: '1', role: 'ADMIN' });
    
    const res = await middleware(req);
    
    expect(res.type).toBe('redirect');
    expect(res.url.toString()).toContain('/users');
  });

  it('allows authenticated user with correct role to access protected route', async () => {
    const req = new NextRequest(new URL('/users', baseUrl));
    req.cookies.set('auth_token', 'valid-token');
    vi.mocked(verifyToken).mockResolvedValue({ id: '1', role: 'ADMIN' });
    
    const res = await middleware(req);
    
    expect(NextResponse.next).toHaveBeenCalled();
  });

  it('redirects authenticated user to /forbidden when role lacks access', async () => {
    const req = new NextRequest(new URL('/users', baseUrl));
    req.cookies.set('auth_token', 'valid-token');
    // Technician cannot access /users (ADMIN only)
    vi.mocked(verifyToken).mockResolvedValue({ id: '2', role: 'TECHNICIAN' });
    
    const res = await middleware(req);
    
    expect(res.type).toBe('redirect');
    expect(res.url.toString()).toContain('/forbidden');
  });

  it('bypasses static files and api routes', async () => {
    const staticReq = new NextRequest(new URL('/_next/static/chunks/main.js', baseUrl));
    await middleware(staticReq);
    expect(NextResponse.next).toHaveBeenCalled();

    const apiReq = new NextRequest(new URL('/api/health', baseUrl));
    await middleware(apiReq);
    expect(NextResponse.next).toHaveBeenCalled();
    
    const fileReq = new NextRequest(new URL('/image.png', baseUrl));
    await middleware(fileReq);
    expect(NextResponse.next).toHaveBeenCalled();
  });
});
