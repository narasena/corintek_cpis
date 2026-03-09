import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Foundational environment stubs - must be set before any module imports
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://mock:mock@localhost:5432/mock';
}

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'mock-secret-for-testing-only-1234567890';
}

if (typeof Element !== 'undefined') {
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = vi.fn(() => false);
  }
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = vi.fn();
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = vi.fn();
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = vi.fn();
  }
}

if (typeof window !== 'undefined') {
  if (!window.scroll) {
    window.scroll = vi.fn();
  }
  if (!window.scrollTo) {
    window.scrollTo = vi.fn();
  }
  if (!window.ResizeObserver) {
    window.ResizeObserver = class ResizeObserver {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    };
  }
  if (!window.PointerEvent) {
    // @ts-ignore
    window.PointerEvent = class PointerEvent extends MouseEvent {};
  }
}

afterEach(() => {
  cleanup();
});
