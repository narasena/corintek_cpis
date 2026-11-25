import { describe, it, expect } from 'vitest';
import {
  assertEditableWorkReportStatus,
  assertValidStatusTransition,
} from './status-policy';

describe('assertEditableWorkReportStatus', () => {
  it.each(['DRAFT', 'SUBMITTED'])('accepts %s', status => {
    expect(() => assertEditableWorkReportStatus(status)).not.toThrow();
  });

  it('accepts undefined (no status supplied)', () => {
    expect(() => assertEditableWorkReportStatus(undefined)).not.toThrow();
  });

  it.each(['APPROVED', 'REJECTED', 'BOGUS'])(
    'rejects %s from the generic edit path',
    status => {
      expect(() => assertEditableWorkReportStatus(status)).toThrow(
        'Status laporan tidak valid'
      );
    }
  );

  it('APPROVED requires the dedicated transition workflow (PIC-only)', () => {
    expect(() =>
      assertValidStatusTransition('SUBMITTED', 'APPROVED', {
        isProjectPic: false,
      })
    ).toThrow('Unauthorized');
    expect(() =>
      assertValidStatusTransition('SUBMITTED', 'APPROVED', {
        isProjectPic: true,
      })
    ).not.toThrow();
  });
});
