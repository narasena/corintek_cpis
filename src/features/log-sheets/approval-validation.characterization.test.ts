import { describe, expect, it } from 'vitest';

import type { ILogSheetDetailView } from '@/features/log-sheets/service';
import { validateLogSheetApprovalDetail } from '@/features/log-sheets/approval-validation';

describe('validateLogSheetApprovalDetail (no-op)', () => {
  it('passes regardless of any entries', () => {
    const detail = { id: 'ls-1' } as unknown as ILogSheetDetailView;
    expect(() => validateLogSheetApprovalDetail(detail)).not.toThrow();
  });

  it('passes with empty entries', () => {
    const detail = { entries: [] } as unknown as ILogSheetDetailView;
    expect(() => validateLogSheetApprovalDetail(detail)).not.toThrow();
  });

  it('passes with null detail fields', () => {
    const detail = null as unknown as ILogSheetDetailView;
    expect(() => validateLogSheetApprovalDetail(detail)).not.toThrow();
  });

  it('passes with undefined detail', () => {
    const detail = undefined as unknown as ILogSheetDetailView;
    expect(() => validateLogSheetApprovalDetail(detail)).not.toThrow();
  });
});
