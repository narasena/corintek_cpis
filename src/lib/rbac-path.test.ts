import { describe, it, expect } from 'vitest';
import { matchPathToResource, RbacResource } from './rbac';

describe('matchPathToResource', () => {
  it('matches root dashboard', () => {
    expect(matchPathToResource('/')).toBe(RbacResource.DASHBOARD);
    expect(matchPathToResource('')).toBe(RbacResource.DASHBOARD);
  });

  it('matches summary reports', () => {
    expect(matchPathToResource('/summary-reports')).toBe(RbacResource.SUMMARY_REPORTS);
    expect(matchPathToResource('/summary-reports/123')).toBe(RbacResource.SUMMARY_REPORTS);
  });

  it('matches log sheets', () => {
    expect(matchPathToResource('/log-sheets')).toBe(RbacResource.LOG_SHEETS);
    expect(matchPathToResource('/log-sheets/abc')).toBe(RbacResource.LOG_SHEETS);
  });

  it('matches work reports', () => {
    expect(matchPathToResource('/work-reports')).toBe(RbacResource.WORK_REPORTS);
    expect(matchPathToResource('/work-reports/456')).toBe(RbacResource.WORK_REPORTS);
  });

  it('matches lab analyses', () => {
    expect(matchPathToResource('/lab-analyses')).toBe(RbacResource.LAB_ANALYSES);
    expect(matchPathToResource('/lab-analyses/789')).toBe(RbacResource.LAB_ANALYSES);
  });

  it('matches attendance/absence', () => {
    expect(matchPathToResource('/attendance')).toBe(RbacResource.ATTENDANCE);
    expect(matchPathToResource('/absence')).toBe(RbacResource.ATTENDANCE);
  });

  it('matches user admin', () => {
    expect(matchPathToResource('/users')).toBe(RbacResource.USERS_ADMIN);
    expect(matchPathToResource('/users/create')).toBe(RbacResource.USERS_ADMIN);
  });

  it('matches projects list vs admin', () => {
    expect(matchPathToResource('/my-projects')).toBe(RbacResource.PROJECTS_LIST);
    expect(matchPathToResource('/projects')).toBe(RbacResource.PROJECTS_ADMIN);
  });

  it('matches granular master data categories', () => {
    expect(matchPathToResource('/clients')).toBe(RbacResource.CLIENTS);
    expect(matchPathToResource('/chemicals')).toBe(RbacResource.CHEMICALS);
    expect(matchPathToResource('/parameters')).toBe(RbacResource.PARAMETERS);
    expect(matchPathToResource('/machines')).toBe(RbacResource.MACHINES);
  });

  it('returns UNKNOWN for unknown paths', () => {
    expect(matchPathToResource('/unknown')).toBe(RbacResource.UNKNOWN);
    expect(matchPathToResource('/api/health')).toBe(RbacResource.UNKNOWN);
  });
});
