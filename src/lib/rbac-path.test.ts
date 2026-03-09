import { describe, it, expect } from 'vitest';
import { matchPathToResource, RbacResource } from './rbac';

describe('RBAC Path Matching Rigorous Verification', () => {
  it('correctly matches exact paths', () => {
    expect(matchPathToResource('/users')).toBe(RbacResource.USERS_ADMIN);
    expect(matchPathToResource('/log-sheets')).toBe(RbacResource.LOG_SHEETS);
  });

  it('correctly matches sub-paths', () => {
    expect(matchPathToResource('/users/123')).toBe(RbacResource.USERS_ADMIN);
    expect(matchPathToResource('/users/edit/abc')).toBe(RbacResource.USERS_ADMIN);
    expect(matchPathToResource('/log-sheets/new')).toBe(RbacResource.LOG_SHEETS);
  });

  it('handles query parameters and hashes', () => {
    expect(matchPathToResource('/users?id=1')).toBe(RbacResource.USERS_ADMIN);
    expect(matchPathToResource('/log-sheets#section')).toBe(RbacResource.LOG_SHEETS);
  });

  it('prevents greedy matching of sibling paths (The Security Fix)', () => {
    // These should NOT match the specific resource if we fix the greedy regex
    // CURRENT BEHAVIOR: They match because of /^\/users/
    // DESIRED BEHAVIOR: They should be UNKNOWN or match a different resource
    expect(matchPathToResource('/users-backup')).toBe(RbacResource.UNKNOWN);
    expect(matchPathToResource('/log-sheets-archive')).toBe(RbacResource.UNKNOWN);
    expect(matchPathToResource('/attendance-config')).toBe(RbacResource.UNKNOWN);
  });

  it('matches root dashboard', () => {
    expect(matchPathToResource('/')).toBe(RbacResource.DASHBOARD);
    expect(matchPathToResource('')).toBe(RbacResource.DASHBOARD);
  });
});
