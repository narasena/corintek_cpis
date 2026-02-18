import { describe, it, expect } from 'vitest';

import {
  getLogSheetEditState,
  type TLogSheetEditState,
} from './log-sheet-locking';
import { decideLogSheetStatusTransition } from './log-sheet-status';

function expectState(
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED',
  options: { isAdmin: boolean; allowAdminOverride?: boolean },
  expected: TLogSheetEditState,
  locked = false
) {
  const state = getLogSheetEditState({ status, locked }, options);
  expect(state).toBe(expected);
}

describe('getLogSheetEditState', () => {
  it('treats DRAFT as editable for any actor', () => {
    expectState('DRAFT', { isAdmin: false }, 'EDITABLE');
    expectState('DRAFT', { isAdmin: true }, 'EDITABLE');
  });

  it('treats SUBMITTED as locked unless admin override is allowed', () => {
    expectState('SUBMITTED', { isAdmin: false }, 'LOCKED_SUBMITTED');
    expectState('SUBMITTED', { isAdmin: true }, 'LOCKED_SUBMITTED');
    expectState(
      'SUBMITTED',
      { isAdmin: true, allowAdminOverride: true },
      'EDITABLE'
    );
  });

  it('matches legacy behavior for APPROVED with admin override', () => {
    expectState('APPROVED', { isAdmin: false }, 'LOCKED_APPROVED');
    expectState('APPROVED', { isAdmin: true }, 'LOCKED_APPROVED');
    expectState(
      'APPROVED',
      { isAdmin: true, allowAdminOverride: true },
      'EDITABLE'
    );
  });

  it('treats locked flag as a hard lock regardless of status or override', () => {
    expectState('DRAFT', { isAdmin: true, allowAdminOverride: true }, 'LOCKED_APPROVED', true);
    expectState('SUBMITTED', { isAdmin: true, allowAdminOverride: true }, 'LOCKED_APPROVED', true);
  });
});

describe('decideLogSheetStatusTransition', () => {
  it('allows DRAFT → SUBMITTED for internal technician or PIC', () => {
    const techDecision = decideLogSheetStatusTransition({
      current: 'DRAFT',
      target: 'SUBMITTED',
      isInternalPic: false,
      isInternalTechnician: true,
    });
    expect(techDecision).toEqual({
      ok: true,
      requiresApprovalValidation: false,
    });

    const picDecision = decideLogSheetStatusTransition({
      current: 'DRAFT',
      target: 'SUBMITTED',
      isInternalPic: true,
      isInternalTechnician: false,
    });
    expect(picDecision).toEqual({
      ok: true,
      requiresApprovalValidation: false,
    });
  });

  it('rejects DRAFT → SUBMITTED for unauthorized actor', () => {
    const decision = decideLogSheetStatusTransition({
      current: 'DRAFT',
      target: 'SUBMITTED',
      isInternalPic: false,
      isInternalTechnician: false,
    });
    expect(decision).toEqual({ ok: false, error: 'Unauthorized' });
  });

  it('allows SUBMITTED → APPROVED for internal PIC and requires approval validation', () => {
    const decision = decideLogSheetStatusTransition({
      current: 'SUBMITTED',
      target: 'APPROVED',
      isInternalPic: true,
      isInternalTechnician: false,
    });
    expect(decision).toEqual({
      ok: true,
      requiresApprovalValidation: true,
    });
  });

  it('rejects SUBMITTED → APPROVED for non PIC', () => {
    const decision = decideLogSheetStatusTransition({
      current: 'SUBMITTED',
      target: 'APPROVED',
      isInternalPic: false,
      isInternalTechnician: true,
    });
    expect(decision).toEqual({ ok: false, error: 'Unauthorized' });
  });

  it('rejects invalid transitions back to DRAFT', () => {
    const decision = decideLogSheetStatusTransition({
      current: 'SUBMITTED',
      target: 'DRAFT',
      isInternalPic: true,
      isInternalTechnician: true,
    });
    expect(decision).toEqual({
      ok: false,
      error: 'Tidak dapat mengubah status kembali ke DRAFT',
    });
  });
});
