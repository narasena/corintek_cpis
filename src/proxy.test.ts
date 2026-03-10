import { describe, it, expect, vi, beforeEach } from 'vitest';
import { proxy } from './proxy';
import { NextRequest, NextResponse } from 'next/server';

describe('Proxy (Thin Proxy Pattern)', () => {
  const baseUrl = 'http://localhost:3000';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects unauthenticated user to login from protected route', async () => {
    const req = new NextRequest(new URL('/users', baseUrl));
    // No cookie set
    
    const res = await proxy(req);
    
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/login');
    expect(res.headers.get('location')).toContain('from=%2Fusers');
  });

  it('allows unauthenticated user to access public routes (login)', async () => {
    const req = new NextRequest(new URL('/login', baseUrl));
    
    const res = await proxy(req);
    
    expect(res.status).toBe(200);
  });

  it('allows unauthenticated user to access forbidden page', async () => {
    const req = new NextRequest(new URL('/forbidden', baseUrl));
    
    const res = await proxy(req);
    
    expect(res.status).toBe(200);
  });

  it('allows authenticated user through (cookie exists)', async () => {
    const req = new NextRequest(new URL('/projects', baseUrl));
    req.cookies.set('auth_token', 'any-token'); // Cookie exists = allowed
    
    const res = await proxy(req);
    
    // Thin Proxy only checks cookie existence, not token validity
    // JWT verification happens in Server Components
    expect(res.status).toBe(200);
  });

  it('redirects root path when no cookie', async () => {
    const req = new NextRequest(new URL('/', baseUrl));
    
    const res = await proxy(req);
    
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/login');
  });
});
