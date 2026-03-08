/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { SearchFilterService } from '@/lib/search-filter-service';
import { canAccess, matchPathToResource, RbacResource } from '@/lib/rbac';
import { ErrorHandlerService, ConsoleLogger } from '@/lib/error-handler-service';
import { processImagePipeline } from '@/lib/utils/image-compression';

// --- MOCKING NEXT/NAVIGATION ---
// Avoid "invariant expected app router to be mounted"
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// --- 1. SearchFilterService.fuzzyMatch ---
describe('SearchFilterService Characterization', () => {
  const service = new SearchFilterService({});

  it('fuzzyMatch: identifies exact matches', () => {
    expect(service.fuzzyMatch('Corintek', 'Corintek')).toBe(true);
    expect(service.fuzzyMatch('corintek', 'CORINTEK')).toBe(true);
  });

  it('fuzzyMatch: identifies partial matches', () => {
    expect(service.fuzzyMatch('Corintek Projects', 'Project')).toBe(true);
  });

  it('fuzzyMatch: identifies matches within tolerance (default: 2)', () => {
    // 1 typo: 'Corintek' -> 'Corintekx' (Distance 1)
    expect(service.fuzzyMatch('Corintek', 'Corintekx')).toBe(true);
    // 2 typos: 'Corintek' -> 'Corintxk' (Distance 1), 'Corintxk' -> 'Corintxy' (Distance 2)
    expect(service.fuzzyMatch('Corintek', 'Corintxy')).toBe(true);
    // 3 typos: Should fail
    expect(service.fuzzyMatch('Corintek', 'Corinabc')).toBe(false);
  });
});

// --- 2. rbac.canAccess ---
describe('RBAC Characterization', () => {
  it('canAccess: ADMIN has full access', () => {
    expect(canAccess('ADMIN', RbacResource.USERS_ADMIN, 'create')).toBe(true);
    expect(canAccess('ADMIN', RbacResource.LOG_SHEETS, 'delete')).toBe(true);
  });

  it('canAccess: PUBLIC resource is accessible to everyone', () => {
    expect(canAccess('ANYBODY', RbacResource.PUBLIC, 'read')).toBe(true);
  });

  it('matchPathToResource: correctly maps paths to resources', () => {
    expect(matchPathToResource('/users')).toBe(RbacResource.USERS_ADMIN);
    expect(matchPathToResource('/log-sheets/123')).toBe(RbacResource.LOG_SHEETS);
    expect(matchPathToResource('/unknown-path')).toBe(RbacResource.UNKNOWN);
  });
});

// --- 3. ErrorHandlerService.processError ---
describe('ErrorHandlerService Characterization', () => {
  const logger = new ConsoleLogger();
  const service = new ErrorHandlerService({
    environment: 'production',
    logger,
  });

  it('processError: sanitizes error for production', () => {
    const error = new Error('Database connection failed');
    const processed = service.processError(error);
    
    expect(processed.title).toBe('Terjadi kesalahan');
    expect(processed.details).toBeUndefined(); // Hidden in production
    expect(processed.recoverable).toBe(true);
  });

  it('getUserMessage: provides Indonesian translations for common errors', () => {
    const networkError = new Error('Failed');
    networkError.name = 'NetworkError';
    expect(service.getUserMessage(networkError)).toBe('Gagal terhubung ke server. Periksa koneksi internet Anda.');

    const unknownError = new Error('Something weird');
    expect(service.getUserMessage(unknownError)).toBe('Maaf, terjadi kesalahan. Silakan coba lagi.');
  });
});

// --- 4. processImagePipeline (CameraInput logic) ---
describe('Image Pipeline Characterization', () => {
  // Mock canvas and context since it's not available in JSDOM/Node easily
  // In a real environment, we'd use a canvas polyfill or test in a real browser
  it('identifies the core pipeline steps (Structural check)', () => {
    expect(processImagePipeline).toBeDefined();
    // Since this requires a real <canvas> or <img> element, we'll verify it's exported
    // and correctly typed. Unit tests in src/lib/utils/image-compression.test.ts 
    // cover the mocked canvas implementation.
  });
});

// --- 5. DataTable state orchestration (using a mocked router) ---
// Note: This is more of a component test, but we're characterizing the logic 
// that previously failed due to router issues.
import { render, screen } from '@testing-library/react';
import { DataTable } from '@/components/data-table';
import React from 'react';

describe('DataTable Logic Characterization', () => {
  const columns = [{ accessorKey: 'name', header: 'Name' }];
  const data = [{ name: 'Project A' }, { name: 'Project B' }];

  it('renders without crashing even when next/navigation is used', () => {
    render(
      <DataTable 
        columns={columns} 
        data={data} 
        searchConfig={{ enableUrlSync: true }}
      />
    );
    expect(screen.getByPlaceholderText('Cari...')).toBeDefined();
    expect(screen.getAllByText('Project A').length).toBeGreaterThan(0);
  });
});
