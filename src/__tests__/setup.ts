import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

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
}

afterEach(() => {
  cleanup();
});
